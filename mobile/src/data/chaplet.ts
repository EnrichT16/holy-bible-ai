/**
 * The Divine Mercy Chaplet — prayed on ordinary rosary beads. The short
 * invocations are the standard texts of the public devotion.
 */
import type { PrayerStep } from '@/components/GuidedPrayer';
import { SIGN_OF_THE_CROSS, OUR_FATHER, HAIL_MARY, APOSTLES_CREED } from '@/data/rosary';

export const ETERNAL_FATHER =
  'Eternal Father, I offer You the Body and Blood, Soul and Divinity ' +
  'of Your dearly beloved Son, Our Lord Jesus Christ, ' +
  'in atonement for our sins and those of the whole world.';

export const SORROWFUL_PASSION =
  'For the sake of His sorrowful Passion, have mercy on us and on the whole world.';

export const HOLY_GOD =
  'Holy God, Holy Mighty One, Holy Immortal One, ' +
  'have mercy on us and on the whole world.';

export const MERCY_CLOSING =
  'Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, ' +
  'look kindly upon us and increase Your mercy in us, that in difficult moments ' +
  'we might not despair nor become despondent, but with great confidence ' +
  'submit ourselves to Your holy will, which is Love and Mercy itself. Amen.';

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth'];

export function buildChapletSteps(): PrayerStep[] {
  const steps: PrayerStep[] = [
    {
      id: 'cross',
      title: 'The Sign of the Cross',
      instruction: 'Hold the crucifix. Begin.',
      prayer: SIGN_OF_THE_CROSS,
    },
    {
      id: 'our-father',
      title: 'Our Father',
      instruction: 'On the first large bead.',
      prayer: OUR_FATHER,
    },
    {
      id: 'hail-mary',
      title: 'Hail Mary',
      instruction: 'On the next bead.',
      prayer: HAIL_MARY,
    },
    {
      id: 'creed',
      title: 'The Apostles’ Creed',
      instruction: 'Profess the faith before the decades.',
      prayer: APOSTLES_CREED,
    },
  ];

  for (let i = 0; i < 5; i++) {
    const nth = ORDINALS[i];
    const Nth = nth.charAt(0).toUpperCase() + nth.slice(1);
    steps.push(
      {
        id: `decade-${i + 1}-eternal-father`,
        title: `Eternal Father — ${Nth} Decade`,
        instruction: 'On the large bead before each decade.',
        prayer: ETERNAL_FATHER,
      },
      {
        id: `decade-${i + 1}-passion`,
        title: 'For the Sake of His Sorrowful Passion',
        instruction: 'On each of the ten small beads.',
        prayer: SORROWFUL_PASSION,
        beads: 10,
      }
    );
  }

  steps.push(
    {
      id: 'holy-god',
      title: 'Holy God',
      instruction: 'Repeat three times to conclude.',
      prayer: HOLY_GOD,
      beads: 3,
    },
    {
      id: 'closing',
      title: 'The Closing Prayer',
      instruction: 'Rest in His mercy.',
      prayer: MERCY_CLOSING,
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
