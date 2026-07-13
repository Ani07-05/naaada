// Add-to-playlist dialog: pick a playlist to add the song to.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { TuiDialog } from '@/components/TuiDialog';
import { TuiText } from '@/components/TuiText';
import { TuiButton } from '@/components/TuiButton';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary, songById, songsInPlaylist } from '@/store/libraryStore';
import { useUi } from '@/store/uiStore';

export function AddToPlaylistDialog({ songId }: { songId: string }) {
  const t = useTheme();
  const close = useUi((s) => s.closeDialog);
  const lib = useLibrary();
  const song = songById(songId);

  return (
    <TuiDialog
      title="add to playlist"
      onClose={close}
      footer={
        <>
          <TuiButton label="[+] new playlist" onPress={() => useUi.getState().openDialog({ kind: 'create' })} />
          <TuiButton label="done" variant="primary" onPress={close} />
        </>
      }
    >
      <TuiText color="inkSoft" d={-1} numberOfLines={1}>adding: {song?.title ?? ''}</TuiText>
      {lib.playlists.map((p) => {
        const inIt = songsInPlaylist(p.id).some((s) => s.id === songId);
        return (
          <Pressable
            key={p.id}
            onPress={() => (inIt ? lib.removeFromPlaylist(p.id, songId) : lib.addToPlaylist(p.id, songId))}
            style={({ pressed }) => [styles.row, { backgroundColor: pressed ? t.colors.selection : 'transparent' }]}
          >
            <TuiText color={inIt ? 'accent' : 'inkSoft'}>{inIt ? '[✓]' : '[+]'}</TuiText>
            <View style={{ flex: 1 }}>
              <TuiText color="ink" numberOfLines={1}>▸ {p.name}</TuiText>
            </View>
          </Pressable>
        );
      })}
    </TuiDialog>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingVertical: 6, paddingHorizontal: 4 },
});
