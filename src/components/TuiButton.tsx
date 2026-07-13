// Button variants: bordered (default), primary (ink bg / bg text), accent (accent border+text).
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Variant = 'bordered' | 'primary' | 'accent' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  d?: number;
  full?: boolean;
  style?: ViewStyle;
};

export function TuiButton({ label, onPress, variant = 'bordered', d = -1, full, style }: Props) {
  const t = useTheme();
  const danger = '#8a3a10';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => {
        let borderColor = t.colors.hairline;
        let backgroundColor: string = 'transparent';
        if (variant === 'primary') {
          borderColor = t.colors.ink;
          backgroundColor = pressed ? t.colors.accent : t.colors.ink;
        } else if (variant === 'accent') {
          borderColor = t.colors.accent;
          backgroundColor = pressed ? t.colors.selection : 'transparent';
        } else if (variant === 'danger') {
          borderColor = danger;
          backgroundColor = pressed ? t.colors.selection : 'transparent';
        } else {
          backgroundColor = pressed ? t.colors.selection : 'transparent';
        }
        return [styles.btn, { borderColor, backgroundColor }, full && styles.full, style];
      }}
      hitSlop={4}
    >
      <TuiText
        color={variant === 'primary' ? 'bg' : variant === 'accent' ? 'accent' : variant === 'danger' ? 'accent' : 'ink'}
        weight="medium"
        d={d}
        center
        style={variant === 'danger' ? { color: danger } : undefined}
      >
        {label}
      </TuiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  full: { alignSelf: 'stretch' },
});
