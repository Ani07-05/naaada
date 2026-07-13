// Active theme context: resolves palette + typography from persisted settings.
import React, { createContext, useContext, useMemo } from 'react';
import {
  THEMES, Palette, FONT_FAMILIES, DEVANAGARI_FAMILIES, WeightKey, resolveAccent,
} from './tokens';
import { useSettings } from '@/store/settingsStore';

export type Theme = {
  colors: Palette & { accent: string };
  fontSize: number; // base size (sp)
  size: (delta?: number) => number;
  lineHeight: (delta?: number) => number;
  /** resolve a font family for a weight, using the Devanagari set when needed */
  family: (weight: WeightKey, devanagari: boolean) => string;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useSettings((s) => s.theme);
  const fontId = useSettings((s) => s.font);
  const fontSize = useSettings((s) => s.fontSize);
  const accent = useSettings((s) => s.accent);

  const value = useMemo<Theme>(() => {
    const base = THEMES[themeId];
    const accentColor = resolveAccent(themeId, accent);
    return {
      colors: { ...base, accent: accentColor },
      fontSize,
      size: (delta = 0) => fontSize + delta,
      lineHeight: (delta = 0) => Math.round((fontSize + delta) * 1.45),
      family: (weight, devanagari) =>
        devanagari ? DEVANAGARI_FAMILIES[weight] : FONT_FAMILIES[fontId][weight],
    };
  }, [themeId, fontId, fontSize, accent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used within ThemeProvider');
  return t;
}

// Detect Devanagari codepoints to pick the fallback family.
const DEVANAGARI_RE = /[ऀ-ॿ]/;
export function hasDevanagari(s: string | undefined | null): boolean {
  return !!s && DEVANAGARI_RE.test(s);
}
