// Domain types for the library. Mirrors the design fixtures + adds playback fields.

export type SourceType = 'seed' | 'local';

export type Song = {
  id: string;
  title: string;
  albumId: string | null;
  artist: string;
  dur: number; // seconds
  track: number;
  uri: string | null; // local file path / content uri — null for demo-only seed rows
  sourceType: SourceType;
  banner: string | null; // custom ASCII banner
  liked: boolean;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  tracks: number;
  seed: string;
  palette: string;
};

export type Artist = {
  id: string;
  name: string;
  albums: number;
  songs: number;
};

export type Playlist = {
  id: string;
  name: string;
  seed: string;
  desc: string;
};

export type PlaylistEntry = {
  playlistId: string;
  songId: string;
  position: number;
};

export type LyricLine = {
  t: number; // seconds
  line: string;
};
