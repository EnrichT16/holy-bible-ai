/**
 * A modest liturgical calendar, computed from the date — season, colour,
 * the Sunday cycle (A/B/C), the day's Rosary mysteries, and the coming feast.
 *
 * Enough for the Home screen and the For Catholics "day" card. It is a good
 * approximation of the Roman calendar, not a substitute for the Ordo; local
 * feasts and transferred solemnities are refined in Phase 2.
 */

export type LiturgicalColor = 'green' | 'violet' | 'white' | 'red' | 'rose';
export type MysterySet = 'Joyful' | 'Sorrowful' | 'Glorious' | 'Luminous';

export interface LiturgicalDay {
  season: string;
  color: LiturgicalColor;
  cycle: 'A' | 'B' | 'C';
  mysteries: MysterySet;
  dateLabel: string;
  nextFeast: { name: string; date: Date; inDays: number } | null;
}

const DAY = 86400000;

/** Anonymous Gregorian computus — the date of Easter Sunday for a year. */
export function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** First Sunday of Advent (four Sundays before Christmas Day). */
function firstAdvent(year: number): Date {
  const christmas = new Date(year, 11, 25);
  const dow = christmas.getDay(); // 0 = Sunday
  const sundayBeforeChristmas = new Date(christmas.getTime() - dow * DAY);
  return new Date(sundayBeforeChristmas.getTime() - 3 * 7 * DAY);
}

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const MYSTERY_BY_WEEKDAY: MysterySet[] = [
  'Glorious', // Sun
  'Joyful', // Mon
  'Sorrowful', // Tue
  'Glorious', // Wed
  'Luminous', // Thu
  'Sorrowful', // Fri
  'Joyful', // Sat
];

export function getLiturgicalDay(input = new Date()): LiturgicalDay {
  const today = atMidnight(input);
  const year = today.getFullYear();

  const easterDay = easter(year);
  const ashWednesday = new Date(easterDay.getTime() - 46 * DAY);
  const pentecost = new Date(easterDay.getTime() + 49 * DAY);
  const advent = firstAdvent(year);
  const christmas = new Date(year, 11, 25);
  // Baptism of the Lord ≈ Sunday after Epiphany (Jan 6).
  const epiphany = new Date(year, 0, 6);
  const baptism = new Date(epiphany.getTime() + ((7 - epiphany.getDay()) % 7 || 7) * DAY);

  let season = 'Ordinary Time';
  let color: LiturgicalColor = 'green';

  if (today >= advent && today < christmas) {
    season = 'Advent';
    color = 'violet';
  } else if (today >= christmas || today < baptism) {
    season = 'Christmastide';
    color = 'white';
  } else if (today >= ashWednesday && today < easterDay) {
    season = 'Lent';
    color = 'violet';
  } else if (today >= easterDay && today <= pentecost) {
    season = today.getTime() === pentecost.getTime() ? 'Pentecost' : 'Eastertide';
    color = today.getTime() === pentecost.getTime() ? 'red' : 'white';
  }

  // Sunday cycle: the liturgical year begins at Advent.
  const startYear = today >= advent ? year : year - 1;
  const cycle = (['A', 'B', 'C'] as const)[startYear % 3];

  return {
    season,
    color,
    cycle,
    mysteries: MYSTERY_BY_WEEKDAY[today.getDay()],
    dateLabel: input.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    nextFeast: nextFeast(input),
  };
}

interface FeastDef {
  name: string;
  date: (year: number) => Date;
}

const FEASTS: FeastDef[] = [
  { name: 'The Epiphany', date: (y) => new Date(y, 0, 6) },
  { name: 'Ash Wednesday', date: (y) => new Date(easter(y).getTime() - 46 * DAY) },
  { name: 'Palm Sunday', date: (y) => new Date(easter(y).getTime() - 7 * DAY) },
  { name: 'Holy Thursday', date: (y) => new Date(easter(y).getTime() - 3 * DAY) },
  { name: 'Good Friday', date: (y) => new Date(easter(y).getTime() - 2 * DAY) },
  { name: 'Easter Sunday', date: (y) => easter(y) },
  { name: 'The Ascension', date: (y) => new Date(easter(y).getTime() + 39 * DAY) },
  { name: 'Pentecost', date: (y) => new Date(easter(y).getTime() + 49 * DAY) },
  { name: 'The Assumption', date: (y) => new Date(y, 7, 15) },
  { name: 'All Saints', date: (y) => new Date(y, 10, 1) },
  { name: 'Christ the King', date: (y) => new Date(firstAdvent(y).getTime() - 7 * DAY) },
  { name: 'The Nativity of the Lord', date: (y) => new Date(y, 11, 25) },
];

function nextFeast(from: Date): LiturgicalDay['nextFeast'] {
  const now = atMidnight(from).getTime();
  const candidates: { name: string; date: Date }[] = [];
  for (const y of [from.getFullYear(), from.getFullYear() + 1]) {
    for (const f of FEASTS) candidates.push({ name: f.name, date: atMidnight(f.date(y)) });
  }
  const upcoming = candidates
    .filter((c) => c.date.getTime() >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!upcoming.length) return null;
  const f = upcoming[0];
  return { name: f.name, date: f.date, inDays: Math.round((f.date.getTime() - now) / DAY) };
}
