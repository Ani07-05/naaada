// In-memory reactive mirror of the SQLite library (single source of truth for UI).
import { create } from 'zustand';
import { Album, Artist, Playlist, PlaylistEntry, Song, LyricLine } from '@/data/types';
import * as repo from '@/data/repo';
import { initDb } from '@/data/db';

type LibraryState = {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  entries: PlaylistEntry[];
  lyricIds: string[];
  loaded: boolean;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleLike: (songId: string) => Promise<void>;
  importSong: (s: Omit<Song, 'id' | 'liked'>) => Promise<string>;
  removeSong: (id: string) => Promise<void>;
  editSong: (id: string, patch: Partial<Song>) => Promise<void>;
  addSong: (s: Omit<Song, 'id' | 'liked'>) => Promise<string>;
  saveLyrics: (songId: string, lines: LyricLine[]) => Promise<void>;
  createPlaylist: (name: string, desc: string) => Promise<string>;
  editPlaylist: (id: string, patch: { name?: string; desc?: string }) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
};

export const useLibrary = create<LibraryState>((set, get) => ({
  songs: [],
  albums: [],
  artists: [],
  playlists: [],
  entries: [],
  lyricIds: [],
  loaded: false,

  init: async () => {
    await initDb();
    await get().refresh();
    set({ loaded: true });
  },

  refresh: async () => {
    const data = await repo.loadAll();
    set(data);
  },

  toggleLike: async (songId) => {
    const cur = get().songs.find((s) => s.id === songId);
    if (!cur) return;
    const liked = !cur.liked;
    set({ songs: get().songs.map((s) => (s.id === songId ? { ...s, liked } : s)) });
    await repo.setLiked(songId, liked);
  },

  importSong: async (s) => {
    const id = await repo.addSong(s);
    await get().refresh();
    return id;
  },

  removeSong: async (id) => {
    await repo.deleteSong(id);
    await get().refresh();
  },

  editSong: async (id, patch) => {
    await repo.updateSong(id, patch);
    await get().refresh();
  },

  addSong: async (s) => {
    const id = await repo.addSong(s);
    await get().refresh();
    return id;
  },

  saveLyrics: async (songId, lines) => {
    await repo.setLyrics(songId, lines);
    // lyrics live in their own table; refresh not required for song rows,
    // but bump the store so lyrics-derived views recompute.
    await get().refresh();
  },

  createPlaylist: async (name, desc) => {
    const id = await repo.createPlaylist(name, desc);
    await get().refresh();
    return id;
  },

  editPlaylist: async (id, patch) => {
    await repo.updatePlaylist(id, patch);
    await get().refresh();
  },

  deletePlaylist: async (id) => {
    await repo.deletePlaylist(id);
    await get().refresh();
  },

  addToPlaylist: async (playlistId, songId) => {
    await repo.addToPlaylist(playlistId, songId);
    await get().refresh();
  },

  removeFromPlaylist: async (playlistId, songId) => {
    await repo.removeFromPlaylist(playlistId, songId);
    await get().refresh();
  },
}));

// ---- selector helpers (read current snapshot) ----
export function songById(id: string | null): Song | undefined {
  if (!id) return undefined;
  return useLibrary.getState().songs.find((s) => s.id === id);
}
export function albumById(id: string | null): Album | undefined {
  if (!id) return undefined;
  return useLibrary.getState().albums.find((a) => a.id === id);
}
export function songsInAlbum(albumId: string): Song[] {
  return useLibrary.getState().songs.filter((s) => s.albumId === albumId).sort((a, b) => a.track - b.track);
}
export function songsByArtist(name: string): Song[] {
  return useLibrary.getState().songs.filter((s) => s.artist === name);
}
export function albumsByArtist(name: string): Album[] {
  return useLibrary.getState().albums.filter((a) => a.artist === name);
}
export function songsInPlaylist(playlistId: string): Song[] {
  const st = useLibrary.getState();
  return st.entries
    .filter((e) => e.playlistId === playlistId)
    .sort((a, b) => a.position - b.position)
    .map((e) => st.songs.find((s) => s.id === e.songId))
    .filter((s): s is Song => !!s);
}
