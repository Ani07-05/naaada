// Themes gallery: live palette swatches + accent chips + font grid.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { DetailLayout } from '@/components/DetailLayout';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { useTheme } from '@/theme/ThemeProvider';
import { useSettings } from '@/store/settingsStore';
import {
  THEMES, THEME_IDS, ThemeMeta, ACCENTS, PAPER_FAMILY, FONTS, FONT_FAMILIES, FontId,
} from '@/theme/tokens';

export default function ThemesGallery() {
  const router = useRouter();
  const t = useTheme();
  const activeTheme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const accent = useSettings((s) => s.accent);
  const setAccent = useSettings((s) => s.setAccent);
  const font = useSettings((s) => s.font);
  const setFont = useSettings((s) => s.setFont);

  const exoticActive = !PAPER_FAMILY.includes(activeTheme);

  return (
    <DetailLayout>
      <Breadcrumb
        parts={[
          { label: 'config', onPress: () => router.push('/config') },
          { label: 'themes' },
        ]}
      />

      <SectionHead label="9 themes" right={<TuiText color="inkFaint" d={-2}>tap to apply</TuiText>} />
      <View style={styles.grid}>
        {THEME_IDS.map((id) => (
          <Swatch key={id} theme={THEMES[id]} active={id === activeTheme} onPress={() => setTheme(id)} font={font} />
        ))}
      </View>

      <SectionHead label="accent color" />
      {exoticActive ? (
        <TuiText color="inkFaint" d={-2}>this theme overrides accent</TuiText>
      ) : null}
      <View style={styles.accentRow}>
        {ACCENTS.map((a) => {
          const on = accent === a.id;
          return (
            <Pressable key={a.id} onPress={() => setAccent(on ? null : a.id)} style={[styles.accentChip, { borderColor: on ? t.colors.accent : t.colors.hairline }]}>
              <View style={[styles.swatchSquare, { backgroundColor: a.color }]} />
              <TuiText color={on ? 'accent' : 'inkSoft'} d={-1}>{a.label}</TuiText>
              {on ? <TuiText color="accent" d={-1}>✓</TuiText> : null}
            </Pressable>
          );
        })}
      </View>

      <SectionHead label="font" />
      <View style={styles.grid}>
        {(Object.keys(FONTS) as FontId[]).map((f) => {
          const on = font === f;
          return (
            <Pressable key={f} onPress={() => setFont(f)} style={[styles.fontChip, { borderColor: on ? t.colors.accent : t.colors.hairline, backgroundColor: on ? t.colors.selection : 'transparent' }]}>
              <TuiText color={on ? 'accent' : 'ink'} d={-1} weight="medium">{FONTS[f].label}</TuiText>
              <TuiText color="inkSoft" style={{ fontFamily: FONT_FAMILIES[f].regular }}>{FONTS[f].sample}</TuiText>
            </Pressable>
          );
        })}
      </View>
    </DetailLayout>
  );
}

// A live preview painted entirely in its own palette.
function Swatch({ theme, active, onPress, font }: { theme: ThemeMeta; active: boolean; onPress: () => void; font: FontId }) {
  const fam = FONT_FAMILIES[font].regular;
  const famMed = FONT_FAMILIES[font].medium;
  const txt = (color: string, extra?: object) => ({ color, fontFamily: fam, fontSize: 10, includeFontPadding: false, ...extra });
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.swatch,
        { backgroundColor: theme.bg, borderColor: active ? theme.accent : theme.hairline, borderWidth: active ? 2 : 1 },
      ]}
    >
      {/* chrome dots + rule */}
      <View style={styles.dots}>
        <Dot c={theme.accent} />
        <Dot c={theme.inkSoft} />
        <Dot c={theme.inkFaint} />
        <View style={{ flex: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: theme.hairline, marginLeft: 6 }} />
      </View>
      {/* mini fake screen */}
      <TuiTextRaw style={txt(theme.inkFaint)}>/library</TuiTextRaw>
      <View style={{ backgroundColor: theme.selection, borderRadius: 1, paddingHorizontal: 3, marginVertical: 2 }}>
        <TuiTextRaw style={txt(theme.accent, { fontFamily: famMed })}>▶ Ferrybridge</TuiTextRaw>
      </View>
      <TuiTextRaw style={txt(theme.ink)}>Paper Window</TuiTextRaw>
      <TuiTextRaw style={txt(theme.ink)}>Low Tide</TuiTextRaw>
      <TuiTextRaw style={txt(theme.accent)}>
        ████<TuiTextRaw style={txt(theme.inkFaint)}>░░░░</TuiTextRaw>
      </TuiTextRaw>
      {/* label */}
      <View style={{ marginTop: 6 }}>
        <TuiTextRaw style={txt(theme.ink, { fontSize: 12, fontFamily: famMed })}>{active ? '▸ ' : ''}{theme.label}</TuiTextRaw>
        <TuiTextRaw style={txt(theme.inkFaint)}>{theme.desc}</TuiTextRaw>
      </View>
    </Pressable>
  );
}

// raw Text that ignores the active theme (swatches paint their own palette)
function TuiTextRaw({ style, children }: { style: any; children: React.ReactNode }) {
  return <Text style={style} allowFontScaling={false}>{children}</Text>;
}

function Dot({ c }: { c: string }) {
  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c, marginRight: 4 }} />;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  swatch: { width: '47%', borderRadius: 3, padding: 8 },
  dots: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  accentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  accentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 2, paddingHorizontal: 8, minHeight: 34 },
  swatchSquare: { width: 12, height: 12, borderRadius: 2 },
  fontChip: { width: '47%', borderWidth: 1, borderRadius: 2, padding: 10, gap: 4 },
});
