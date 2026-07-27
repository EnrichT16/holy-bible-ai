import { useMemo } from 'react';
import { GuidedPrayer } from '@/components/GuidedPrayer';
import { buildChapletSteps } from '@/data/chaplet';

/**
 * The Divine Mercy Chaplet, prayed on the shared illuminated-bead player.
 * Traditionally prayed at three o'clock, the Hour of Mercy.
 */
export default function Chaplet() {
  const steps = useMemo(() => buildChapletSteps(), []);
  return (
    <GuidedPrayer
      title="Divine Mercy Chaplet"
      subtitle="On ordinary rosary beads · the Hour of Mercy"
      steps={steps}
    />
  );
}
