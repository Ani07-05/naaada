// Config: playback · audio · interface · content · storage · about.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TuiScreen } from '@/components/TuiScreen';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { Toggle } from '@/components/Toggle';
import { Segmented } from '@/components/Segmented';
import { TuiButton } from '@/components/TuiButton';
import { useTheme } from '@/theme/ThemeProvider';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import { FONT_SIZE_MAX, FONT_SIZE_MIN } from '@/theme/tokens';

export default function ConfigScreen() {
  const router = useRouter();
  const s = useSettings();

  return (
    <TuiScreen bottomInset={140}>
      <Breadcrumb parts={[{ label: 'config' }]} />
      <TuiText color="ink" d={3} weight="semibold">config</TuiText>

      <SectionHead label="playback" />
      <Row label="crossfade" sub="blend track ends" control={<Toggle value={s.crossfade} onChange={s.setCrossfade} />} />
      <Row label="gapless" sub="no silence between tracks" control={<Toggle value={s.gapless} onChange={s.setGapless} />} />
      <Row
        label="equalizer"
        control={<Segmented options={['flat', 'warm', 'bass', 'vocal'] as const} value={s.eq} onChange={s.setEq} />}
        stack
      />

      <SectionHead label="audio" />
      <Row
        label="stream quality"
        control={<Segmented options={['auto', 'wifi', 'hq'] as const} value={s.streamQuality} onChange={s.setStreamQuality} />}
        stack
      />
      <Row label="downloaded only" sub="skip network sources" control={<Toggle value={s.downloadedOnly} onChange={s.setDownloadedOnly} />} />

      <SectionHead label="interface" />
      <NavRow label="themes" sub="9 palettes, accent, font" onPress={() => router.push('/config/themes')} />
      <Row
        label="color scheme"
        control={<Segmented options={['paper', 'mono', 'sepia', 'dark'] as const} value={(['paper', 'mono', 'sepia', 'dark'] as const).includes(s.theme as any) ? (s.theme as any) : 'paper'} onChange={s.setTheme} />}
        stack
      />
      <Row
        label="cover art"
        control={<Segmented options={['blocks', 'ascii', 'letter'] as const} value={s.coverStyle} onChange={s.setCoverStyle} />}
        stack
      />
      <Row
        label="text size"
        sub={`${s.fontSize}sp`}
        control={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Stepper label="−" onPress={() => s.setFontSize(s.fontSize - 1)} disabled={s.fontSize <= FONT_SIZE_MIN} />
            <Stepper label="+" onPress={() => s.setFontSize(s.fontSize + 1)} disabled={s.fontSize >= FONT_SIZE_MAX} />
          </View>
        }
      />

      <SectionHead label="content" />
      <NavRow label="lyrics manager" sub="sync + edit lyrics" onPress={() => router.push('/config/lyrics')} />
      <Row label="add new track" sub="import audio file" control={<TuiButton label="[+] new" onPress={() => useUi.getState().openDialog({ kind: 'addSong' })} />} />

      <SectionHead label="storage" />
      <Kv k="downloaded" v="1.2 GB" />
      <Kv k="cache" v="48 MB" />
      <Kv k="free" v="12.4 GB" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <TuiButton label="clear cache" onPress={() => {}} />
        <TuiButton label="manage downloads" onPress={() => {}} />
      </View>

      <SectionHead label="about" />
      <Kv k="version" v={`1.4.0 — "${s.theme}"`} />
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <TuiText color="inkFaint">♫ ═══ ♫</TuiText>
      </View>
    </TuiScreen>
  );
}

function Row({ label, sub, control, stack }: { label: string; sub?: string; control: React.ReactNode; stack?: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: t.colors.hairline }, stack && styles.rowStack]}>
      <View style={styles.rowLabel}>
        <TuiText color="ink" d={-1}>{label}</TuiText>
        {sub ? <TuiText color="inkFaint" d={-2}>{sub}</TuiText> : null}
      </View>
      <View style={stack ? { marginTop: 8 } : undefined}>{control}</View>
    </View>
  );
}

function NavRow({ label, sub, onPress }: { label: string; sub?: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: t.colors.hairline, backgroundColor: pressed ? t.colors.selection : 'transparent' }]}>
      <View style={styles.rowLabel}>
        <TuiText color="ink" d={-1}>{label}</TuiText>
        {sub ? <TuiText color="inkFaint" d={-2}>{sub}</TuiText> : null}
      </View>
      <TuiText color="accent" d={-1}>open →</TuiText>
    </Pressable>
  );
}

function Stepper({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={6} style={[styles.stepper, { borderColor: t.colors.hairline, opacity: disabled ? 0.4 : 1 }]}>
      <TuiText color="ink">{label}</TuiText>
    </Pressable>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.kv}>
      <TuiText color="inkSoft" d={-1}>{k}</TuiText>
      <TuiText color="ink" d={-1} tabular>{v}</TuiText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderStyle: 'dashed', gap: 12 },
  rowStack: { flexDirection: 'column', alignItems: 'flex-start' },
  rowLabel: { flexShrink: 1 },
  stepper: { borderWidth: 1, borderRadius: 2, width: 36, height: 32, alignItems: 'center', justifyContent: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
