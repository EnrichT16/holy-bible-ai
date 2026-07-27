import { useLocalSearchParams } from 'expo-router';
import { GuidePage } from '@/components/GuidePage';
import { findEntry } from '@/data/library';

/** One readable Library entry. */
export default function Entry() {
  const { cid, eid } = useLocalSearchParams<{ cid: string; eid: string }>();
  const entry = findEntry(String(cid), String(eid));

  if (!entry) {
    return (
      <GuidePage
        content={{
          title: 'Not found',
          sections: [{ body: ['This entry does not exist. Go back and choose another.'] }],
        }}
      />
    );
  }
  return <GuidePage content={entry.content} />;
}
