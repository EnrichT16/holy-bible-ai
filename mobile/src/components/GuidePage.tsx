import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';

/**
 * A structured, illuminated content page — the shared shape of the
 * For Catholics guides, mentorship sessions, and library entries.
 * Prayers and Scripture render as cards and can be heard aloud.
 */

export interface GuideSection {
  label?: string; // small-caps section label
  heading?: string;
  body?: string[];
  bullets?: string[];
  prayer?: { title: string; text: string };
  scripture?: { ref: string; text: string };
  cta?: { label: string; icon?: string; route?: string; url?: string };
}

export interface GuideContent {
  title: string;
  subtitle?: string;
  sections: GuideSection[];
  footnote?: string;
}

export function GuidePage({ content, footer }: { content: GuideContent; footer?: React.ReactNode }) {
  const router = useRouter();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speak = (id: string, text: string) => {
    if (speakingId === id) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }
    Speech.stop();
    setSpeakingId(id);
    Speech.speak(text, {
      rate: 0.85,
      onDone: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => { Speech.stop(); router.back(); }} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{content.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{content.title}</Text>
        {content.subtitle && <Text style={styles.subtitle}>{content.subtitle}</Text>}

        {content.sections.map((s, i) => (
          <View key={i} style={{ marginTop: 22 }}>
            {s.label && <Label style={{ marginBottom: 8 }}>{s.label}</Label>}
            {s.heading && <Text style={styles.heading}>{s.heading}</Text>}
            {s.body?.map((p, j) => (
              <Text key={j} style={styles.paragraph}>{p}</Text>
            ))}
            {s.bullets && (
              <View style={{ marginTop: 6 }}>
                {s.bullets.map((b, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>✦</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
            {s.scripture && (
              <Card style={{ marginTop: 10 }}>
                <Text style={styles.scripture}>“{s.scripture.text}”</Text>
                <Text style={styles.scriptureRef}>{s.scripture.ref}</Text>
              </Card>
            )}
            {s.prayer && (
              <Card style={{ marginTop: 10 }}>
                <Text style={styles.prayerTitle}>{s.prayer.title}</Text>
                <Text style={styles.prayerText}>{s.prayer.text}</Text>
                <Pressable style={styles.listen} onPress={() => speak(`p${i}`, s.prayer!.text)}>
                  <Ionicons
                    name={speakingId === `p${i}` ? 'stop' : 'volume-medium-outline'}
                    size={18}
                    color={Lumen.colors.accent}
                  />
                  <Text style={styles.listenText}>{speakingId === `p${i}` ? 'Stop' : 'Pray aloud with me'}</Text>
                </Pressable>
              </Card>
            )}
            {s.cta && (
              <Pressable
                style={styles.cta}
                onPress={() => {
                  if (s.cta!.route) router.push(s.cta!.route as any);
                  else if (s.cta!.url) Linking.openURL(s.cta!.url).catch(() => {});
                }}
              >
                <Ionicons name={(s.cta.icon as any) ?? 'arrow-forward'} size={18} color="#0d1830" />
                <Text style={styles.ctaText}>{s.cta.label}</Text>
              </Pressable>
            )}
          </View>
        ))}

        {footer}
        {content.footnote && <Text style={styles.footnote}>{content.footnote}</Text>}
        <View style={{ height: 60 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.muted, maxWidth: '70%' },
  body: { paddingHorizontal: 22 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text, marginTop: 6 },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6 },
  heading: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.accent2, marginBottom: 4 },
  paragraph: { fontFamily: Lumen.fonts.body, fontSize: 15.5, lineHeight: 24, color: Lumen.colors.text, marginTop: 8 },
  bulletRow: { flexDirection: 'row', gap: 10, marginTop: 7, paddingRight: 8 },
  bulletMark: { color: Lumen.colors.accent, fontSize: 12, lineHeight: 22 },
  bulletText: { flex: 1, fontFamily: Lumen.fonts.body, fontSize: 15, lineHeight: 22, color: Lumen.colors.text },
  scripture: { fontFamily: Lumen.fonts.display, fontSize: 19, lineHeight: 29, color: Lumen.colors.text },
  scriptureRef: { fontFamily: Lumen.fonts.bodyBold, fontSize: 12, color: Lumen.colors.accent, marginTop: 8 },
  prayerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.accent2, marginBottom: 6 },
  prayerText: { fontFamily: Lumen.fonts.display, fontSize: 18, lineHeight: 28, color: Lumen.colors.text },
  listen: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, marginTop: 12, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  listenText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.accent, fontSize: 13 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, height: 48, borderRadius: 24, backgroundColor: Lumen.colors.accent },
  ctaText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  footnote: { fontFamily: Lumen.fonts.body, fontSize: 12.5, lineHeight: 19, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 26 },
});
