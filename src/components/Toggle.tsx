// Toggle rendered as `[×] on` / `[ ] off` — accent border + text when on.
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={6}
      style={({ pressed }) => [
        styles.box,
        {
          borderColor: value ? t.colors.accent : t.colors.hairline,
          backgroundColor: pressed ? t.colors.selection : 'transparent',
        },
      ]}
    >
      <TuiText color={value ? 'accent' : 'inkSoft'} d={-1} weight={value ? 'medium' : 'normal'}>
        {value ? '[×] on' : '[ ] off'}
      </TuiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    minHeight: 30,
    justifyContent: 'center',
  },
});
