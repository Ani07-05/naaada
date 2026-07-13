// Segmented control: joined options, active segment = ink bg / bg text.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<string, string>;
};

export function Segmented<T extends string>({ options, value, onChange, labels }: Props<T>) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { borderColor: t.colors.hairline }]}>
      {options.map((opt, i) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.seg,
              i > 0 && { borderLeftWidth: 1, borderLeftColor: t.colors.hairline },
              active && { backgroundColor: t.colors.ink },
            ]}
          >
            <TuiText color={active ? 'bg' : 'inkSoft'} d={-1} weight={active ? 'medium' : 'normal'}>
              {labels?.[opt] ?? opt}
            </TuiText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderWidth: 1, borderRadius: 2, overflow: 'hidden', alignSelf: 'flex-start' },
  seg: { paddingHorizontal: 10, minHeight: 30, justifyContent: 'center' },
});
