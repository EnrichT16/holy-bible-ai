import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { getPref, setPref, removePref } from '@/lib/storage';
import { NOTIFY_SUPPORTED, scheduleDaily, cancelScheduled } from '@/lib/notify';

/**
 * Reminders — the hours of prayer, ringing on your phone each day.
 * Phase 3 upgrades these to the incoming-call experience; today they are
 * gentle daily notifications, scheduled entirely on the device.
 */

const PRESETS = [
  { id: 'morning', icon: 'sunny-outline', title: 'Morning Offering', sub: 'Give Him the day before the day begins', hour: 7, minute: 0, time: '7:00' },
  { id: 'angelus', icon: 'notifications-outline', title: 'The Angelus', sub: 'The Incarnation remembered at noon', hour: 12, minute: 0, time: '12:00' },
  { id: 'mercy', icon: 'water-outline', title: 'The Hour of Mercy', sub: 'Three o\'clock — the hour He died for us', hour: 15, minute: 0, time: '15:00' },
  { id: 'rosary', icon: 'flower-outline', title: 'The Evening Rosary', sub: 'The day\'s mysteries before the day ends', hour: 19, minute: 0, time: '19:00' },
] as const;

export default function Reminders() {
  const router = useRouter();
  const [scheduled, setScheduled] = useState<Record<string, string>>({});
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      const map: Record<string, string> = {};
      for (const p of PRESETS) {
        const id = await getPref(`reminder:${p.id}`);
        if (id) map[p.id] = id;
      }
      setScheduled(map);
    })();
  }, []);

  const toggle = async (preset: (typeof PRESETS)[number], on: boolean) => {
    setDenied(false);
    if (on) {
      const notifId = await scheduleDaily(
        preset.title,
        `${preset.sub}. Open Holy Bible · AI Assisted to pray.`,
        preset.hour,
        preset.minute
      );
      if (!notifId) {
        setDenied(true);
        return;
      }
      await setPref(`reminder:${preset.id}`, notifId);
      setScheduled((s) => ({ ...s, [preset.id]: notifId }));
    } else {
      const existing = scheduled[preset.id];
      if (existing) await cancelScheduled(existing);
      await removePref(`reminder:${preset.id}`);
      setScheduled((s) => {
        const n = { ...s };
        delete n[preset.id];
        return n;
      });
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>
          The Church has always prayed by the clock. Choose your hours; your phone will
          call you to them each day. Everything stays on your device.
        </Text>

        {!NOTIFY_SUPPORTED && (
          <Card style={{ marginTop: 16 }}>
            <View style={styles.webNote}>
              <Ionicons name="phone-portrait-outline" size={22} color={Lumen.colors.accent} />
              <Text style={styles.webNoteText}>
                Reminders ring on the phone app. This web preview shows the hours; open the
                app on your phone to set them ringing.
              </Text>
            </View>
          </Card>
        )}

        {denied && (
          <Card style={{ marginTop: 16 }}>
            <Text style={styles.denied}>
              Notifications are off for this app in your phone's settings — allow them there,
              then try again.
            </Text>
          </Card>
        )}

        <Label style={{ marginTop: 24, marginBottom: 10 }}>The hours</Label>
        {PRESETS.map((p) => (
          <Card key={p.id} style={styles.row}>
            <Ionicons name={p.icon as any} size={22} color={Lumen.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{p.title} · {p.time}</Text>
              <Text style={styles.rowSub}>{p.sub}</Text>
            </View>
            <Switch
              value={!!scheduled[p.id]}
              onValueChange={(v) => toggle(p, v)}
              disabled={!NOTIFY_SUPPORTED}
              trackColor={{ true: Lumen.colors.accent, false: 'rgba(155,176,208,0.3)' }}
              thumbColor={Platform.OS === 'android' ? '#f1e8d2' : undefined}
            />
          </Card>
        ))}

        <Text style={styles.footnote}>
          Phase 3 turns these into the incoming-call experience — a real ring, answered
          with prayer.
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
  webNote: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  webNoteText: { flex: 1, fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.text },
  denied: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: '#d99' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  rowTitle: { fontFamily: Lumen.fonts.display, fontSize: 18, color: Lumen.colors.text },
  rowSub: { fontFamily: Lumen.fonts.body, fontSize: 12, lineHeight: 17, color: Lumen.colors.muted, marginTop: 1 },
  footnote: { fontFamily: Lumen.fonts.body, fontSize: 12.5, lineHeight: 19, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 16 },
});
