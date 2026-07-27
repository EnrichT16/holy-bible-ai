import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { getLiturgicalDay } from '@/lib/liturgical';
import { MYSTERIES } from '@/data/rosary';

const COLOR_SWATCH: Record<string, string> = {
  green: '#3f7d4e',
  violet: '#6b4f8a',
  white: '#e8e4d8',
  red: '#a03a3a',
  rose: '#c97b8e',
};

/**
 * The Day — the liturgical calendar opened out: season, colour, cycle,
 * the day's mysteries, and the coming feast, with the day's devotions
 * one tap away.
 */
export default function CatholicDay() {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const lit = useMemo(() => getLiturgicalDay(now), [now]);
  const mysteries = MYSTERIES[lit.mysteries];

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>The Day</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{lit.dateLabel}</Text>

        <Card style={{ marginTop: 16 }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>Season</Label>
              <Text style={styles.big}>{lit.season}</Text>
            </View>
            <View style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: COLOR_SWATCH[lit.color] ?? Lumen.colors.accent }]} />
              <Text style={styles.swatchLabel}>{lit.color}</Text>
            </View>
          </View>
          <View style={[styles.row, { marginTop: 16 }]}>
            <View style={{ flex: 1 }}>
              <Label>Sunday cycle</Label>
              <Text style={styles.big}>Year {lit.cycle}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Label>Mysteries</Label>
              <Text style={styles.big}>{lit.mysteries}</Text>
            </View>
          </View>
        </Card>

        {lit.nextFeast && (
          <Card style={{ marginTop: 12 }}>
            <Label>Coming feast</Label>
            <Text style={styles.feast}>{lit.nextFeast.name}</Text>
            <Text style={styles.feastWhen}>
              {lit.nextFeast.inDays === 0 ? 'Today' : lit.nextFeast.inDays === 1 ? 'Tomorrow' : `In ${lit.nextFeast.inDays} days`}
            </Text>
          </Card>
        )}

        <Label style={{ marginTop: 24, marginBottom: 8 }}>Today's mysteries · {mysteries.day}</Label>
        <Card>
          {mysteries.list.map((m, i) => (
            <View key={m} style={[styles.mysteryRow, i > 0 && styles.mysteryDivider]}>
              <Text style={styles.mysteryNum}>{i + 1}</Text>
              <Text style={styles.mysteryName}>{m}</Text>
            </View>
          ))}
        </Card>

        <Pressable style={styles.cta} onPress={() => router.push('/rosary')}>
          <Ionicons name="flower-outline" size={18} color="#0d1830" />
          <Text style={styles.ctaText}>Pray today's Rosary</Text>
        </Pressable>
        <Pressable style={styles.ctaGhost} onPress={() => router.push('/chaplet')}>
          <Ionicons name="water-outline" size={18} color={Lumen.colors.accent} />
          <Text style={styles.ctaGhostText}>The Divine Mercy Chaplet</Text>
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.muted },
  body: { paddingHorizontal: 22 },
  date: { fontFamily: Lumen.fonts.displaySemi, fontSize: 28, color: Lumen.colors.text, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  big: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.text, marginTop: 4 },
  swatchWrap: { alignItems: 'center', gap: 4 },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  swatchLabel: { fontFamily: Lumen.fonts.label, fontSize: 9, letterSpacing: 1, color: Lumen.colors.muted, textTransform: 'uppercase' },
  feast: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.accent2, marginTop: 4 },
  feastWhen: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.muted, marginTop: 2 },
  mysteryRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 9 },
  mysteryDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  mysteryNum: { fontFamily: Lumen.fonts.displaySemi, fontSize: 18, color: Lumen.colors.accent, width: 18, textAlign: 'center' },
  mysteryName: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.text, flex: 1 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22, height: 50, borderRadius: 25, backgroundColor: Lumen.colors.accent },
  ctaText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  ctaGhost: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, height: 50, borderRadius: 25, borderWidth: 1, borderColor: Lumen.colors.cardBorder, backgroundColor: Lumen.colors.card },
  ctaGhostText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.accent, fontSize: 15 },
});
