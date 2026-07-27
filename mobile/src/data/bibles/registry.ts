/**
 * Lazy loader map for the bundled Bible JSON (iOS / Android).
 *
 * Each thunk resolves the first time its version is opened, so the app
 * starts fast and the text is fully available offline (no network, ever).
 * On web, Metro resolves `registry.web.ts` instead, which fetches the same
 * files as static assets so they never bloat the JS bundle.
 *
 * Shape of each file: { "<Book>": { "<chapter>": { "<verse>": "text" } } }.
 */

export type BibleData = Record<string, Record<string, Record<string, string>>>;

export const BIBLE_FILES: Record<string, () => Promise<BibleData>> = {
  kjv: async () => require('../../../public/bibles/kjv.json'),
  web: async () => require('../../../public/bibles/web.json'),
  asv: async () => require('../../../public/bibles/asv.json'),
  ylt: async () => require('../../../public/bibles/ylt.json'),
  dra: async () => require('../../../public/bibles/dra.json'),
  darby: async () => require('../../../public/bibles/darby.json'),
};
