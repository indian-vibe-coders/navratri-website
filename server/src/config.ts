import 'dotenv/config';
import path from 'node:path';

export const config = {
  port: Number(process.env.PORT) || 3001,
  isProduction: process.env.NODE_ENV === 'production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'navswar',
  },
  // Keep uploads outside the deploy folder so deployments never wipe them
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'uploads'),
  maxAudioBytes: 10 * 1024 * 1024,
};
