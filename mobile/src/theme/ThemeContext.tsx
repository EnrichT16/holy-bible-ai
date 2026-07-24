import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { HomeTheme, themeOfDay, HOME_THEMES, ThemeName } from './lumen';

interface ThemeState {
  theme: HomeTheme;
  setTheme: (name: ThemeName) => void;
  isPinned: boolean;
  clearPin: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default: the theme rotates daily. The user may pin one (Settings, Phase 2).
  const [pinned, setPinned] = useState<ThemeName | null>(null);

  const value = useMemo<ThemeState>(
    () => ({
      theme: pinned ? HOME_THEMES[pinned] : themeOfDay(),
      setTheme: (name: ThemeName) => setPinned(name),
      isPinned: pinned !== null,
      clearPin: () => setPinned(null),
    }),
    [pinned]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
