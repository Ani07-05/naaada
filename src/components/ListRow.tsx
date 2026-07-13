// Generic TUI list row: leader glyph/index + main (left + sub) + right + optional ⋮ menu.
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Props = {
  idx?: number;
  glyph?: string;
  left: string;
  sub?: string;
  right?: string;
  active?: boolean;
  onPress?: () => void;
  onMenu?: () => void;
  tabularRight?: boolean;
};

export function ListRow({
  idx, glyph, left, sub, right, active, onPress, onMenu, tabularRight,
}: Props) {
  const t = useTheme();
  const leader = glyph ?? (active ? '▶' : idx != null ? String(idx).padStart(2, '0') : '·');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: active || pressed ? t.colors.selection : 'transparent' },
        active && { borderLeftColor: t.colors.accent, borderLeftWidth: 2, paddingLeft: 6 },
      ]}
    >
      <TuiText color={active ? 'accent' : 'inkFaint'} tabular d={-1} style={styles.leader}>
        {leader}
      </TuiText>
      <View style={styles.main}>
        <TuiText color="ink" numberOfLines={1}>{left}</TuiText>
        {sub ? (
          <TuiText color="inkSoft" d={-2} numberOfLines={1}>{sub}</TuiText>
        ) : null}
      </View>
      {right ? (
        <TuiText color="inkSoft" d={-1} tabular={tabularRight} style={styles.right}>{right}</TuiText>
      ) : null}
      {onMenu ? (
        <Pressable onPress={onMenu} hitSlop={10} style={styles.menu}>
          <TuiText color="inkFaint">⋮</TuiText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 10,
  },
  leader: { width: 20, textAlign: 'left' },
  main: { flex: 1, minWidth: 0 },
  right: { flexShrink: 0 },
  menu: { width: 22, alignItems: 'center', justifyContent: 'center' },
});
