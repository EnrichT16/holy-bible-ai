import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { useTheme } from '@/theme/ThemeContext';
import { Screen, Card, Label } from '@/components/ui';
import { getLiturgicalDay } from '@/lib/liturgical';
import { getPref } from '@/lib/storage';

const VERSES = [
  { ref: 'Job 22:28', text: 'Thou shalt also decree a thing, and it shall be established unto thee: and the light shall shine upon thy ways.' },
  { ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
  { ref: 'Lamentations 3:23', text: 'They are new every morning: great is thy faithfulness.' },
  { ref: 'John 8:12', text: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.' },
  { ref: 'Proverbs 3:5', text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
  { ref: 'Isaiah 40:31', text: 'They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' },
];

function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const COLOR_SWATCH: Record<string, string> = {
  green: '#3f7d5a',
  violet: '#6a4b8a',
  white: '#e7e0cf',
  red: '#a4433f',
  rose: '#c98ea0',
};

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const now = useMemo(() => new Date(), []);

  // First open: walk the welcome once, then never again.
  useEffect(() => {
    getPref('onboarded').then((v) => {
      if (!v) router.replace('/onboarding');
    });
  }, [router]);
  const lit = useMemo(() => getLiturgicalDay(now), [now]);
  const verse = VERSES[Math.floor(now.getTime() / 86400000) % VERSES.length];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{greeting(now)}</Text>
        <Text style={styles.wordmark}>Holy Bible</Text>
        <Text style={styles.subwordmark}>· AI Assisted ·</Text>

        {/* Verse of the day */}
        <Card style={{ marginTop: 22 }}>
          <Label>Verse of the day</Label>
          <Text style={styles.verse}>{verse.text}</Text>
          <Text style={styles.verseRef}>{verse.ref} · KJV</Text>
        </Card>

        {/* The liturgical day */}
        <Card style={{ marginTop: 14 }}>
          <View style={styles.litHeader}>
            <View style={{ flex: 1 }}>
              <Label>The day</Label>
              <Text style={styles.litDate}>{lit.dateLabel}</Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: COLOR_SWATCH[lit.color] }]} />
          </View>
          <View style={styles.litRow}>
            <LitFact label="Season" value={lit.season} />
            <LitFact label="Cycle" value={`Year ${lit.cycle}`} />
            <LitFact label="Mysteries" value={lit.mysteries} />
          </View>
          {lit.nextFeast && (
            <Text style={styles.feast}>
              Coming feast · {lit.nextFeast.name}
              {lit.nextFeast.inDays === 0 ? ' — today' : ` — in ${lit.nextFeast.inDays} day${lit.nextFeast.inDays === 1 ? '' : 's'}`}
            </Text>
          )}
        </Card>

        {/* Quick ways in */}
        <Label style={{ marginTop: 26, marginBottom: 12 }}>Begin</Label>
        <Way icon="book-outline" title="Read the Word" sub="KJV · every book and chapter" onPress={() => router.push('/bible')} accent={theme.accent} />
        <Way icon="mic-outline" title="Speak the Word" sub="Hear it read · ask what it means" onPress={() => router.push('/listen')} accent={theme.accent} />
        <Way icon="flower-outline" title="Pray the Rosary" sub={`Today: the ${lit.mysteries} Mysteries`} onPress={() => router.push('/rosary')} accent={theme.accent} />
        <Way icon="heart-outline" title="Support this app" sub="Keep the Word freely given" onPress={() => router.push('/give')} accent={theme.accent} />

        <Text style={styles.themeNote}>Today's light: {theme.label} — {theme.note.toLowerCase()}</Text>
        <View style={{ height: 90 }} />
      </ScrollView>
    </Screen>
  );
}

function LitFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function Way({
  icon, title, sub, onPress, accent,
}: { icon: any; title: string; sub: string; onPress: () => void; accent: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.way, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={[styles.wayIcon, { borderColor: accent + '55' }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.wayTitle}>{title}</Text>
        <Text style={styles.waySub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Lumen.colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12 },
  greeting: { fontFamily: Lumen.fonts.body, fontSize: 16, color: Lumen.colors.muted },
  wordmark: { fontFamily: Lumen.fonts.displaySemi, fontSize: 44, color: Lumen.colors.text, marginTop: 2 },
  subwordmark: { fontFamily: Lumen.fonts.label, fontSize: 13, letterSpacing: 4, color: Lumen.colors.accent, marginTop: 2 },
  verse: { fontFamily: Lumen.fonts.display, fontSize: 23, lineHeight: 32, color: Lumen.colors.text, marginTop: 12 },
  verseRef: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: Lumen.colors.accent, marginTop: 12, letterSpacing: 0.5 },
  litHeader: { flexDirection: 'row', alignItems: 'center' },
  litDate: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.text, marginTop: 6 },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  litRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
  factLabel: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1.5, color: Lumen.colors.muted, textTransform: 'uppercase' },
  factValue: { fontFamily: Lumen.fonts.bodyBold, fontSize: 15, color: Lumen.colors.text, marginTop: 4 },
  feast: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.accent2, marginTop: 16 },
  way: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  wayIcon: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  wayTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  waySub: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.muted, marginTop: 1 },
  themeNote: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 24, textAlign: 'center', fontStyle: 'italic' },
});
