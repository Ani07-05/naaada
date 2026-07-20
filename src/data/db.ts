// SQLite: schema only. Single source of truth for the library.
// The library starts empty and is populated by scanning the device / importing files.
import * as SQLite from 'expo-sqlite';

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
  track INTEGER, uri TEXT, sourceType TEXT, banner TEXT, coverUri TEXT, liked INTEGER DEFAULT 0
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
  // Migrations for DBs created before a column existed (CREATE TABLE IF NOT
  // EXISTS won't add columns to an already-present table).
  await ensureColumn(db, 'songs', 'coverUri', 'TEXT');
}

async function ensureColumn(
  db: SQLite.SQLiteDatabase,
  table: string,
  col: string,
  type: string
): Promise<void> {
  const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!cols.some((c) => c.name === col)) {
    await db.runAsync(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  }
}

// One-time cleanup: wipe any demo/seed rows left over from earlier builds so the
// library reflects only the user's real, scanned/imported audio.
export async function purgeSeedData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM songs WHERE sourceType != 'local'");
    await db.runAsync('DELETE FROM albums');
    await db.runAsync('DELETE FROM artists');
    // playlists/lyrics that referenced demo songs are harmless once songs are gone,
    // but clear demo-only playlist entries whose song no longer exists.
    await db.runAsync('DELETE FROM playlist_entries WHERE songId NOT IN (SELECT id FROM songs)');
    await db.runAsync('DELETE FROM lyrics WHERE songId NOT IN (SELECT id FROM songs)');
  });
}
