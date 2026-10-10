import express, { type ErrorRequestHandler, Router } from 'express';
import compression from 'compression';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { config } from './config.ts';
import { pool } from './db.ts';
import { ValidationError } from './validate.ts';
import { importPendingData, runMigrations } from './migrations.ts';
import { garbasRouter } from './routes/garbas.ts';
import { commentsRouter } from './routes/comments.ts';
import { invalidateLibraryCache, songsRouter } from './routes/songs.ts';

mkdirSync(config.uploadDir, { recursive: true });

const app = express();
app.disable('x-powered-by');
// Behind Apache/Passenger on cPanel; needed so rate limiting sees the real client IP
app.set('trust proxy', 1);
// Song lists are large JSON (the ~500 garba list is ~450KB raw, ~60KB gzipped)
app.use(compression());
app.use(express.json({ limit: '300kb' }));

const api = Router();

api.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    // Only the error code (e.g. ER_ACCESS_DENIED_ERROR, ECONNREFUSED) - never the message,
    // which can include usernames or hostnames
    const code = (err as { code?: string }).code ?? (err instanceof AggregateError ? 'CONNECTION_FAILED' : 'UNKNOWN');
    console.error('Health check DB error:', err);
    res.status(503).json({ ok: false, db: code });
  }
});

api.use(
  '/uploads',
  express.static(config.uploadDir, {
    immutable: true,
    maxAge: '30d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }),
);
api.use(songsRouter);
api.use(garbasRouter);
api.use(commentsRouter);


import { handleGarbaSsr, handleHomepageSsr, handleRobotsTxt, handleSitemapXml } from './ssr.ts';

// Passenger may or may not strip the /api prefix depending on setup, so accept both
app.use('/api', api);

// Homepage SSR Route
app.get('/', handleHomepageSsr);

// Sitemap & Robots
app.get('/sitemap.xml', handleSitemapXml);
app.get('/robots.txt', handleRobotsTxt);

// SSR Garba Route
app.get('/garba/:slug', handleGarbaSsr);

// Root / API fallthrough
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((_req, res, next) => {
  if (_req.accepts('html')) {
    next();
    return;
  }
  res.status(404).json({ error: 'Not found' });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Audio file must be under 10MB' : err.message;
    res.status(400).json({ error: message });
  } else if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request is too large' });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
app.use(errorHandler);

// Listen immediately so Passenger recognizes the running process
app.listen(config.port, () => {
  console.log(`NavSwar API listening on port ${config.port}`);
});

// Run migrations and data import in background
async function initDatabase() {
  try {
    await runMigrations();
  } catch (err) {
    console.error('Startup migration failed:', err);
  }

  importPendingData()
    .then((imported) => imported && invalidateLibraryCache())
    .catch((err) => console.error('Library import failed:', err));
}

initDatabase();

