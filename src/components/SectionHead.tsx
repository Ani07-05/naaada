// Section header: `── label ───────────────`  with optional right slot.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Props = {
  label: string;
  right?: React.ReactNode;
  accent?: boolean;
};

export function SectionHead({ label, right, accent }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <TuiText color="hairline">── </TuiText>
      <TuiText color={accent ? 'accent' : 'inkSoft'} d={-1} weight="medium">
        {label}
      </TuiText>
      <View style={[styles.rule, { borderColor: t.colors.hairline }]} />
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  rule: { flex: 1, borderBottomWidth: 1, marginHorizontal: 8, opacity: 0.7 },
  right: { flexShrink: 0 },
});
