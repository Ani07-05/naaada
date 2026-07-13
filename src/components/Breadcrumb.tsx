// Breadcrumb path: /library/artists/Juno Vale  (last segment emphasized).
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TuiText } from './TuiText';

export type Crumb = { label: string; onPress?: () => void };

export function Breadcrumb({ parts }: { parts: Crumb[] }) {
  return (
    <View style={styles.row}>
      {parts.map((p, i) => {
        const last = i === parts.length - 1;
        return (
          <View key={i} style={styles.seg}>
            <TuiText color="inkFaint" d={-2}>/</TuiText>
            {p.onPress && !last ? (
              <Pressable onPress={p.onPress} hitSlop={6}>
                <TuiText color="inkFaint" d={-2}>{p.label}</TuiText>
              </Pressable>
            ) : (
              <TuiText color={last ? 'ink' : 'inkFaint'} weight={last ? 'medium' : 'normal'} d={-2}>
                {p.label}
              </TuiText>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 },
  seg: { flexDirection: 'row', alignItems: 'center' },
});
