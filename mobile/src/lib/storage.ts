/**
 * Tiny persistence layer for preferences. AsyncStorage on native,
 * localStorage on web (AsyncStorage delegates to it there too, but going
 * direct keeps web reads synchronous-fast and dependency-light).
 * Failures are swallowed: a preference that fails to save must never
 * break prayer.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'holybible:';

export async function getPref(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export async function setPref(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, value);
  } catch {
    // non-fatal
  }
}

export async function removePref(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // non-fatal
  }
}
