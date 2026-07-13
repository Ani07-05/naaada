// Local audio import: pick files (any device) or scan the media library (Android/iOS).
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLibrary } from '@/store/libraryStore';
import { Song } from '@/data/types';

function titleFromName(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim() || 'untitled';
}

// Try to split "Artist - Title" filenames.
function parseName(name: string): { title: string; artist: string } {
  const base = titleFromName(name);
  const m = base.match(/^(.*?)\s*[-–]\s*(.*)$/);
  if (m && m[1] && m[2]) return { artist: m[1].trim(), title: m[2].trim() };
  return { title: base, artist: 'unknown artist' };
}

// Pick one or more audio files and add them to the library. Returns new song ids.
export async function importFromFiles(): Promise<string[]> {
  const res = await DocumentPicker.getDocumentAsync({
    type: 'audio/*',
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (res.canceled) return [];

  const lib = useLibrary.getState();
  const ids: string[] = [];
  let track = lib.songs.length + 1;
  for (const asset of res.assets) {
    const { title, artist } = parseName(asset.name ?? 'untitled');
    const song: Omit<Song, 'id' | 'liked'> = {
      title,
      artist,
      albumId: null,
      dur: 0, // filled in on first play from the real audio duration
      track: track++,
      uri: asset.uri,
      sourceType: 'local',
      banner: null,
    };
    ids.push(await lib.importSong(song));
  }
  return ids;
}

// Scan the on-device media library for audio (native only).
export async function importFromMediaLibrary(limit = 200): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  const MediaLibrary = require('expo-media-library');
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return [];

  const page = await MediaLibrary.getAssetsAsync({
    mediaType: MediaLibrary.MediaType.audio,
    first: limit,
    sortBy: [MediaLibrary.SortBy.creationTime],
  });

  const lib = useLibrary.getState();
  const existing = new Set(lib.songs.map((s) => s.uri));
  const ids: string[] = [];
  let track = lib.songs.length + 1;
  for (const asset of page.assets) {
    if (existing.has(asset.uri)) continue;
    const { title, artist } = parseName(asset.filename ?? asset.uri);
    ids.push(
      await lib.importSong({
        title,
        artist,
        albumId: null,
        dur: Math.round(asset.duration || 0),
        track: track++,
        uri: asset.uri,
        sourceType: 'local',
        banner: null,
      })
    );
  }
  return ids;
}
