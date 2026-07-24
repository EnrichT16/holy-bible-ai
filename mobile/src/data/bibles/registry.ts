/**
 * Lazy require map for the bundled Bible JSON. Each thunk is only evaluated
 * the first time its version is opened, so the app starts fast and the text
 * is fully available offline (no network, ever).
 *
 * Shape of each file: { "<Book>": { "<chapter>": { "<verse>": "text" } } }.
 */

export type BibleData = Record<string, Record<string, Record<string, string>>>;

export const BIBLE_FILES: Record<string, () => BibleData> = {
  kjv: () => require('../../../assets/bibles/kjv.json'),
  web: () => require('../../../assets/bibles/web.json'),
  asv: () => require('../../../assets/bibles/asv.json'),
  ylt: () => require('../../../assets/bibles/ylt.json'),
  dra: () => require('../../../assets/bibles/dra.json'),
  darby: () => require('../../../assets/bibles/darby.json'),
};
