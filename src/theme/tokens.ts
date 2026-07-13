// Design tokens — 9 themes ported from the design handoff (shell.jsx / README).
// Each theme carries the 8 semantic color tokens.

export type ThemeId =
  | 'paper'
  | 'mono'
  | 'sepia'
  | 'dark'
  | 'eink'
  | 'contrast'
  | 'amber'
  | 'phosphor'
  | 'matrix';

export type Palette = {
  bg: string;
  bgElev: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  accent: string;
  selection: string;
  hairline: string;
};

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  desc: string;
} & Palette;

export const THEMES: Record<ThemeId, ThemeMeta> = {
  paper: {
    id: 'paper', label: 'paper', desc: 'warm cream, sepia ink',
    bg: '#efe7d7', bgElev: '#e7dcc7', ink: '#2a241c', inkSoft: '#6b5d47',
    inkFaint: '#a89776', accent: '#a04a1c', selection: '#d9c9a3', hairline: '#c9b896',
  },
  mono: {
    id: 'mono', label: 'mono', desc: 'off-white, pure ink',
    bg: '#f5f3ee', bgElev: '#ece9e0', ink: '#1a1a1a', inkSoft: '#555555',
    inkFaint: '#9a968c', accent: '#1a1a1a', selection: '#dedbd2', hairline: '#bfbbaf',
  },
  sepia: {
    id: 'sepia', label: 'sepia', desc: 'aged vellum, red ink',
    bg: '#ebd9b4', bgElev: '#e0ca9e', ink: '#3a2610', inkSoft: '#7a5a30',
    inkFaint: '#a88850', accent: '#8a3a10', selection: '#d4be8c', hairline: '#b89868',
  },
  dark: {
    id: 'dark', label: 'dark', desc: 'midnight, warm amber',
    bg: '#15140f', bgElev: '#1d1b14', ink: '#e8dfc8', inkSoft: '#a59a7e',
    inkFaint: '#6a6047', accent: '#d9a45c', selection: '#2d2a1e', hairline: '#3a3528',
  },
  eink: {
    id: 'eink', label: 'e-ink', desc: 'paperwhite reader',
    bg: '#e3e1da', bgElev: '#d8d5cc', ink: '#222220', inkSoft: '#56544c',
    inkFaint: '#8a877a', accent: '#222220', selection: '#c8c5b8', hairline: '#a8a59a',
  },
  contrast: {
    id: 'contrast', label: 'contrast', desc: 'maximum legibility',
    bg: '#ffffff', bgElev: '#f0f0f0', ink: '#000000', inkSoft: '#333333',
    inkFaint: '#888888', accent: '#0000aa', selection: '#ffe86b', hairline: '#000000',
  },
  amber: {
    id: 'amber', label: 'amber crt', desc: 'vintage terminal glow',
    bg: '#1a0e00', bgElev: '#2a1800', ink: '#ffb86c', inkSoft: '#d48849',
    inkFaint: '#7a4820', accent: '#ffd98c', selection: '#3a2400', hairline: '#5a3810',
  },
  phosphor: {
    id: 'phosphor', label: 'phosphor', desc: 'green tube',
    bg: '#001008', bgElev: '#00180c', ink: '#6aff8c', inkSoft: '#3ac868',
    inkFaint: '#1a7a3c', accent: '#a0ffb8', selection: '#003020', hairline: '#1a4a28',
  },
  matrix: {
    id: 'matrix', label: 'matrix', desc: 'cascading code',
    bg: '#000000', bgElev: '#080808', ink: '#00ff41', inkSoft: '#00aa2a',
    inkFaint: '#005510', accent: '#80ff80', selection: '#002a0a', hairline: '#003310',
  },
};

// Theme ids in display order.
export const THEME_IDS: ThemeId[] = [
  'paper', 'mono', 'sepia', 'dark', 'eink', 'contrast', 'amber', 'phosphor', 'matrix',
];

// Themes that allow a user-picked accent override.
export const PAPER_FAMILY: ThemeId[] = ['paper', 'mono', 'sepia', 'dark', 'eink'];

export type AccentId = 'amber' | 'rust' | 'sage' | 'plum' | 'ink';

export const ACCENTS: { id: AccentId; label: string; color: string }[] = [
  { id: 'amber', label: 'amber', color: '#a04a1c' },
  { id: 'rust', label: 'rust', color: '#8a3a10' },
  { id: 'sage', label: 'sage', color: '#5a7148' },
  { id: 'plum', label: 'plum', color: '#6b3a5a' },
  { id: 'ink', label: 'ink', color: '#2a241c' },
];

// Font ids -> loaded font family names (registered in _layout via expo-font).
export type FontId = 'jetbrains' | 'space' | 'vt';
export type WeightKey = 'regular' | 'medium' | 'semibold';

export const FONTS: Record<FontId, { label: string; sample: string }> = {
  jetbrains: { label: 'jetbrains mono', sample: 'Aa Bb 01' },
  space: { label: 'space mono', sample: 'Aa Bb 01' },
  vt: { label: 'vt323', sample: 'Aa Bb 01' },
};

// Per-weight family names (each weight is a separately registered font file so
// Android renders the correct weight rather than synthesizing it).
export const FONT_FAMILIES: Record<FontId, Record<WeightKey, string>> = {
  jetbrains: {
    regular: 'JetBrainsMono',
    medium: 'JetBrainsMono-Medium',
    semibold: 'JetBrainsMono-SemiBold',
  },
  space: { regular: 'SpaceMono', medium: 'SpaceMono', semibold: 'SpaceMono-Bold' },
  vt: { regular: 'VT323', medium: 'VT323', semibold: 'VT323' },
};

// Devanagari fallback families (used when a string contains Devanagari codepoints).
export const DEVANAGARI_FAMILIES: Record<WeightKey, string> = {
  regular: 'NotoSansDevanagari',
  medium: 'NotoSansDevanagari-Medium',
  semibold: 'NotoSansDevanagari-SemiBold',
};

export const FONT_SIZE_MIN = 11;
export const FONT_SIZE_MAX = 16;
export const FONT_SIZE_DEFAULT = 13;

// Resolve the accent for a given theme, honoring the paper-family override rule.
export function resolveAccent(themeId: ThemeId, accentOverride: AccentId | null): string {
  const base = THEMES[themeId].accent;
  if (!accentOverride) return base;
  if (!PAPER_FAMILY.includes(themeId)) return base; // exotic themes keep their own accent
  const found = ACCENTS.find((a) => a.id === accentOverride);
  return found ? found.color : base;
}
