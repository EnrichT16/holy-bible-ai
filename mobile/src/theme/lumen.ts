/**
 * The Lumen design system — the visual law of Holy Bible · AI Assisted.
 *
 * An illuminated manuscript, not a utility: deep lapis-navy, candle gold,
 * ivory ink. Every screen is built from these tokens. Refined directly from
 * the Master Blueprint.
 */

export type ThemeName = 'lumen' | 'vox' | 'sanctus' | 'aurora';

export const Gold = {
  accent: '#cfa84e',
  accent2: '#e7c976',
  bright: '#f6e4a0',
  border: 'rgba(207,168,78,0.2)',
  borderStrong: 'rgba(207,168,78,0.45)',
} as const;

export const Ink = {
  ivory: '#f1e8d2',
  muted: '#9bb0d0',
} as const;

export const Lumen = {
  gold: Gold,
  ink: Ink,
  colors: {
    // Base surface colours over the navy gradient.
    text: Ink.ivory,
    muted: Ink.muted,
    accent: Gold.accent,
    accent2: Gold.accent2,
    bright: Gold.bright,
    // Card: white at 5% over navy, hairline gold border.
    card: 'rgba(255,255,255,0.05)',
    cardStrong: 'rgba(255,255,255,0.08)',
    cardBorder: Gold.border,
    tabBar: 'rgba(9,16,32,0.92)',
    tabActive: Gold.accent,
    tabInactive: 'rgba(155,176,208,0.7)',
  },
  fonts: {
    display: 'CormorantGaramond', // headings, prayers, Scripture
    displaySemi: 'CormorantGaramond_600SemiBold',
    body: 'Cardo', // body copy, labels, metadata
    bodyBold: 'Cardo_700Bold',
    label: 'Cinzel', // small-caps section labels
  },
  type: {
    display: 34,
    title: 26,
    heading: 21,
    body: 17,
    scripture: 20,
    label: 13,
    caption: 12,
  },
  spacing: (n: number) => n * 8,
  radius: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 },
} as const;

export interface HomeTheme {
  key: ThemeName;
  label: string;
  note: string;
  /** Background gradient, top → bottom. */
  gradient: [string, string, string];
  accent: string;
  bright: string;
}

/**
 * The four home themes. By default they rotate daily; the user may pin one,
 * a few, or let all rotate (Settings, Phase 2). All keep ivory ink and gold
 * so the app stays one coherent, reverent whole.
 */
export const HOME_THEMES: Record<ThemeName, HomeTheme> = {
  lumen: {
    key: 'lumen',
    label: 'Lumen',
    note: 'Lapis & gold manuscript',
    gradient: ['#1a2b4d', '#12203c', '#0d1830'],
    accent: Gold.accent,
    bright: Gold.bright,
  },
  vox: {
    key: 'vox',
    label: 'Vox',
    note: 'Voice-first dark',
    gradient: ['#101623', '#0a0e18', '#05070c'],
    accent: Gold.accent2,
    bright: Gold.bright,
  },
  sanctus: {
    key: 'sanctus',
    label: 'Sanctus',
    note: 'Stained glass',
    gradient: ['#241a3d', '#1a1330', '#120b24'],
    accent: '#d8b25a',
    bright: '#f2d98a',
  },
  aurora: {
    key: 'aurora',
    label: 'Aurora',
    note: 'Dawn light',
    gradient: ['#1e2f52', '#2a3a58', '#3a3a54'],
    accent: Gold.bright,
    bright: '#fff0c4',
  },
};

export const THEME_ORDER: ThemeName[] = ['lumen', 'vox', 'sanctus', 'aurora'];

/** The theme that rotates in for a given date (stable per calendar day). */
export function themeOfDay(date = new Date()): HomeTheme {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return HOME_THEMES[THEME_ORDER[dayIndex % THEME_ORDER.length]];
}
