import { useMemo } from 'react';
import { GuidedPrayer } from '@/components/GuidedPrayer';
import { buildRosarySteps, MYSTERIES, mysteriesForDay } from '@/data/rosary';

/**
 * The Guided Rosary — the complete devotion for the day's mysteries:
 * opening prayers, all five decades, and the closing prayers, prayed on
 * the shared illuminated-bead player.
 */
export default function Rosary() {
  const set = useMemo(() => mysteriesForDay(), []);
  const steps = useMemo(() => buildRosarySteps(set), [set]);
  return (
    <GuidedPrayer
      title="The Rosary"
      subtitle={`${set} Mysteries · ${MYSTERIES[set].day}`}
      steps={steps}
    />
  );
}
