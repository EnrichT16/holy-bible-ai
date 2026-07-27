/**
 * The Guided Rosary — the complete devotion: the opening prayers, all five
 * decades of the day's mysteries, and the closing prayers.
 *
 * Prayers are the traditional Catholic texts (public domain).
 */
import type { PrayerStep } from '@/components/GuidedPrayer';

export type RosaryStep = PrayerStep;

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

export const HAIL_HOLY_QUEEN =
  'Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. ' +
  'To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, ' +
  'mourning and weeping in this valley of tears. Turn then, most gracious advocate, ' +
  'thine eyes of mercy toward us, and after this our exile show unto us the blessed ' +
  'fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. ' +
  'Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.';

export const ROSARY_CLOSING_PRAYER =
  'O God, whose only begotten Son, by His life, death, and resurrection, ' +
  'has purchased for us the rewards of eternal life: grant, we beseech Thee, ' +
  'that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, ' +
  'we may imitate what they contain and obtain what they promise, ' +
  'through the same Christ our Lord. Amen.';

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

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth'];

/**
 * The complete Rosary for a mystery set: opening prayers, five full decades
 * (each announced with its mystery), and the closing prayers.
 */
export function buildRosarySteps(set: MysterySet): RosaryStep[] {
  const steps: RosaryStep[] = [
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
  ];

  MYSTERIES[set].list.forEach((mystery, i) => {
    const nth = ORDINALS[i];
    const Nth = nth.charAt(0).toUpperCase() + nth.slice(1);
    steps.push(
      {
        id: `decade-${i + 1}-our-father`,
        title: `Our Father — ${Nth} Decade`,
        instruction: `Announce the ${nth} mystery, then pray on the large bead.`,
        prayer: OUR_FATHER,
        announce: `The ${nth} mystery: ${mystery}.`,
      },
      {
        id: `decade-${i + 1}-hail-marys`,
        title: 'Ten Hail Marys',
        instruction: 'Pray one on each of the ten small beads, meditating on the mystery.',
        prayer: HAIL_MARY,
        beads: 10,
      },
      {
        id: `decade-${i + 1}-glory`,
        title: 'Glory Be',
        instruction: 'At the end of the decade.',
        prayer: GLORY_BE,
      },
      {
        id: `decade-${i + 1}-fatima`,
        title: 'The Fatima Prayer',
        instruction: 'After the Glory Be.',
        prayer: FATIMA_PRAYER,
      }
    );
  });

  steps.push(
    {
      id: 'hail-holy-queen',
      title: 'Hail, Holy Queen',
      instruction: 'On the medal, to Our Lady.',
      prayer: HAIL_HOLY_QUEEN,
    },
    {
      id: 'closing',
      title: 'The Closing Prayer',
      instruction: 'Gather the whole Rosary into one prayer.',
      prayer: ROSARY_CLOSING_PRAYER,
    },
    {
      id: 'cross-end',
      title: 'The Sign of the Cross',
      instruction: 'End as you began.',
      prayer: SIGN_OF_THE_CROSS,
    }
  );

  return steps;
}
