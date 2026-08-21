import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  RefreshControlProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { useAccount } from '@/state/AccountContext';
import { shareText } from '@/lib/share';
import {
  CircleFriend,
  Intention,
  InviteOutcome,
  PendingInvites,
  fetchCircle,
  fetchIntentions,
  fetchInvites,
  findByPrayerId,
  inviteByPrayerId,
  leaveCircle,
  markAnswered,
  postIntention,
  prayForIntention,
  PRAYER_ID_PATTERN,
  removeIntention,
  respondToInvite,
  unprayForIntention,
  withdrawInvite,
} from '@/lib/circle';

/**
 * The Prayer Circle — the first half of Pray with Friends.
 *
 * Before anyone can be called, there must be someone to call: this is
 * where a person gathers their few, by the prayer ID they hand out, and
 * where the circle carries one another's intentions in the meantime.
 * The voice calls join them in Slice 2.
 */

const OUTCOMES: Record<InviteOutcome, string> = {
  invited: 'Invitation sent. They will find it waiting when they next open their circle.',
  joined: 'They had already asked for you — your circles are joined.',
  already_in_circle: 'They are already in your circle.',
  already_invited: 'You have already asked them; the invitation is still waiting.',
  not_found: 'No one carries that prayer ID. Check it letter by letter.',
  self: 'That is your own prayer ID.',
};

