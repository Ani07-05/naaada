// Transient UI state: dialogs, row-action menu, library subtab + sort.
import { create } from 'zustand';

export type Dialog =
  | { kind: 'create' }
  | { kind: 'editPlaylist'; playlistId: string }
  | { kind: 'addToPlaylist'; songId: string }
  | { kind: 'editTrack'; songId: string }
  | { kind: 'editLyrics'; songId: string }
  | { kind: 'addSong' }
  | null;

export type RowMenu = { songId: string; x: number; y: number } | null;

export type LibrarySubtab = 'songs' | 'albums' | 'artists' | 'playlists';
export type SortMode = 'title' | 'artist' | 'duration';

type UiState = {
  dialog: Dialog;
  rowMenu: RowMenu;
  subtab: LibrarySubtab;
  sort: SortMode;

  openDialog: (d: NonNullable<Dialog>) => void;
  closeDialog: () => void;
  openRowMenu: (m: NonNullable<RowMenu>) => void;
  closeRowMenu: () => void;
  setSubtab: (t: LibrarySubtab) => void;
  cycleSort: () => void;
};

export const useUi = create<UiState>((set) => ({
  dialog: null,
  rowMenu: null,
  subtab: 'songs',
  sort: 'title',

  openDialog: (dialog) => set({ dialog, rowMenu: null }),
  closeDialog: () => set({ dialog: null }),
  openRowMenu: (rowMenu) => set({ rowMenu }),
  closeRowMenu: () => set({ rowMenu: null }),
  setSubtab: (subtab) => set({ subtab }),
  cycleSort: () =>
    set((s) => ({ sort: s.sort === 'title' ? 'artist' : s.sort === 'artist' ? 'duration' : 'title' })),
}));
