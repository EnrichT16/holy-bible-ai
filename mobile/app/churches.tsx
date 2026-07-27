import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';

/**
 * Churches — the worldwide verified directory. The directory itself opens
 * once the vetting backend exists; today a church can prepare its listing
 * and send it onward for the founding review.
 */
export default function Churches() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  const canSubmit = name.trim() && city.trim() && country.trim() && contact.trim();

  const submit = async () => {
    const listing =
      `Church listing — Holy Bible · AI Assisted\n\n` +
      `Church: ${name.trim()}\n` +
      `City: ${city.trim()}\n` +
      `Country: ${country.trim()}\n` +
      `Contact: ${contact.trim()}\n` +
      (note.trim() ? `Mass times / notes: ${note.trim()}\n` : '');
    try {
      await Share.share({ message: listing });
      setSent('Your listing was handed to the share sheet — send it to the app team or keep it ready for when submissions open.');
    } catch {
      setSent('Sharing is not available here. Keep these details ready — online submissions open with the directory backend.');
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

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Churches</Text>
        <Text style={styles.subtitle}>
          A worldwide directory of verified churches — every listing checked by a person
          before it appears, so what you find is real.
        </Text>

        <Card style={{ marginTop: 18 }}>
          <View style={styles.emptyWrap}>
            <Ionicons name="business-outline" size={30} color={Lumen.colors.accent} />
            <Text style={styles.emptyTitle}>The founding directory is being gathered</Text>
            <Text style={styles.emptyText}>
              Verified listings appear here as the vetting service comes online later in
              Phase 2. The first churches listed will be the ones who ask first.
            </Text>
          </View>
        </Card>

        <Label style={{ marginTop: 26, marginBottom: 8 }}>List your church</Label>
        <Card>
          <Field label="Church name" value={name} onChange={setName} placeholder="St. Mary's Catholic Church" />
          <Field label="City" value={city} onChange={setCity} placeholder="Enugu" />
          <Field label="Country" value={country} onChange={setCountry} placeholder="Nigeria" />
          <Field label="Contact (parish email or phone)" value={contact} onChange={setContact} placeholder="parish@example.org" />
          <Field label="Mass times / notes (optional)" value={note} onChange={setNote} placeholder="Sun 7am & 10am · Wed 6pm" multiline />

          <Pressable
            style={[styles.submit, !canSubmit && { opacity: 0.45 }]}
            disabled={!canSubmit}
            onPress={submit}
          >
            <Ionicons name="paper-plane-outline" size={17} color="#0d1830" />
            <Text style={styles.submitText}>Prepare my listing</Text>
          </Pressable>
          {sent && <Text style={styles.sent}>{sent}</Text>}
          <Text style={styles.vetting}>
            Every listing is vetted with the parish before it is published — nothing appears
            unverified.
          </Text>
        </Card>

        <View style={{ height: 60 }} />
      </ScrollView>
    </Screen>
  );
}

function Field({
  label, value, onChange, placeholder, multiline,
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 60, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={'rgba(155,176,208,0.5)'}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.muted },
  body: { paddingHorizontal: 22 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 30, color: Lumen.colors.text, marginTop: 6 },
  subtitle: { fontFamily: Lumen.fonts.body, fontSize: 14, lineHeight: 21, color: Lumen.colors.muted, marginTop: 6 },
  emptyWrap: { alignItems: 'center', gap: 8, paddingVertical: 10 },
  emptyTitle: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text, textAlign: 'center' },
  emptyText: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, textAlign: 'center' },
  fieldLabel: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Lumen.colors.accent, marginBottom: 6 },
  input: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, borderWidth: 1, borderColor: Lumen.colors.cardBorder, borderRadius: Lumen.radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24, backgroundColor: Lumen.colors.accent, marginTop: 4 },
  submitText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  sent: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.accent2, marginTop: 12 },
  vetting: { fontFamily: Lumen.fonts.body, fontSize: 12, lineHeight: 18, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 12 },
});
