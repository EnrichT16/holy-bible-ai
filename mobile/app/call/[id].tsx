import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card } from '@/components/ui';
import { useAccount } from '@/state/AccountContext';
import { announce } from '@/lib/a11y';
import {
  CallState,
  endCall,
  fetchCallState,
  getVoiceTicket,
} from '@/lib/calls';
import {
  isReadingMessage,
  joinVoice,
  ReadingMessage,
  VoicePeer,
  VoiceSession,
  VOICE_SUPPORTED,
} from '@/lib/voice';
import { SharedPassage, SharedReading } from '@/components/SharedReading';

/**
 * The prayer call — a still room with voices in it.
 *
 * The screen joins the LiveKit room named by the call id, shows who is
 * present and who is being waited on, and offers exactly three acts:
 * mute, unmute, and leave. Every arrival and departure is spoken aloud,
 * because a voice call is above all a screen-reader's home ground.
 */

type Phase = 'connecting' | 'in-call' | 'ended' | 'failed';

const STATE_POLL_MS = 6_000;

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const callId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const { status, session, profile } = useAccount();
  const myId = session?.userId ?? '';

  const [phase, setPhase] = useState<Phase>('connecting');
  const [problem, setProblem] = useState<string | null>(null);
  const [peers, setPeers] = useState<VoicePeer[]>([]);
  const [muted, setMuted] = useState(false);
  const [call, setCall] = useState<CallState | null>(null);
  const [seconds, setSeconds] = useState(0);

  const voice = useRef<VoiceSession | null>(null);
  const prevPeers = useRef<Map<string, string>>(new Map());
  const leaving = useRef(false);

  // The page the whole call is reading, if anyone has opened the Word.
  const [reading, setReading] = useState<SharedPassage | null>(null);
  const readingRef = useRef<SharedPassage | null>(null);
  // True while this device made the newest choice — it then repeats the
  // choice for anyone who joins late.
  const iTurnedThePage = useRef(false);

  const chooseReading = (book: string, chapter: number) => {
    const next: SharedPassage = {
      book,
      chapter,
      at: Date.now(),
      byName: profile?.display_name?.trim() || 'A friend in Christ',
    };
    readingRef.current = next;
    iTurnedThePage.current = true;
    setReading(next);
    const message: ReadingMessage = { t: 'passage', ...next };
    voice.current?.sendData(message).catch(() => {});
  };

  const leave = useCallback(
    async (endForEveryone: boolean) => {
      if (leaving.current) return;
      leaving.current = true;
      try {
        await voice.current?.leave();
      } catch {
        // the room is already gone
      }
      voice.current = null;
      if (endForEveryone) {
        try {
          await endCall(callId);
        } catch {
          // the call row may already be ended
        }
      }
      router.back();
    },
    [callId, router],
  );

  const connect = useCallback(async () => {
    if (!callId || status !== 'signed-in') return;
    setPhase('connecting');
    setProblem(null);
    try {
      const ticket = await getVoiceTicket(callId, profile?.display_name ?? '');
      const session_ = await joinVoice(ticket.url, ticket.token, {
        onPeers: (next) => {
          const seen = new Map(next.map((p) => [p.identity, p.name]));
          let someoneArrived = false;
          for (const [identity, name] of seen) {
            if (!prevPeers.current.has(identity)) {
              announce(`${name} is here.`);
              someoneArrived = true;
            }
          }
          for (const [identity, name] of prevPeers.current) {
            if (!seen.has(identity)) announce(`${name} has left the call.`);
          }
          prevPeers.current = seen;
          setPeers(next);
          // Late arrivals find the call already on a page: whoever made
          // the newest choice repeats it for them a moment later.
          if (someoneArrived && iTurnedThePage.current && readingRef.current) {
            const repeat: ReadingMessage = { t: 'passage', ...readingRef.current };
            setTimeout(() => voice.current?.sendData(repeat).catch(() => {}), 1200);
          }
        },
        onDisconnected: () => {
          if (!leaving.current) {
            setPhase('ended');
            announce('The call has ended.');
          }
        },
        onData: (payload) => {
          if (!isReadingMessage(payload)) return;
          if (payload.at <= (readingRef.current?.at ?? 0)) return;
          const next: SharedPassage = {
            book: payload.book,
            chapter: payload.chapter,
            at: payload.at,
            byName: payload.byName?.trim() || 'A friend in Christ',
          };
          readingRef.current = next;
          iTurnedThePage.current = false;
          setReading(next);
          announce(`${next.byName} turned to ${next.book} chapter ${next.chapter}.`);
        },
      });
      voice.current = session_;
      setPhase('in-call');
      announce('You are in the prayer call.');
    } catch (e) {
      setPhase('failed');
      setProblem(e instanceof Error ? e.message : 'The call could not be joined.');
    }
  }, [callId, status, profile?.display_name]);

  // Join once signed-in state is known; hang up cleanly on unmount.
  useEffect(() => {
    if (status !== 'signed-in') return;
    void connect();
    return () => {
      leaving.current = true;
      voice.current?.leave().catch(() => {});
      voice.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, callId]);

  // The ringing truth: who accepted, who declined, whether it ended.
  useEffect(() => {
    if (status !== 'signed-in' || !callId) return;
    let alive = true;
    const poll = async () => {
      try {
        const state = await fetchCallState(callId);
        if (!alive || !state) return;
        setCall(state);
        if (state.endedAt && phase === 'in-call') {
          setPhase('ended');
          announce('The call has ended.');
          voice.current?.leave().catch(() => {});
          voice.current = null;
        }
      } catch {
        // offline for a moment; the voices carry on regardless
      }
    };
    void poll();
    const t = setInterval(() => void poll(), STATE_POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [status, callId, phase]);

  // A gentle clock, for sighted and spoken use alike.
  useEffect(() => {
    if (phase !== 'in-call') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const toggleMute = async () => {
    const next = !muted;
    try {
      await voice.current?.setMuted(next);
      setMuted(next);
      announce(next ? 'Your microphone is muted.' : 'Your microphone is on.');
    } catch {
      announce('That could not be changed just now.');
    }
  };

  const iAmCaller = call ? call.createdBy === myId : false;
  const waitingOn = (call?.invites ?? []).filter(
    (v) => v.userId !== myId && !peers.some((p) => p.identity === v.userId),
  );

  if (status === 'loading') {
    return (
      <Frame>
        <Card style={{ marginTop: 24, alignItems: 'center' }}>
          <ActivityIndicator color={Lumen.colors.accent} />
        </Card>
      </Frame>
    );
  }

  if (status !== 'signed-in') {
    return (
      <Frame>
        <Card style={{ marginTop: 24 }}>
          <Text style={styles.quiet}>
            A prayer call belongs to a circle, and a circle needs an account. Sign in
            and try the call again from your Prayer Circle.
          </Text>
          <Pressable
            style={styles.primary}
            onPress={() => router.replace('/account')}
            accessibilityRole="button"
            accessibilityLabel="Go to sign in"
          >
            <Text style={styles.primaryText}>Sign in</Text>
          </Pressable>
        </Card>
      </Frame>
    );
  }

  if (!VOICE_SUPPORTED) {
    return (
      <Frame>
        <Card style={{ marginTop: 24 }}>
          <Text style={styles.quiet}>
            Voice prayer calls work in the web app today. The store apps of Phase 4
            will carry them too — with a true ring, even on a locked phone.
          </Text>
          <Pressable
            style={styles.primary}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.primaryText}>Go back</Text>
          </Pressable>
        </Card>
      </Frame>
    );
  }

  return (
    <Frame>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title} accessibilityRole="header" aria-level={1}>
          {phase === 'ended' ? 'The prayer has ended' : 'Praying together'}
        </Text>
        <Text style={styles.subtitle}>
          “For where two or three are gathered together in my name, there am I in the
          midst of them.”
        </Text>

        {phase === 'connecting' && (
          <Card style={{ marginTop: 22, alignItems: 'center' }}>
            <ActivityIndicator color={Lumen.colors.accent} />
            <Text style={[styles.quiet, { textAlign: 'center', marginTop: 12 }]}>
              Joining the call…
            </Text>
          </Card>
        )}

        {phase === 'failed' && (
          <Card style={{ marginTop: 22 }}>
            <Text style={styles.problem}>{problem}</Text>
            <Pressable
              style={styles.primary}
              onPress={() => void connect()}
              accessibilityRole="button"
              accessibilityLabel="Try joining the call again"
            >
              <Ionicons name="refresh" size={16} color="#0d1830" aria-hidden />
              <Text style={styles.primaryText}>Try again</Text>
            </Pressable>
            <Pressable
              style={styles.secondary}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back without joining"
            >
              <Text style={styles.secondaryText}>Go back</Text>
            </Pressable>
          </Card>
        )}

        {(phase === 'in-call' || phase === 'ended') && (
          <>
            {phase === 'in-call' && (
              <Text
                style={styles.clock}
                accessibilityLabel={`In the call for ${clockSpoken(seconds)}`}
              >
                {clockShown(seconds)}
              </Text>
            )}

            <Card style={{ marginTop: 18 }}>
              <PersonRow name="You" speaking={false} note={muted ? 'Muted' : undefined} you />
              {peers.map((p) => (
                <PersonRow key={p.identity} name={p.name} speaking={p.speaking} />
              ))}
              {phase === 'in-call' &&
                waitingOn.map((v) => (
                  <PersonRow
                    key={v.userId}
                    name={v.name}
                    speaking={false}
                    note={
                      v.status === 'ringing'
                        ? 'Ringing…'
                        : v.status === 'declined'
                          ? 'Cannot join now'
                          : v.status === 'missed'
                            ? 'Missed the call'
                            : 'Joining…'
                    }
                  />
                ))}
            </Card>

            {phase === 'in-call' && (
              <SharedReading passage={reading} onChoose={chooseReading} />
            )}

            {phase === 'in-call' ? (
              <View style={styles.controls}>
                <Pressable
                  style={[styles.roundBtn, muted && styles.roundBtnActive]}
                  onPress={() => void toggleMute()}
                  accessibilityRole="button"
                  accessibilityLabel={muted ? 'Unmute your microphone' : 'Mute your microphone'}
                  accessibilityState={{ selected: muted }}
                >
                  <Ionicons
                    name={muted ? 'mic-off' : 'mic'}
                    size={24}
                    color={muted ? '#0d1830' : Lumen.colors.text}
                    aria-hidden
                  />
                </Pressable>
                <Pressable
                  style={[styles.roundBtn, styles.hangUp]}
                  onPress={() => void leave(iAmCaller)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    iAmCaller ? 'End the prayer call for everyone' : 'Leave the prayer call'
                  }
                >
                  <Ionicons name="call" size={24} color="#fff" style={styles.hangUpIcon} aria-hidden />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.primary}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Return to your circle"
              >
                <Text style={styles.primaryText}>Amen</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.body}>{children}</View>
    </Screen>
  );
}

function PersonRow({
  name,
  speaking,
  note,
  you,
}: {
  name: string;
  speaking: boolean;
  note?: string;
  you?: boolean;
}) {
  return (
    <View
      style={styles.person}
      accessibilityLabel={`${name}${speaking ? '. Speaking.' : ''}${note ? `. ${note}.` : ''}`}
    >
      <View style={[styles.dot, speaking && styles.dotSpeaking]} aria-hidden />
      <Text style={[styles.personName, you && { color: Lumen.colors.muted }]} aria-hidden>
        {name}
      </Text>
      {note ? (
        <Text style={styles.personNote} aria-hidden>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

function clockShown(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

function clockSpoken(s: number): string {
  const m = Math.floor(s / 60);
  if (m === 0) return 'under a minute';
  return m === 1 ? 'one minute' : `${m} minutes`;
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 18 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text },
  subtitle: {
    fontFamily: Lumen.fonts.display,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
    color: Lumen.colors.muted,
    marginTop: 8,
  },
  clock: {
    fontFamily: Lumen.fonts.label,
    fontSize: 14,
    letterSpacing: 2,
    color: Lumen.colors.accent,
    marginTop: 16,
    textAlign: 'center',
  },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(155,176,208,0.4)',
  },
  dotSpeaking: { backgroundColor: Lumen.colors.bright },
  personName: { flex: 1, fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  personNote: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
    marginTop: 30,
  },
  roundBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Lumen.colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  hangUp: { backgroundColor: '#a33', borderColor: '#a33' },
  hangUpIcon: { transform: [{ rotate: '135deg' }] },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: Lumen.colors.accent,
    marginTop: 18,
  },
  primaryText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  secondary: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Lumen.colors.cardBorder,
    marginTop: 10,
  },
  secondaryText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 14 },
  quiet: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 22, color: Lumen.colors.muted },
  problem: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: '#d99' },
});
