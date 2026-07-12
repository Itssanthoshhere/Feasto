/**
 * Lightweight analytics wrapper.
 *
 * If a PostHog API key is configured via EXPO_PUBLIC_POSTHOG_API_KEY,
 * events are forwarded to PostHog. Otherwise they are silently logged
 * to the console in __DEV__ mode.
 *
 * Usage:
 *   import { analytics } from '@/lib/analytics';
 *   analytics.track('item_added', { itemId, restaurantId });
 */

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

let posthogClient: any = null;
let initAttempted = false;

async function ensureInit() {
  if (initAttempted) return;
  initAttempted = true;

  if (!POSTHOG_API_KEY) {
    if (__DEV__) console.log('[analytics] No PostHog API key — events will be logged locally.');
    return;
  }

  try {
    const PostHog = (await import('posthog-react-native')).PostHog;
    posthogClient = new PostHog(POSTHOG_API_KEY, { host: POSTHOG_HOST });
    if (__DEV__) console.log('[analytics] PostHog initialised.');
  } catch (err) {
    if (__DEV__) console.warn('[analytics] Failed to init PostHog:', err);
  }
}

// ────────────────────────────────────────────────────────────────────────────

export const analytics = {
  /**
   * Track a custom event.
   */
  async track(event: string, properties?: Record<string, any>) {
    await ensureInit();
    if (posthogClient) {
      posthogClient.capture(event, properties);
    } else if (__DEV__) {
      console.log(`[analytics] ${event}`, properties ?? '');
    }
  },

  /**
   * Identify the current user (call on login).
   */
  async identify(userId: string, traits?: Record<string, any>) {
    await ensureInit();
    if (posthogClient) {
      posthogClient.identify(userId, traits);
    } else if (__DEV__) {
      console.log(`[analytics] identify`, userId, traits ?? '');
    }
  },

  /**
   * Reset identity (call on logout).
   */
  async reset() {
    await ensureInit();
    if (posthogClient) {
      posthogClient.reset();
    }
  },
};