export default function Circle() {
  const router = useRouter();
  const { status, profile, session, available } = useAccount();
  const myId = session?.userId ?? '';

  const [circle, setCircle] = useState<CircleFriend[]>([]);
  const [invites, setInvites] = useState<PendingInvites>({ received: [], sent: [] });
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!myId) return;
    setProblem(null);
    try {
      const [c, v, i] = await Promise.all([
        fetchCircle(),
        fetchInvites(myId),
        fetchIntentions(myId),
      ]);
      setCircle(c);
      setInvites(v);
      setIntentions(i);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'The circle could not be reached just now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myId]);

  useEffect(() => {
    if (status === 'signed-in') void load();
    else if (status === 'signed-out') setLoading(false);
  }, [status, load]);

  if (status === 'loading') {
    return (
      <Frame onBack={() => router.back()}>
        <Card style={{ marginTop: 18, alignItems: 'center' }}>
          <ActivityIndicator color={Lumen.colors.accent} />
        </Card>
      </Frame>
    );
  }

  if (status !== 'signed-in') {
    return (
      <Frame onBack={() => router.back()}>
        <Text style={styles.subtitle}>
          “Where two or three are gathered together in my name, there am I in the midst of
          them.” — Matthew 18:20
        </Text>
        <Card style={{ marginTop: 20 }}>
          <Text style={styles.quietTitle}>Gather your few</Text>
          <Text style={styles.quiet}>
            A circle is the handful of people you pray with — family, a friend far away, a
            prayer group. You will each have a prayer ID to share, and you will carry one
            another's intentions here.
            {'\n\n'}
            {available
              ? 'It needs an account, so that they can find you. Nothing else in the app does.'
              : 'This build carries no account keys yet, so the circle is quiet for now.'}
          </Text>
          {available && (
            <Pressable style={styles.primary} onPress={() => router.push('/account')}>
              <Ionicons name="person-add-outline" size={17} color="#0d1830" />
              <Text style={styles.primaryText}>Sign in or create an account</Text>
            </Pressable>
          )}
        </Card>
        <ComingNext />
      </Frame>
    );
  }

  return (
    <Frame
      onBack={() => router.back()}
      refresh={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
          tintColor={Lumen.colors.accent}
        />
      }
    >
      <Text style={styles.subtitle}>
        The people you pray with, and the intentions you carry for one another.
      </Text>

      {problem && (
        <Card style={{ marginTop: 16 }}>
          <Text style={styles.problem}>{problem}</Text>
        </Card>
      )}

      {loading ? (
        <Card style={{ marginTop: 18, alignItems: 'center' }}>
          <ActivityIndicator color={Lumen.colors.accent} />
        </Card>
      ) : (
        <>
          {invites.received.length > 0 && (
            <>
              <Label style={styles.sectionLabel}>Asking for you</Label>
              <Card>
                {invites.received.map((invite, i) => (
                  <View key={invite.id} style={[styles.row, i > 0 && styles.divider]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{invite.personName}</Text>
                      <Text style={styles.rowMeta}>{invite.personPrayerId}</Text>
                      {invite.note ? <Text style={styles.rowNote}>“{invite.note}”</Text> : null}
                    </View>
                    <Pressable
                      hitSlop={8}
                      style={styles.iconButton}
                      onPress={async () => {
                        await respondToInvite(invite.id, true);
                        await load();
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color={Lumen.colors.accent} />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      style={styles.iconButton}
                      onPress={async () => {
                        await respondToInvite(invite.id, false);
                        await load();
                      }}
                    >
                      <Ionicons name="close" size={20} color={Lumen.colors.muted} />
                    </Pressable>
                  </View>
                ))}
              </Card>
            </>
          )}

          <Label style={styles.sectionLabel}>Your circle</Label>
          {circle.length === 0 ? (
            <Card>
              <View style={styles.emptyWrap}>
                <Ionicons name="people-outline" size={30} color={Lumen.colors.accent} />
                <Text style={styles.emptyTitle}>No one yet</Text>
                <Text style={styles.emptyText}>
                  Share your prayer ID — {profile?.prayer_id ?? '—'} — with someone you would
                  pray with, or add theirs below.
                </Text>
                <Pressable
                  style={styles.secondary}
                  onPress={() =>
                    shareText(
                      `Pray with me on Holy Bible · AI Assisted. My prayer ID is ${profile?.prayer_id ?? ''}.`,
                    )
                  }
                >
                  <Ionicons name="share-outline" size={16} color={Lumen.colors.muted} />
                  <Text style={styles.secondaryText}>Share your prayer ID</Text>
                </Pressable>
              </View>
            </Card>
          ) : (
            <Card>
              {circle.map((friend, i) => (
                <FriendRow
                  key={friend.id}
                  friend={friend}
                  first={i === 0}
                  onLeave={async () => {
                    await leaveCircle(friend.id);
                    await load();
                  }}
                />
              ))}
            </Card>
          )}

          <AddFriend onDone={load} />

          {invites.sent.length > 0 && (
            <>
              <Label style={styles.sectionLabel}>Waiting on an answer</Label>
              <Card>
                {invites.sent.map((invite, i) => (
                  <View key={invite.id} style={[styles.row, i > 0 && styles.divider]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{invite.personName}</Text>
                      <Text style={styles.rowMeta}>{invite.personPrayerId}</Text>
                    </View>
                    <Pressable
                      hitSlop={8}
                      style={styles.iconButton}
                      onPress={async () => {
                        await withdrawInvite(invite.id);
                        await load();
                      }}
                    >
                      <Ionicons name="close" size={20} color={Lumen.colors.muted} />
                    </Pressable>
                  </View>
                ))}
              </Card>
            </>
          )}

          <Intentions
            intentions={intentions}
            myId={myId}
            circleSize={circle.length}
            setIntentions={setIntentions}
            reload={load}
          />
        </>
      )}

      <ComingNext />
    </Frame>
  );
}

// ── The page frame ──────────────────────────────────────────────────

function Frame({
  children,
  onBack,
  refresh,
}: {
  children: React.ReactNode;
  onBack: () => void;
  refresh?: React.ReactElement<RefreshControlProps>;
}) {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 26 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refresh}
        >
          <Text style={styles.title}>Prayer Circle</Text>
          {children}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ComingNext() {
  return (
    <Card style={{ marginTop: 26 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name="call-outline" size={20} color={Lumen.colors.muted} />
        <Text style={styles.comingText}>
          Praying aloud together — the calls, the ringing, reading the Word as one — joins
          your circle next.
        </Text>
      </View>
    </Card>
  );
}

// ── The circle itself ───────────────────────────────────────────────

function FriendRow({
  friend,
  first,
  onLeave,
}: {
  friend: CircleFriend;
  first: boolean;
  onLeave: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <View style={[styles.row, !first && styles.divider]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{friend.displayName.trim().charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{friend.displayName}</Text>
        <Text style={styles.rowMeta}>{friend.prayerId}</Text>
      </View>
      {confirming ? (
        <>
          <Pressable hitSlop={8} style={styles.iconButton} onPress={onLeave}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconButton} onPress={() => setConfirming(false)}>
            <Ionicons name="close" size={18} color={Lumen.colors.muted} />
          </Pressable>
        </>
      ) : (
        <Pressable hitSlop={8} style={styles.iconButton} onPress={() => setConfirming(true)}>
          <Ionicons name="ellipsis-horizontal" size={18} color={Lumen.colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

type Lookup = { state: 'idle' } | { state: 'looking' } | { state: 'found'; name: string } | { state: 'unknown' };

function AddFriend({ onDone }: { onDone: () => Promise<void> }) {
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' });

  // Once a whole prayer ID has been typed, say whose it is — so nobody
  // asks a stranger by mistyping one letter.
  useEffect(() => {
    if (!PRAYER_ID_PATTERN.test(code)) {
      setLookup({ state: 'idle' });
      return;
    }
    let current = true;
    setLookup({ state: 'looking' });
    findByPrayerId(code)
      .then((person) => {
        if (!current) return;
        setLookup(person ? { state: 'found', name: person.displayName } : { state: 'unknown' });
      })
      .catch(() => {
        if (current) setLookup({ state: 'idle' });
      });
    return () => {
      current = false;
    };
  }, [code]);

  const send = async () => {
    setBusy(true);
    setSaid(null);
    setFailed(false);
    try {
      const outcome = await inviteByPrayerId(code, note);
      setSaid(OUTCOMES[outcome] ?? 'Sent.');
      setFailed(outcome === 'not_found' || outcome === 'self');
      if (outcome === 'invited' || outcome === 'joined') {
        setCode('');
        setNote('');
        setLookup({ state: 'idle' });
        await onDone();
      }
    } catch (e) {
      setFailed(true);
      setSaid(e instanceof Error ? e.message : 'That could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Label style={styles.sectionLabel}>Add a friend</Label>
      <Card>
        <Text style={styles.fieldLabel}>Their prayer ID</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="HB-XXXX-XXXX"
          placeholderTextColor={'rgba(155,176,208,0.5)'}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {lookup.state === 'looking' && <Text style={styles.lookup}>Looking…</Text>}
        {lookup.state === 'found' && <Text style={styles.lookup}>This is {lookup.name}.</Text>}
        {lookup.state === 'unknown' && (
          <Text style={[styles.lookup, { color: '#d99' }]}>
            No one carries that prayer ID. Check it letter by letter.
          </Text>
        )}

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>A word with it (optional)</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Let us keep the novena together."
          placeholderTextColor={'rgba(155,176,208,0.5)'}
        />
        <Pressable
          style={[styles.primary, (!code.trim() || busy || lookup.state === 'unknown') && { opacity: 0.45 }]}
          disabled={!code.trim() || busy || lookup.state === 'unknown'}
          onPress={send}
        >
          {busy ? (
            <ActivityIndicator color="#0d1830" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={17} color="#0d1830" />
              <Text style={styles.primaryText}>
                {lookup.state === 'found' ? `Ask ${lookup.name} to join` : 'Ask them to join'}
              </Text>
            </>
          )}
        </Pressable>
        {said && <Text style={[styles.note, failed && { color: '#d99' }]}>{said}</Text>}
      </Card>
    </>
  );
}

// ── Intentions ──────────────────────────────────────────────────────

function Intentions({
  intentions,
  myId,
  circleSize,
  setIntentions,
  reload,
}: {
  intentions: Intention[];
  myId: string;
  circleSize: number;
  setIntentions: (next: (prev: Intention[]) => Intention[]) => void;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const post = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await postIntention(myId, draft);
      setDraft('');
      await reload();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'That could not be shared.');
    } finally {
      setBusy(false);
    }
  };

  // The tap is answered on screen at once; the circle is a place for
  // prayer, not for waiting on a network.
  const togglePrayer = async (intention: Intention) => {
    const praying = !intention.prayedByMe;
    setIntentions((prev) =>
      prev.map((i) =>
        i.id === intention.id
          ? { ...i, prayedByMe: praying, prayers: i.prayers + (praying ? 1 : -1) }
          : i,
      ),
    );
    try {
      if (praying) await prayForIntention(intention.id, myId);
      else await unprayForIntention(intention.id, myId);
    } catch {
      await reload();
    }
  };

  return (
    <>
      <Label style={styles.sectionLabel}>Intentions</Label>
      <Card>
        <TextInput
          style={[styles.input, { minHeight: 68, textAlignVertical: 'top' }]}
          value={draft}
          onChangeText={setDraft}
          placeholder="Name what you would have them pray for…"
          placeholderTextColor={'rgba(155,176,208,0.5)'}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[styles.primary, (!draft.trim() || busy) && { opacity: 0.45 }]}
          disabled={!draft.trim() || busy}
          onPress={post}
        >
          {busy ? (
            <ActivityIndicator color="#0d1830" />
          ) : (
            <>
              <Ionicons name="flame-outline" size={17} color="#0d1830" />
              <Text style={styles.primaryText}>Share with my circle</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.quiet}>
          {circleSize === 0
            ? 'Only you will see this until someone joins your circle.'
            : `Seen by the ${circleSize} ${circleSize === 1 ? 'person' : 'people'} in your circle, and no one else.`}
        </Text>
        {problem && <Text style={styles.problem}>{problem}</Text>}
      </Card>

      {intentions.map((intention) => (
        <Card key={intention.id} style={{ marginTop: 12 }}>
          <View style={styles.intentionHead}>
            <Text style={styles.intentionAuthor}>
              {intention.mine ? 'You' : intention.authorName}
            </Text>
            <Text style={styles.intentionWhen}>{timeAgo(intention.createdAt)}</Text>
          </View>
          <Text style={[styles.intentionBody, intention.answered && styles.answeredBody]}>
            {intention.body}
          </Text>
          {intention.answered && (
            <Text style={styles.answeredMark}>Answered — thanks be to God.</Text>
          )}

          <View style={styles.intentionFoot}>
            <Pressable style={styles.prayButton} onPress={() => togglePrayer(intention)}>
              <Ionicons
                name={intention.prayedByMe ? 'flame' : 'flame-outline'}
                size={17}
                color={intention.prayedByMe ? Lumen.colors.bright : Lumen.colors.muted}
              />
              <Text style={[styles.prayText, intention.prayedByMe && { color: Lumen.colors.bright }]}>
                {intention.prayedByMe ? 'You prayed' : 'I prayed for this'}
              </Text>
            </Pressable>
            {intention.prayers > 0 && (
              <Text style={styles.prayCount}>
                {intention.prayers} {intention.prayers === 1 ? 'prayer' : 'prayers'}
              </Text>
            )}
            {intention.mine && (
              <>
                <Pressable
                  hitSlop={8}
                  style={styles.iconButton}
                  onPress={async () => {
                    await markAnswered(intention.id, !intention.answered);
                    await reload();
                  }}
                >
                  <Ionicons
                    name={intention.answered ? 'refresh-outline' : 'checkmark-done-outline'}
                    size={18}
                    color={Lumen.colors.accent}
                  />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  style={styles.iconButton}
                  onPress={async () => {
                    await removeIntention(intention.id);
                    await reload();
                  }}
                >
                  <Ionicons name="trash-outline" size={17} color={Lumen.colors.muted} />
                </Pressable>
              </>
            )}
          </View>
        </Card>
      ))}
    </>
  );
}

/** A gentle, unhurried sense of when — never a timestamp to the second. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.muted },
  body: { paddingHorizontal: 22 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text, marginTop: 6 },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6 },
  sectionLabel: { marginTop: 26, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  rowName: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.text },
  rowMeta: { fontFamily: Lumen.fonts.body, fontSize: 11, letterSpacing: 1, color: Lumen.colors.muted, marginTop: 1 },
  rowNote: { fontFamily: Lumen.fonts.body, fontStyle: 'italic', fontSize: 13, color: Lumen.colors.accent2, marginTop: 4 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: Lumen.colors.cardBorder, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: Lumen.fonts.label, fontSize: 15, color: Lumen.colors.accent },
  iconButton: { paddingHorizontal: 6, paddingVertical: 4 },
  removeText: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: '#d99' },
  emptyWrap: { alignItems: 'center', gap: 8, paddingVertical: 10 },
  emptyTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text, textAlign: 'center' },
  emptyText: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, textAlign: 'center' },
  quietTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text, marginBottom: 8 },
  quiet: { fontFamily: Lumen.fonts.body, fontSize: 12, lineHeight: 19, color: Lumen.colors.muted, marginTop: 12 },
  fieldLabel: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Lumen.colors.accent, marginBottom: 6 },
  input: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, borderWidth: 1, borderColor: Lumen.colors.cardBorder, borderRadius: Lumen.radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  codeInput: { fontFamily: Lumen.fonts.label, letterSpacing: 2, textAlign: 'center', fontSize: 17 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24, backgroundColor: Lumen.colors.accent, marginTop: 14 },
  primaryText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  secondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1, borderColor: Lumen.colors.cardBorder, marginTop: 6 },
  secondaryText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 14 },
  note: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.accent2, marginTop: 12 },
  lookup: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.accent2, marginTop: 8, textAlign: 'center' },
  problem: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: '#d99', marginTop: 8 },
  intentionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  intentionAuthor: { fontFamily: Lumen.fonts.label, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Lumen.colors.accent },
  intentionWhen: { fontFamily: Lumen.fonts.body, fontSize: 11, color: Lumen.colors.muted },
  intentionBody: { fontFamily: Lumen.fonts.display, fontSize: 19, lineHeight: 28, color: Lumen.colors.text, marginTop: 8 },
  answeredBody: { color: Lumen.colors.muted },
  answeredMark: { fontFamily: Lumen.fonts.body, fontStyle: 'italic', fontSize: 12, color: Lumen.colors.accent2, marginTop: 6 },
  intentionFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  prayButton: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  prayText: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: Lumen.colors.muted },
  prayCount: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, flex: 1 },
  comingText: { flex: 1, fontFamily: Lumen.fonts.body, fontStyle: 'italic', fontSize: 13, lineHeight: 20, color: Lumen.colors.muted },
});
