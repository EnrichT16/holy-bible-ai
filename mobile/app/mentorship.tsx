import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { SEMINAR } from '@/data/mentorship';

/**
 * Mentorship — guided tracks walked week by week. The Life in the Spirit
 * Seminar is the first; more tracks follow.
 */
export default function Mentorship() {
  const router = useRouter();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mentorship</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Life in the Spirit</Text>
        <Text style={styles.subtitle}>
          The classic seven-week seminar — from knowing God's love to a Spirit-filled,
          sent-out life. Walk one session a week; don't hurry the fire.
        </Text>

        <Label style={{ marginTop: 24, marginBottom: 10 }}>The seven sessions</Label>
        {SEMINAR.map((s) => (
          <Pressable key={s.id} onPress={() => router.push(`/seminar/${s.id}` as any)}>
            <Card style={styles.row}>
              <View style={styles.week}>
                <Text style={styles.weekNum}>{s.week}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.title}</Text>
                <Text style={styles.rowSub}>{s.aim}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
            </Card>
          </Pressable>
        ))}

        <Label style={{ marginTop: 20, marginBottom: 10 }}>More tracks</Label>
        <Card style={styles.row}>
          <Ionicons name="book-outline" size={22} color={Lumen.colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: Lumen.colors.muted }]}>Walking with the Word</Text>
            <Text style={styles.rowSub}>A year through the Gospels — coming soon</Text>
          </View>
        </Card>

        <Text style={styles.footnote}>
          Each session carries an “Ask your guide” — the AI study companion — for
          questions along the way. It is an aid, never a replacement for Scripture,
          the Church, or your pastor.
        </Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.muted },
  body: { paddingHorizontal: 22 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text, marginTop: 6 },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  week: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Lumen.colors.cardBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  weekNum: { fontFamily: Lumen.fonts.displaySemi, fontSize: 18, color: Lumen.colors.accent },
  rowTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  rowSub: { fontFamily: Lumen.fonts.body, fontSize: 12, lineHeight: 17, color: Lumen.colors.muted, marginTop: 1 },
  footnote: { fontFamily: Lumen.fonts.body, fontSize: 12.5, lineHeight: 19, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 18 },
});
