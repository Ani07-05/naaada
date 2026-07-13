// Library: songs / albums / artists / playlists subtabs.
import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TuiScreen } from '@/components/TuiScreen';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { ListRow } from '@/components/ListRow';
import { TuiChip } from '@/components/TuiChip';
import { TuiButton } from '@/components/TuiButton';
import { BlockCover } from '@/components/BlockCover';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary, songsInPlaylist } from '@/store/libraryStore';
import { usePlayer } from '@/store/playerStore';
import { useUi, LibrarySubtab } from '@/store/uiStore';
import { fmt } from '@/lib/format';
import { importFromFiles } from '@/import/importAudio';
import { Album, Playlist } from '@/data/types';

const SUBTABS: LibrarySubtab[] = ['songs', 'albums', 'artists', 'playlists'];

export default function LibraryScreen() {
  const subtab = useUi((s) => s.subtab);
  const setSubtab = useUi((s) => s.setSubtab);

  return (
    <TuiScreen bottomInset={140}>
      <Breadcrumb parts={[{ label: 'library' }, { label: subtab }]} />
      <View style={styles.subtabs}>
        {SUBTABS.map((s) => (
          <TuiChip key={s} label={s} active={subtab === s} bracket onPress={() => setSubtab(s)} />
        ))}
      </View>
      {subtab === 'songs' && <Songs />}
      {subtab === 'albums' && <Albums />}
      {subtab === 'artists' && <Artists />}
      {subtab === 'playlists' && <Playlists />}
    </TuiScreen>
  );
}

function Songs() {
  const songs = useLibrary((s) => s.songs);
  const sort = useUi((s) => s.sort);
  const cycleSort = useUi((s) => s.cycleSort);
  const openRowMenu = useUi((s) => s.openRowMenu);
  const nowId = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));

  const sorted = useMemo(() => {
    const arr = [...songs];
    if (sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') arr.sort((a, b) => a.artist.localeCompare(b.artist));
    else arr.sort((a, b) => a.dur - b.dur);
    return arr;
  }, [songs, sort]);

  const play = (id: string) => usePlayer.getState().playSong(id);

  return (
    <>
      <SectionHead
        label={`${songs.length} songs`}
        right={<TuiChip label={`sort: ${sort} ↕`} onPress={cycleSort} />}
      />
      {sorted.map((s, i) => (
        <ListRow
          key={s.id}
          idx={i + 1}
          left={s.title}
          sub={`${s.artist}${s.sourceType === 'local' ? '' : ' · demo'}`}
          right={s.dur ? fmt(s.dur) : '—'}
          tabularRight
          active={s.id === nowId}
          onPress={() => play(s.id)}
          onMenu={() => openRowMenu({ songId: s.id, x: 0, y: 0 })}
        />
      ))}
      <View style={{ marginTop: 14, alignItems: 'center' }}>
        <TuiButton label="[+] add track" onPress={() => importFromFiles()} />
      </View>
    </>
  );
}

function Albums() {
  const albums = useLibrary((s) => s.albums);
  return (
    <>
      <SectionHead label={`${albums.length} albums`} />
      <View style={styles.grid}>
        {albums.map((a) => (
          <AlbumCard key={a.id} album={a} />
        ))}
      </View>
    </>
  );
}

function AlbumCard({ album }: { album: Album }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/album/${album.id}`)} style={[styles.card, { borderColor: t.colors.hairline }]}>
      <BlockCover seed={album.seed} size={7} cell={9} label={album.title} />
      <TuiText color="ink" d={-1} weight="medium" numberOfLines={1}>{album.title}</TuiText>
      <TuiText color="inkSoft" d={-2} numberOfLines={1}>{album.artist} · {album.year}</TuiText>
    </Pressable>
  );
}

function Artists() {
  const router = useRouter();
  const artists = useLibrary((s) => s.artists);
  return (
    <>
      <SectionHead label={`${artists.length} artists`} />
      {artists.map((a) => (
        <ListRow
          key={a.id}
          glyph="◆"
          left={a.name}
          sub={`${a.albums} albums · ${a.songs} songs`}
          right="→"
          onPress={() => router.push(`/artist/${encodeURIComponent(a.name)}`)}
        />
      ))}
    </>
  );
}

function Playlists() {
  const playlists = useLibrary((s) => s.playlists);
  return (
    <>
      <SectionHead label={`${playlists.length} playlists`} />
      {playlists.map((p) => (
        <PlaylistCard key={p.id} playlist={p} />
      ))}
    </>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const t = useTheme();
  const router = useRouter();
  const songs = songsInPlaylist(playlist.id);
  const total = songs.reduce((n, s) => n + (s.dur || 0), 0);
  return (
    <Pressable
      onPress={() => router.push(`/playlist/${playlist.id}`)}
      style={({ pressed }) => [
        styles.plCard,
        { borderColor: t.colors.hairline, backgroundColor: pressed ? t.colors.selection : 'transparent' },
      ]}
    >
      <BlockCover seed={playlist.seed} size={5} cell={8} label={playlist.name} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <TuiText color="ink" weight="medium" numberOfLines={1}>▸ {playlist.name}</TuiText>
        {playlist.desc ? <TuiText color="inkSoft" italic d={-2} numberOfLines={1}>“{playlist.desc}”</TuiText> : null}
        <TuiText color="inkFaint" d={-2}>{songs.length} songs · {fmt(total)}</TuiText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subtabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: '47%', borderWidth: 1, borderRadius: 2, padding: 8, gap: 2 },
  plCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 2,
    padding: 10,
    marginBottom: 8,
  },
});
