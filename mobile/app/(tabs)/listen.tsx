import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Card, Label } from '@/components/ui';
import { BOOKS, Book, findBook } from '@/data/books';
import { loadChapter } from '@/lib/bibleApi';
import { explainPassage } from '@/lib/claudeApi';
import { useVersion } from '@/state/VersionContext';

export default function Listen() {
  const params = useLocalSearchParams<{ version?: string; book?: string; chapter?: string; verse?: string }>();
  const { versionId, version, setVersion } = useVersion();
  const [book, setBook] = useState<Book>(findBook('Psalms')!);
  const [chapter, setChapter] = useState(23);
  const [text, setText] = useState('');
  const [reference, setReference] = useState('Psalms 23');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [answer, setAnswer] = useState('');
  const [thinking, setThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  // Deep-link from the reader's "Explain" toolbar.
  useEffect(() => {
    if (params.version) setVersion(params.version);
    if (params.book && findBook(params.book)) {
      setBook(findBook(params.book)!);
      setChapter(params.chapter ? Number(params.chapter) : 1);
    }
  }, [params.version, params.book, params.chapter]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await loadChapter(versionId, book.name, chapter);
        if (!alive) return;
        setReference(res.reference);
        setText(res.verses.map((v) => v.text).join(' '));
      } catch {
        if (alive) setText('This passage could not be loaded. Check your connection and try another.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      Speech.stop();
      setSpeaking(false);
    };
  }, [versionId, book, chapter]);

  const toggleSpeak = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const runAi = async (mode: 'explain' | 'ask') => {
    setThinking(true);
    setAiError(null);
    setAnswer('');
    try {
      setAnswer(await explainPassage({ mode, reference, passage: text, question: mode === 'ask' ? question : undefined }));
    } catch (e: any) {
      setAiError(e.message ?? 'The guide is resting. Try again shortly.');
    } finally {
      setThinking(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Speak the Word</Text>
        <Text style={styles.epigraph}>
          “Thou shalt also decree a thing, and it shall be established unto thee: and the light shall
          shine upon thy ways.”
        </Text>
        <Text style={styles.epigraphRef}>Job 22:28 · KJV</Text>

        <Pressable style={styles.refBar} onPress={() => setPickerOpen(true)}>
          <Ionicons name="book-outline" size={16} color={Lumen.colors.accent} />
          <Text style={styles.refText}>{reference}</Text>
          <Ionicons name="chevron-down" size={16} color={Lumen.colors.accent} />
        </Pressable>

        <Card style={{ marginTop: 16, minHeight: 120, justifyContent: 'center' }}>
          {loading ? <ActivityIndicator color={Lumen.colors.accent} /> : <Text style={styles.passage}>{text}</Text>}
        </Card>

        <Pressable style={[styles.speakBtn, speaking && styles.speakBtnActive]} onPress={toggleSpeak} disabled={loading}>
          <Ionicons name={speaking ? 'stop' : 'play'} size={22} color="#0d1830" />
          <Text style={styles.speakText}>{speaking ? 'Stop reading' : 'Read aloud'}</Text>
        </Pressable>

        <Label style={{ marginTop: 28, marginBottom: 12 }}>Understand it</Label>
        <Pressable style={styles.explainBtn} onPress={() => runAi('explain')} disabled={thinking || loading}>
          <Ionicons name="bulb-outline" size={18} color={Lumen.colors.accent} />
          <Text style={styles.explainText}>Explain this passage</Text>
        </Pressable>

        <View style={styles.askRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about it…"
            placeholderTextColor={Lumen.colors.muted}
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <Pressable
            style={[styles.askSend, (!question.trim() || thinking) && { opacity: 0.4 }]}
            onPress={() => runAi('ask')}
            disabled={!question.trim() || thinking || loading}
          >
            <Ionicons name="arrow-up" size={20} color="#0d1830" />
          </Pressable>
        </View>

        {thinking && (
          <View style={styles.thinking}>
            <ActivityIndicator color={Lumen.colors.accent} />
            <Text style={styles.hint}>Reflecting on the Word…</Text>
          </View>
        )}
        {aiError && <Text style={styles.errorText}>{aiError}</Text>}
        {answer !== '' && (
          <Card style={{ marginTop: 16 }}>
            <Label>Reflection</Label>
            <Text style={styles.answerText}>{answer}</Text>
            <Text style={styles.disclaimer}>
              An AI reflection to aid study — not a substitute for Scripture, prayer, or your
              shepherd's counsel.
            </Text>
          </Card>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <ChapterPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChoose={(b, c) => {
          setBook(b);
          setChapter(c);
          setPickerOpen(false);
        }}
      />
    </Screen>
  );
}

function ChapterPicker({ open, onClose, onChoose }: { open: boolean; onClose: () => void; onChoose: (b: Book, c: number) => void }) {
  const [book, setBook] = useState<Book | null>(null);
  const chapters = useMemo(() => (book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : []), [book]);
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerRoot}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{book ? `${book.name} — chapter` : 'Choose a passage'}</Text>
          <Pressable onPress={book ? () => setBook(null) : onClose} hitSlop={12}>
            <Ionicons name={book ? 'arrow-back' : 'close'} size={26} color={Lumen.colors.text} />
          </Pressable>
        </View>
        {!book ? (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {BOOKS.map((b) => (
              <Pressable key={b.name} style={styles.pickRow} onPress={() => setBook(b)}>
                <Text style={styles.pickName}>{b.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.chapterGrid}>
            {chapters.map((c) => (
              <Pressable key={c} style={styles.chapterCell} onPress={() => onChoose(book, c)}>
                <Text style={styles.chapterNum}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontFamily: Lumen.fonts.displaySemi, fontSize: 32, color: Lumen.colors.text },
  epigraph: { fontFamily: Lumen.fonts.display, fontSize: 18, lineHeight: 26, color: Lumen.colors.muted, fontStyle: 'italic', marginTop: 10 },
  epigraphRef: { fontFamily: Lumen.fonts.label, fontSize: 11, letterSpacing: 1, color: Lumen.colors.accent, marginTop: 8 },
  refBar: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, marginTop: 20, paddingVertical: 8, paddingHorizontal: 16, borderRadius: Lumen.radius.pill, backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  refText: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  passage: { fontFamily: Lumen.fonts.display, fontSize: 19, lineHeight: 30, color: Lumen.colors.text },
  speakBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Lumen.colors.accent, paddingVertical: 15, borderRadius: Lumen.radius.pill },
  speakBtnActive: { backgroundColor: Lumen.colors.accent2 },
  speakText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 16 },
  explainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Lumen.radius.md, backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  explainText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.text, fontSize: 15 },
  askRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 12 },
  input: { flex: 1, backgroundColor: Lumen.colors.card, borderRadius: Lumen.radius.md, borderWidth: 1, borderColor: Lumen.colors.cardBorder, padding: 14, fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, maxHeight: 120 },
  askSend: { width: 46, height: 46, borderRadius: 23, backgroundColor: Lumen.colors.accent, alignItems: 'center', justifyContent: 'center' },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  hint: { fontFamily: Lumen.fonts.body, color: Lumen.colors.muted, fontSize: 14 },
  errorText: { fontFamily: Lumen.fonts.body, marginTop: 16, color: '#e0a05a', fontSize: 14 },
  answerText: { fontFamily: Lumen.fonts.body, fontSize: 16, lineHeight: 25, color: Lumen.colors.text, marginTop: 10 },
  disclaimer: { fontFamily: Lumen.fonts.body, marginTop: 14, fontSize: 12, fontStyle: 'italic', color: Lumen.colors.muted, lineHeight: 17 },
  pickerRoot: { flex: 1, backgroundColor: '#0d1830', paddingTop: 56 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  pickerTitle: { fontFamily: Lumen.fonts.display, fontSize: 24, color: Lumen.colors.text },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  pickName: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  chapterCell: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: Lumen.radius.md, backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  chapterNum: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
});
