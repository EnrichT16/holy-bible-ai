import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Label } from '@/components/ui';

/**
 * More — the hub for everything that does not belong on the home screen.
 * Per the blueprint, the Catholic devotions and Churches live in here,
 * never on Home. Phase 3 opens the community half: accounts and the
 * Prayer Circle are live, and the prayer calls themselves come next.
 */
export default function More() {
  const router = useRouter();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>More</Text>

        <Label style={styles.sectionLabel}>Pray</Label>
        <Item icon="flower-outline" title="The Rosary" sub="Guided, illuminated bead by bead" onPress={() => router.push('/rosary')} live />
        <Item icon="water-outline" title="Divine Mercy Chaplet" sub="Guided, on ordinary rosary beads" onPress={() => router.push('/chaplet')} live />
        <Item icon="heart-outline" title="Support this app" sub="Keep the Word freely given" onPress={() => router.push('/give')} live />

        <Label style={styles.sectionLabel}>For Catholics</Label>
        <Item icon="sunny-outline" title="The day" sub="Season, colour, cycle, mysteries, the coming feast" onPress={() => router.push('/catholic-day')} live />
        <Item icon="water-outline" title="Divine Mercy" sub="The chaplet, the novena, the 3 o'clock hour" onPress={() => router.push('/divine-mercy')} live />
        <Item icon="home-outline" title="Block Rosary" sub="The neighbourhood evening apostolate" onPress={() => router.push('/block-rosary')} live />
        <Item icon="shield-outline" title="Legion of Mary" sub="Mary's lay apostolic army" onPress={() => router.push('/legion')} live />
        <Item icon="rose-outline" title="Our Lady" sub="The Angelus, the Memorare, the Magnificat" onPress={() => router.push('/our-lady')} live />
        <Item icon="document-text-outline" title="Canon Law" sub="A readable guide, with the Vatican text" onPress={() => router.push('/canon-law')} live />

        <Label style={styles.sectionLabel}>Community</Label>
        <Item icon="business-outline" title="Churches" sub="A verified directory worldwide" onPress={() => router.push('/churches')} live />
        <Item icon="people-outline" title="Prayer Circle" sub="The friends you pray with, and their intentions" onPress={() => router.push('/circle')} live />
        <Item icon="call-outline" title="Pray with Friends" sub="Praying aloud together — calls arrive next" />
        <Item icon="notifications-outline" title="Reminders" sub="The hours of prayer, ringing daily" onPress={() => router.push('/reminders')} live />
        <Item icon="school-outline" title="Mentorship" sub="The Life in the Spirit Seminar" onPress={() => router.push('/mentorship')} live />

        <Label style={styles.sectionLabel}>App</Label>
        <Item icon="person-circle-outline" title="Your account" sub="Your prayer ID — how friends find you" onPress={() => router.push('/account')} live />
        <Item icon="settings-outline" title="Settings" sub="Version, text size, themes, reminders" onPress={() => router.push('/settings')} live />

        <Text style={styles.footer}>
          “Put the Word freely in people's hands.” Free forever — never a paywall on Scripture.
        </Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

function Item({ icon, title, sub, onPress, live }: { icon: any; title: string; sub: string; onPress?: () => void; live?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && live && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={!live}
    >
      <View style={[styles.itemIcon, { borderColor: live ? Lumen.colors.accent + '66' : Lumen.colors.cardBorder }]}>
        <Ionicons name={icon} size={20} color={live ? Lumen.colors.accent : Lumen.colors.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, !live && { color: Lumen.colors.muted }]}>{title}</Text>
        <Text style={styles.itemSub}>{sub}</Text>
      </View>
      {live ? (
        <Ionicons name="chevron-forward" size={20} color={Lumen.colors.muted} />
      ) : (
        <Text style={styles.coming}>Next</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 32, color: Lumen.colors.text },
  sectionLabel: { marginTop: 24, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11 },
  itemIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  itemTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  itemSub: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  coming: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1, color: Lumen.colors.muted, borderWidth: 1, borderColor: Lumen.colors.cardBorder, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Lumen.radius.pill },
  footer: { fontFamily: Lumen.fonts.body, fontStyle: 'italic', fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, textAlign: 'center', marginTop: 28 },
});
