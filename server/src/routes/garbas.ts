import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import type { Garba } from '../../../src/types/index.ts';
import { upsertSongs } from '../migrations.ts';
import { validateNewGarba } from '../validate.ts';
import { writeLimiter } from '../rateLimit.ts';
import { invalidateLibraryCache } from './songs.ts';
import { pool } from '../db.ts';
import type { RowDataPacket } from 'mysql2';

export const garbasRouter = Router();

garbasRouter.post('/garbas', writeLimiter, async (req, res) => {
  const garba: Garba = {
    id: `custom-garba-${randomBytes(8).toString('hex')}`,
    ...validateNewGarba(req.body),
    collection: 'navratri',
    subcollection: 'community',
  };

  const songRow: any = { ...garba, sortOrder: 100000 };

  await upsertSongs([songRow], false);
  invalidateLibraryCache();
  res.status(201).json(garba);
});

// Admin: delete a non-builtin (custom/community) garba by id
garbasRouter.delete('/garbas/:id', writeLimiter, async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, is_builtin FROM garbas WHERE id = ?',
    [id],
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Garba not found' });
    return;
  }
  if (rows[0].is_builtin) {
    res.status(403).json({ error: 'Cannot delete a built-in garba' });
    return;
  }
  await pool.query('DELETE FROM garbas WHERE id = ?', [id]);
  invalidateLibraryCache();
  res.status(204).send();
});


