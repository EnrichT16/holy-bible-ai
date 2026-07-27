import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getPref, setPref } from '@/lib/storage';

/**
 * App preferences beyond version and theme: Scripture text size for now.
 * Persisted so the reader opens the way the reader left it.
 */

export const TEXT_SIZES = [
  { key: 'compact', label: 'Compact', scale: 0.88 },
  { key: 'serene', label: 'Serene', scale: 1.0 },
  { key: 'large', label: 'Large', scale: 1.15 },
  { key: 'grand', label: 'Grand', scale: 1.32 },
] as const;

export type TextSizeKey = (typeof TEXT_SIZES)[number]['key'];

interface SettingsState {
  textSize: TextSizeKey;
  textScale: number;
  setTextSize: (key: TextSizeKey) => void;
}

const Ctx = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSizeKey>('serene');

  useEffect(() => {
    getPref('textSize').then((v) => {
      if (v && TEXT_SIZES.some((t) => t.key === v)) setTextSizeState(v as TextSizeKey);
    });
  }, []);

  const value = useMemo<SettingsState>(() => {
    const entry = TEXT_SIZES.find((t) => t.key === textSize) ?? TEXT_SIZES[1];
    return {
      textSize,
      textScale: entry.scale,
      setTextSize: (key: TextSizeKey) => {
        setTextSizeState(key);
        setPref('textSize', key);
      },
    };
  }, [textSize]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
