/**
 * Thin Supabase client — plain fetch against the PostgREST API, no SDK.
 * The app carries only the public anon key (safe by design); what anyone
 * can do with it is governed entirely by Row Level Security:
 * submissions can be written but never read back, only verified church
 * listings are readable by strangers, and everything belonging to an
 * account is reachable only with that account's own token.
 * See supabase/schema.sql.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

const BASE = extra.supabaseUrl || '';
const ANON = extra.supabaseAnonKey || '';

export const SUPABASE_URL = BASE;
export const SUPABASE_ANON_KEY = ANON;
export const SUPABASE_ENABLED = !!(BASE && ANON);

/**
 * Where the signed-in access token comes from. `auth.ts` registers the
 * real one at start-up; keeping it behind a setter means this transport
 * never has to import the auth module, so there is no cycle between them.
 * `force` asks for a fresh token even if the held one looks valid — used
 * once after a 401, in case the server disagrees about the clock.
 */
type TokenProvider = (force?: boolean) => Promise<string | null>;

let tokenProvider: TokenProvider = async () => null;

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

function headers(token?: string | null): Record<string, string> {
  return {
    apikey: ANON,
    Authorization: `Bearer ${token || ANON}`,
    'Content-Type': 'application/json',
  };
}

/** Insert one row as the anonymous public (the submission queues). */
export async function insertRow(table: string, row: Record<string, unknown>): Promise<void> {
  if (!SUPABASE_ENABLED) throw new Error('Submissions are not configured yet.');
  const res = await fetch(`${BASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Could not send (${res.status}). ${detail}`.trim());
  }
}

/** Read rows with a PostgREST query string, e.g. `select=name&verified=eq.true`. */
export async function selectRows<T>(table: string, query: string): Promise<T[]> {
  if (!SUPABASE_ENABLED) return [];
  const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: headers() });
  if (!res.ok) return [];
  return (await res.json()) as T[];
}

/**
 * A request made as the signed-in person. Anything the token cannot
 * reach simply is not there — the policies decide, not the app. A 401 is
 * retried exactly once with a freshly minted token, which quietly covers
 * the common case of a token that expired mid-screen.
 */
async function authedFetch(path: string, init: RequestInit, retry = true): Promise<Response> {
  if (!SUPABASE_ENABLED) throw new Error('Accounts are not configured yet.');
  const token = await tokenProvider();
  if (!token) throw new Error('Please sign in first.');

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init.headers as Record<string, string> | undefined) },
  });

  if (res.status === 401 && retry) {
    const fresh = await tokenProvider(true);
    if (fresh) return authedFetch(path, init, false);
  }
  return res;
}

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const parsed = JSON.parse(text) as { message?: string; hint?: string };
    return parsed.message || parsed.hint || text;
  } catch {
    return text;
  }
}

/** Read rows as the signed-in person. Throws so the screen can say why. */
export async function authSelect<T>(table: string, query: string): Promise<T[]> {
  const res = await authedFetch(`/rest/v1/${table}?${query}`, { method: 'GET' });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T[];
}

/**
 * Insert as the signed-in person, returning the stored row.
 * `ignoreDuplicates` lets a row that is already there pass quietly —
 * a second tap on "I prayed for this" is not an error worth showing.
 */
export async function authInsert<T>(
  table: string,
  row: Record<string, unknown>,
  options: { ignoreDuplicates?: boolean } = {},
): Promise<T | null> {
  const prefer = ['return=representation'];
  if (options.ignoreDuplicates) prefer.push('resolution=ignore-duplicates');

  const res = await authedFetch(`/rest/v1/${table}`, {
    method: 'POST',
    headers: { Prefer: prefer.join(',') },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(await readError(res));
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

/** Patch rows the signed-in person is allowed to patch. */
export async function authUpdate(
  table: string,
  query: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const res = await authedFetch(`/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await readError(res));
}

/** Delete rows the signed-in person is allowed to delete. */
export async function authDelete(table: string, query: string): Promise<void> {
  const res = await authedFetch(`/rest/v1/${table}?${query}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
  if (!res.ok) throw new Error(await readError(res));
}

/**
 * Call one of the database functions. These are the operations that
 * touch two people at once — inviting, accepting, leaving — and they
 * check the caller themselves rather than trusting the app.
 */
export async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await authedFetch(`/rest/v1/rpc/${fn}`, {
    method: 'POST',
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(await readError(res));
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
