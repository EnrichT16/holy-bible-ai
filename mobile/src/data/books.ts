/**
 * The 66 books of the canon (Protestant order, KJV), with chapter counts.
 * This drives the book picker and the reader's chapter navigation.
 *
 * `api` is the name bible-api.com expects for on-demand chapter fetches.
 */

export type Testament = 'old' | 'new';

export interface Book {
  name: string;
  api: string;
  abbrev: string;
  testament: Testament;
  chapters: number;
}

export const BOOKS: Book[] = [
  // ── Old Testament ──
  { name: 'Genesis', api: 'Genesis', abbrev: 'Gen', testament: 'old', chapters: 50 },
  { name: 'Exodus', api: 'Exodus', abbrev: 'Exo', testament: 'old', chapters: 40 },
  { name: 'Leviticus', api: 'Leviticus', abbrev: 'Lev', testament: 'old', chapters: 27 },
  { name: 'Numbers', api: 'Numbers', abbrev: 'Num', testament: 'old', chapters: 36 },
  { name: 'Deuteronomy', api: 'Deuteronomy', abbrev: 'Deu', testament: 'old', chapters: 34 },
  { name: 'Joshua', api: 'Joshua', abbrev: 'Jos', testament: 'old', chapters: 24 },
  { name: 'Judges', api: 'Judges', abbrev: 'Jdg', testament: 'old', chapters: 21 },
  { name: 'Ruth', api: 'Ruth', abbrev: 'Rut', testament: 'old', chapters: 4 },
  { name: '1 Samuel', api: '1 Samuel', abbrev: '1Sa', testament: 'old', chapters: 31 },
  { name: '2 Samuel', api: '2 Samuel', abbrev: '2Sa', testament: 'old', chapters: 24 },
  { name: '1 Kings', api: '1 Kings', abbrev: '1Ki', testament: 'old', chapters: 22 },
  { name: '2 Kings', api: '2 Kings', abbrev: '2Ki', testament: 'old', chapters: 25 },
  { name: '1 Chronicles', api: '1 Chronicles', abbrev: '1Ch', testament: 'old', chapters: 29 },
  { name: '2 Chronicles', api: '2 Chronicles', abbrev: '2Ch', testament: 'old', chapters: 36 },
  { name: 'Ezra', api: 'Ezra', abbrev: 'Ezr', testament: 'old', chapters: 10 },
  { name: 'Nehemiah', api: 'Nehemiah', abbrev: 'Neh', testament: 'old', chapters: 13 },
  { name: 'Esther', api: 'Esther', abbrev: 'Est', testament: 'old', chapters: 10 },
  { name: 'Job', api: 'Job', abbrev: 'Job', testament: 'old', chapters: 42 },
  { name: 'Psalms', api: 'Psalms', abbrev: 'Psa', testament: 'old', chapters: 150 },
  { name: 'Proverbs', api: 'Proverbs', abbrev: 'Pro', testament: 'old', chapters: 31 },
  { name: 'Ecclesiastes', api: 'Ecclesiastes', abbrev: 'Ecc', testament: 'old', chapters: 12 },
  { name: 'Song of Solomon', api: 'Song of Solomon', abbrev: 'Sng', testament: 'old', chapters: 8 },
  { name: 'Isaiah', api: 'Isaiah', abbrev: 'Isa', testament: 'old', chapters: 66 },
  { name: 'Jeremiah', api: 'Jeremiah', abbrev: 'Jer', testament: 'old', chapters: 52 },
  { name: 'Lamentations', api: 'Lamentations', abbrev: 'Lam', testament: 'old', chapters: 5 },
  { name: 'Ezekiel', api: 'Ezekiel', abbrev: 'Eze', testament: 'old', chapters: 48 },
  { name: 'Daniel', api: 'Daniel', abbrev: 'Dan', testament: 'old', chapters: 12 },
  { name: 'Hosea', api: 'Hosea', abbrev: 'Hos', testament: 'old', chapters: 14 },
  { name: 'Joel', api: 'Joel', abbrev: 'Joe', testament: 'old', chapters: 3 },
  { name: 'Amos', api: 'Amos', abbrev: 'Amo', testament: 'old', chapters: 9 },
  { name: 'Obadiah', api: 'Obadiah', abbrev: 'Oba', testament: 'old', chapters: 1 },
  { name: 'Jonah', api: 'Jonah', abbrev: 'Jon', testament: 'old', chapters: 4 },
  { name: 'Micah', api: 'Micah', abbrev: 'Mic', testament: 'old', chapters: 7 },
  { name: 'Nahum', api: 'Nahum', abbrev: 'Nah', testament: 'old', chapters: 3 },
  { name: 'Habakkuk', api: 'Habakkuk', abbrev: 'Hab', testament: 'old', chapters: 3 },
  { name: 'Zephaniah', api: 'Zephaniah', abbrev: 'Zep', testament: 'old', chapters: 3 },
  { name: 'Haggai', api: 'Haggai', abbrev: 'Hag', testament: 'old', chapters: 2 },
  { name: 'Zechariah', api: 'Zechariah', abbrev: 'Zec', testament: 'old', chapters: 14 },
  { name: 'Malachi', api: 'Malachi', abbrev: 'Mal', testament: 'old', chapters: 4 },
  // ── New Testament ──
  { name: 'Matthew', api: 'Matthew', abbrev: 'Mat', testament: 'new', chapters: 28 },
  { name: 'Mark', api: 'Mark', abbrev: 'Mrk', testament: 'new', chapters: 16 },
  { name: 'Luke', api: 'Luke', abbrev: 'Luk', testament: 'new', chapters: 24 },
  { name: 'John', api: 'John', abbrev: 'Jhn', testament: 'new', chapters: 21 },
  { name: 'Acts', api: 'Acts', abbrev: 'Act', testament: 'new', chapters: 28 },
  { name: 'Romans', api: 'Romans', abbrev: 'Rom', testament: 'new', chapters: 16 },
  { name: '1 Corinthians', api: '1 Corinthians', abbrev: '1Co', testament: 'new', chapters: 16 },
  { name: '2 Corinthians', api: '2 Corinthians', abbrev: '2Co', testament: 'new', chapters: 13 },
  { name: 'Galatians', api: 'Galatians', abbrev: 'Gal', testament: 'new', chapters: 6 },
  { name: 'Ephesians', api: 'Ephesians', abbrev: 'Eph', testament: 'new', chapters: 6 },
  { name: 'Philippians', api: 'Philippians', abbrev: 'Php', testament: 'new', chapters: 4 },
  { name: 'Colossians', api: 'Colossians', abbrev: 'Col', testament: 'new', chapters: 4 },
  { name: '1 Thessalonians', api: '1 Thessalonians', abbrev: '1Th', testament: 'new', chapters: 5 },
  { name: '2 Thessalonians', api: '2 Thessalonians', abbrev: '2Th', testament: 'new', chapters: 3 },
  { name: '1 Timothy', api: '1 Timothy', abbrev: '1Ti', testament: 'new', chapters: 6 },
  { name: '2 Timothy', api: '2 Timothy', abbrev: '2Ti', testament: 'new', chapters: 4 },
  { name: 'Titus', api: 'Titus', abbrev: 'Tit', testament: 'new', chapters: 3 },
  { name: 'Philemon', api: 'Philemon', abbrev: 'Phm', testament: 'new', chapters: 1 },
  { name: 'Hebrews', api: 'Hebrews', abbrev: 'Heb', testament: 'new', chapters: 13 },
  { name: 'James', api: 'James', abbrev: 'Jas', testament: 'new', chapters: 5 },
  { name: '1 Peter', api: '1 Peter', abbrev: '1Pe', testament: 'new', chapters: 5 },
  { name: '2 Peter', api: '2 Peter', abbrev: '2Pe', testament: 'new', chapters: 3 },
  { name: '1 John', api: '1 John', abbrev: '1Jn', testament: 'new', chapters: 5 },
  { name: '2 John', api: '2 John', abbrev: '2Jn', testament: 'new', chapters: 1 },
  { name: '3 John', api: '3 John', abbrev: '3Jn', testament: 'new', chapters: 1 },
  { name: 'Jude', api: 'Jude', abbrev: 'Jud', testament: 'new', chapters: 1 },
  { name: 'Revelation', api: 'Revelation', abbrev: 'Rev', testament: 'new', chapters: 22 },
];

