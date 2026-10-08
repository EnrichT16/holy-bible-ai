import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { CONFIG } from '@/lib/config';
import { announce } from '@/lib/a11y';

const AMOUNTS = [5, 10, 25, 50];

const CAUSES = [
  { icon: 'happy-outline', label: 'Orphanages & babies’ homes' },
  { icon: 'people-outline', label: 'Homes for the elderly' },
  { icon: 'eye-outline', label: 'The disabled & the blind' },
  { icon: 'restaurant-outline', label: 'Food & shelter' },
  { icon: 'medkit-outline', label: 'Disaster & emergency relief' },
  { icon: 'business-outline', label: 'The Church in Rome' },
];

export default function Give() {
  const router = useRouter();
  const [monthly, setMonthly] = useState(false);
  const [amount, setAmount] = useState<number | null>(10);
  const [giftAid, setGiftAid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [thanked, setThanked] = useState(false);

  // Stripe brings the giver home with ?thanks=1 after a completed gift.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('thanks') === '1') {
      setThanked(true);
      announce('Thank you. Your gift is received, and the Word stays freely given.');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (problem) announce(problem);
  }, [problem]);

  // Ask the backend for a Stripe Checkout page. The secret key lives
  // only on the server, and the card is typed only on Stripe's page.
  const openGiving = async () => {
    if (!amount || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch(`${CONFIG.backendUrl}/api/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_pounds: amount,
          frequency: monthly ? 'monthly' : 'once',
          gift_aid: giftAid,
        }),
      });
      if (res.status === 503) {
        setProblem('Giving is nearly ready — the server has not been given its Stripe key yet.');
        return;
      }
      if (!res.ok) {
        let detail = '';
        try {
          detail = ((await res.json()) as { detail?: string }).detail ?? '';
        } catch {
          // keep the plain sentence below
        }
        setProblem(detail || 'The giving page could not be opened just now. Please try again.');
        return;
      }
      const { url } = (await res.json()) as { url: string };
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.assign(url);
      } else {
        await Linking.openURL(url);
      }
    } catch {
      setProblem('The giving page could not be reached. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close Give">
          <Ionicons name="chevron-down" size={26} color={Lumen.colors.text} aria-hidden />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header" aria-level={1}>Give</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Ionicons name="heart" size={30} color={Lumen.colors.accent} />
          <Text style={styles.title}>Support this app</Text>
          <Text style={styles.subtitle}>
            Holy Bible is a gift, freely given. Your generosity keeps the Word within reach for
            everyone — never a paywall on Scripture.
          </Text>
        </View>

        {thanked && (
          <Card style={{ marginBottom: 18 }}>
            <Text style={styles.thanks}>
              Thank you — your gift is received. “God loveth a cheerful giver.”
            </Text>
          </Card>
        )}

        {/* Frequency */}
        <View style={styles.freqRow}>
          {[['once', 'One-time'], ['monthly', 'Monthly']].map(([k, lbl]) => {
            const active = (k === 'monthly') === monthly;
            return (
              <Pressable
                key={k}
                style={[styles.freqChip, active && styles.freqActive]}
                onPress={() => setMonthly(k === 'monthly')}
                accessibilityRole="button"
                accessibilityLabel={`${lbl} gift`}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.freqText, active && styles.freqTextActive]}>{lbl}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Amount chips */}
        <Label style={{ marginTop: 20, marginBottom: 10 }}>Choose an amount</Label>
        <View style={styles.amountGrid}>
          {AMOUNTS.map((a) => (
            <Pressable
              key={a}
              style={[styles.amountChip, amount === a && styles.amountActive]}
              onPress={() => setAmount(a)}
              accessibilityRole="button"
              accessibilityLabel={`${a} pounds`}
              accessibilityState={{ selected: amount === a }}
            >
              <Text style={[styles.amountText, amount === a && styles.amountTextActive]}>£{a}</Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.amountChip, amount === null && styles.amountActive]}
            onPress={() => setAmount(null)}
            accessibilityRole="button"
            accessibilityLabel="Another amount — coming soon; choose one of the set amounts for now"
            accessibilityState={{ selected: amount === null }}
          >
            <Text style={[styles.amountText, amount === null && styles.amountTextActive]}>Other</Text>
          </Pressable>
        </View>
        {amount === null && (
          <Text style={styles.otherNote}>
            A free-amount box is coming; for today, choose one of the set amounts.
          </Text>
        )}

        {/* Gift Aid */}
        <Pressable
          style={styles.giftAid}
          onPress={() => setGiftAid((g) => !g)}
          accessibilityRole="checkbox"
          accessibilityLabel="Add Gift Aid. UK taxpayers can boost their gift by 25 percent at no extra cost"
          accessibilityState={{ checked: giftAid }}
        >
          <Ionicons name={giftAid ? 'checkbox' : 'square-outline'} size={22} color={Lumen.colors.accent} aria-hidden />
          <Text style={styles.giftAidText}>
            Add Gift Aid — UK taxpayers can boost their gift by 25% at no extra cost.
          </Text>
        </Pressable>

        <Pressable
          style={[styles.giveBtn, (!amount || busy) && { opacity: 0.45 }]}
          onPress={() => void openGiving()}
          disabled={!amount || busy}
          accessibilityRole="button"
          accessibilityLabel={`Give${amount ? ` ${amount} pounds` : ''}${monthly ? ' each month' : ''}`}
          accessibilityHint="Opens Stripe's secure payment page"
          accessibilityState={{ disabled: !amount || busy }}
        >
          {busy ? (
            <ActivityIndicator color="#0d1830" />
          ) : (
            <>
              <Ionicons name="gift-outline" size={22} color="#0d1830" aria-hidden />
              <Text style={styles.giveBtnText}>
                Give {amount ? `£${amount}` : ''}{monthly ? ' / month' : ''}
              </Text>
            </>
          )}
        </Pressable>
        {problem && <Text style={styles.problem}>{problem}</Text>}
        <Text style={styles.secureNote}>
          Payment happens on Stripe's secure page — your card never touches this app.
        </Text>

        {/* Verified causes */}
        <Label style={{ marginTop: 30, marginBottom: 10 }}>Verified causes</Label>
        <Card>
          {CAUSES.map((c, i) => (
            <View key={c.label} style={[styles.causeRow, i > 0 && styles.causeDivider]}>
              <Ionicons name={c.icon as any} size={20} color={Lumen.colors.accent} />
              <Text style={styles.causeText}>{c.label}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Label>Transparency wall</Label>
          <Text style={styles.transparency}>
            Gifts are shown by initials and amount only — never full names, and only if the giver
            agrees. Donations are kept separate from any future subscription.
          </Text>
        </Card>

        <Text style={styles.scripture}>
          “God loveth a cheerful giver.”
        </Text>
        <Text style={styles.scriptureRef}>2 Corinthians 9:7 · KJV</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.text },
  content: { paddingHorizontal: 20, paddingTop: 6 },
  hero: { alignItems: 'center', gap: 10, marginBottom: 24 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 28, color: Lumen.colors.text },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 22, color: Lumen.colors.muted, textAlign: 'center' },
  freqRow: { flexDirection: 'row', gap: 10 },
  freqChip: { flex: 1, paddingVertical: 12, borderRadius: Lumen.radius.pill, alignItems: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  freqActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  freqText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 15 },
  freqTextActive: { color: '#0d1830' },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountChip: { minWidth: 72, flexGrow: 1, paddingVertical: 14, borderRadius: Lumen.radius.md, alignItems: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  amountActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  amountText: { fontFamily: Lumen.fonts.displaySemi, fontSize: 20, color: Lumen.colors.text },
  amountTextActive: { color: '#0d1830' },
  giftAid: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, padding: 14, borderRadius: Lumen.radius.md, backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  giftAidText: { flex: 1, fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.text },
  giveBtn: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Lumen.colors.accent, paddingVertical: 16, borderRadius: Lumen.radius.pill },
  giveBtnText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 17 },
  secureNote: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, textAlign: 'center', marginTop: 10 },
  thanks: { fontFamily: Lumen.fonts.display, fontSize: 17, lineHeight: 26, color: Lumen.colors.accent2, textAlign: 'center' },
  otherNote: { fontFamily: Lumen.fonts.body, fontSize: 12, lineHeight: 18, color: Lumen.colors.muted, marginTop: 8, textAlign: 'center' },
  problem: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: '#d99', textAlign: 'center', marginTop: 10 },
  causeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  causeDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  causeText: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text },
  transparency: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, marginTop: 10 },
  scripture: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text, textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
  scriptureRef: { fontFamily: Lumen.fonts.label, fontSize: 11, letterSpacing: 1, color: Lumen.colors.accent, textAlign: 'center', marginTop: 8 },
});
