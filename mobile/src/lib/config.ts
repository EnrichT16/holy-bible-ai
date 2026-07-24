/**
 * App configuration. Values come from Expo's public env (app.json → extra),
 * so nothing secret lives here — the Claude API key stays on the backend.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const CONFIG = {
  /** Base URL of the Holy Bible backend (the Claude proxy). */
  backendUrl: extra.backendUrl || 'http://localhost:8000',

  /** Where the Give tab sends people. Swap for your hosted donation page. */
  donationUrl: extra.donationUrl || 'https://example.org/give',
  giftAidUrl: extra.giftAidUrl || '',
};
