// Local audio import: pick files (any device) or scan the media library (Android/iOS).
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLibrary } from '@/store/libraryStore';
import * as repo from '@/data/repo';
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

export type ScanResult = { added: number; total: number; denied?: boolean };

// Scan the on-device media library for ALL audio (native only), paginating through
// every asset. Skips files already in the library, so it's safe to re-run.
export async function scanDeviceMusic(max = 2000): Promise<ScanResult> {
  if (Platform.OS === 'web') return { added: 0, total: 0 };
  const MediaLibrary = require('expo-media-library');
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return { added: 0, total: 0, denied: true };

  const lib = useLibrary.getState();
  const existing = new Set(lib.songs.map((s) => s.uri));
  const ids: string[] = [];
  let track = lib.songs.length + 1;
  let after: string | undefined;
  let scanned = 0;

  // page through the whole audio library
  while (scanned < max) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 100,
      after,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });
    for (const asset of page.assets) {
      scanned += 1;
      if (existing.has(asset.uri)) continue;
      existing.add(asset.uri);
      const { title, artist } = parseName(asset.filename ?? asset.uri);
      // insert straight to the DB; we refresh the store once at the end (fast for big libraries)
      const id = await repo.addSong({
        title,
        artist,
        albumId: null,
        dur: Math.round(asset.duration || 0),
        track: track++,
        uri: asset.uri,
        sourceType: 'local',
        banner: null,
      });
      ids.push(id);
    }
    if (!page.hasNextPage) break;
    after = page.endCursor;
  }
  await lib.refresh();
  return { added: ids.length, total: useLibrary.getState().songs.length };
}

// Back-compat alias.
export async function importFromMediaLibrary(): Promise<string[]> {
  await scanDeviceMusic();
  return [];
}
