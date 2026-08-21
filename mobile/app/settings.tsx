import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen, HOME_THEMES, THEME_ORDER } from '@/theme/lumen';
import { useTheme } from '@/theme/ThemeContext';
import { Screen, Card, Label } from '@/components/ui';
import { useVersion } from '@/state/VersionContext';
import { useSettings, TEXT_SIZES } from '@/state/SettingsContext';
import { useAccount } from '@/state/AccountContext';
import { VERSIONS } from '@/data/versions';

/**
 * Settings — the reader's own copy of the book: version, text size, theme,
 * reminders. Every choice is remembered on the device.
 */
export default function Settings() {
  const router = useRouter();
  const { versionId, setVersion } = useVersion();
  const { textSize, textScale, setTextSize } = useSettings();
  const { isPinned, pinnedName, setTheme, clearPin } = useTheme();
  const { status, profile, available } = useAccount();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>App</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {available && (
          <>
            <Label style={styles.sectionLabel}>Account</Label>
            <Pressable onPress={() => router.push('/account')}>
              <Card style={styles.linkRow}>
                <Ionicons name="person-circle-outline" size={22} color={Lumen.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkTitle}>
                    {status === 'signed-in' ? profile?.display_name || 'Your account' : 'Sign in'}
                  </Text>
                  <Text style={styles.linkSub}>
                    {status === 'signed-in'
                      ? profile?.prayer_id
                        ? `Prayer ID ${profile.prayer_id}`
                        : 'Your prayer ID and your circle'
                      : 'Only needed for the Prayer Circle'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
              </Card>
            </Pressable>
          </>
        )}

        <Label style={styles.sectionLabel}>Bible version</Label>
        <Card>
          <View style={styles.chips}>
            {VERSIONS.map((v) => {
              const active = v.id === versionId;
              return (
                <Pressable key={v.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setVersion(v.id)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{v.abbrev}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>The version the reader opens with. All six are bundled and free.</Text>
        </Card>

        <Label style={styles.sectionLabel}>Scripture text size</Label>
        <Card>
          <View style={styles.chips}>
            {TEXT_SIZES.map((t) => {
              const active = t.key === textSize;
              return (
                <Pressable key={t.key} style={[styles.chip, active && styles.chipActive]} onPress={() => setTextSize(t.key)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.preview, { fontSize: 20 * textScale, lineHeight: 31 * textScale }]}>
            In the beginning was the Word, and the Word was with God.
          </Text>
        </Card>

        <Label style={styles.sectionLabel}>Home theme</Label>
        <Card>
          <Pressable style={styles.themeRow} onPress={clearPin}>
            <View style={[styles.swatch, { backgroundColor: '#1a2b4d', borderColor: !isPinned ? Lumen.colors.accent : Lumen.colors.cardBorder }]}>
              <Ionicons name="sync-outline" size={16} color={Lumen.colors.accent2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.themeName}>Rotate daily</Text>
              <Text style={styles.themeNote}>Lumen · Vox · Sanctus · Aurora, a new light each day</Text>
            </View>
            {!isPinned && <Ionicons name="checkmark-circle" size={22} color={Lumen.colors.accent} />}
          </Pressable>
          {THEME_ORDER.map((key) => {
            const t = HOME_THEMES[key];
            const active = isPinned && pinnedName === key;
            return (
              <Pressable key={key} style={styles.themeRow} onPress={() => setTheme(key)}>
                <View style={[styles.swatch, { backgroundColor: t.gradient[0], borderColor: active ? Lumen.colors.accent : Lumen.colors.cardBorder }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.themeName}>{t.label}</Text>
                  <Text style={styles.themeNote}>{t.note}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={Lumen.colors.accent} />}
              </Pressable>
            );
          })}
        </Card>

        <Label style={styles.sectionLabel}>Prayer</Label>
        <Pressable onPress={() => router.push('/reminders')}>
          <Card style={styles.linkRow}>
            <Ionicons name="notifications-outline" size={22} color={Lumen.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Reminders</Text>
              <Text style={styles.linkSub}>The hours of prayer, ringing daily</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
          </Card>
        </Pressable>

        <Pressable onPress={() => router.push('/circle')}>
          <Card style={[styles.linkRow, { marginTop: 10 }]}>
            <Ionicons name="people-outline" size={22} color={Lumen.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Prayer Circle</Text>
              <Text style={styles.linkSub}>The friends you pray with, and their intentions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
          </Card>
        </Pressable>

        <Label style={styles.sectionLabel}>About</Label>
        <Card>
          <Text style={styles.aboutName}>Holy Bible · AI Assisted</Text>
          <Text style={styles.aboutLine}>Version 0.3.0 — accounts and the Prayer Circle</Text>
          <Text style={styles.aboutLine}>Publisher: [Organisation TBC]</Text>
          <Text style={styles.aboutCreed}>
            Free forever — never a paywall on Scripture. Sustained by donations.
          </Text>
        </Card>

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
  sectionLabel: { marginTop: 24, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  chipActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  chipText: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: Lumen.colors.muted },
  chipTextActive: { color: '#0d1830' },
  hint: { fontFamily: Lumen.fonts.body, fontSize: 12, lineHeight: 18, color: Lumen.colors.muted, marginTop: 12 },
  preview: { fontFamily: Lumen.fonts.display, color: Lumen.colors.text, marginTop: 14 },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 9 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  themeName: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.text },
  themeNote: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  linkTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  linkSub: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  aboutName: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  aboutLine: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.muted, marginTop: 4 },
  aboutCreed: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.accent2, fontStyle: 'italic', marginTop: 10 },
});
