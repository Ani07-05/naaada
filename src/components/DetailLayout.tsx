// Wrapper for stack (non-tab) detail screens: scrollable body + pinned mini player.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TuiScreen } from './TuiScreen';
import { MiniPlayer } from './MiniPlayer';

export function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.fill}>
      <TuiScreen bottomInset={20}>{children}</TuiScreen>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
