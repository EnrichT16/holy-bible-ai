import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';

/**
 * The guided prayer player — the illuminated-bead experience shared by the
 * Rosary and the Divine Mercy Chaplet (and any devotion with stepped,
 * repeated prayers). Word-by-word highlight as each prayer is spoken;
 * gentle 0.5× default pace so a small child can follow.
 */

export interface PrayerStep {
  id: string;
  title: string;
  instruction: string;
  prayer: string;
  beads?: number; // for repeated prayers (e.g. a decade of 10)
  announce?: string; // e.g. "The first mystery: The Annunciation"
}

const SPEEDS = [0.5, 0.75, 1.0];

export function GuidedPrayer({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: PrayerStep[];
}) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [bead, setBead] = useState(1);
  const [rate, setRate] = useState(0.5);
  const [speaking, setSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);

  const step = steps[index];
  const totalBeads = step.beads ?? 1;
  const isLast = index === steps.length - 1;

  const words = useMemo(() => {
    const out: { text: string; start: number; end: number }[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(step.prayer))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length });
    return out;
  }, [step.prayer]);

  const stopSpeech = () => {
    Speech.stop();
    setSpeaking(false);
    setCharIndex(-1);
  };

  const speak = () => {
    Speech.stop();
    setCharIndex(-1);
    setSpeaking(true);
    // Announce the mystery first (as its own utterance) so the prayer's word
    // boundaries stay aligned with the text on screen.
    if (step.announce) {
      Speech.speak(step.announce, { rate });
    }
    Speech.speak(step.prayer, {
      rate,
      onBoundary: (e: any) => {
        if (typeof e?.charIndex === 'number') setCharIndex(e.charIndex);
      },
      onDone: () => { setSpeaking(false); setCharIndex(-1); },
      onStopped: () => { setSpeaking(false); setCharIndex(-1); },
      onError: () => { setSpeaking(false); setCharIndex(-1); },
    });
  };

  const next = () => {
    stopSpeech();
    if (bead < totalBeads) return setBead((b) => b + 1);
    if (!isLast) {
      setIndex((i) => i + 1);
      setBead(1);
    }
  };
  const back = () => {
    stopSpeech();
    if (bead > 1) return setBead((b) => b - 1);
    if (index > 0) {
      const p = index - 1;
      setIndex(p);
      setBead(steps[p].beads ?? 1);
    }
  };
  const restart = () => {
    stopSpeech();
    setIndex(0);
    setBead(1);
  };

  const progress = (index + 1) / steps.length;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => { stopSpeech(); router.back(); }} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={restart} hitSlop={12}>
          <Ionicons name="refresh-outline" size={22} color={Lumen.colors.muted} />
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Label>{subtitle}</Label>

        {/* Illuminated beads */}
        <View style={styles.beadStage}>
          <Ionicons
            name="add"
            size={26}
            color={index <= 1 ? Lumen.colors.bright : 'rgba(155,176,208,0.3)'}
          />
          <View style={styles.beadLine}>
            {Array.from({ length: totalBeads }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.bead,
                  i < bead ? styles.beadDone : styles.beadTodo,
                  i === bead - 1 && styles.beadCurrent,
                ]}
              />
            ))}
          </View>
        </View>
        {totalBeads > 1 && <Text style={styles.beadLabel}>Bead {bead} of {totalBeads}</Text>}

        <Text style={styles.stepCount}>Step {index + 1} of {steps.length}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.annotation}>{step.instruction}</Text>

        {step.announce && (
          <Card style={{ marginTop: 14 }}>
            <Text style={styles.mysteryAnnounce}>{step.announce}</Text>
          </Card>
        )}

        <Card style={{ marginTop: 18 }}>
          <Text style={styles.prayer}>
            {words.map((w, i) => {
              const active = speaking && charIndex >= w.start && charIndex < w.end;
              return (
                <Text key={i} style={active ? styles.prayerWordActive : undefined}>
                  {w.text}{i < words.length - 1 ? ' ' : ''}
                </Text>
              );
            })}
          </Text>
        </Card>

        <Pressable style={styles.listen} onPress={speaking ? stopSpeech : speak}>
          <Ionicons name={speaking ? 'stop' : 'volume-medium-outline'} size={20} color={Lumen.colors.accent} />
          <Text style={styles.listenText}>{speaking ? 'Stop' : 'Pray aloud with me'}</Text>
        </Pressable>

        {/* Speed */}
        <View style={styles.speedRow}>
          <Text style={styles.speedLabel}>Pace</Text>
          {SPEEDS.map((s) => (
            <Pressable key={s} style={[styles.speedChip, rate === s && styles.speedChipActive]} onPress={() => setRate(s)}>
              <Text style={[styles.speedText, rate === s && styles.speedTextActive]}>{s}×</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.speedHint}>Default is gentle — 0.5× — so a small child can follow.</Text>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.ctrlSecondary} onPress={back} disabled={index === 0 && bead === 1}>
          <Ionicons name="chevron-back" size={22} color={index === 0 && bead === 1 ? 'rgba(155,176,208,0.35)' : Lumen.colors.text} />
        </Pressable>
        {isLast && bead >= totalBeads ? (
          <Pressable style={styles.ctrlPrimary} onPress={restart}>
            <Ionicons name="refresh" size={20} color="#0d1830" />
            <Text style={styles.ctrlPrimaryText}>Amen — pray again</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.ctrlPrimary} onPress={next}>
            <Text style={styles.ctrlPrimaryText}>{bead < totalBeads ? 'Next bead' : 'Continue'}</Text>
            <Ionicons name="chevron-forward" size={20} color="#0d1830" />
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 22, color: Lumen.colors.text },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: Lumen.colors.accent, borderRadius: 2 },
  body: { paddingHorizontal: 24, paddingTop: 18, alignItems: 'center' },
  beadStage: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  beadLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center', maxWidth: 240 },
  bead: { width: 17, height: 17, borderRadius: 9 },
  beadTodo: { backgroundColor: 'rgba(155,176,208,0.25)' },
  beadDone: { backgroundColor: Lumen.gold.accent2 },
  beadCurrent: { backgroundColor: Lumen.colors.bright, transform: [{ scale: 1.3 }], shadowColor: Lumen.colors.bright, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  beadLabel: { fontFamily: Lumen.fonts.body, marginTop: 12, color: Lumen.colors.muted, fontSize: 13 },
  stepCount: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1.5, color: Lumen.colors.muted, textTransform: 'uppercase', marginTop: 22 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 28, color: Lumen.colors.text, marginTop: 6, textAlign: 'center' },
  annotation: { fontFamily: Lumen.fonts.body, color: Lumen.colors.muted, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 21 },
  mysteryAnnounce: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.accent2, textAlign: 'center' },
  prayer: { fontFamily: Lumen.fonts.display, fontSize: 20, lineHeight: 31, color: Lumen.colors.text, textAlign: 'center' },
  prayerWordActive: { color: '#0d1830', backgroundColor: Lumen.colors.bright },
  listen: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder, backgroundColor: Lumen.colors.card },
  listenText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.accent, fontSize: 15 },
  speedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  speedLabel: { fontFamily: Lumen.fonts.label, fontSize: 11, letterSpacing: 1, color: Lumen.colors.muted, marginRight: 4 },
  speedChip: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  speedChipActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  speedText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 14 },
  speedTextActive: { color: '#0d1830' },
  speedHint: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 10, fontStyle: 'italic', textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  ctrlSecondary: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  ctrlPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26, backgroundColor: Lumen.colors.accent },
  ctrlPrimaryText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 16 },
});
