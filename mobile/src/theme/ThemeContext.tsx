import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { HomeTheme, themeOfDay, HOME_THEMES, ThemeName } from './lumen';
import { getPref, setPref, removePref } from '@/lib/storage';

interface ThemeState {
  theme: HomeTheme;
  setTheme: (name: ThemeName) => void;
  isPinned: boolean;
  pinnedName: ThemeName | null;
  clearPin: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default: the theme rotates daily. The user may pin one in Settings;
  // the pin is remembered between sessions.
  const [pinned, setPinned] = useState<ThemeName | null>(null);

  useEffect(() => {
    getPref('theme').then((v) => {
      if (v && v in HOME_THEMES) setPinned(v as ThemeName);
    });
  }, []);

  const value = useMemo<ThemeState>(
    () => ({
      theme: pinned ? HOME_THEMES[pinned] : themeOfDay(),
      setTheme: (name: ThemeName) => {
        setPinned(name);
        setPref('theme', name);
      },
      isPinned: pinned !== null,
      pinnedName: pinned,
      clearPin: () => {
        setPinned(null);
        removePref('theme');
      },
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
