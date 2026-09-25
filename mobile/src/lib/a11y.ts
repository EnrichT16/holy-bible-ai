/**
 * Accessibility foundations — order eight: accessibility is the
 * architecture, not a feature.
 *
 * announce() speaks a short message through the screen reader without
 * moving focus: VoiceOver and TalkBack via AccessibilityInfo, the web
 * via a visually hidden polite live region shared by the whole app.
 *
 * useReducedMotion() answers the phone's own "reduce motion" setting,
 * live, on every platform.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

const LIVE_REGION_ID = 'hb-live-region';

function webRegion(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let region = document.getElementById(LIVE_REGION_ID);
  if (!region) {
    region = document.createElement('div');
    region.id = LIVE_REGION_ID;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    // Visually hidden, never display:none — hidden regions are not spoken.
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      border: '0',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
    });
    document.body.appendChild(region);
  }
  return region;
}

/** Politely announce a short message to screen-reader users. */
export function announce(message: string): void {
  if (!message) return;
  if (Platform.OS === 'web') {
    const region = webRegion();
    if (!region) return;
    // Clear first so repeating the same message is spoken again.
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 40);
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

/** True when the person's device asks for reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduced(query.matches);
      const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
      query.addEventListener?.('change', onChange);
      return () => query.removeEventListener?.('change', onChange);
    }
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setReduced(!!v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduced(!!v));
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
