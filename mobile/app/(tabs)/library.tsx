import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';

/**
 * The Library — featured works, collections, and ways to grow the shelf.
 * Phase 1 previews the shape; the readable works, uploads, and the admin
 * review queue arrive in Phase 2 (they need cloud storage).
 */

const FEATURED = [
  { title: 'The Secret of the Rosary', author: 'St. Louis de Montfort' },
  { title: 'Diary — Divine Mercy in My Soul', author: 'St. Faustina Kowalska' },
];

const STARTER_SHELF = [
  ['Confessions', 'Augustine'],
  ['The Imitation of Christ', 'Thomas à Kempis'],
  ['The Practice of the Presence of God', 'Brother Lawrence'],
  ['Interior Castle', 'Teresa of Ávila'],
  ['Dark Night of the Soul', 'John of the Cross'],
  ['Pilgrim’s Progress', 'John Bunyan'],
  ['Story of a Soul', 'Thérèse of Lisieux'],
];

const COLLECTIONS = [
  { icon: 'people-outline', title: 'Book of the Saints', sub: 'Life · feast day · patronage · writings' },
  { icon: 'megaphone-outline', title: 'Prophets', sub: 'The voices that pointed to Christ' },
  { icon: 'ribbon-outline', title: 'Artifacts & Documents', sub: 'Relics, letters, and sources' },
];

export default function Library() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>The Library</Text>
        <Text style={styles.subtitle}>Full public-domain works, free to read and to hear. Every book can be read aloud.</Text>

        <Label style={styles.sectionLabel}>Featured works</Label>
        {FEATURED.map((f) => (
          <Card key={f.title} style={styles.featured}>
            <Ionicons name="book" size={22} color={Lumen.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.featuredTitle}>{f.title}</Text>
              <Text style={styles.featuredAuthor}>{f.author}</Text>
            </View>
          </Card>
        ))}

        <Label style={styles.sectionLabel}>Collections</Label>
        {COLLECTIONS.map((c) => (
          <Card key={c.title} style={styles.row}>
            <Ionicons name={c.icon as any} size={22} color={Lumen.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{c.title}</Text>
              <Text style={styles.rowSub}>{c.sub}</Text>
            </View>
            <Text style={styles.coming}>Phase 2</Text>
          </Card>
        ))}

        <Label style={styles.sectionLabel}>Starter shelf</Label>
        <Card>
          {STARTER_SHELF.map(([t, a], i) => (
            <View key={t} style={[styles.shelfRow, i > 0 && styles.shelfDivider]}>
              <Text style={styles.shelfTitle}>{t}</Text>
              <Text style={styles.shelfAuthor}>{a}</Text>
            </View>
          ))}
        </Card>

        <Label style={styles.sectionLabel}>Grow the library</Label>
        <Card style={styles.row}>
          <Ionicons name="search-outline" size={22} color={Lumen.colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Find free books</Text>
            <Text style={styles.rowSub}>CCEL · Gutenberg · Internet Archive · Wikisource</Text>
          </View>
          <Text style={styles.coming}>Phase 2</Text>
        </Card>
        <Card style={styles.row}>
          <Ionicons name="cloud-upload-outline" size={22} color={Lumen.colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Submit your book</Text>
            <Text style={styles.rowSub}>Reviewed with its author before publishing</Text>
          </View>
          <Text style={styles.coming}>Phase 2</Text>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 32, color: Lumen.colors.text },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6 },
  sectionLabel: { marginTop: 26, marginBottom: 12 },
  featured: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  featuredTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  featuredAuthor: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.muted, marginTop: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  rowTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  rowSub: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  coming: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1, color: Lumen.colors.accent, borderWidth: 1, borderColor: Lumen.colors.cardBorder, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Lumen.radius.pill },
  shelfRow: { paddingVertical: 10 },
  shelfDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  shelfTitle: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.text },
  shelfAuthor: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
});
