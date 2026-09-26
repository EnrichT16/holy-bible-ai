import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Card, Label } from '@/components/ui';
import { BOOKS, findBook } from '@/data/books';
import { loadChapter, hasBook, Verse } from '@/lib/bibleApi';
import { useVersion } from '@/state/VersionContext';
import { announce, useReducedMotion } from '@/lib/a11y';

/**
 * Reading the Word together, inside a prayer call.
 *
 * One passage is shared by the whole call: whoever turns the page turns
 * it for everyone, and the choice travels over the call itself. Each
 * person sees the chapter in their own chosen Bible version — the page
 * is common, the translation is personal. The parent owns the shared
 * state; this component shows it and offers the turning of pages.
 */

export interface SharedPassage {
  book: string;
  chapter: number;
  /** Epoch milliseconds of the choice — the newest wins on every screen. */
  at: number;
  byName: string;
}

export function SharedReading({
  passage,
  onChoose,
}: {
  passage: SharedPassage | null;
  onChoose: (book: string, chapter: number) => void;
}) {
  const { versionId, version } = useVersion();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Fall back to the King James if the reader's version lacks the book.
  const readableVersion = passage && hasBook(versionId, passage.book) ? versionId : 'kjv';

  useEffect(() => {
    if (!passage) {
      setVerses(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setProblem(null);
    loadChapter(readableVersion, passage.book, passage.chapter)
      .then((res) => {
        if (!alive) return;
        setVerses(res.verses);
        announce(`${passage.book} chapter ${passage.chapter} is ready. ${res.verses.length} verses.`);
      })
      .catch((e) => {
        if (alive) setProblem(e instanceof Error ? e.message : 'That chapter could not be opened.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passage?.book, passage?.chapter, readableVersion]);

  const book = passage ? findBook(passage.book) : null;
  const canPrev = !!passage && passage.chapter > 1;
  const canNext = !!passage && !!book && passage.chapter < book.chapters;

  return (
    <>
      <Label style={{ marginTop: 26, marginBottom: 10 }}>Read the Word together</Label>
      <Card>
        {!passage ? (
          <>
            <Text style={styles.quiet}>
              Choose a chapter and every voice in this call turns to the same page —
              each in their own Bible version.
            </Text>
            <Pressable
              style={styles.primary}
              onPress={() => setPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Choose a passage to read together"
            >
              <Ionicons name="book-outline" size={17} color="#0d1830" aria-hidden />
              <Text style={styles.primaryText}>Choose a passage</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.reference} accessibilityRole="header" aria-level={2}>
              {passage.book} {passage.chapter}
            </Text>
            <Text style={styles.chosenBy}>
              Turned to by {passage.byName} · {version.abbrev ?? version.name}
            </Text>

            <View style={styles.pageControls}>
              <Pressable
                style={[styles.pageBtn, !canPrev && { opacity: 0.35 }]}
                disabled={!canPrev}
                onPress={() => passage && onChoose(passage.book, passage.chapter - 1)}
                accessibilityRole="button"
                accessibilityLabel="Previous chapter, for everyone in the call"
                accessibilityState={{ disabled: !canPrev }}
              >
                <Ionicons name="chevron-back" size={18} color={Lumen.colors.text} aria-hidden />
              </Pressable>
              <Pressable
                style={styles.pageMid}
                onPress={() => setPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Reading ${passage.book} chapter ${passage.chapter}. Choose a different passage`}
              >
                <Text style={styles.pageMidText}>Change passage</Text>
              </Pressable>
              <Pressable
                style={[styles.pageBtn, !canNext && { opacity: 0.35 }]}
                disabled={!canNext}
                onPress={() => passage && onChoose(passage.book, passage.chapter + 1)}
                accessibilityRole="button"
                accessibilityLabel="Next chapter, for everyone in the call"
                accessibilityState={{ disabled: !canNext }}
              >
                <Ionicons name="chevron-forward" size={18} color={Lumen.colors.text} aria-hidden />
              </Pressable>
            </View>

            {loading && (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <ActivityIndicator color={Lumen.colors.accent} />
              </View>
            )}
            {problem && <Text style={styles.problem}>{problem}</Text>}
            {!loading &&
              verses?.map((v) => (
                <Text
                  key={v.verse}
                  style={styles.verse}
                  accessibilityLabel={`Verse ${v.verse}. ${v.text}`}
                >
                  <Text style={styles.verseNum}>{v.verse}  </Text>
                  {v.text}
                </Text>
              ))}
          </>
        )}
      </Card>

      <PassagePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(bookName, chapter) => {
          setPickerOpen(false);
          onChoose(bookName, chapter);
        }}
      />
    </>
  );
}

// ── The picker ──────────────────────────────────────────────────────
// A calm two-step chooser: find the book, then tap the chapter.

function PassagePicker({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (book: string, chapter: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [bookName, setBookName] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const books = q ? BOOKS.filter((b) => b.name.toLowerCase().includes(q)) : BOOKS;
  const book = bookName ? findBook(bookName) : null;

  const close = () => {
    setQuery('');
    setBookName(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={close}
      accessibilityViewIsModal
      {...(Platform.OS === 'web' ? { 'aria-modal': true } : {})}
    >
      <View style={styles.pickerBackdrop}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHead}>
            <Text style={styles.pickerTitle} accessibilityRole="header" aria-level={1}>
              {book ? book.name : 'Read together'}
            </Text>
            <Pressable
              onPress={book ? () => setBookName(null) : close}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={book ? 'Back to the list of books' : 'Close the passage chooser'}
            >
              <Ionicons
                name={book ? 'chevron-back' : 'close'}
                size={24}
                color={Lumen.colors.text}
                aria-hidden
              />
            </Pressable>
          </View>

          {!book ? (
            <>
              <TextInput
                style={styles.search}
                value={query}
                onChangeText={setQuery}
                placeholder="Find a book…"
                placeholderTextColor={'rgba(155,176,208,0.8)'}
                accessibilityLabel="Search the books of the Bible"
              />
              <FlatList
                data={books}
                keyExtractor={(b) => b.name}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.bookRow}
                    onPress={() => setBookName(item.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}. ${item.chapters} chapters`}
                  >
                    <Text style={styles.bookName}>{item.name}</Text>
                    <Text style={styles.bookChapters}>{item.chapters}</Text>
                  </Pressable>
                )}
              />
            </>
          ) : (
            <FlatList
              data={Array.from({ length: book.chapters }, (_, i) => i + 1)}
              keyExtractor={(n) => String(n)}
              numColumns={5}
              columnWrapperStyle={{ gap: 8 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.chapterCell}
                  onPress={() => {
                    onPick(book.name, item);
                    setQuery('');
                    setBookName(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${book.name} chapter ${item}`}
                >
                  <Text style={styles.chapterNum}>{item}</Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  quiet: { fontFamily: Lumen.fonts.body, fontSize: 13.5, lineHeight: 21, color: Lumen.colors.muted },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 24, backgroundColor: Lumen.colors.accent, marginTop: 14 },
  primaryText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 15 },
  reference: { fontFamily: Lumen.fonts.displaySemi, fontSize: 24, color: Lumen.colors.text },
  chosenBy: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 2 },
  pageControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 6 },
  pageBtn: { minWidth: 44, minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: Lumen.colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  pageMid: { flex: 1, minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: Lumen.colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  pageMidText: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: Lumen.colors.accent },
  verse: { fontFamily: Lumen.fonts.display, fontSize: 18, lineHeight: 29, color: Lumen.colors.text, marginTop: 10 },
  verseNum: { fontFamily: Lumen.fonts.bodyBold, fontSize: 12, color: Lumen.colors.accent },
  problem: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 19, color: '#d99', marginTop: 10 },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(6,12,26,0.7)', justifyContent: 'flex-end' },
  pickerSheet: { height: '82%', backgroundColor: '#0f1c38', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: Lumen.colors.cardBorder, paddingHorizontal: 18, paddingTop: 14 },
  pickerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pickerTitle: { fontFamily: Lumen.fonts.displaySemi, fontSize: 22, color: Lumen.colors.text },
  search: { fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text, borderWidth: 1, borderColor: Lumen.colors.cardBorder, borderRadius: Lumen.radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 10 },
  bookRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bookName: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  bookChapters: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted },
  chapterCell: { flex: 1, minHeight: 48, borderRadius: Lumen.radius.md, borderWidth: 1, borderColor: Lumen.colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  chapterNum: { fontFamily: Lumen.fonts.displaySemi, fontSize: 17, color: Lumen.colors.text },
});
