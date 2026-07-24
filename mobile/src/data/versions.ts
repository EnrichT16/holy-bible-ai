/**
 * The bundled, fully-offline Bible versions (all public domain).
 * The user switches between these in the version selector.
 *
 * The Deuterocanon (Tobit, Judith, Wisdom, Sirach, Baruch, 1 & 2 Maccabees,
 * and the additions to Esther and Daniel) is served by the World English Bible
 * "with Apocrypha" edition — the one complete, correctly-labelled public-domain
 * source. The Douay-Rheims here carries its 66 protocanonical books.
 */

export interface Version {
  id: string;
  name: string;
  abbrev: string;
  year: string;
  blurb: string;
  tradition: 'protestant' | 'catholic';
}

export const VERSIONS: Version[] = [
  { id: 'kjv', name: 'King James Version', abbrev: 'KJV', year: '1611', blurb: 'The classic English Bible', tradition: 'protestant' },
  { id: 'web', name: 'World English Bible', abbrev: 'WEB', year: '2000', blurb: 'Modern English · includes the Deuterocanon', tradition: 'protestant' },
  { id: 'asv', name: 'American Standard Version', abbrev: 'ASV', year: '1901', blurb: 'Precise and formal', tradition: 'protestant' },
  { id: 'ylt', name: "Young's Literal Translation", abbrev: 'YLT', year: '1898', blurb: 'Word-for-word literal', tradition: 'protestant' },
  { id: 'dra', name: 'Douay-Rheims (Challoner)', abbrev: 'DRA', year: '1899', blurb: 'The traditional Catholic Bible', tradition: 'catholic' },
  { id: 'darby', name: 'Darby Translation', abbrev: 'DBY', year: '1890', blurb: 'Careful and studied', tradition: 'protestant' },
];

export const DEFAULT_VERSION = 'kjv';

/** The Deuterocanon tab reads from this version (complete + correctly labelled). */
export const DEUTERO_VERSION = 'web';

/** Deuterocanonical books, in traditional order, as carried by the WEB. */
export const DEUTERO_BOOKS: string[] = [
  'Tobit',
  'Judith',
  'Additions to Esther',
  'Wisdom',
  'Sirach',
  'Baruch',
  'Letter of Jeremiah',
  'Prayer of Azariah',
  'Susanna',
  'Bel and the Dragon',
  '1 Maccabees',
  '2 Maccabees',
];

export const findVersion = (id: string) => VERSIONS.find((v) => v.id === id) ?? VERSIONS[0];
