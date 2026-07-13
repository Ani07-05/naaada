// Renders the active dialog based on uiStore.dialog. Mounted once at the root.
import React from 'react';
import { useUi } from '@/store/uiStore';
import { PlaylistDialog } from './PlaylistDialog';
import { AddToPlaylistDialog } from './AddToPlaylistDialog';
import { EditTrackDialog } from './EditTrackDialog';
import { AddTrackDialog } from './AddTrackDialog';
import { LyricsEditorDialog } from './LyricsEditorDialog';

export function DialogHost() {
  const dialog = useUi((s) => s.dialog);
  if (!dialog) return null;
  switch (dialog.kind) {
    case 'create':
      return <PlaylistDialog />;
    case 'editPlaylist':
      return <PlaylistDialog playlistId={dialog.playlistId} />;
    case 'addToPlaylist':
      return <AddToPlaylistDialog songId={dialog.songId} />;
    case 'editTrack':
      return <EditTrackDialog songId={dialog.songId} />;
    case 'addSong':
      return <AddTrackDialog />;
    case 'editLyrics':
      return <LyricsEditorDialog songId={dialog.songId} />;
    default:
      return null;
  }
}
