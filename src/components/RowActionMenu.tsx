// Row action menu (⋮) — popover of actions for a song. Mounted once at the root.
import React from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';
import { useUi } from '@/store/uiStore';
import { usePlayer } from '@/store/playerStore';
import { useLibrary, songById, albumById } from '@/store/libraryStore';

export function RowActionMenu() {
  const t = useTheme();
  const router = useRouter();
  const menu = useUi((s) => s.rowMenu);
  const close = useUi((s) => s.closeRowMenu);
  const openDialog = useUi((s) => s.openDialog);
  useLibrary((s) => s.songs);

  const song = songById(menu?.songId ?? null);
  if (!menu || !song) return null;
  const album = albumById(song.albumId);

  const act = (fn: () => void) => () => {
    fn();
    close();
  };

  const items: { label: string; onPress: () => void; danger?: boolean }[] = [
    { label: '▶ play now', onPress: act(() => { usePlayer.getState().playSong(song.id); router.push('/now'); }) },
    { label: '+ add to queue', onPress: act(() => usePlayer.getState().enqueue(song.id)) },
    { label: '+ add to playlist', onPress: act(() => openDialog({ kind: 'addToPlaylist', songId: song.id })) },
    { label: song.liked ? '♥ unlike' : '♡ like', onPress: act(() => useLibrary.getState().toggleLike(song.id)) },
    { label: '✎ edit track', onPress: act(() => openDialog({ kind: 'editTrack', songId: song.id })) },
    { label: '♪ edit lyrics', onPress: act(() => openDialog({ kind: 'editLyrics', songId: song.id })) },
  ];
  if (album) {
    items.push({ label: '⌂ go to album', onPress: act(() => router.push(`/album/${album.id}`)) });
  }
  if (song.sourceType === 'local') {
    items.push({ label: '⤫ delete', danger: true, onPress: act(() => useLibrary.getState().removeSong(song.id)) });
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <Pressable style={styles.scrim} onPress={close}>
        <Pressable
          style={[styles.card, { backgroundColor: t.colors.bgElev, borderColor: t.colors.inkSoft }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: t.colors.hairline }]}>
            <TuiText color="inkFaint" d={-1} numberOfLines={1}>┌ {song.title}</TuiText>
          </View>
          {items.map((it) => (
            <Pressable
              key={it.label}
              onPress={it.onPress}
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: t.colors.selection }]}
            >
              <TuiText color={it.danger ? 'accent' : 'ink'} style={it.danger ? { color: '#8a3a10' } : undefined}>
                {it.label}
              </TuiText>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  card: { minWidth: 200, borderWidth: 1, borderRadius: 2, paddingVertical: 4 },
  header: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderStyle: 'dashed' },
  item: { paddingHorizontal: 12, paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
});
