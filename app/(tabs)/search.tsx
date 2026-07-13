// Search: Unicode/Devanagari-aware, filter chips, grouped results.
import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TuiScreen } from '@/components/TuiScreen';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { ListRow } from '@/components/ListRow';
import { TuiChip } from '@/components/TuiChip';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary } from '@/store/libraryStore';
import { usePlayer } from '@/store/playerStore';
import { fmt } from '@/lib/format';

type Filter = 'all' | 'songs' | 'albums' | 'artists' | 'playlists';
const FILTERS: Filter[] = ['all', 'songs', 'albums', 'artists', 'playlists'];

export default function SearchScreen() {
  const t = useTheme();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const { songs, albums, artists, playlists } = useLibrary();

  const query = q.trim().toLowerCase();
  const has = (s: string) => s.toLowerCase().includes(query);

  const res = useMemo(() => {
    if (!query) return { songs: [], albums: [], artists: [], playlists: [] };
    return {
      songs: songs.filter((s) => has(s.title) || has(s.artist)),
      albums: albums.filter((a) => has(a.title) || has(a.artist)),
      artists: artists.filter((a) => has(a.name)),
      playlists: playlists.filter((p) => has(p.name) || has(p.desc)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, songs, albums, artists, playlists]);

  const show = (f: Filter) => filter === 'all' || filter === f;
  const total =
    (show('songs') ? res.songs.length : 0) +
    (show('albums') ? res.albums.length : 0) +
    (show('artists') ? res.artists.length : 0) +
    (show('playlists') ? res.playlists.length : 0);

  return (
    <TuiScreen bottomInset={140}>
      <Breadcrumb parts={[{ label: 'search' }]} />

      <View style={[styles.inputRow, { borderColor: t.colors.ink, backgroundColor: t.colors.bgElev }]}>
        <TuiText color="accent">$ </TuiText>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="type to search…"
          placeholderTextColor={t.colors.inkFaint}
          autoCorrect={false}
          style={{ flex: 1, color: t.colors.ink, fontFamily: t.family('regular', false), fontSize: t.size(0), padding: 0 }}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TuiChip key={f} label={f} active={filter === f} bracket onPress={() => setFilter(f)} />
        ))}
      </View>

      {!query ? (
        <View style={styles.panel}>
          <TuiText color="inkFaint">┌─ searchable ─────────┐</TuiText>
          <TuiText color="inkSoft">  songs · albums</TuiText>
          <TuiText color="inkSoft">  artists · playlists</TuiText>
          <TuiText color="inkFaint">└──────────────────────┘</TuiText>
          <TuiText color="inkFaint" d={-1} style={{ marginTop: 10 }}>
            try: "ferry", "juno", "रात"
          </TuiText>
        </View>
      ) : total === 0 ? (
        <View style={styles.panel}>
          <TuiText color="inkSoft">
            no results for <TuiText color="accent">"{q}"</TuiText>
          </TuiText>
        </View>
      ) : (
        <>
          {show('songs') && res.songs.length > 0 && (
            <>
              <SectionHead label={`songs (${res.songs.length})`} />
              {res.songs.map((s) => (
                <ListRow
                  key={s.id}
                  glyph="♪"
                  left={s.title}
                  sub={s.artist}
                  right={s.dur ? fmt(s.dur) : '—'}
                  tabularRight
                  onPress={() => usePlayer.getState().playSong(s.id)}
                />
              ))}
            </>
          )}
          {show('albums') && res.albums.length > 0 && (
            <>
              <SectionHead label={`albums (${res.albums.length})`} />
              {res.albums.map((a) => (
                <ListRow
                  key={a.id}
                  glyph="■"
                  left={a.title}
                  sub={`${a.artist} · ${a.year}`}
                  right="→"
                  onPress={() => router.push(`/album/${a.id}`)}
                />
              ))}
            </>
          )}
          {show('artists') && res.artists.length > 0 && (
            <>
              <SectionHead label={`artists (${res.artists.length})`} />
              {res.artists.map((a) => (
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
          )}
          {show('playlists') && res.playlists.length > 0 && (
            <>
              <SectionHead label={`playlists (${res.playlists.length})`} />
              {res.playlists.map((p) => (
                <ListRow
                  key={p.id}
                  glyph="▸"
                  left={p.name}
                  sub={p.desc || undefined}
                  right="→"
                  onPress={() => router.push(`/playlist/${p.id}`)}
                />
              ))}
            </>
          )}
        </>
      )}
    </TuiScreen>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    minHeight: 44,
    marginBottom: 10,
  },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  panel: { alignItems: 'center', paddingVertical: 40, gap: 2 },
});
