import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import type { LibrarySection } from '../../../src/types/index.ts';
import { GARBAS_DATA } from '../../../src/data/garbas.ts';
import { pool } from '../db.ts';
import { ValidationError } from '../validate.ts';
import { rowToGarba, rowToSummary, SUMMARY_COLUMNS } from '../rows.ts';
import { getGarbaSlug, parseIdFromSlug } from '../utils/slug.ts';

export const songsRouter = Router();

const MAX_PAGE_SIZE = 1000; // the Navratri tab loads all ~500 garbas (summaries only) at once
const LIBRARY_CACHE_MS = 5 * 60 * 1000;

let libraryCache: { at: number; data: LibrarySection[] } | null = null;

export function invalidateLibraryCache() {
  libraryCache = null;
}

/** Sections with song counts per sub-collection, for the Library page. */
songsRouter.get('/library', async (_req, res) => {
  if (!libraryCache || Date.now() - libraryCache.at > LIBRARY_CACHE_MS) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT collection, subcollection, COUNT(*) AS n FROM garbas
       WHERE collection IS NOT NULL GROUP BY collection, subcollection ORDER BY collection, subcollection`,
    );
    const sections = new Map<string, LibrarySection>();
    for (const row of rows) {
      const section: LibrarySection = sections.get(row.collection) ?? { slug: row.collection, count: 0, subcollections: [] };
      section.count += Number(row.n);
      if (row.subcollection) section.subcollections.push({ slug: row.subcollection, count: Number(row.n) });
      sections.set(row.collection, section);
    }
    libraryCache = { at: Date.now(), data: [...sections.values()] };
  }
  res.set('Cache-Control', 'public, max-age=300');
  res.json(libraryCache.data);
});

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Paged song summaries (no lyrics).
 *   ?collection=&sub=&q=&page=1&limit=30   or   ?ids=a,b,c
 */
songsRouter.get('/songs', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const collection = typeof req.query.collection === 'string' ? req.query.collection : '';
  const sub = typeof req.query.sub === 'string' ? req.query.sub : '';
  const ids = typeof req.query.ids === 'string' ? req.query.ids.split(',').filter(Boolean) : [];
  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), MAX_PAGE_SIZE);
  const page = Math.max(Number(req.query.page) || 1, 1);

  if (q.length > 100) throw new ValidationError('Search text is too long');
  if (ids.length > 200) throw new ValidationError('Too many ids');

  const where: string[] = [];
  const params: unknown[] = [];
  if (ids.length) {
    where.push(`id IN (${ids.map(() => '?').join(', ')})`);
    params.push(...ids);
  }
  if (collection) {
    where.push('collection = ?');
    params.push(collection);
  }
  if (sub) {
    where.push('subcollection = ?');
    params.push(sub);
  }
  // Every word must appear somewhere (title, artist, opening lines) in any script
  for (const word of q.split(/\s+/).filter(Boolean).slice(0, 6)) {
    where.push(`search_text LIKE ?`);
    params.push(`%${escapeLike(word)}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM garbas ${whereSql}`, params);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${SUMMARY_COLUMNS} FROM garbas ${whereSql}
     ORDER BY is_builtin DESC, collection, subcollection, sort_order, id
     LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit],
  );

  res.set('Cache-Control', 'public, max-age=60');
  res.json({ items: rows.map(rowToSummary), total: Number(total), page, limit });
});

songsRouter.get('/songs/:id', async (req, res) => {
  const builtinIds = GARBAS_DATA.map((g) => g.id);
  const rawIdOrSlug = req.params.id;
  const targetId = parseIdFromSlug(rawIdOrSlug, builtinIds);

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM garbas WHERE id = ? OR id = ?', [targetId, rawIdOrSlug]);
    if (rows.length > 0) {
      res.set('Cache-Control', 'public, max-age=300');
      res.json(rowToGarba(rows[0]));
      return;
    }
  } catch (err) {
    console.error('DB query error on GET /songs/:id:', err);
    const builtin = GARBAS_DATA.find((g) => g.id.toLowerCase() === targetId.toLowerCase() || g.id.toLowerCase() === rawIdOrSlug.toLowerCase());
    if (builtin) {
      const copy = { ...builtin, slug: getGarbaSlug({ id: builtin.id, title: builtin.title, isBuiltin: true }) };
      res.set('Cache-Control', 'public, max-age=60');
      res.json(copy);
      return;
    }
    res.status(503).setHeader('Retry-After', '5').json({ error: 'Database service temporarily unavailable' });
    return;
  }

  const builtin = GARBAS_DATA.find((g) => g.id.toLowerCase() === targetId.toLowerCase() || g.id.toLowerCase() === rawIdOrSlug.toLowerCase());
  if (builtin) {
    const copy = { ...builtin, slug: getGarbaSlug({ id: builtin.id, title: builtin.title, isBuiltin: true }) };
    res.set('Cache-Control', 'public, max-age=300');
    res.json(copy);
    return;
  }

  res.status(404).json({ error: 'Song not found' });
});
