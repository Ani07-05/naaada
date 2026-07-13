// First-launch welcome overlay. Shown once (welcomeSeen flag persisted).
// Offers to scan the device for real music before entering the app.
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';
import { TuiButton } from './TuiButton';
import { useSettings } from '@/store/settingsStore';
import { scanDeviceMusic } from '@/import/importAudio';

const LOGO = `╔══════════════════╗
║   ♫  ████  ♫     ║
╚══════════════════╝`;

export function Welcome() {
  const t = useTheme();
  const welcomeSeen = useSettings((s) => s.welcomeSeen);
  const setSeen = useSettings((s) => s.setWelcomeSeen);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'denied'>('idle');
  const [msg, setMsg] = useState('');

  if (welcomeSeen) return null;

  const scan = async () => {
    setStatus('scanning');
    setMsg('reading your library…');
    try {
      const res = await scanDeviceMusic();
      if (res.denied) {
        setStatus('denied');
        setMsg('permission denied — you can still add files by hand in library.');
        return;
      }
      setStatus('done');
      setMsg(
        res.added > 0
          ? `found ${res.added} track${res.added === 1 ? '' : 's'}. enjoy.`
          : 'no audio files found on this device yet.'
      );
    } catch {
      setStatus('denied');
      setMsg('could not read the media library. add files by hand in library.');
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
      <View style={styles.center}>
        <TuiText color="accent" center lh={1.25}>{LOGO}</TuiText>
        <TuiText color="ink" d={6} weight="semibold" center style={{ letterSpacing: 6, marginTop: 20 }}>
          TERMINAL
        </TuiText>
        <TuiText color="inkSoft" center style={{ marginTop: 4 }}>a quiet music app</TuiText>

        {status === 'done' || status === 'denied' ? (
          <>
            <View style={{ marginTop: 24 }}>
              <TuiText color="inkSoft" center d={-1}>{msg}</TuiText>
            </View>
            <View style={{ marginTop: 20 }}>
              <TuiButton label="enter →" variant="primary" onPress={() => setSeen(true)} />
            </View>
          </>
        ) : (
          <>
            <View style={{ marginTop: 28 }}>
              <TuiButton
                label={status === 'scanning' ? '⋯ scanning…' : '⌕ scan my music'}
                variant="primary"
                onPress={status === 'scanning' ? () => {} : scan}
              />
            </View>
            {status === 'scanning' ? (
              <TuiText color="inkFaint" d={-2} center style={{ marginTop: 10 }}>{msg}</TuiText>
            ) : (
              <View style={{ marginTop: 12 }}>
                <TuiButton label="skip for now" onPress={() => setSeen(true)} />
              </View>
            )}
            <View style={{ marginTop: 24, gap: 2 }}>
              <TuiText color="inkFaint" d={-2} center>· plays your own on-device audio</TuiText>
              <TuiText color="inkFaint" d={-2} center>· or add files by hand in library</TuiText>
              <TuiText color="inkFaint" d={-2} center>· 9 themes in config</TuiText>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 100, alignItems: 'center', justifyContent: 'center', padding: 24 },
  center: { alignItems: 'center' },
});
