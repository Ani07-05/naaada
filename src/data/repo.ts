// Typed data access over SQLite. Mutations write the DB; the library store mirrors it.
import { getDb } from './db';
import { Album, Artist, Playlist, PlaylistEntry, Song, LyricLine } from './types';

type SongRow = {
  id: string; title: string; albumId: string | null; artist: string; dur: number;
  track: number; uri: string | null; sourceType: string; banner: string | null; liked: number;
};

function toSong(r: SongRow): Song {
  return {
    id: r.id, title: r.title, albumId: r.albumId, artist: r.artist, dur: r.dur,
    track: r.track, uri: r.uri, sourceType: (r.sourceType as Song['sourceType']) ?? 'seed',
    banner: r.banner, liked: !!r.liked,
  };
}

export async function loadAll(): Promise<{
  songs: Song[]; albums: Album[]; artists: Artist[]; playlists: Playlist[];
  entries: PlaylistEntry[]; lyricIds: string[];
}> {
  const db = await getDb();
  const [songs, albums, artists, playlists, entries, lyricRows] = await Promise.all([
    db.getAllAsync<SongRow>('SELECT * FROM songs ORDER BY albumId, track'),
    db.getAllAsync<Album>('SELECT * FROM albums'),
    db.getAllAsync<Artist>('SELECT * FROM artists'),
    db.getAllAsync<Playlist>('SELECT * FROM playlists'),
    db.getAllAsync<PlaylistEntry>('SELECT * FROM playlist_entries ORDER BY playlistId, position'),
    db.getAllAsync<{ songId: string }>('SELECT DISTINCT songId FROM lyrics'),
  ]);
  return {
    songs: songs.map(toSong), albums, artists, playlists, entries,
    lyricIds: lyricRows.map((r) => r.songId),
  };
}

export async function getLyrics(songId: string): Promise<LyricLine[] | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ t: number; line: string }>(
    'SELECT t, line FROM lyrics WHERE songId = ? ORDER BY idx',
    [songId]
  );
  return rows.length ? rows.map((r) => ({ t: r.t, line: r.line })) : null;
}

export async function setLyrics(songId: string, lines: LyricLine[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM lyrics WHERE songId = ?', [songId]);
    for (let idx = 0; idx < lines.length; idx++) {
      await db.runAsync('INSERT INTO lyrics (songId,idx,t,line) VALUES (?,?,?,?)', [
        songId, idx, lines[idx].t, lines[idx].line,
      ]);
    }
  });
}

export async function setLiked(songId: string, liked: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE songs SET liked = ? WHERE id = ?', [liked ? 1 : 0, songId]);
}

export async function updateSong(id: string, patch: Partial<Song>): Promise<void> {
  const db = await getDb();
  const cols: string[] = [];
  const vals: (string | number | null)[] = [];
  const map: Record<string, string | number | null> = {
    title: patch.title ?? null,
    artist: patch.artist ?? null,
    albumId: patch.albumId ?? null,
    banner: patch.banner ?? null,
    dur: patch.dur ?? null,
  };
  (['title', 'artist', 'albumId', 'banner', 'dur'] as const).forEach((k) => {
    if (patch[k] !== undefined) {
      cols.push(`${k} = ?`);
      vals.push(map[k]);
    }
  });
  if (!cols.length) return;
  vals.push(id);
  await db.runAsync(`UPDATE songs SET ${cols.join(', ')} WHERE id = ?`, vals);
}

export async function addSong(song: Omit<Song, 'id' | 'liked'> & { id?: string }): Promise<string> {
  const db = await getDb();
  const id = song.id ?? 'usr' + Math.random().toString(36).slice(2, 9);
  await db.runAsync(
    'INSERT INTO songs (id,title,albumId,artist,dur,track,uri,sourceType,banner,liked) VALUES (?,?,?,?,?,?,?,?,?,0)',
    [id, song.title, song.albumId, song.artist, song.dur, song.track, song.uri, song.sourceType, song.banner]
  );
  return id;
}

export async function deleteSong(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM songs WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM lyrics WHERE songId = ?', [id]);
    await db.runAsync('DELETE FROM playlist_entries WHERE songId = ?', [id]);
  });
}

// ---- playlists ----
export async function createPlaylist(name: string, desc: string): Promise<string> {
  const db = await getDb();
  const id = 'pl' + Math.random().toString(36).slice(2, 9);
  const seed = (name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PLY') + id.slice(-2);
  await db.runAsync('INSERT INTO playlists (id,name,seed,desc) VALUES (?,?,?,?)', [id, name, seed, desc]);
  return id;
}

export async function updatePlaylist(id: string, patch: { name?: string; desc?: string }): Promise<void> {
  const db = await getDb();
  const cols: string[] = [];
  const vals: (string | null)[] = [];
  if (patch.name !== undefined) { cols.push('name = ?'); vals.push(patch.name); }
  if (patch.desc !== undefined) { cols.push('desc = ?'); vals.push(patch.desc); }
  if (!cols.length) return;
  vals.push(id);
  await db.runAsync(`UPDATE playlists SET ${cols.join(', ')} WHERE id = ?`, vals);
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM playlist_entries WHERE playlistId = ?', [id]);
  });
}

export async function addToPlaylist(playlistId: string, songId: string): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM playlist_entries WHERE playlistId = ?',
    [playlistId]
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO playlist_entries (playlistId,songId,position) VALUES (?,?,?)',
    [playlistId, songId, row?.n ?? 0]
  );
}

export async function removeFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM playlist_entries WHERE playlistId = ? AND songId = ?', [
    playlistId, songId,
  ]);
}
