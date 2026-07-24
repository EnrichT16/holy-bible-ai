import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { CONFIG } from '@/lib/config';

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

  const openGiving = () => {
    const url = new URL(CONFIG.donationUrl);
    if (amount) url.searchParams.set('amount', String(amount));
    url.searchParams.set('frequency', monthly ? 'monthly' : 'once');
    if (giftAid) url.searchParams.set('giftaid', 'yes');
    Linking.openURL(url.toString()).catch(() => Linking.openURL(CONFIG.donationUrl).catch(() => {}));
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Give</Text>
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

        {/* Frequency */}
        <View style={styles.freqRow}>
          {[['once', 'One-time'], ['monthly', 'Monthly']].map(([k, lbl]) => {
            const active = (k === 'monthly') === monthly;
            return (
              <Pressable key={k} style={[styles.freqChip, active && styles.freqActive]} onPress={() => setMonthly(k === 'monthly')}>
                <Text style={[styles.freqText, active && styles.freqTextActive]}>{lbl}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Amount chips */}
        <Label style={{ marginTop: 20, marginBottom: 10 }}>Choose an amount</Label>
        <View style={styles.amountGrid}>
          {AMOUNTS.map((a) => (
            <Pressable key={a} style={[styles.amountChip, amount === a && styles.amountActive]} onPress={() => setAmount(a)}>
              <Text style={[styles.amountText, amount === a && styles.amountTextActive]}>£{a}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.amountChip, amount === null && styles.amountActive]} onPress={() => setAmount(null)}>
            <Text style={[styles.amountText, amount === null && styles.amountTextActive]}>Other</Text>
          </Pressable>
        </View>

        {/* Gift Aid */}
        <Pressable style={styles.giftAid} onPress={() => setGiftAid((g) => !g)}>
          <Ionicons name={giftAid ? 'checkbox' : 'square-outline'} size={22} color={Lumen.colors.accent} />
          <Text style={styles.giftAidText}>
            Add Gift Aid — UK taxpayers can boost their gift by 25% at no extra cost.
          </Text>
        </Pressable>

        <Pressable style={styles.giveBtn} onPress={openGiving}>
          <Ionicons name="gift-outline" size={22} color="#0d1830" />
          <Text style={styles.giveBtnText}>
            Give {amount ? `£${amount}` : ''}{monthly ? ' / month' : ''}
          </Text>
        </Pressable>
        <Text style={styles.secureNote}>Opens our secure donation page in your browser.</Text>

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
  causeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  causeDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  causeText: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text },
  transparency: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, marginTop: 10 },
  scripture: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text, textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
  scriptureRef: { fontFamily: Lumen.fonts.label, fontSize: 11, letterSpacing: 1, color: Lumen.colors.accent, textAlign: 'center', marginTop: 8 },
});
