import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal, ActivityIndicator, TextInput, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Lumen } from '@/theme/lumen';
import { Screen, Label } from '@/components/ui';
import { BOOKS, OT_GROUPS, findBook } from '@/data/books';
import { VERSIONS, DEUTERO_VERSION, DEUTERO_BOOKS, findVersion } from '@/data/versions';
import { BIBLE_MANIFEST } from '@/data/bibles/manifest';
import { useVersion } from '@/state/VersionContext';
import { loadChapter, chapterCount, hasBook, ChapterResult } from '@/lib/bibleApi';

export default function BibleReader() {
  const router = useRouter();
  const { versionId, version, setVersion } = useVersion();
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(1);
  const [data, setData] = useState<ChapterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [speaking, setSpeaking] = useState(false);

  const bookList = useMemo(() => Object.keys(BIBLE_MANIFEST[versionId] ?? {}), [versionId]);
  const bookIndex = bookList.indexOf(book);
  const chapters = chapterCount(versionId, book);

  const load = useCallback(async (v: string, b: string, c: number) => {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      setData(await loadChapter(v, b, c));
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // If the chosen version lacks the current book (e.g. leaving a Deuterocanon
  // book), fall back gracefully.
  useEffect(() => {
    if (!hasBook(versionId, book)) {
      setBook('John');
      setChapter(1);
      return;
    }
    const max = chapterCount(versionId, book);
    const c = chapter > max ? 1 : chapter;
    if (c !== chapter) setChapter(c);
    load(versionId, book, c);
    setHighlights(new Set());
    return () => {
      Speech.stop();
      setSpeaking(false);
    };
  }, [versionId, book, chapter, load]);

  const goBook = (delta: number) => {
    const next = bookList[bookIndex + delta];
    if (next) {
      setBook(next);
      setChapter(1);
    }
  };
  const goChapter = (delta: number) => {
    const next = chapter + delta;
    if (next >= 1 && next <= chapters) setChapter(next);
  };

  const playChapter = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); return; }
    if (!data) return;
    setSpeaking(true);
    Speech.speak(data.verses.map((v) => v.text).join(' '), {
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const selectedVerse = data?.verses.find((v) => v.verse === selected);
  const onHighlight = () => {
    if (selected == null) return;
    setHighlights((prev) => {
      const n = new Set(prev);
      n.has(selected) ? n.delete(selected) : n.add(selected);
      return n;
    });
  };
  const onExplain = () => {
    if (selected == null) return;
    router.push({ pathname: '/listen', params: { version: versionId, book, chapter: String(chapter), verse: String(selected) } });
  };
  const onListenVerse = () => {
    if (!selectedVerse) return;
    Speech.stop();
    Speech.speak(selectedVerse.text, { rate: 0.9 });
  };
  const onShare = () => {
    if (!selectedVerse) return;
    Share.share({ message: `"${selectedVerse.text}" — ${book} ${chapter}:${selected} (${version.abbrev})` }).catch(() => {});
  };

  return (
    <Screen>
      {/* Reference + version bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.refBtn} onPress={() => setPickerOpen(true)}>
          <Text style={styles.refText}>{book} {chapter}</Text>
          <Ionicons name="chevron-down" size={18} color={Lumen.colors.accent} />
        </Pressable>
        <Pressable style={styles.versionBtn} onPress={() => setVersionOpen(true)}>
          <Text style={styles.versionText}>{version.abbrev}</Text>
          <Ionicons name="swap-horizontal" size={15} color={Lumen.colors.accent} />
        </Pressable>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={Lumen.colors.accent} />
        </View>
      )}
      {error && !loading && (
        <View style={styles.center}>
          <Ionicons name="book-outline" size={30} color={Lumen.colors.muted} />
          <Text style={styles.hint}>{error}</Text>
        </View>
      )}

      {data && !loading && (
        <ScrollView contentContainerStyle={styles.reader} showsVerticalScrollIndicator={false}>
          <Text style={styles.chapterHeading}>Chapter {chapter}</Text>
          <Text>
            {data.verses.map((v, i) => {
              const hl = highlights.has(v.verse);
              const isFirst = i === 0;
              const t = v.text.trimStart();
              return (
                <Text key={v.verse} onPress={() => setSelected(selected === v.verse ? null : v.verse)} style={hl ? styles.highlighted : undefined}>
                  {isFirst ? (
                    <Text>
                      <Text style={styles.dropCap}><Text style={styles.dropCapNum}>{v.verse}</Text>{t.charAt(0)}</Text>
                      <Text style={[styles.verseText, selected === v.verse && styles.verseSelected]}>{t.slice(1)}{'  '}</Text>
                    </Text>
                  ) : (
                    <Text style={[styles.verseText, selected === v.verse && styles.verseSelected]}>
                      <Text style={styles.verseNum}>{v.verse} </Text>{v.text}{'  '}
                    </Text>
                  )}
                </Text>
              );
            })}
          </Text>
          <Text style={styles.sourceNote}>{version.name} · offline</Text>
          <View style={{ height: 150 }} />
        </ScrollView>
      )}

      {data && !loading && selected == null && (
        <Pressable style={styles.player} onPress={playChapter}>
          <Ionicons name={speaking ? 'stop-circle' : 'play-circle'} size={26} color="#0d1830" />
          <Text style={styles.playerText}>{speaking ? 'Stop' : 'Read this chapter aloud'}</Text>
        </Pressable>
      )}

      {selectedVerse && (
        <View style={styles.toolbar}>
          <Text style={styles.toolbarRef}>{book} {chapter}:{selected} · {version.abbrev}</Text>
          <View style={styles.toolbarActions}>
            <ToolBtn icon={highlights.has(selected!) ? 'bookmark' : 'bookmark-outline'} label="Highlight" onPress={onHighlight} />
            <ToolBtn icon="sparkles-outline" label="Explain" onPress={onExplain} />
            <ToolBtn icon="volume-medium-outline" label="Listen" onPress={onListenVerse} />
            <ToolBtn icon="share-outline" label="Share" onPress={onShare} />
          </View>
        </View>
      )}

      {!selectedVerse && (
        <View style={styles.nav}>
          <NavBtn icon="play-back" label="Book" disabled={bookIndex <= 0} onPress={() => goBook(-1)} />
          <NavBtn icon="chevron-back" label="Prev" disabled={chapter <= 1} onPress={() => goChapter(-1)} />
          <Text style={styles.navCenter}>{chapter} / {chapters}</Text>
          <NavBtn icon="chevron-forward" label="Next" right disabled={chapter >= chapters} onPress={() => goChapter(1)} />
          <NavBtn icon="play-forward" label="Book" right disabled={bookIndex >= bookList.length - 1} onPress={() => goBook(1)} />
        </View>
      )}

      <BookPicker
        open={pickerOpen}
        versionId={versionId}
        onClose={() => setPickerOpen(false)}
        onChoose={(b, c, forceVersion) => {
          if (forceVersion && forceVersion !== versionId) setVersion(forceVersion);
          setBook(b);
          setChapter(c);
          setPickerOpen(false);
        }}
      />
      <VersionPicker
        open={versionOpen}
        currentId={versionId}
        onClose={() => setVersionOpen(false)}
        onChoose={(id) => {
          setVersion(id);
          setVersionOpen(false);
        }}
      />
    </Screen>
  );
}

function ToolBtn({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.toolBtn} onPress={onPress} hitSlop={8}>
      <Ionicons name={icon} size={22} color={Lumen.colors.accent} />
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}
function NavBtn({ icon, label, onPress, disabled, right }: { icon: any; label: string; onPress: () => void; disabled?: boolean; right?: boolean }) {
  const color = disabled ? 'rgba(155,176,208,0.35)' : Lumen.colors.text;
  return (
    <Pressable style={styles.navBtn} disabled={disabled} onPress={onPress}>
      {!right && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.navText, { color }]}>{label}</Text>
      {right && <Ionicons name={icon} size={18} color={color} />}
    </Pressable>
  );
}

// ── Version picker ───────────────────────────────────────────────
function VersionPicker({ open, currentId, onClose, onChoose }: { open: boolean; currentId: string; onClose: () => void; onChoose: (id: string) => void }) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Choose a version</Text>
          <Text style={styles.sheetSub}>All bundled · fully offline · public domain</Text>
          <ScrollView>
            {VERSIONS.map((v) => {
              const active = v.id === currentId;
              return (
                <Pressable key={v.id} style={[styles.versionRow, active && styles.versionRowActive]} onPress={() => onChoose(v.id)}>
                  <View style={styles.versionBadge}><Text style={styles.versionBadgeText}>{v.abbrev}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.versionName}>{v.name}</Text>
                    <Text style={styles.versionBlurb}>{v.year} · {v.blurb}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={22} color={Lumen.colors.accent} />}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.sheetClose} onPress={onClose}><Text style={styles.sheetCloseText}>Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Book picker: three tabs ──────────────────────────────────────
type Tab = 'ot' | 'nt' | 'deutero';

function BookPicker({
  open, versionId, onClose, onChoose,
}: { open: boolean; versionId: string; onClose: () => void; onChoose: (b: string, chapter: number, forceVersion?: string) => void }) {
  const [tab, setTab] = useState<Tab>('ot');
  const [query, setQuery] = useState('');
  const [chapterFor, setChapterFor] = useState<{ book: string; chapters: number; forceVersion?: string } | null>(null);

  const q = query.trim().toLowerCase();
  const matches = q ? BOOKS.filter((b) => b.name.toLowerCase().includes(q)) : null;

  const openChapters = (book: string, count: number, forceVersion?: string) =>
    setChapterFor({ book, chapters: count, forceVersion });

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.pickerRoot}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{chapterFor ? `${chapterFor.book} — chapter` : 'Choose a book'}</Text>
          <Pressable onPress={chapterFor ? () => setChapterFor(null) : onClose} hitSlop={12}>
            <Ionicons name={chapterFor ? 'arrow-back' : 'close'} size={26} color={Lumen.colors.text} />
          </Pressable>
        </View>

        {chapterFor ? (
          <ScrollView contentContainerStyle={styles.chapterGrid}>
            {Array.from({ length: chapterFor.chapters }, (_, i) => i + 1).map((c) => (
              <Pressable key={c} style={styles.chapterCell} onPress={() => onChoose(chapterFor.book, c, chapterFor.forceVersion)}>
                <Text style={styles.chapterNum}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={Lumen.colors.muted} />
              <TextInput style={styles.search} placeholder="Search books — try “rev”" placeholderTextColor={Lumen.colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} />
            </View>

            {matches ? (
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                {matches.length === 0 && <Text style={styles.hint}>No book matches “{query}”.</Text>}
                {matches.map((b) => (
                  <BookRow key={b.name} name={b.name} meta={`${b.chapters} chapters`} onPress={() => openChapters(b.name, chapterCount(versionId, b.name) || b.chapters)} />
                ))}
              </ScrollView>
            ) : (
              <>
                <View style={styles.tabs}>
                  {([['ot', 'Old Testament'], ['nt', 'New Testament'], ['deutero', 'Deuterocanon']] as const).map(([k, lbl]) => (
                    <Pressable key={k} style={[styles.tab, tab === k && styles.tabActive]} onPress={() => setTab(k)}>
                      <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{lbl}</Text>
                    </Pressable>
                  ))}
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                  {tab === 'ot' && OT_GROUPS.map((g) => (
                    <View key={g.title} style={{ marginBottom: 18 }}>
                      <Label style={{ marginBottom: 8 }}>{g.title}</Label>
                      {g.books.map((name) => (
                        <BookRow key={name} name={name} meta={`${chapterCount(versionId, name) || findBook(name)!.chapters} chapters`} onPress={() => openChapters(name, chapterCount(versionId, name) || findBook(name)!.chapters)} />
                      ))}
                    </View>
                  ))}
                  {tab === 'nt' && BOOKS.filter((b) => b.testament === 'new').map((b) => (
                    <BookRow key={b.name} name={b.name} meta={`${b.chapters} chapters`} onPress={() => openChapters(b.name, chapterCount(versionId, b.name) || b.chapters)} />
                  ))}
                  {tab === 'deutero' && (
                    <View>
                      <Text style={styles.deuteroNote}>
                        The Deuterocanonical books, from the {findVersion(DEUTERO_VERSION).name} (with Apocrypha).
                        Opening one switches to that version.
                      </Text>
                      {DEUTERO_BOOKS.map((name) => {
                        const count = chapterCount(DEUTERO_VERSION, name);
                        if (!count) return null;
                        return (
                          <BookRow key={name} name={name} meta={`${count} chapter${count === 1 ? '' : 's'} · WEB`} onPress={() => openChapters(name, count, DEUTERO_VERSION)} />
                        );
                      })}
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

function BookRow({ name, meta, onPress }: { name: string; meta: string; onPress: () => void }) {
  return (
    <Pressable style={styles.bookRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bookName}>{name}</Text>
        <Text style={styles.bookMeta}>{meta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Lumen.colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Lumen.colors.cardBorder },
  refBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refText: { fontFamily: Lumen.fonts.displaySemi, fontSize: 22, color: Lumen.colors.text },
  versionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder, backgroundColor: Lumen.colors.card },
  versionText: { fontFamily: Lumen.fonts.label, fontSize: 12, letterSpacing: 1, color: Lumen.colors.accent },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  hint: { fontFamily: Lumen.fonts.body, color: Lumen.colors.muted, fontSize: 14, textAlign: 'center' },
  reader: { paddingHorizontal: 22, paddingTop: 16 },
  chapterHeading: { fontFamily: Lumen.fonts.display, fontSize: 26, color: Lumen.colors.accent, marginBottom: 12 },
  dropCap: { fontFamily: Lumen.fonts.displaySemi, fontSize: 58, lineHeight: 54, color: Lumen.colors.accent },
  dropCapNum: { fontFamily: Lumen.fonts.bodyBold, fontSize: 13, color: Lumen.colors.accent },
  verseText: { fontFamily: Lumen.fonts.display, fontSize: Lumen.type.scripture + 3, lineHeight: 34, color: Lumen.colors.text },
  verseNum: { fontFamily: Lumen.fonts.bodyBold, fontSize: 12, color: Lumen.colors.accent },
  verseSelected: { color: Lumen.colors.bright, textDecorationLine: 'underline' },
  highlighted: { backgroundColor: 'rgba(207,168,78,0.18)' },
  sourceNote: { fontFamily: Lumen.fonts.body, marginTop: 16, color: Lumen.colors.muted, fontSize: 12, fontStyle: 'italic' },
  player: { position: 'absolute', bottom: 122, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Lumen.colors.accent, paddingVertical: 11, paddingHorizontal: 22, borderRadius: Lumen.radius.pill },
  playerText: { fontFamily: Lumen.fonts.bodyBold, color: '#0d1830', fontSize: 14 },
  toolbar: { position: 'absolute', bottom: 64, left: 0, right: 0, backgroundColor: Lumen.colors.tabBar, borderTopWidth: 1, borderTopColor: Lumen.colors.cardBorder, paddingTop: 10, paddingBottom: 16, paddingHorizontal: 20 },
  toolbarRef: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.accent, fontSize: 13, marginBottom: 8, letterSpacing: 0.5 },
  toolbarActions: { flexDirection: 'row', justifyContent: 'space-around' },
  toolBtn: { alignItems: 'center', gap: 4 },
  toolLabel: { fontFamily: Lumen.fonts.body, color: Lumen.colors.muted, fontSize: 12 },
  nav: { position: 'absolute', bottom: 64, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Lumen.colors.cardBorder, backgroundColor: Lumen.colors.tabBar },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 6 },
  navText: { fontFamily: Lumen.fonts.body, fontSize: 13 },
  navCenter: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.muted, fontSize: 13 },
  // Book picker
  pickerRoot: { flex: 1, backgroundColor: '#0d1830', paddingTop: 56 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  pickerTitle: { fontFamily: Lumen.fonts.display, fontSize: 26, color: Lumen.colors.text },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, paddingHorizontal: 14, height: 44, borderRadius: Lumen.radius.pill, backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  search: { flex: 1, fontFamily: Lumen.fonts.body, fontSize: 15, color: Lumen.colors.text },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 14 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Lumen.radius.pill, alignItems: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  tabActive: { backgroundColor: Lumen.colors.accent, borderColor: Lumen.colors.accent },
  tabText: { fontFamily: Lumen.fonts.label, fontSize: 11, letterSpacing: 0.5, color: Lumen.colors.muted },
  tabTextActive: { color: '#0d1830' },
  bookRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bookName: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  bookMeta: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  deuteroNote: { fontFamily: Lumen.fonts.body, fontSize: 13, lineHeight: 20, color: Lumen.colors.muted, marginBottom: 16, fontStyle: 'italic' },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  chapterCell: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: Lumen.radius.md, backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  chapterNum: { fontFamily: Lumen.fonts.display, fontSize: 20, color: Lumen.colors.text },
  // Version sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#12203c', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, maxHeight: '80%' },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Lumen.colors.cardBorder, marginBottom: 14 },
  sheetTitle: { fontFamily: Lumen.fonts.display, fontSize: 24, color: Lumen.colors.text },
  sheetSub: { fontFamily: Lumen.fonts.body, fontSize: 13, color: Lumen.colors.muted, marginBottom: 12 },
  versionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  versionRowActive: { },
  versionBadge: { width: 52, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Lumen.colors.card, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  versionBadgeText: { fontFamily: Lumen.fonts.label, fontSize: 12, letterSpacing: 0.5, color: Lumen.colors.accent },
  versionName: { fontFamily: Lumen.fonts.display, fontSize: 19, color: Lumen.colors.text },
  versionBlurb: { fontFamily: Lumen.fonts.body, fontSize: 12, color: Lumen.colors.muted, marginTop: 1 },
  sheetClose: { marginTop: 14, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30, borderRadius: Lumen.radius.pill, borderWidth: 1, borderColor: Lumen.colors.cardBorder },
  sheetCloseText: { fontFamily: Lumen.fonts.bodyBold, color: Lumen.colors.text, fontSize: 15 },
});
