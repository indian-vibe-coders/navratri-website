import { type RequestHandler, Router } from 'express';
import multer from 'multer';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { config } from '../config.ts';
import { pool } from '../db.ts';
import { ValidationError, validateComment } from '../validate.ts';
import { likeLimiter, writeLimiter } from '../rateLimit.ts';

export const commentsRouter = Router();

const AUDIO_EXTENSIONS: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    // Never trust the client filename on disk; generate our own
    filename: (_req, file, cb) => {
      const baseType = file.mimetype.split(';')[0];
      cb(null, `${randomBytes(16).toString('hex')}${AUDIO_EXTENSIONS[baseType]}`);
    },
  }),
  limits: { fileSize: config.maxAudioBytes, files: 1, fields: 10 },
  fileFilter: (_req, file, cb) => {
    if (AUDIO_EXTENSIONS[file.mimetype.split(';')[0]]) cb(null, true);
    else cb(new ValidationError('Only audio files (webm, ogg, mp3, wav, m4a, aac) are allowed'));
  },
});

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

function rowToComment(row: RowDataPacket) {
  return {
    id: row.id as string,
    garbaId: row.garba_id as string,
    userName: row.author_name as string,
    commentText: row.comment_text as string,
    audioFile: (row.audio_file as string | null) ?? undefined,
    audioName: (row.audio_name as string | null) ?? undefined,
    audioDuration: (row.audio_duration as number | null) ?? undefined,
    likes: row.likes_count as number,
    timestamp: new Date(row.created_at).getTime(),
  };
}

commentsRouter.get('/garbas/:garbaId/comments', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, garba_id, author_name, comment_text, audio_file, audio_name, audio_duration, likes_count, created_at
     FROM audio_comments WHERE garba_id = ? ORDER BY likes_count DESC, created_at DESC LIMIT 200`,
    [req.params.garbaId],
  );
  res.json(rows.map(rowToComment));
});

commentsRouter.post('/garbas/:garbaId/comments', writeLimiter, upload.single('audio'), async (req, res) => {
  const file = req.file;
  try {
    const { authorName, commentText, audioDuration } = validateComment(req.body ?? {});
    if (!commentText && !file) throw new ValidationError('Please enter a comment or attach audio');

    const [garbaRows] = await pool.query<RowDataPacket[]>('SELECT id FROM garbas WHERE id = ?', [req.params.garbaId]);
    if (garbaRows.length === 0) throw new ValidationError('Unknown garba');

    const id = `comment-${randomBytes(10).toString('hex')}`;
    const deleteToken = randomBytes(24).toString('hex');
    const customAudioName = typeof req.body.audioName === 'string' && req.body.audioName.trim() ? req.body.audioName.trim() : null;
    const audioName = file ? (customAudioName || file.originalname).slice(0, 255) : customAudioName;

    await pool.execute(
      `INSERT INTO audio_comments
        (id, garba_id, author_name, comment_text, audio_file, audio_name, audio_duration, likes_count, delete_token_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [id, req.params.garbaId, authorName, commentText, file?.filename ?? null, audioName, file ? audioDuration : null, hashToken(deleteToken)],
    );


    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM audio_comments WHERE id = ?', [id]);
    // deleteToken is returned only once; the browser keeps it to prove ownership later
    res.status(201).json({ ...rowToComment(rows[0]), deleteToken });
  } catch (err) {
    if (file) await unlink(file.path).catch(() => {});
    throw err;
  }
});

commentsRouter.post('/comments/:id/like', likeLimiter, async (req, res) => {
  const delta = req.body?.liked === false ? -1 : 1;
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE audio_comments SET likes_count = GREATEST(likes_count + ?, 0) WHERE id = ?',
    [delta, req.params.id],
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  const [rows] = await pool.query<RowDataPacket[]>('SELECT likes_count FROM audio_comments WHERE id = ?', [req.params.id]);
  res.json({ likes: rows[0].likes_count });
});

// MilesWeb's LiteSpeed front end rejects the DELETE method with its own 403,
// so the client deletes via POST; DELETE stays for hosts that allow it.
const deleteHandler: RequestHandler<{ id: string }> = async (req, res) => {
  const token = req.get('x-delete-token') ?? '';
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT delete_token_hash, audio_file FROM audio_comments WHERE id = ?',
    [req.params.id],
  );
  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  const expected = Buffer.from(row.delete_token_hash ?? '', 'hex');
  const given = Buffer.from(hashToken(token), 'hex');
  if (!token || expected.length !== given.length || !timingSafeEqual(expected, given)) {
    res.status(403).json({ error: 'You can only delete your own comments' });
    return;
  }

  await pool.execute('DELETE FROM audio_comments WHERE id = ?', [req.params.id]);
  if (row.audio_file) {
    await unlink(path.join(config.uploadDir, path.basename(row.audio_file))).catch(() => {});
  }
  res.status(204).end();
};

commentsRouter.post('/comments/:id/delete', writeLimiter, deleteHandler);
commentsRouter.delete('/comments/:id', writeLimiter, deleteHandler);
