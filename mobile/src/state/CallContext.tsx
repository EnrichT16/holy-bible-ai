import { useEffect, useRef, useState, ReactNode } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { useAccount } from '@/state/AccountContext';
import { announce, useReducedMotion } from '@/lib/a11y';
import { answerCall, fetchRinging, touchPresence, RingingCall } from '@/lib/calls';

/**
 * The app-wide ear for prayer calls. While a signed-in person has the
 * app open it does two quiet things: touches their presence so friends
 * see them as reachable, and listens for a ring. A ring becomes a
 * full-screen invitation — spoken aloud for screen readers, repeated
 * gently like a real ring — with one button to answer and one to
 * decline. Signed out, this renders children and nothing more.
 */

const HEARTBEAT_MS = 60_000;
const RING_POLL_MS = 8_000;

export function CallProvider({ children }: { children: ReactNode }) {
  const { status, session } = useAccount();
  const myId = session?.userId ?? null;
  const reducedMotion = useReducedMotion();

  const [incoming, setIncoming] = useState<RingingCall | null>(null);
  const [busy, setBusy] = useState(false);
  // Calls already answered, declined, or ignored — never ring twice.
  const handled = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (status !== 'signed-in' || !myId) {
      setIncoming(null);
      return;
    }

    let alive = true;

    // If the schema is older than Slice 2 these calls fail quietly;
    // the circle screen is where that is explained, not a toast here.
    const beat = () => {
      touchPresence().catch(() => {});
    };
    beat();
    const heartbeat = setInterval(beat, HEARTBEAT_MS);

    const poll = async () => {
      try {
        const ring = await fetchRinging(myId);
        if (!alive) return;
        if (ring && !handled.current.has(ring.callId)) {
          setIncoming((current) => {
            const fresh = current?.callId !== ring.callId;
            announce(
              fresh
                ? `${ring.callerName} is calling you to pray. The answer and decline buttons are on screen.`
                : `${ring.callerName} is still calling.`,
            );
            return ring;
          });
        } else {
          setIncoming(null);
        }
      } catch {
        // offline, or the schema is not installed — stay quiet
      }
    };
    void poll();
    const ringing = setInterval(() => void poll(), RING_POLL_MS);

    return () => {
      alive = false;
      clearInterval(heartbeat);
      clearInterval(ringing);
    };
  }, [status, myId]);

  const respond = async (accept: boolean) => {
    if (!incoming || busy) return;
    const call = incoming;
    setBusy(true);
    handled.current.add(call.callId);
    try {
      await answerCall(call.callId, accept);
      setIncoming(null);
      if (accept) {
        router.push(`/call/${call.callId}`);
      } else {
        announce('Call declined.');
      }
    } catch {
      handled.current.delete(call.callId);
      announce('That could not be answered. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {children}
      <Modal
        visible={!!incoming}
        transparent
        animationType={reducedMotion ? 'none' : 'fade'}
        onRequestClose={() => void respond(false)}
        accessibilityViewIsModal
        {...(Platform.OS === 'web' ? { 'aria-modal': true } : {})}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.halo} aria-hidden>
              <Ionicons name="call" size={30} color="#0d1830" />
            </View>
            <Text style={styles.name} accessibilityRole="header" aria-level={1}>
              {incoming?.callerName ?? ''}
            </Text>
            <Text style={styles.line}>is calling you to pray</Text>
            <Pressable
              style={styles.answer}
              onPress={() => void respond(true)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={`Answer the call from ${incoming?.callerName ?? 'your friend'}`}
              accessibilityState={{ disabled: busy }}
            >
              <Ionicons name="call" size={18} color="#0d1830" aria-hidden />
              <Text style={styles.answerText}>Answer</Text>
            </Pressable>
            <Pressable
              style={styles.decline}
              onPress={() => void respond(false)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={`Decline the call from ${incoming?.callerName ?? 'your friend'}`}
              accessibilityState={{ disabled: busy }}
            >
              <Ionicons name="close" size={18} color={Lumen.colors.muted} aria-hidden />
              <Text style={styles.declineText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,12,26,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    backgroundColor: '#111f3d',
    borderRadius: Lumen.radius.lg,
    borderWidth: 1,
    borderColor: Lumen.colors.cardBorder,
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  halo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Lumen.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: { fontFamily: Lumen.fonts.displaySemi, fontSize: 26, color: Lumen.colors.text, textAlign: 'center' },
  line: { fontFamily: Lumen.fonts.body, fontSize: 14, color: Lumen.colors.muted, marginTop: 4, marginBottom: 22 },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: Lumen.colors.accent,
  },
  answerText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 16 },
  decline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: Lumen.colors.cardBorder,
    marginTop: 10,
  },
  declineText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 14 },
});
