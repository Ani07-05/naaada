// Playlist detail: header + actions + tracks (remove per row) + add-song picker.
import React, { useState } from 'react';
import { View, Pressable, Modal, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailLayout } from '@/components/DetailLayout';
import { TuiScreen } from '@/components/TuiScreen';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { ListRow } from '@/components/ListRow';
import { BlockCover } from '@/components/BlockCover';
import { TuiButton } from '@/components/TuiButton';
import { TuiChip } from '@/components/TuiChip';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary, songsInPlaylist } from '@/store/libraryStore';
import { usePlayer } from '@/store/playerStore';
import { useUi } from '@/store/uiStore';
import { fmt, fmtLong } from '@/lib/format';
import { shuffled } from '@/lib/shuffle';

export default function PlaylistDetail() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lib = useLibrary();
  const openDialog = useUi((s) => s.openDialog);
  const nowId = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));
  const [picker, setPicker] = useState(false);

  const playlist = lib.playlists.find((p) => p.id === id);
  if (!playlist) {
    return (
      <DetailLayout>
        <Breadcrumb parts={[{ label: 'library' }, { label: 'playlists' }]} />
        <TuiText color="inkSoft">playlist not found</TuiText>
      </DetailLayout>
    );
  }

  const tracks = songsInPlaylist(playlist.id);
  const ids = tracks.map((s) => s.id);
  const total = tracks.reduce((n, s) => n + (s.dur || 0), 0);
  const inPlaylist = new Set(ids);

  return (
    <DetailLayout>
      <Breadcrumb
        parts={[
          { label: 'library', onPress: () => router.push('/library') },
          { label: 'playlists' },
          { label: playlist.name },
        ]}
      />

      <View style={[styles.header, { borderBottomColor: t.colors.hairline }]}>
        <BlockCover seed={playlist.seed} size={8} cell={10} label={playlist.name} />
        <View style={styles.headMeta}>
          <TuiText color="ink" d={3} weight="semibold">{playlist.name}</TuiText>
          <TuiText color="accent" d={-1}>playlist</TuiText>
          {playlist.desc ? <TuiText color="inkSoft" italic d={-2}>“{playlist.desc}”</TuiText> : null}
          <TuiText color="inkSoft" d={-1}>{tracks.length} songs · {fmtLong(total)}</TuiText>
        </View>
      </View>

      <View style={styles.actions}>
        <TuiButton label="▶ play" variant="primary" onPress={() => ids.length && usePlayer.getState().playContext(ids)} />
        <TuiButton label="⇋ shuffle" onPress={() => ids.length && usePlayer.getState().playContext(shuffled(ids))} />
        <TuiButton label="✎ edit" onPress={() => openDialog({ kind: 'editPlaylist', playlistId: playlist.id })} />
      </View>

      <SectionHead label="tracks" right={<TuiChip label="+ add song" onPress={() => setPicker(true)} />} />
      {tracks.length === 0 ? (
        <TuiText color="inkFaint" style={{ paddingVertical: 12 }}>no songs yet — tap “+ add song”.</TuiText>
      ) : (
        tracks.map((s, i) => (
          <ListRow
            key={s.id}
            idx={i + 1}
            left={s.title}
            sub={s.artist}
            right="×"
            active={s.id === nowId}
            onPress={() => usePlayer.getState().playContext(ids, s.id)}
            onMenu={() => lib.removeFromPlaylist(playlist.id, s.id)}
          />
        ))
      )}

      <Modal transparent visible={picker} animationType="fade" onRequestClose={() => setPicker(false)}>
        <Pressable style={styles.scrim} onPress={() => setPicker(false)}>
          <Pressable style={[styles.pickerCard, { backgroundColor: t.colors.bg, borderColor: t.colors.ink }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.pickerHead, { backgroundColor: t.colors.bgElev, borderBottomColor: t.colors.hairline }]}>
              <TuiText color="ink" weight="medium">┌── add to {playlist.name} ──</TuiText>
              <Pressable onPress={() => setPicker(false)} hitSlop={10}><TuiText color="inkSoft">[×]</TuiText></Pressable>
            </View>
            <TuiScreen bottomInset={10}>
              {lib.songs.map((s) => (
                <ListRow
                  key={s.id}
                  glyph={inPlaylist.has(s.id) ? '✓' : '+'}
                  left={s.title}
                  sub={s.artist}
                  onPress={() => !inPlaylist.has(s.id) && lib.addToPlaylist(playlist.id, s.id)}
                />
              ))}
            </TuiScreen>
          </Pressable>
        </Pressable>
      </Modal>
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 14, paddingBottom: 12, borderBottomWidth: 1, borderStyle: 'dashed', marginTop: 4 },
  headMeta: { flex: 1, minWidth: 0, gap: 3, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  pickerCard: { width: '100%', maxWidth: 380, height: '70%', borderWidth: 1 },
  pickerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderStyle: 'dashed' },
});
