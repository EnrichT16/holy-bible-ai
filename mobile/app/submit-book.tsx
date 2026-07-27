import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { insertRow } from '@/lib/supabase';

/**
 * Submit your book — the review queue is open. A submission enters the
 * queue; a reviewer replies to arrange the manuscript and walk through
 * rights, doctrine, and readability together before publishing.
 */
export default function SubmitBook() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rights, setRights] = useState<string>('');
  const [about, setAbout] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const RIGHTS = ['I am the author', 'Public domain', 'I hold permission'];
  const canSubmit = !busy && title.trim() && author.trim() && rights && contact.trim();

  const submit = async () => {
    setBusy(true);
    setSent(null);
    setFailed(false);
    try {
      await insertRow('book_submissions', {
        title: title.trim(),
        author: author.trim(),
        rights,
        about: about.trim() || null,
        contact: contact.trim(),
      });
      setSent('Received, with thanks. Your book enters the review queue — a reviewer will reach you at the contact you gave to arrange the manuscript and walk through the review together.');
      setTitle(''); setAuthor(''); setRights(''); setAbout(''); setContact('');
    } catch {
      setFailed(true);
      setSent('The submission service could not be reached. Keep the details and try again later.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={Lumen.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>The Library</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Submit your book</Text>
        <Text style={styles.subtitle}>
          The Library grows by gift — books offered by their authors, reviewed together,
          and published free. Never a paywall on the books that lead to the Word.
        </Text>

        <Label style={{ marginTop: 20, marginBottom: 8 }}>How it works</Label>
        <Card>
          <Bullet text="You send the details below — the book itself comes later." />
          <Bullet text="A reviewer replies to arrange the manuscript, and walks through rights, doctrine, and readability with you." />
          <Bullet text="Once approved, it joins the Library, free to every reader, your name honoured as the giver." />
        </Card>

        <Label style={{ marginTop: 24, marginBottom: 8 }}>The book</Label>
        <Card>
          <Field label="Title" value={title} onChange={setTitle} placeholder="The title of the work" />
          <Field label="Author" value={author} onChange={setAuthor} placeholder="Who wrote it" />

          <Text style={styles.fieldLabel}>Rights</Text>
          <View style={styles.chips}>
            {RIGHTS.map((r) => (
              <Pressable key={r} style={[styles.chip, rights === r && styles.chipActive]} onPress={() => setRights(r)}>
                <Text style={[styles.chipText, rights === r && styles.chipTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 14 }} />
          <Field label="About the book (optional)" value={about} onChange={setAbout} placeholder="A few lines on what it is and who it serves" multiline />
          <Field label="Contact (email)" value={contact} onChange={setContact} placeholder="you@example.org" />

          <Pressable style={[styles.submit, !canSubmit && { opacity: 0.45 }]} disabled={!canSubmit} onPress={submit}>
            {busy ? (
              <ActivityIndicator color="#0d1830" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={17} color="#0d1830" />
                <Text style={styles.submitText}>Submit for review</Text>
              </>
            )}
          </Pressable>
          {sent && <Text style={[styles.sent, failed && { color: '#d99' }]}>{sent}</Text>}
        </Card>

        <Text style={styles.footnote}>
          If the book you love is already public domain, it may be freely readable today —
          see “Find free books.”
        </Text>

        <View style={{ height: 60 }} />
      </ScrollView>
    </Screen>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletMark}>✦</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
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
  bulletRow: { flexDirection: 'row', gap: 10, marginTop: 7, paddingRight: 8 },
  bulletMark: { color: Lumen.colors.accent, fontSize: 12, lineHeight: 22 },
  bulletText: { flex: 1, fontFamily: Lumen.fonts.body, fontSize: 14.5, lineHeight: 21, color: Lumen.colors.text },
  fieldLabel: { fontFamily: Lumen.fonts.label, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Lumen.colors.accent, marginBottom: 6 },
  input: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, borderWidth: 1, borderColor: Lumen.colors.cardBorder, borderRadius: Lumen.radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  chipActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  chipText: { fontFamily: Lumen.fonts.bodyBold, fontSize: 12.5, color: Lumen.colors.muted },
  chipTextActive: { color: '#0d1830' },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24, backgroundColor: Lumen.colors.accent, marginTop: 4 },
  submitText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  sent: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: Lumen.colors.accent2, marginTop: 12 },
  footnote: { fontFamily: Lumen.fonts.body, fontSize: 12.5, lineHeight: 19, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 16 },
});
