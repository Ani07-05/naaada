// Base monospace text primitive. Handles theme color tokens, relative sizing,
// tabular figures, and Devanagari font fallback.
import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme, hasDevanagari } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export type ColorToken = keyof Palette | 'accent';

type Props = TextProps & {
  color?: ColorToken;
  /** size delta relative to base font size (README scale) */
  d?: number;
  weight?: 'normal' | 'medium' | 'semibold';
  tabular?: boolean;
  italic?: boolean;
  center?: boolean;
  lh?: number; // explicit line height multiplier override
  children?: React.ReactNode;
};

export function TuiText({
  color = 'ink',
  d = 0,
  weight = 'normal',
  tabular,
  italic,
  center,
  lh,
  style,
  children,
  ...rest
}: Props) {
  const t = useTheme();
  const str = typeof children === 'string' ? children : undefined;
  const weightKey = weight === 'semibold' ? 'semibold' : weight === 'medium' ? 'medium' : 'regular';
  const family = t.family(weightKey, hasDevanagari(str));

  const base: StyleProp<TextStyle> = {
    color: t.colors[color],
    fontFamily: family,
    fontSize: t.size(d),
    lineHeight: lh ? Math.round(t.size(d) * lh) : t.lineHeight(d),
    fontVariant: tabular ? ['tabular-nums'] : undefined,
    fontStyle: italic ? 'italic' : 'normal',
    textAlign: center ? 'center' : undefined,
    includeFontPadding: false,
  };

  return (
    <Text style={[base, style]} {...rest}>
      {children}
    </Text>
  );
}
