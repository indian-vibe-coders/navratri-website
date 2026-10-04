import mysql from 'mysql2/promise';
import { config } from './config.ts';

export const pool = mysql.createPool({
  ...config.db,
  charset: 'utf8mb4',
  connectionLimit: 5,
  waitForConnections: true,
});

// MySQL returns JSON columns already parsed; MariaDB stores them as LONGTEXT strings.
export function parseJson<T>(value: unknown): T {
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}

// Song-library columns, added to `garbas` by runMigrations() when missing
// (works for both fresh installs and the table created before the library existed)
export const SCHEMA_COLUMNS: Record<string, string> = {
  collection: 'VARCHAR(80) NULL',
  subcollection: 'VARCHAR(120) NULL',
  sort_order: 'INT NOT NULL DEFAULT 0',
  search_text: 'TEXT NULL',
  user_email: 'VARCHAR(255) NULL',
};

export const SCHEMA_INDEXES: Record<string, string> = {
  idx_garbas_collection: '(collection, subcollection, sort_order)',
  idx_garbas_user_email: '(user_email)',
};

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS garbas (
    id VARCHAR(120) PRIMARY KEY,
    title JSON NOT NULL,
    category VARCHAR(40) NOT NULL,
    deity VARCHAR(120) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_popular TINYINT(1) NOT NULL DEFAULT 0,
    is_builtin TINYINT(1) NOT NULL DEFAULT 0,
    tags JSON NOT NULL,
    description JSON NOT NULL,
    artwork_url VARCHAR(500) NULL,
    lyrics_source JSON NULL,
    audio_reference JSON NULL,
    lyrics JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS audio_comments (
    id VARCHAR(64) PRIMARY KEY,
    garba_id VARCHAR(120) NOT NULL,
    author_name VARCHAR(80) NOT NULL,
    comment_text TEXT NOT NULL,
    audio_file VARCHAR(255) NULL,
    audio_name VARCHAR(255) NULL,
    audio_duration INT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    delete_token_hash CHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comments_garba (garba_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    google_id VARCHAR(120) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS user_favorites (
    email VARCHAR(255) NOT NULL,
    garba_id VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email, garba_id),
    INDEX idx_user_fav_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

