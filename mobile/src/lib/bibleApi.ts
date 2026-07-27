/**
 * Chapter loading. On iOS/Android all Scripture is bundled with the app, so
 * this never touches the network. On web the version's JSON is fetched as a
 * static asset the first time it is opened (see registry.web.ts).
 *
 * Loading a version's data (~4–5 MB) happens once, lazily, the first time
 * that version is opened; results are cached for the session.
 */
import { BIBLE_FILES, BibleData } from '@/data/bibles/registry';
import { BIBLE_MANIFEST } from '@/data/bibles/manifest';

export interface Verse {
  verse: number;
  text: string;
}

export interface ChapterResult {
  verses: Verse[];
  source: 'offline';
  reference: string;
  version: string;
}

const cache: Record<string, Promise<BibleData>> = {};

function getVersionData(version: string): Promise<BibleData> {
  if (!cache[version]) {
    const loader = BIBLE_FILES[version] ?? BIBLE_FILES.kjv;
    cache[version] = loader().catch((err) => {
      delete cache[version]; // don't cache a failed load — allow retry
      throw err;
    });
  }
  return cache[version];
}

/** Chapter count for a book in a version (0 if the version lacks the book). */
export function chapterCount(version: string, book: string): number {
  return BIBLE_MANIFEST[version]?.[book] ?? 0;
}

/** True if a version carries a given book. */
export function hasBook(version: string, book: string): boolean {
  return chapterCount(version, book) > 0;
}

/**
 * Load a chapter. Resolves from bundled data on native, from a fetched static
 * asset on web. Rejects if the book/chapter isn't present or the fetch fails.
 */
export async function loadChapter(version: string, book: string, chapter: number): Promise<ChapterResult> {
  const data = await getVersionData(version);
  const ch = data[book]?.[String(chapter)];
  if (!ch) {
    throw new Error(`${book} ${chapter} isn't in this version.`);
  }
  const verses: Verse[] = Object.keys(ch)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b)
    .map((n) => ({ verse: n, text: ch[String(n)] }));
  return { verses, source: 'offline', reference: `${book} ${chapter}`, version };
}
