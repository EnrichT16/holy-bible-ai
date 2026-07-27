/**
 * Web loader map for the Bible JSON. The files live in `public/bibles/` and
 * are served as static assets, so the JS bundle stays small and a version is
 * downloaded only the first time it is opened (then cached by bibleApi and
 * the browser). Native platforms use `registry.ts`, which bundles the same
 * files for full offline reading.
 */

export type BibleData = Record<string, Record<string, Record<string, string>>>;

const BASE = process.env.EXPO_BASE_URL ?? '';

function fetchBible(id: string): () => Promise<BibleData> {
  return async () => {
    const res = await fetch(`${BASE}/bibles/${id}.json`);
    if (!res.ok) {
      throw new Error(`Could not load this Bible version (HTTP ${res.status}).`);
    }
    return (await res.json()) as BibleData;
  };
}

export const BIBLE_FILES: Record<string, () => Promise<BibleData>> = {
  kjv: fetchBible('kjv'),
  web: fetchBible('web'),
  asv: fetchBible('asv'),
  ylt: fetchBible('ylt'),
  dra: fetchBible('dra'),
  darby: fetchBible('darby'),
};
