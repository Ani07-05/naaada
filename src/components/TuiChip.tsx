// Chip: bordered, near-square, optional active (bracketed + accent) state.
import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** wrap active label in [brackets] */
  bracket?: boolean;
  d?: number;
  style?: ViewStyle;
};

export function TuiChip({ label, active, onPress, bracket, d = -1, style }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: active ? t.colors.accent : t.colors.hairline,
          backgroundColor: pressed ? t.colors.selection : 'transparent',
        },
        style,
      ]}
      hitSlop={4}
    >
      <View style={styles.inner}>
        {bracket && active ? <TuiText color="accent" d={d}>[</TuiText> : null}
        <TuiText color={active ? 'accent' : 'inkSoft'} weight={active ? 'medium' : 'normal'} d={d}>
          {label}
        </TuiText>
        {bracket && active ? <TuiText color="accent" d={d}>]</TuiText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    minHeight: 30,
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
});
