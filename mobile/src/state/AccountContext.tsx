import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  Session,
  getSession,
  hydrateSession,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  subscribeToSession,
} from '@/lib/auth';
import { authUpdate, rpc, SUPABASE_ENABLED } from '@/lib/supabase';

/**
 * Who the person is, if they have chosen to say. The whole app works
 * signed out; an account only unlocks the Prayer Circle — being findable
 * by the friends you pray with.
 */

export interface Profile {
  id: string;
  display_name: string;
  prayer_id: string;
  about: string | null;
}

export type AccountStatus = 'loading' | 'signed-out' | 'signed-in';

interface AccountState {
  status: AccountStatus;
  session: Session | null;
  profile: Profile | null;
  /** False when the project has no Supabase keys — the screens then say so. */
  available: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const Ctx = createContext<AccountState | null>(null);

/** `ensure_profile` returns one row; PostgREST may hand it back either way. */
function firstProfile(payload: Profile | Profile[] | null): Profile | null {
  if (!payload) return null;
  return Array.isArray(payload) ? payload[0] ?? null : payload;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus>(SUPABASE_ENABLED ? 'loading' : 'signed-out');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      // Also mints a profile for any account created before the trigger
      // existed, so nobody is left without a prayer ID.
      const row = await rpc<Profile | Profile[]>('ensure_profile', { name: null });
      setProfile(firstProfile(row));
    } catch {
      // Offline, or the schema is not installed yet. The person is still
      // signed in; the circle screen explains why it is quiet.
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;

    let alive = true;

    const apply = (next: Session | null) => {
      if (!alive) return;
      setSession(next);
      setStatus(next ? 'signed-in' : 'signed-out');
      if (next) void loadProfile();
      else setProfile(null);
    };

    const unsubscribe = subscribeToSession(apply);
    hydrateSession().then(() => apply(getSession()));

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AccountState>(
    () => ({
      status,
      session,
      profile,
      available: SUPABASE_ENABLED,
      signIn: async (email, password) => {
        await authSignIn(email, password);
      },
      signUp: async (email, password, displayName) => {
        const result = await authSignUp(email, password, displayName);
        return { needsConfirmation: result.needsConfirmation };
      },
      signOut: async () => {
        await authSignOut();
      },
      setDisplayName: async (name) => {
        if (!session) throw new Error('Please sign in first.');
        const trimmed = name.trim();
        if (!trimmed) throw new Error('A name cannot be empty.');
        await authUpdate('profiles', `id=eq.${session.userId}`, { display_name: trimmed });
        setProfile((p) => (p ? { ...p, display_name: trimmed } : p));
      },
      reloadProfile: loadProfile,
    }),
    [status, session, profile, loadProfile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount(): AccountState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
}
