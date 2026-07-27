import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen, HOME_THEMES, THEME_ORDER } from '@/theme/lumen';
import { useTheme } from '@/theme/ThemeContext';
import { Screen, Card, Label } from '@/components/ui';
import { useVersion } from '@/state/VersionContext';
import { VERSIONS } from '@/data/versions';
import { setPref } from '@/lib/storage';

/**
 * First-open welcome — three gentle panes: the mission, your version,
 * your light. Shown once; every choice can be changed later in Settings.
 */
export default function Onboarding() {
  const router = useRouter();
  const { versionId, setVersion } = useVersion();
  const { isPinned, pinnedName, setTheme, clearPin } = useTheme();
  const [pane, setPane] = useState(0);

  const finish = async () => {
    await setPref('onboarded', '1');
    router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {pane === 0 && (
          <View style={styles.pane}>
            <Text style={styles.wordmark}>Holy Bible</Text>
            <Text style={styles.subwordmark}>· AI Assisted ·</Text>
            <Card style={{ marginTop: 30 }}>
              <Text style={styles.mission}>
                Every version of the Word, in one place — read, heard, explained, and prayed.
              </Text>
              <Text style={styles.creed}>
                Free forever. Never a paywall on Scripture.
              </Text>
            </Card>
            <Text style={styles.note}>
              Six Bibles live on your device — no internet needed to read, listen, or pray.
            </Text>
          </View>
        )}

        {pane === 1 && (
          <View style={styles.pane}>
            <Label>Step 2 of 3</Label>
            <Text style={styles.title}>Choose your Bible</Text>
            <Text style={styles.sub}>The version the reader opens with — change it any time.</Text>
            <Card style={{ marginTop: 18, alignSelf: 'stretch' }}>
              {VERSIONS.map((v) => {
                const active = v.id === versionId;
                return (
                  <Pressable key={v.id} style={styles.row} onPress={() => setVersion(v.id)}>
                    <View style={styles.badge}><Text style={styles.badgeText}>{v.abbrev}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{v.name}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={Lumen.colors.accent} />}
                  </Pressable>
                );
              })}
            </Card>
          </View>
        )}

        {pane === 2 && (
          <View style={styles.pane}>
            <Label>Step 3 of 3</Label>
            <Text style={styles.title}>Choose your light</Text>
            <Text style={styles.sub}>Four illuminated themes. Let them rotate daily, or pin one.</Text>
            <Card style={{ marginTop: 18, alignSelf: 'stretch' }}>
              <Pressable style={styles.row} onPress={clearPin}>
                <View style={[styles.swatch, { backgroundColor: '#1a2b4d', borderColor: !isPinned ? Lumen.colors.accent : Lumen.colors.cardBorder }]}>
                  <Ionicons name="sync-outline" size={15} color={Lumen.colors.accent2} />
                </View>
                <Text style={[styles.rowTitle, { flex: 1 }]}>Rotate daily</Text>
                {!isPinned && <Ionicons name="checkmark-circle" size={22} color={Lumen.colors.accent} />}
              </Pressable>
              {THEME_ORDER.map((key) => {
                const t = HOME_THEMES[key];
                const active = isPinned && pinnedName === key;
                return (
                  <Pressable key={key} style={styles.row} onPress={() => setTheme(key)}>
                    <View style={[styles.swatch, { backgroundColor: t.gradient[0], borderColor: active ? Lumen.colors.accent : Lumen.colors.cardBorder }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{t.label}</Text>
                      <Text style={styles.rowSub}>{t.note}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={Lumen.colors.accent} />}
                  </Pressable>
                );
              })}
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={styles.controls}>
        {pane > 0 ? (
          <Pressable style={styles.back} onPress={() => setPane((p) => p - 1)}>
            <Ionicons name="chevron-back" size={22} color={Lumen.colors.text} />
          </Pressable>
        ) : (
          <Pressable style={styles.skip} onPress={finish}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
        <Pressable style={styles.next} onPress={() => (pane < 2 ? setPane((p) => p + 1) : finish())}>
          <Text style={styles.nextText}>{pane < 2 ? 'Continue' : 'Begin'}</Text>
          <Ionicons name={pane < 2 ? 'chevron-forward' : 'book-outline'} size={20} color="#0d1830" />
        </Pressable>
      </View>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === pane && styles.dotActive]} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 30 },
  pane: { alignItems: 'center' },
  wordmark: { fontFamily: Lumen.fonts.displaySemi, fontSize: 44, color: Lumen.colors.text, textAlign: 'center' },
  subwordmark: { fontFamily: Lumen.fonts.label, fontSize: 12, letterSpacing: 4, color: Lumen.colors.accent, textAlign: 'center', marginTop: 4, textTransform: 'uppercase' },
  mission: { fontFamily: Lumen.fonts.display, fontSize: 22, lineHeight: 33, color: Lumen.colors.text, textAlign: 'center' },
  creed: { fontFamily: Lumen.fonts.bodyBold, fontSize: 14, color: Lumen.colors.accent2, textAlign: 'center', marginTop: 14 },
  note: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, textAlign: 'center', marginTop: 18, fontStyle: 'italic' },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text, marginTop: 8, textAlign: 'center' },
  sub: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  badge: { width: 52, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  badgeText: { fontFamily: Lumen.fonts.label, fontSize: 12, letterSpacing: 0.5, color: Lumen.colors.accent },
  rowTitle: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.text },
  rowSub: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 8 },
  back: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  skip: { width: 72, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: Lumen.fonts.body, color: Lumen.colors.muted, fontSize: 14 },
  next: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26, backgroundColor: Lumen.colors.accent },
  nextText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(155,176,208,0.3)' },
  dotActive: { backgroundColor: Lumen.colors.accent, width: 18 },
});
