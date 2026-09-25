/**
 * Call signalling — everything around the sound of a prayer call.
 *
 * The database carries the ringing (see supabase/schema.sql, Slice 2):
 * placing, answering, declining and ending all go through security
 * definer functions, and the app simply polls its own invites while it
 * is open. The sound itself travels over LiveKit; the backend mints the
 * room token after checking the person's sign-in (`getVoiceTicket`).
 */
import { authSelect, rpc } from '@/lib/supabase';
import { accessToken } from '@/lib/auth';
import { CONFIG } from '@/lib/config';

export type CallInviteStatus = 'ringing' | 'accepted' | 'declined' | 'missed';

export interface RingingCall {
  callId: string;
  callerName: string;
}

export interface CallInviteState {
  userId: string;
  name: string;
  status: CallInviteStatus;
}

export interface CallState {
  id: string;
  createdBy: string;
  callerName: string;
  createdAt: string;
  endedAt: string | null;
  /**
   * Everyone asked to join, as far as this viewer may see. The caller
   * sees every invite; an invited friend sees only their own (Row Level
   * Security draws that line) — who has actually arrived comes from the
   * voice room itself either way.
   */
  invites: CallInviteState[];
}

/** How long an unanswered ring keeps ringing on the callee's side. */
export const RING_WINDOW_MS = 45_000;

/** A friend counts as reachable if the app spoke up this recently. */
export const PRESENCE_FRESH_MS = 150_000;

export function reachableNow(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const then = new Date(lastSeenAt).getTime();
  return !Number.isNaN(then) && Date.now() - then < PRESENCE_FRESH_MS;
}

// ── The two-sided moves ─────────────────────────────────────────────

/** Ring up to three friends from your circle. Returns the call id. */
export async function startCall(friendIds: string[]): Promise<string> {
  return rpc<string>('start_call', { invitees: friendIds });
}

export async function answerCall(callId: string, accept: boolean): Promise<string> {
  return rpc<string>('answer_call', { call: callId, accept });
}

export async function endCall(callId: string): Promise<void> {
  await rpc<null>('end_call', { call: callId });
}

/** The quiet "I am here" that lets friends see you as reachable. */
export async function touchPresence(): Promise<void> {
  await rpc<null>('touch_presence', {});
}

// ── Polling ─────────────────────────────────────────────────────────

interface RingRow {
  id: string;
  call_id: string;
  created_at: string;
  calls: { ended_at: string | null } | null;
  caller: { display_name: string } | null;
}

/** The newest live ring addressed to you, if any. */
export async function fetchRinging(myUserId: string): Promise<RingingCall | null> {
  const since = new Date(Date.now() - RING_WINDOW_MS).toISOString();
  const rows = await authSelect<RingRow>(
    'call_invites',
    'select=id,call_id,created_at,' +
      'calls!call_invites_call_id_fkey(ended_at),' +
      'caller:profiles!call_invites_from_user_fkey(display_name)' +
      `&to_user=eq.${myUserId}&status=eq.ringing` +
      `&created_at=gte.${encodeURIComponent(since)}` +
      '&order=created_at.desc&limit=1',
  );
  const row = rows[0];
  if (!row || row.calls?.ended_at) return null;
  return {
    callId: row.call_id,
    callerName: row.caller?.display_name ?? 'A friend in Christ',
  };
}

interface CallRow {
  id: string;
  created_by: string;
  created_at: string;
  ended_at: string | null;
  caller: { display_name: string } | null;
  call_invites: {
    to_user: string;
    status: CallInviteStatus;
    invitee: { display_name: string } | null;
  }[] | null;
}

export async function fetchCallState(callId: string): Promise<CallState | null> {
  const rows = await authSelect<CallRow>(
    'calls',
    'select=id,created_by,created_at,ended_at,' +
      'caller:profiles!calls_created_by_fkey(display_name),' +
      'call_invites(to_user,status,invitee:profiles!call_invites_to_user_fkey(display_name))' +
      `&id=eq.${callId}&limit=1`,
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    createdBy: row.created_by,
    callerName: row.caller?.display_name ?? 'A friend in Christ',
    createdAt: row.created_at,
    endedAt: row.ended_at,
    invites: (row.call_invites ?? []).map((v) => ({
      userId: v.to_user,
      name: v.invitee?.display_name ?? 'A friend in Christ',
      status: v.status,
    })),
  };
}

// ── The room ticket ─────────────────────────────────────────────────

export const VOICE_ASLEEP =
  'The calling service has not been given its keys yet. Your circle still stands — ' +
  'the moment the keys are set on the server, calls will ring.';

/**
 * Ask the backend for a LiveKit room token. The person proves who they
 * are with their Supabase sign-in; the server holds the only secret.
 */
export async function getVoiceTicket(
  room: string,
  displayName: string,
): Promise<{ token: string; url: string }> {
  const token = await accessToken();
  if (!token) throw new Error('Please sign in first.');

  const res = await fetch(`${CONFIG.backendUrl}/api/call-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room, display_name: displayName }),
  });

  if (res.status === 503) throw new Error(VOICE_ASLEEP);
  if (!res.ok) {
    let detail = '';
    try {
      detail = ((await res.json()) as { detail?: string }).detail ?? '';
    } catch {
      // fall through to the generic sentence
    }
    throw new Error(detail || `The call could not be prepared (${res.status}).`);
  }
  return (await res.json()) as { token: string; url: string };
}
