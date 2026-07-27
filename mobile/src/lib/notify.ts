/**
 * Prayer reminder scheduling — web build. The browser cannot ring like a
 * call, so reminders are presented as a phone-app grace; `notify.native.ts`
 * carries the real implementation (Metro picks it on iOS/Android).
 */

export const NOTIFY_SUPPORTED = false;

export async function scheduleDaily(
  _title: string,
  _body: string,
  _hour: number,
  _minute: number
): Promise<string | null> {
  return null;
}

export async function cancelScheduled(_id: string): Promise<void> {
  // nothing scheduled on web
}
