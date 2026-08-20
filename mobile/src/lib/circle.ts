/**
 * The Prayer Circle — the people you pray with, and the intentions you
 * carry for one another.
 *
 * Every read here is already narrowed by Row Level Security: the queries
 * ask for "my circle", and the database is what decides what that means.
 * The two-sided moves — inviting, accepting, leaving — go through
 * database functions, because each one writes a row belonging to someone
 * else. See supabase/schema.sql.
 */
import { authDelete, authInsert, authSelect, authUpdate, rpc } from '@/lib/supabase';

/** A profile as seen alongside someone else's row. */
interface JoinedProfile {
  display_name: string;
  prayer_id?: string;
}

export interface CircleFriend {
  id: string;
  displayName: string;
  prayerId: string;
  since: string;
}

export interface Invite {
  id: string;
  createdAt: string;
  note: string | null;
  /** The other person — the sender for an invite to you, the recipient for one you sent. */
  personName: string;
  personPrayerId: string;
}

export interface Intention {
  id: string;
  body: string;
  createdAt: string;
  answered: boolean;
  authorId: string;
  authorName: string;
  /** How many of the circle have prayed for it. */
  prayers: number;
  /** Whether you are one of them. */
  prayedByMe: boolean;
  mine: boolean;
}

/** What `invite_to_circle` can answer, said plainly. */
export type InviteOutcome =
  | 'invited'
  | 'joined'
  | 'already_in_circle'
  | 'already_invited'
  | 'not_found'
  | 'self';

// ── The circle ──────────────────────────────────────────────────────

interface MemberRow {
  friend_id: string;
  created_at: string;
  profiles: JoinedProfile | null;
}

export async function fetchCircle(): Promise<CircleFriend[]> {
  const rows = await authSelect<MemberRow>(
    'circle_members',
    'select=friend_id,created_at,profiles!circle_members_friend_id_fkey(display_name,prayer_id)&order=created_at.asc',
  );
  return rows.map((r) => ({
    id: r.friend_id,
    displayName: r.profiles?.display_name ?? 'A friend in Christ',
    prayerId: r.profiles?.prayer_id ?? '',
    since: r.created_at,
  }));
}

export async function leaveCircle(friendId: string): Promise<void> {
  await rpc<null>('leave_circle', { friend: friendId });
}

// ── Invitations ─────────────────────────────────────────────────────

interface InviteRow {
  id: string;
  created_at: string;
  note: string | null;
  from_user: string;
  to_user: string;
  sender: JoinedProfile | null;
  recipient: JoinedProfile | null;
}

const INVITE_SELECT =
  'select=id,created_at,note,from_user,to_user,' +
  'sender:profiles!circle_invites_from_user_fkey(display_name,prayer_id),' +
  'recipient:profiles!circle_invites_to_user_fkey(display_name,prayer_id)' +
  '&status=eq.pending&order=created_at.desc';

function toInvite(row: InviteRow, person: JoinedProfile | null): Invite {
  return {
    id: row.id,
    createdAt: row.created_at,
    note: row.note,
    personName: person?.display_name ?? 'A friend in Christ',
    personPrayerId: person?.prayer_id ?? '',
  };
}

export interface PendingInvites {
  received: Invite[];
  sent: Invite[];
}

export async function fetchInvites(myUserId: string): Promise<PendingInvites> {
  const rows = await authSelect<InviteRow>('circle_invites', INVITE_SELECT);
  return {
    received: rows.filter((r) => r.to_user === myUserId).map((r) => toInvite(r, r.sender)),
    sent: rows.filter((r) => r.from_user === myUserId).map((r) => toInvite(r, r.recipient)),
  };
}

/** The shape of a prayer ID, once it is worth looking up. */
export const PRAYER_ID_PATTERN = /^HB-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;

/**
 * Who carries this prayer ID? Answers with a name and nothing else, so a
 * person can be sure of whom they are asking before they ask — and so a
 * mistyped code is caught before an invitation goes to a stranger.
 */
export async function findByPrayerId(code: string): Promise<{ id: string; displayName: string } | null> {
  const rows = await rpc<{ id: string; display_name: string }[] | null>('find_profile_by_prayer_id', {
    code: code.trim().toUpperCase(),
  });
  const found = Array.isArray(rows) ? rows[0] : null;
  return found ? { id: found.id, displayName: found.display_name } : null;
}

export async function inviteByPrayerId(code: string, note?: string): Promise<InviteOutcome> {
  const outcome = await rpc<InviteOutcome>('invite_to_circle', {
    code: code.trim().toUpperCase(),
    invite_note: note?.trim() || null,
  });
  return outcome;
}

export async function respondToInvite(inviteId: string, accept: boolean): Promise<void> {
  await rpc<string>('respond_to_invite', { invite: inviteId, accept });
}

export async function withdrawInvite(inviteId: string): Promise<void> {
  await authDelete('circle_invites', `id=eq.${inviteId}`);
}

// ── Intentions ──────────────────────────────────────────────────────

interface IntentionRow {
  id: string;
  body: string;
  created_at: string;
  answered: boolean;
  author: string;
  profiles: JoinedProfile | null;
  intention_prayers: { user_id: string }[] | null;
}

const INTENTION_SELECT =
  'select=id,body,created_at,answered,author,' +
  'profiles!prayer_intentions_author_fkey(display_name),' +
  'intention_prayers(user_id)' +
  '&order=created_at.desc&limit=60';

export async function fetchIntentions(myUserId: string): Promise<Intention[]> {
  const rows = await authSelect<IntentionRow>('prayer_intentions', INTENTION_SELECT);
  return rows.map((r) => {
    const prayed = r.intention_prayers ?? [];
    return {
      id: r.id,
      body: r.body,
      createdAt: r.created_at,
      answered: r.answered,
      authorId: r.author,
      authorName: r.profiles?.display_name ?? 'A friend in Christ',
      prayers: prayed.length,
      prayedByMe: prayed.some((p) => p.user_id === myUserId),
      mine: r.author === myUserId,
    };
  });
}

export async function postIntention(myUserId: string, body: string): Promise<void> {
  await authInsert('prayer_intentions', { author: myUserId, body: body.trim() });
}

export async function prayForIntention(intentionId: string, myUserId: string): Promise<void> {
  await authInsert(
    'intention_prayers',
    { intention_id: intentionId, user_id: myUserId },
    { ignoreDuplicates: true },
  );
}

export async function unprayForIntention(intentionId: string, myUserId: string): Promise<void> {
  await authDelete(
    'intention_prayers',
    `intention_id=eq.${intentionId}&user_id=eq.${myUserId}`,
  );
}

export async function markAnswered(intentionId: string, answered: boolean): Promise<void> {
  await authUpdate('prayer_intentions', `id=eq.${intentionId}`, { answered });
}

export async function removeIntention(intentionId: string): Promise<void> {
  await authDelete('prayer_intentions', `id=eq.${intentionId}`);
}
