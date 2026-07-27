/**
 * Prayer reminder scheduling — iOS / Android. Local daily notifications via
 * expo-notifications; nothing leaves the device.
 */
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NOTIFY_SUPPORTED = true;

export async function scheduleDaily(
  title: string,
  body: string,
  hour: number,
  minute: number
): Promise<string | null> {
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelScheduled(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already gone
  }
}
