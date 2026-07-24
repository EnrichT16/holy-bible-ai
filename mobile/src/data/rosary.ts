/**
 * The Guided Rosary — Phase 1 covers the opening prayers and the first
 * decade. The full four-mysteries flow is added in Phase 2.
 *
 * Prayers are the traditional Catholic texts (public domain).
 */

export interface RosaryStep {
  id: string;
  title: string;
  instruction: string;
  prayer: string;
  beads?: number; // for repeated prayers (e.g. a decade of 10 Hail Marys)
}

export const SIGN_OF_THE_CROSS =
  'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.';

export const APOSTLES_CREED =
  'I believe in God, the Father Almighty, Creator of Heaven and earth; ' +
  'and in Jesus Christ, His only Son, our Lord, Who was conceived by the Holy Spirit, ' +
  'born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. ' +
  'He descended into Hell; the third day He rose again from the dead; ' +
  'He ascended into Heaven, and sitteth at the right hand of God, the Father Almighty; ' +
  'thence He shall come to judge the living and the dead. ' +
  'I believe in the Holy Spirit, the Holy Catholic Church, the communion of Saints, ' +
  'the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.';

export const OUR_FATHER =
  'Our Father, Who art in Heaven, hallowed be Thy Name; Thy Kingdom come; ' +
  'Thy Will be done on earth as it is in Heaven. Give us this day our daily bread; ' +
  'and forgive us our trespasses as we forgive those who trespass against us; ' +
  'and lead us not into temptation, but deliver us from evil. Amen.';

export const HAIL_MARY =
  'Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, ' +
  'and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, ' +
  'pray for us sinners, now and at the hour of our death. Amen.';

export const GLORY_BE =
  'Glory be to the Father, and to the Son, and to the Holy Spirit. ' +
  'As it was in the beginning, is now, and ever shall be, world without end. Amen.';

export const FATIMA_PRAYER =
  'O my Jesus, forgive us our sins, save us from the fires of Hell, ' +
  'lead all souls to Heaven, especially those in most need of Thy mercy. Amen.';

export type MysterySet = 'Joyful' | 'Sorrowful' | 'Glorious' | 'Luminous';

export const MYSTERIES: Record<MysterySet, { day: string; list: string[] }> = {
  Joyful: {
    day: 'Monday & Saturday',
    list: [
      'The Annunciation',
      'The Visitation',
      'The Nativity',
      'The Presentation in the Temple',
      'The Finding in the Temple',
    ],
  },
  Sorrowful: {
    day: 'Tuesday & Friday',
    list: [
      'The Agony in the Garden',
      'The Scourging at the Pillar',
      'The Crowning with Thorns',
      'The Carrying of the Cross',
      'The Crucifixion',
    ],
  },
  Glorious: {
    day: 'Wednesday & Sunday',
    list: [
      'The Resurrection',
      'The Ascension',
      'The Descent of the Holy Spirit',
      'The Assumption of Mary',
      'The Coronation of Mary',
    ],
  },
  Luminous: {
    day: 'Thursday',
    list: [
      'The Baptism in the Jordan',
      'The Wedding at Cana',
      'The Proclamation of the Kingdom',
      'The Transfiguration',
      'The Institution of the Eucharist',
    ],
  },
};

const MYSTERY_BY_WEEKDAY: MysterySet[] = [
  'Glorious', 'Joyful', 'Sorrowful', 'Glorious', 'Luminous', 'Sorrowful', 'Joyful',
];

export const mysteriesForDay = (date = new Date()): MysterySet => MYSTERY_BY_WEEKDAY[date.getDay()];

export const ROSARY_STEPS: RosaryStep[] = [
  {
    id: 'cross',
    title: 'The Sign of the Cross',
    instruction: 'Hold the crucifix. Begin.',
    prayer: SIGN_OF_THE_CROSS,
  },
  {
    id: 'creed',
    title: 'The Apostles’ Creed',
    instruction: 'On the crucifix, profess the faith.',
    prayer: APOSTLES_CREED,
  },
  {
    id: 'our-father-1',
    title: 'Our Father',
    instruction: 'On the first large bead.',
    prayer: OUR_FATHER,
  },
  {
    id: 'hail-mary-faith',
    title: 'Three Hail Marys',
    instruction: 'For faith, hope, and charity — on the three small beads.',
    prayer: HAIL_MARY,
    beads: 3,
  },
  {
    id: 'glory-1',
    title: 'Glory Be',
    instruction: 'To close the opening prayers.',
    prayer: GLORY_BE,
  },
  {
    id: 'decade-our-father',
    title: 'Our Father — First Decade',
    instruction: 'Announce the first mystery, then pray on the large bead.',
    prayer: OUR_FATHER,
  },
  {
    id: 'decade-hail-marys',
    title: 'Ten Hail Marys',
    instruction: 'Pray one on each of the ten small beads, meditating on the mystery.',
    prayer: HAIL_MARY,
    beads: 10,
  },
  {
    id: 'decade-glory',
    title: 'Glory Be',
    instruction: 'At the end of the decade.',
    prayer: GLORY_BE,
  },
  {
    id: 'decade-fatima',
    title: 'The Fatima Prayer',
    instruction: 'After the Glory Be.',
    prayer: FATIMA_PRAYER,
  },
];
