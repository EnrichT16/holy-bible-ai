/**
 * Accounts — Supabase Auth over plain fetch, in keeping with the rest of
 * the app: no SDK, nothing secret in the bundle.
 *
 * An account is never required to read Scripture or to pray. It exists
 * only so that a person can be found by their friends: it is the door to
 * the Prayer Circle, and nothing beyond that is locked.
 *
 * This module owns the session. The screens subscribe to it rather than
 * passing tokens around, and the PostgREST transport in `supabase.ts`
 * asks it for a token when it needs one — refreshing shortly before
 * expiry so a long evening of prayer never signs anyone out mid-sentence.
 */
import { getPref, setPref, removePref } from '@/lib/storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED, setTokenProvider } from '@/lib/supabase';

export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
  userId: string;
  email: string;
}

const SESSION_KEY = 'session';
/** Renew this long before the token actually lapses. */
const RENEW_MARGIN_MS = 60_000;

type Listener = (session: Session | null) => void;

let session: Session | null = null;
let hydrated = false;
let hydrating: Promise<Session | null> | null = null;
let renewing: Promise<Session | null> | null = null;
const listeners = new Set<Listener>();

export function getSession(): Session | null {
  return session;
}

export function subscribeToSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function announce(): void {
  for (const listener of listeners) listener(session);
}

async function remember(next: Session | null): Promise<void> {
  session = next;
  if (next) await setPref(SESSION_KEY, JSON.stringify(next));
  else await removePref(SESSION_KEY);
  announce();
}

// ── Talking to GoTrue ───────────────────────────────────────────────

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id: string; email?: string };
  id?: string;
  email?: string;
}

/** Turn GoTrue's several error shapes into one sentence a person can act on. */
function readAuthError(status: number, body: string): string {
  let message = '';
  try {
    const parsed = JSON.parse(body) as {
      error_description?: string;
      msg?: string;
      message?: string;
      error?: string;
    };
    message = parsed.error_description || parsed.msg || parsed.message || parsed.error || '';
  } catch {
    message = body;
  }
  const lower = message.toLowerCase();
  if (lower.includes('invalid login')) return 'That email and password do not match an account.';
  if (lower.includes('already registered')) return 'There is already an account with that email — sign in instead.';
  if (lower.includes('email not confirmed')) return 'Confirm your email first — the link is in your inbox.';
  if (lower.includes('password') && lower.includes('6')) return 'Choose a password of at least six characters.';
  if (status === 429) return 'Too many attempts just now. Please try again in a moment.';
  return message || `Something went wrong (${status}).`;
}

async function authRequest(path: string, body: unknown, token?: string): Promise<TokenResponse> {
  if (!SUPABASE_ENABLED) throw new Error('Accounts are not configured yet.');
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(readAuthError(res.status, text));
  return (text ? JSON.parse(text) : {}) as TokenResponse;
}

/** A token response only becomes a session once it actually carries tokens. */
function toSession(payload: TokenResponse, fallbackEmail: string): Session | null {
  if (!payload.access_token || !payload.refresh_token) return null;
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
    userId: payload.user?.id ?? payload.id ?? '',
    email: payload.user?.email ?? payload.email ?? fallbackEmail,
  };
}

// ── The session's life ──────────────────────────────────────────────

/** Read the remembered session from the device, once, at start-up. */
export async function hydrateSession(): Promise<Session | null> {
  if (hydrated) return session;
  if (hydrating) return hydrating;

  hydrating = (async () => {
    const stored = await getPref(SESSION_KEY);
    if (stored) {
      try {
        session = JSON.parse(stored) as Session;
      } catch {
        session = null;
      }
    }
    hydrated = true;
    hydrating = null;
    if (session && session.expiresAt - Date.now() < RENEW_MARGIN_MS) await renew();
    announce();
    return session;
  })();

  return hydrating;
}

/** Trade the refresh token for a new one. A refusal signs the person out. */
async function renew(): Promise<Session | null> {
  if (renewing) return renewing;
  const current = session;
  if (!current) return null;

  renewing = (async () => {
    try {
      const payload = await authRequest('token?grant_type=refresh_token', {
        refresh_token: current.refreshToken,
      });
      const next = toSession(payload, current.email);
      await remember(next ?? null);
      return next;
    } catch {
      // The refresh token is spent or revoked: begin again, gently.
      await remember(null);
      return null;
    } finally {
      renewing = null;
    }
  })();

  return renewing;
}

/** The token the transport should send, renewed if it is about to lapse. */
export async function accessToken(force = false): Promise<string | null> {
  if (!hydrated) await hydrateSession();
  if (!session) return null;
  if (force || session.expiresAt - Date.now() < RENEW_MARGIN_MS) {
    const next = await renew();
    return next?.accessToken ?? null;
  }
  return session.accessToken;
}

setTokenProvider(accessToken);

// ── What the screens call ───────────────────────────────────────────

export interface SignUpResult {
  session: Session | null;
  /** True when the project asks people to confirm their email first. */
  needsConfirmation: boolean;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<SignUpResult> {
  const payload = await authRequest('signup', {
    email: email.trim(),
    password,
    data: { display_name: displayName.trim() },
  });
  const next = toSession(payload, email.trim());
  if (next) await remember(next);
  return { session: next, needsConfirmation: !next };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const payload = await authRequest('token?grant_type=password', {
    email: email.trim(),
    password,
  });
  const next = toSession(payload, email.trim());
  if (!next) throw new Error('Signing in did not return a session. Please try again.');
  await remember(next);
  return next;
}

export async function signOut(): Promise<void> {
  const current = session;
  // Forget it here first: the person asked to be signed out, and a
  // network that will not co-operate must not stand in the way.
  await remember(null);
  if (current) {
    try {
      await authRequest('logout', {}, current.accessToken);
    } catch {
      // already gone as far as this device is concerned
    }
  }
}

/** Send the "set a new password" email. */
export async function sendRecoveryEmail(email: string): Promise<void> {
  await authRequest('recover', { email: email.trim() });
}
