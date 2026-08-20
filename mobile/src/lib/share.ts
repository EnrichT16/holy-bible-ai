/**
 * Hand a line of text to the person however this platform allows —
 * the share sheet on a phone, the clipboard in a browser.
 */
import { Platform, Share } from 'react-native';

export type ShareOutcome = 'shared' | 'copied' | 'failed';

export async function shareText(message: string): Promise<ShareOutcome> {
  if (Platform.OS === 'web') {
    const clipboard = (globalThis as { navigator?: { clipboard?: { writeText(t: string): Promise<void> } } })
      .navigator?.clipboard;
    if (clipboard) {
      try {
        await clipboard.writeText(message);
        return 'copied';
      } catch {
        return 'failed';
      }
    }
    return 'failed';
  }

  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'failed';
  }
}
