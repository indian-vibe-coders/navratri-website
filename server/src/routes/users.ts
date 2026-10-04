import { Router } from 'express';
import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db.ts';

export const userRouter = Router();

// POST /api/users/sync - Upserts user profile & returns saved favorites
userRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const { email, name, avatarUrl, googleId } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid user email is required' });
      return;
    }

    const userName = name || 'Devotee Singer';
    const userAvatar = avatarUrl || null;
    const gId = googleId || null;

    // Upsert into users table
    await pool.query(
      `INSERT INTO users (email, name, avatar_url, google_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       avatar_url = VALUES(avatar_url),
       google_id = COALESCE(VALUES(google_id), google_id)`,
      [email, userName, userAvatar, gId]
    );

    // Fetch user's saved favorites
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT garba_id FROM user_favorites WHERE email = ? ORDER BY created_at DESC`,
      [email]
    );

    const favorites = rows.map((r) => r.garba_id as string);

    res.json({
      user: { email, name: userName, avatarUrl: userAvatar, googleId: gId },
      favorites,
    });
  } catch (err: any) {
    console.error('Error syncing user:', err);
    res.status(500).json({ error: err?.message || 'Failed to sync user profile' });
  }
});

// GET /api/users/favorites?email=... - Get favorites for email
userRouter.get('/favorites', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: 'Email parameter required' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT garba_id FROM user_favorites WHERE email = ? ORDER BY created_at DESC`,
      [email]
    );

    res.json({ favorites: rows.map((r) => r.garba_id as string) });
  } catch (err: any) {
    console.error('Error getting user favorites:', err);
    res.status(500).json({ error: err?.message || 'Failed to get favorites' });
  }
});

// POST /api/users/favorites - Save favorite
userRouter.post('/favorites', async (req: Request, res: Response) => {
  try {
    const { email, garbaId } = req.body || {};
    if (!email || !garbaId) {
      res.status(400).json({ error: 'email and garbaId are required' });
      return;
    }

    await pool.query(
      `INSERT IGNORE INTO user_favorites (email, garba_id) VALUES (?, ?)`,
      [email, garbaId]
    );

    res.json({ success: true, email, garbaId });
  } catch (err: any) {
    console.error('Error adding user favorite:', err);
    res.status(500).json({ error: err?.message || 'Failed to save favorite' });
  }
});

// DELETE /api/users/favorites - Remove favorite
userRouter.delete('/favorites', async (req: Request, res: Response) => {
  try {
    const { email, garbaId } = req.body || {};
    if (!email || !garbaId) {
      res.status(400).json({ error: 'email and garbaId are required' });
      return;
    }

    await pool.query(
      `DELETE FROM user_favorites WHERE email = ? AND garba_id = ?`,
      [email, garbaId]
    );

    res.json({ success: true, email, garbaId });
  } catch (err: any) {
    console.error('Error removing user favorite:', err);
    res.status(500).json({ error: err?.message || 'Failed to remove favorite' });
  }
});
