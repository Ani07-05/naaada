// Album detail: header (cover + meta + actions) then track list.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailLayout } from '@/components/DetailLayout';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { ListRow } from '@/components/ListRow';
import { BlockCover } from '@/components/BlockCover';
import { TuiButton } from '@/components/TuiButton';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary, albumById, songsInAlbum } from '@/store/libraryStore';
import { usePlayer } from '@/store/playerStore';
import { useUi } from '@/store/uiStore';
import { fmt, fmtLong } from '@/lib/format';
import { shuffled } from '@/lib/shuffle';

export default function AlbumDetail() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  useLibrary((s) => s.songs);
  const album = albumById(id ?? null);
  const openRowMenu = useUi((s) => s.openRowMenu);
  const nowId = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));

  if (!album) {
    return (
      <DetailLayout>
        <Breadcrumb parts={[{ label: 'library' }, { label: 'album' }]} />
        <TuiText color="inkSoft">album not found</TuiText>
      </DetailLayout>
    );
  }

  const tracks = songsInAlbum(album.id);
  const ids = tracks.map((s) => s.id);
  const total = tracks.reduce((n, s) => n + (s.dur || 0), 0);

  return (
    <DetailLayout>
      <Breadcrumb
        parts={[
          { label: 'library', onPress: () => router.push('/library') },
          { label: album.artist, onPress: () => router.push(`/artist/${encodeURIComponent(album.artist)}`) },
          { label: album.title },
        ]}
      />

      <View style={[styles.header, { borderBottomColor: t.colors.hairline }]}>
        <BlockCover seed={album.seed} size={8} cell={10} label={album.title} />
        <View style={styles.headMeta}>
          <TuiText color="ink" d={3} weight="semibold">{album.title}</TuiText>
          <TuiText color="accent">{album.artist}</TuiText>
          <TuiText color="inkSoft" d={-1}>
            {album.year} · {tracks.length} tracks · {fmtLong(total)}
          </TuiText>
        </View>
      </View>

      <View style={styles.actions}>
        <TuiButton label="▶ play" variant="primary" onPress={() => usePlayer.getState().playContext(ids)} />
        <TuiButton label="⇋ shuffle" onPress={() => usePlayer.getState().playContext(shuffled(ids))} />
        <TuiButton label="+ queue" onPress={() => ids.forEach((i) => usePlayer.getState().enqueue(i))} />
      </View>

      <SectionHead label="tracks" />
      {tracks.map((s) => (
        <ListRow
          key={s.id}
          idx={s.track}
          left={s.title}
          right={s.dur ? fmt(s.dur) : '—'}
          tabularRight
          active={s.id === nowId}
          onPress={() => usePlayer.getState().playContext(ids, s.id)}
          onMenu={() => openRowMenu({ songId: s.id, x: 0, y: 0 })}
        />
      ))}
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 14, paddingBottom: 12, borderBottomWidth: 1, borderStyle: 'dashed', marginTop: 4 },
  headMeta: { flex: 1, minWidth: 0, gap: 3, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginVertical: 14 },
});
