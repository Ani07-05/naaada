// Edit track: title / artist / album / custom ASCII banner + lyrics shortcut + delete.
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TuiDialog } from '@/components/TuiDialog';
import { TuiInput } from '@/components/TuiInput';
import { TuiButton } from '@/components/TuiButton';
import { TuiChip } from '@/components/TuiChip';
import { TuiText } from '@/components/TuiText';
import { useLibrary, songById } from '@/store/libraryStore';
import { useUi } from '@/store/uiStore';

export function EditTrackDialog({ songId }: { songId: string }) {
  const close = useUi((s) => s.closeDialog);
  const openDialog = useUi((s) => s.openDialog);
  const lib = useLibrary();
  const song = songById(songId);
  const [title, setTitle] = useState(song?.title ?? '');
  const [artist, setArtist] = useState(song?.artist ?? '');
  const [albumId, setAlbumId] = useState<string | null>(song?.albumId ?? null);
  const [banner, setBanner] = useState(song?.banner ?? '');

  if (!song) return null;

  const save = async () => {
    await lib.editSong(songId, {
      title: title.trim() || song.title,
      artist: artist.trim() || song.artist,
      albumId,
      banner: banner.trim() ? banner : null,
    });
    close();
  };
  const del = async () => {
    await lib.removeSong(songId);
    close();
  };

  return (
    <TuiDialog
      title="edit track"
      onClose={close}
      footer={
        <>
          <TuiButton label="remove" variant="danger" onPress={del} />
          <TuiButton label="cancel" onPress={close} />
          <TuiButton label="save" variant="primary" onPress={save} />
        </>
      }
    >
      <TuiInput label="title" value={title} onChangeText={setTitle} />
      <TuiInput label="artist" value={artist} onChangeText={setArtist} />

      <TuiText color="inkSoft" d={-1}>album</TuiText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <TuiChip label="none" active={albumId === null} onPress={() => setAlbumId(null)} />
        {lib.albums.map((a) => (
          <TuiChip key={a.id} label={a.title} active={albumId === a.id} onPress={() => setAlbumId(a.id)} />
        ))}
      </ScrollView>

      <TuiInput
        label="custom ascii banner"
        value={banner}
        onChangeText={setBanner}
        multiline
        minHeight={90}
        placeholder={'╔═══════╗\n║ SIDE A║\n╚═══════╝'}
      />
      <TuiText color="inkFaint" d={-2}>supports devanagari (हिन्दी), ascii art, box-drawing chars.</TuiText>

      <View style={{ marginTop: 4 }}>
        <TuiButton
          label="♪ + add synced lyrics →"
          variant="accent"
          onPress={() => openDialog({ kind: 'editLyrics', songId })}
        />
      </View>
    </TuiDialog>
  );
}
