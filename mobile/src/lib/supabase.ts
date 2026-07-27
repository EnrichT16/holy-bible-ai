/**
 * Thin Supabase client — plain fetch against the PostgREST API, no SDK.
 * The app carries only the public anon key (safe by design); what anyone
 * can do with it is governed entirely by Row Level Security:
 * submissions can be written but never read back, and only verified
 * church listings are readable. See supabase/schema.sql.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

const URL = extra.supabaseUrl || '';
const ANON = extra.supabaseAnonKey || '';

export const SUPABASE_ENABLED = !!(URL && ANON);

function headers(): Record<string, string> {
  return {
    apikey: ANON,
    Authorization: `Bearer ${ANON}`,
    'Content-Type': 'application/json',
  };
}

/** Insert one row. Resolves on success, throws with a readable message otherwise. */
export async function insertRow(table: string, row: Record<string, unknown>): Promise<void> {
  if (!SUPABASE_ENABLED) throw new Error('Submissions are not configured yet.');
  const res = await fetch(`${URL}/rest/v1/${table}`, {
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
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, { headers: headers() });
  if (!res.ok) return [];
  return (await res.json()) as T[];
}
