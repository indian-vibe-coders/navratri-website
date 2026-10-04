// Schema setup, built-in Garba sync and the song library import.
// Runs automatically when the API starts (see app.ts) and from the migrate.cjs CLI.
import { createReadStream, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';
import type { RowDataPacket } from 'mysql2';
import { GARBAS_DATA } from '../../src/data/garbas.ts';
import type { Garba } from '../../src/types/index.ts';
import { pool, SCHEMA, SCHEMA_COLUMNS, SCHEMA_INDEXES } from './db.ts';
import { buildSearchText } from './searchText.ts';

export const LIBRARY_FILE = 'library.ndjson.gz';

/** A song as stored: lyrics may hold only `sections` (arrays are derived on read). */
export type SongRow = Omit<Garba, 'lyrics'> & {
  lyrics: Partial<Garba['lyrics']> & Pick<Garba['lyrics'], 'sections'>;
  sortOrder?: number;
};

const COLUMNS = [
  'id', 'title', 'category', 'deity', 'is_featured', 'is_popular', 'is_builtin', 'tags', 'description',
  'artwork_url', 'lyrics_source', 'audio_reference', 'lyrics', 'collection', 'subcollection', 'sort_order', 'search_text',
];

function toValues(g: SongRow, isBuiltin: boolean) {
  return [
    g.id,
    JSON.stringify(g.title),
    g.category,
    g.deity || null,
    g.isFeatured ? 1 : 0,
    g.isPopular ? 1 : 0,
    isBuiltin ? 1 : 0,
    JSON.stringify(g.tags || []),
    JSON.stringify(g.description),
    g.artworkUrl || null,
    g.lyricsSource ? JSON.stringify(g.lyricsSource) : null,
    g.audioReference ? JSON.stringify(g.audioReference) : null,
    JSON.stringify(g.lyrics),
    g.collection ?? null,
    g.subcollection ?? null,
    g.sortOrder ?? 0,
    buildSearchText(g),
  ];
}

/** Inserts or updates songs in one statement (callers keep batches to a few MB). */
export async function upsertSongs(songs: SongRow[], isBuiltin: boolean) {
  if (songs.length === 0) return;
  const placeholders = songs.map(() => `(${COLUMNS.map(() => '?').join(', ')})`).join(', ');
  const updates = COLUMNS.filter((c) => c !== 'id').map((c) => `${c} = VALUES(${c})`).join(', ');
  await pool.query(
    `INSERT INTO garbas (${COLUMNS.join(', ')}) VALUES ${placeholders} ON DUPLICATE KEY UPDATE ${updates}`,
    songs.flatMap((s) => toValues(s, isBuiltin)),
  );
}

// CREATE TABLE IF NOT EXISTS doesn't add columns to an existing table, so add any that are missing
async function addMissingColumnsAndIndexes() {
  const [cols] = await pool.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'garbas'`,
  );
  const existing = new Set(cols.map((c) => c.name as string));
  for (const [name, definition] of Object.entries(SCHEMA_COLUMNS)) {
    if (!existing.has(name)) await pool.query(`ALTER TABLE garbas ADD COLUMN ${name} ${definition}`);
  }

  const [idx] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT INDEX_NAME AS name FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'garbas'`,
  );
  const existingIdx = new Set(idx.map((i) => i.name as string));
  for (const [name, definition] of Object.entries(SCHEMA_INDEXES)) {
    if (!existingIdx.has(name)) await pool.query(`ALTER TABLE garbas ADD INDEX ${name} ${definition}`);
  }
}

/** Creates missing tables/columns and refreshes built-in Garbas from src/data/garbas.ts. Safe to run repeatedly. */
export async function runMigrations() {
  for (const statement of SCHEMA) await pool.query(statement);
  await addMissingColumnsAndIndexes();
  // Older user submissions predate the collection column; they belong with the garbas
  await pool.query(`UPDATE garbas SET collection = 'navratri', subcollection = 'community' WHERE collection IS NULL AND is_builtin = 0`);
  await upsertSongs(
    GARBAS_DATA.map((g, i) => ({ ...g, collection: 'navratri', subcollection: 'navswar-featured', sortOrder: i })),
    true,
  );
  console.log(`Migrations done (${GARBAS_DATA.length} built-in Garbas synced)`);
}

/** Streams a library.ndjson.gz file (built by scripts/buildLibrary.ts) into the database. */
export async function importLibrary(file: string): Promise<number> {
  const lines = createInterface({ input: createReadStream(file).pipe(createGunzip()), crlfDelay: Infinity });
  const MAX_BATCH_BYTES = 2 * 1024 * 1024;
  let batch: SongRow[] = [];
  let batchBytes = 0;
  let total = 0;

  for await (const line of lines) {
    if (!line.trim()) continue;
    batch.push(JSON.parse(line) as SongRow);
    batchBytes += line.length;
    if (batchBytes >= MAX_BATCH_BYTES || batch.length >= 200) {
      await upsertSongs(batch, false);
      total += batch.length;
      batch = [];
      batchBytes = 0;
    }
  }
  await upsertSongs(batch, false);
  total += batch.length;
  return total;
}

/**
 * Imports a library file uploaded to <app folder>/migration-data/, then renames it so it runs
 * only once. Lets data imports happen without shell access (FTP-only hosting).
 */
export async function importPendingData(dir = path.resolve('migration-data')): Promise<boolean> {
  const file = path.join(dir, LIBRARY_FILE);
  if (!existsSync(file)) return false;
  console.log(`Found ${file}, importing song library...`);
  const started = Date.now();
  const count = await importLibrary(file);
  renameSync(file, `${file}.imported-${Date.now()}`);
  console.log(`Imported ${count} songs in ${Math.round((Date.now() - started) / 1000)}s`);
  return true;
}
