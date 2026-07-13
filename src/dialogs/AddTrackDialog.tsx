// Add track (manual metadata entry). For real audio, use library → [+] add track (file picker).
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TuiDialog } from '@/components/TuiDialog';
import { TuiInput } from '@/components/TuiInput';
import { TuiButton } from '@/components/TuiButton';
import { TuiChip } from '@/components/TuiChip';
import { TuiText } from '@/components/TuiText';
import { useLibrary } from '@/store/libraryStore';
import { useUi } from '@/store/uiStore';
import { importFromFiles } from '@/import/importAudio';

export function AddTrackDialog() {
  const close = useUi((s) => s.closeDialog);
  const lib = useLibrary();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [mm, setMm] = useState('');
  const [ss, setSs] = useState('');

  const save = async () => {
    const t = title.trim();
    if (!t) return close();
    const dur = (parseInt(mm || '0', 10) || 0) * 60 + (parseInt(ss || '0', 10) || 0);
    await lib.addSong({
      title: t,
      artist: artist.trim() || 'unknown artist',
      albumId,
      dur,
      track: lib.songs.length + 1,
      uri: null,
      sourceType: 'local',
      banner: null,
    });
    close();
  };

  return (
    <TuiDialog
      title="add track"
      onClose={close}
      footer={
        <>
          <TuiButton label="cancel" onPress={close} />
          <TuiButton label="add" variant="primary" onPress={save} />
        </>
      }
    >
      <TuiButton label="⇪ import audio file instead" variant="accent" onPress={() => { close(); importFromFiles(); }} />
      <TuiInput label="title" value={title} onChangeText={setTitle} placeholder="e.g. धुँध / Blueprint / …" />
      <TuiInput label="artist" value={artist} onChangeText={setArtist} />
      <TuiText color="inkSoft" d={-1}>album</TuiText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <TuiChip label="none" active={albumId === null} onPress={() => setAlbumId(null)} />
        {lib.albums.map((a) => (
          <TuiChip key={a.id} label={a.title} active={albumId === a.id} onPress={() => setAlbumId(a.id)} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <View style={{ width: 70 }}>
          <TuiInput label="min" value={mm} onChangeText={setMm} keyboardType="number-pad" placeholder="3" />
        </View>
        <TuiText color="inkSoft" style={{ paddingBottom: 10 }}>:</TuiText>
        <View style={{ width: 70 }}>
          <TuiInput label="sec" value={ss} onChangeText={setSs} keyboardType="number-pad" placeholder="34" />
        </View>
      </View>
    </TuiDialog>
  );
}
