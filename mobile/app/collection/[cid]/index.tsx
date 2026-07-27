import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card } from '@/components/ui';
import { findCollection } from '@/data/library';

/** A Library collection — its readable entries. */
export default function Collection() {
  const router = useRouter();
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const collection = findCollection(String(cid));

  if (!collection) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Text style={styles.missing}>This collection does not exist.</Text>
      </Screen>
    );
  }

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
        <Text style={styles.title}>{collection.title}</Text>
        <Text style={styles.subtitle}>{collection.intro}</Text>

        <View style={{ marginTop: 18 }}>
          {collection.entries.map((e) => (
            <Pressable key={e.id} onPress={() => router.push(`/collection/${collection.id}/${e.id}` as any)}>
              <Card style={styles.row}>
                <Ionicons name={collection.icon as any} size={20} color={Lumen.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{e.title}</Text>
                  <Text style={styles.rowSub}>{e.meta}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
              </Card>
            </Pressable>
          ))}
        </View>
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
  missing: { fontFamily: Lumen.fonts.body, color: Lumen.colors.muted, textAlign: 'center', marginTop: 60 },
});
