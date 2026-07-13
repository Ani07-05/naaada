// Create / edit playlist dialog with a live cover preview.
import React, { useState } from 'react';
import { View } from 'react-native';
import { TuiDialog } from '@/components/TuiDialog';
import { TuiInput } from '@/components/TuiInput';
import { TuiButton } from '@/components/TuiButton';
import { BlockCover } from '@/components/BlockCover';
import { TuiText } from '@/components/TuiText';
import { useLibrary } from '@/store/libraryStore';
import { useUi } from '@/store/uiStore';

export function PlaylistDialog({ playlistId }: { playlistId?: string }) {
  const close = useUi((s) => s.closeDialog);
  const lib = useLibrary();
  const existing = playlistId ? lib.playlists.find((p) => p.id === playlistId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [desc, setDesc] = useState(existing?.desc ?? '');

  const save = async () => {
    const n = name.trim();
    if (!n) return close();
    if (existing) await lib.editPlaylist(existing.id, { name: n, desc: desc.trim() });
    else await lib.createPlaylist(n, desc.trim());
    close();
  };
  const del = async () => {
    if (existing) await lib.deletePlaylist(existing.id);
    close();
  };

  return (
    <TuiDialog
      title={existing ? 'edit playlist' : 'new playlist'}
      onClose={close}
      footer={
        <>
          {existing ? <TuiButton label="[del] delete" variant="danger" onPress={del} /> : null}
          <TuiButton label="cancel" onPress={close} />
          <TuiButton label={existing ? '[↵] save' : '[↵] create'} variant="primary" onPress={save} />
        </>
      }
    >
      <View style={{ alignItems: 'center' }}>
        <BlockCover seed={existing?.seed ?? (name || 'PLY')} size={6} cell={9} label={name} />
      </View>
      <TuiInput label="name" value={name} onChangeText={setName} placeholder="e.g. Rainy Desk" />
      <TuiInput label="description (optional)" value={desc} onChangeText={setDesc} placeholder="short, lowercase" />
      <TuiText color="inkFaint" d={-2}>cover is generated from the name.</TuiText>
    </TuiDialog>
  );
}
