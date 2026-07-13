// Artist detail: name, stats, play all / shuffle, albums grid, top tracks.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailLayout } from '@/components/DetailLayout';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { ListRow } from '@/components/ListRow';
import { BlockCover } from '@/components/BlockCover';
import { TuiButton } from '@/components/TuiButton';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary, songsByArtist, albumsByArtist } from '@/store/libraryStore';
import { usePlayer } from '@/store/playerStore';
import { useUi } from '@/store/uiStore';
import { fmt } from '@/lib/format';
import { shuffled } from '@/lib/shuffle';

export default function ArtistDetail() {
  const t = useTheme();
  const router = useRouter();
  const { name: raw } = useLocalSearchParams<{ name: string }>();
  const name = decodeURIComponent(raw ?? '');
  useLibrary((s) => s.songs);
  const openRowMenu = useUi((s) => s.openRowMenu);
  const nowId = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));

  const songs = songsByArtist(name);
  const albums = albumsByArtist(name);
  const ids = songs.map((s) => s.id);
  const top = songs.slice(0, 6);

  return (
    <DetailLayout>
      <Breadcrumb
        parts={[
          { label: 'library', onPress: () => router.push('/library') },
          { label: 'artists' },
          { label: name },
        ]}
      />
      <TuiText color="ink" d={4} weight="semibold">{name}</TuiText>
      <TuiText color="inkSoft" d={-1}>{albums.length} albums · {songs.length} songs</TuiText>

      <View style={styles.actions}>
        <TuiButton label="▶ play all" variant="primary" onPress={() => usePlayer.getState().playContext(ids)} />
        <TuiButton label="⇋ shuffle" onPress={() => usePlayer.getState().playContext(shuffled(ids))} />
      </View>

      {albums.length > 0 && (
        <>
          <SectionHead label="albums" />
          <View style={styles.grid}>
            {albums.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => router.push(`/album/${a.id}`)}
                style={[styles.card, { borderColor: t.colors.hairline }]}
              >
                <BlockCover seed={a.seed} size={7} cell={9} label={a.title} />
                <TuiText color="ink" d={-1} weight="medium" numberOfLines={1}>{a.title}</TuiText>
                <TuiText color="inkSoft" d={-2}>{a.year}</TuiText>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {top.length > 0 && (
        <>
          <SectionHead label="top tracks" />
          {top.map((s, i) => (
            <ListRow
              key={s.id}
              idx={i + 1}
              left={s.title}
              sub={s.albumId ? undefined : 'single'}
              right={s.dur ? fmt(s.dur) : '—'}
              tabularRight
              active={s.id === nowId}
              onPress={() => usePlayer.getState().playContext(ids, s.id)}
              onMenu={() => openRowMenu({ songId: s.id, x: 0, y: 0 })}
            />
          ))}
        </>
      )}
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: '47%', borderWidth: 1, borderRadius: 2, padding: 8, gap: 2 },
});