export const findBook = (name: string) => BOOKS.find((b) => b.name === name);

/** Old Testament groupings, in order, for the book picker. */
export const OT_GROUPS: { title: string; books: string[] }[] = [
  { title: 'The Law', books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  {
    title: 'History',
    books: [
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
      '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    ],
  },
  {
    title: 'Wisdom & Poetry',
    books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'],
  },
  {
    title: 'The Prophets',
    books: [
      'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    ],
  },
];

/**
 * The Deuterocanon. Shown as its own picker tab. These books belong to the
 * Catholic and Orthodox canons — they arrive with the Douay-Rheims (and, later,
 * other) versions. The KJV of the MVP does not carry them, so the tab explains
 * they are coming rather than failing to load.
 */
export const DEUTEROCANON: { name: string; note: string }[] = [
  { name: 'Tobit', note: '14 chapters' },
  { name: 'Judith', note: '16 chapters' },
  { name: 'Wisdom', note: 'The Wisdom of Solomon' },
  { name: 'Sirach', note: 'Ecclesiasticus' },
  { name: 'Baruch', note: 'with the Letter of Jeremiah' },
  { name: '1 Maccabees', note: '16 chapters' },
  { name: '2 Maccabees', note: '15 chapters' },
  { name: 'Additions to Esther', note: 'the Greek portions' },
  { name: 'Additions to Daniel', note: 'Susanna · Bel · the Song of the Three' },
];
