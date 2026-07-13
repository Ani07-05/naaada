// First-launch welcome overlay. Shown once (welcomeSeen flag persisted).
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';
import { TuiButton } from './TuiButton';
import { useSettings } from '@/store/settingsStore';

const LOGO = `╔══════════════════╗
║   ♫  ████  ♫     ║
╚══════════════════╝`;

export function Welcome() {
  const t = useTheme();
  const welcomeSeen = useSettings((s) => s.welcomeSeen);
  const setSeen = useSettings((s) => s.setWelcomeSeen);
  if (welcomeSeen) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
      <View style={styles.center}>
        <TuiText color="accent" center lh={1.25}>{LOGO}</TuiText>
        <TuiText color="ink" d={6} weight="semibold" center style={{ letterSpacing: 6, marginTop: 20 }}>
          TERMINAL
        </TuiText>
        <TuiText color="inkSoft" center style={{ marginTop: 4 }}>a quiet music app</TuiText>
        <View style={{ marginTop: 28 }}>
          <TuiButton label="[↵] continue →" variant="primary" onPress={() => setSeen(true)} />
        </View>
        <View style={{ marginTop: 24, gap: 2 }}>
          <TuiText color="inkFaint" d={-2} center>· add your own audio in library</TuiText>
          <TuiText color="inkFaint" d={-2} center>· 9 themes in config</TuiText>
          <TuiText color="inkFaint" d={-2} center>· built for calm listening</TuiText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 100, alignItems: 'center', justifyContent: 'center', padding: 24 },
  center: { alignItems: 'center' },
});
