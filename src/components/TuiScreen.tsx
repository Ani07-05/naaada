// Screen wrapper: themed background + safe-area padding + optional scroll.
import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  pad?: boolean;
  contentStyle?: ViewStyle;
  bottomInset?: number; // extra space for mini player + nav
};

export function TuiScreen({ children, scroll = true, pad = true, contentStyle, bottomInset = 0 }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const padStyle: ViewStyle = {
    paddingHorizontal: pad ? 13 : 0,
    paddingTop: pad ? 12 : 0,
    paddingBottom: bottomInset,
  };

  if (scroll) {
    return (
      <View style={[styles.fill, { backgroundColor: t.colors.bg }]}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[padStyle, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: t.colors.bg }, padStyle, contentStyle]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
