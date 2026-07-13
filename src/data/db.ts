// SQLite: schema + first-run seed. Single source of truth for the library.
import * as SQLite from 'expo-sqlite';
import {
  SEED_ALBUMS, SEED_ARTISTS, SEED_SONGS, SEED_PLAYLISTS, SEED_PLAYLIST_ENTRIES, SEED_LYRICS,
} from './seed';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('terminal.db');
  return dbPromise;
}

const SCHEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY, title TEXT, artist TEXT, year INTEGER,
  tracks INTEGER, seed TEXT, palette TEXT
);
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY, name TEXT, albums INTEGER, songs INTEGER
);
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY, title TEXT, albumId TEXT, artist TEXT, dur INTEGER,
  track INTEGER, uri TEXT, sourceType TEXT, banner TEXT, liked INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY, name TEXT, seed TEXT, desc TEXT
);
CREATE TABLE IF NOT EXISTS playlist_entries (
  playlistId TEXT, songId TEXT, position INTEGER,
  PRIMARY KEY (playlistId, songId)
);
CREATE TABLE IF NOT EXISTS lyrics (
  songId TEXT, idx INTEGER, t REAL, line TEXT,
  PRIMARY KEY (songId, idx)
);
`;

export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(SCHEMA);
  await seedIfEmpty(db);
}

async function seedIfEmpty(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM songs');
  if (row && row.c > 0) return;

  await db.withTransactionAsync(async () => {
    for (const a of SEED_ALBUMS) {
      await db.runAsync(
        'INSERT OR REPLACE INTO albums (id,title,artist,year,tracks,seed,palette) VALUES (?,?,?,?,?,?,?)',
        [a.id, a.title, a.artist, a.year, a.tracks, a.seed, a.palette]
      );
    }
    for (const ar of SEED_ARTISTS) {
      await db.runAsync('INSERT OR REPLACE INTO artists (id,name,albums,songs) VALUES (?,?,?,?)', [
        ar.id, ar.name, ar.albums, ar.songs,
      ]);
    }
    for (const s of SEED_SONGS) {
      await db.runAsync(
        'INSERT OR REPLACE INTO songs (id,title,albumId,artist,dur,track,uri,sourceType,banner,liked) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [s.id, s.title, s.albumId, s.artist, s.dur, s.track, s.uri, s.sourceType, s.banner, s.liked ? 1 : 0]
      );
    }
    for (const p of SEED_PLAYLISTS) {
      await db.runAsync('INSERT OR REPLACE INTO playlists (id,name,seed,desc) VALUES (?,?,?,?)', [
        p.id, p.name, p.seed, p.desc,
      ]);
    }
    for (const e of SEED_PLAYLIST_ENTRIES) {
      await db.runAsync(
        'INSERT OR REPLACE INTO playlist_entries (playlistId,songId,position) VALUES (?,?,?)',
        [e.playlistId, e.songId, e.position]
      );
    }
    for (const [songId, lines] of Object.entries(SEED_LYRICS)) {
      for (let idx = 0; idx < lines.length; idx++) {
        const l = lines[idx];
        await db.runAsync('INSERT OR REPLACE INTO lyrics (songId,idx,t,line) VALUES (?,?,?,?)', [
          songId, idx, l.t, l.line,
        ]);
      }
    }
  });
}
