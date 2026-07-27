import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card } from '@/components/ui';
import { FREE_BOOK_SOURCES } from '@/data/library';

/** Find free books — trusted sources of complete, legal, free spiritual reading. */
export default function FreeBooks() {
  const router = useRouter();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>The Library</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Find free books</Text>
        <Text style={styles.subtitle}>
          Whole libraries of public-domain spiritual reading, free and legal. These open in
          your browser; in a later phase, favourites will live on your shelf here.
        </Text>

        <View style={{ marginTop: 18 }}>
          {FREE_BOOK_SOURCES.map((s) => (
            <Pressable key={s.url} onPress={() => Linking.openURL(s.url).catch(() => {})}>
              <Card style={styles.row}>
                <Ionicons name="globe-outline" size={20} color={Lumen.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{s.title}</Text>
                  <Text style={styles.rowSub}>{s.sub}</Text>
                </View>
                <Ionicons name="open-outline" size={17} color={Lumen.colors.muted} />
              </Card>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footnote}>
          Start with the starter shelf: every title on it can be found free at these sources.
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
  rowTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  rowSub: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  footnote: { fontFamily: Lumen.fonts.body, fontSize: 12.5, lineHeight: 19, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 16 },
});
