// Character-mosaic cover art rendered in a monospace Text, tinted accent.
import React, { useMemo } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { buildCover } from '@/art/cover';
import { useSettings } from '@/store/settingsStore';

type Props = {
  seed: string;
  size?: number; // grid cells (3 mini .. 10 hero)
  label?: string;
  cell?: number; // font size per char
  tint?: 'accent' | 'ink' | 'inkSoft';
  styleOverride?: 'blocks' | 'ascii' | 'letter';
};

export function BlockCover({ seed, size = 7, label = '', cell = 7, tint = 'accent', styleOverride }: Props) {
  const t = useTheme();
  const coverStyle = useSettings((s) => s.coverStyle);
  const style = styleOverride ?? coverStyle;

  const text = useMemo(
    () => buildCover({ seed, size, label, style }),
    [seed, size, label, style]
  );

  const textStyle: TextStyle = {
    color: t.colors[tint],
    fontFamily: t.family('regular', false),
    fontSize: cell,
    lineHeight: cell,
    includeFontPadding: false,
  };

  return (
    <Text style={[styles.mono, textStyle]} allowFontScaling={false}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  mono: { letterSpacing: 0 },
});
