import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import type { Garba } from '../../../src/types/index.ts';
import { upsertSongs } from '../migrations.ts';
import { validateNewGarba } from '../validate.ts';
import { writeLimiter } from '../rateLimit.ts';
import { invalidateLibraryCache } from './songs.ts';

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


