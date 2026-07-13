// Lyrics manager: coverage summary, filter, per-track edit/add.
import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { DetailLayout } from '@/components/DetailLayout';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ListRow } from '@/components/ListRow';
import { TuiChip } from '@/components/TuiChip';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary, albumById } from '@/store/libraryStore';
import { useUi } from '@/store/uiStore';
import { asciiProgress } from '@/art/cover';

type Filter = 'all' | 'with' | 'needs';

export default function LyricsManager() {
  const t = useTheme();
  const router = useRouter();
  const songs = useLibrary((s) => s.songs);
  const lyricIds = useLibrary((s) => s.lyricIds);
  const openDialog = useUi((s) => s.openDialog);
  const [filter, setFilter] = useState<Filter>('all');

  const has = useMemo(() => new Set(lyricIds), [lyricIds]);
  const withCount = songs.filter((s) => has.has(s.id)).length;
  const needs = songs.length - withCount;
  const pct = songs.length ? Math.round((withCount / songs.length) * 100) : 0;
  const bar = asciiProgress(withCount, songs.length, 32);

  const list = songs.filter((s) =>
    filter === 'all' ? true : filter === 'with' ? has.has(s.id) : !has.has(s.id)
  );

  return (
    <DetailLayout>
      <Breadcrumb
        parts={[{ label: 'config', onPress: () => router.push('/config') }, { label: 'lyrics manager' }]}
      />

      <View style={[styles.card, { backgroundColor: t.colors.bgElev, borderColor: t.colors.hairline }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TuiText color="ink" weight="medium">lyrics coverage</TuiText>
          <TuiText color="accent" tabular>{withCount}/{songs.length} · {pct}%</TuiText>
        </View>
        <TuiText d={-1} style={{ marginVertical: 6 }}>
          <TuiText color="accent" d={-1}>{bar.fill}</TuiText>
          <TuiText color="inkFaint" d={-1}>{bar.rest}</TuiText>
        </TuiText>
        <TuiText color="inkSoft" d={-2}>{needs} tracks still need lyrics.</TuiText>
      </View>

      <View style={styles.filters}>
        <TuiChip label={`all (${songs.length})`} active={filter === 'all'} bracket onPress={() => setFilter('all')} />
        <TuiChip label={`with lyrics (${withCount})`} active={filter === 'with'} bracket onPress={() => setFilter('with')} />
        <TuiChip label={`needs lyrics (${needs})`} active={filter === 'needs'} bracket onPress={() => setFilter('needs')} />
      </View>

      {list.map((s) => {
        const hasLyr = has.has(s.id);
        const album = albumById(s.albumId);
        return (
          <ListRow
            key={s.id}
            glyph={hasLyr ? '✓' : '○'}
            left={s.title}
            sub={`${s.artist}${album ? ' · ' + album.title : ''}`}
            onPress={() => openDialog({ kind: 'editLyrics', songId: s.id })}
            right={hasLyr ? 'edit' : '+ add'}
          />
        );
      })}
      <View style={{ height: 8 }} />
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 2, padding: 12, marginVertical: 10 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
});
