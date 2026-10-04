import pkg from 'pg';
const { Client } = pkg;
import { GARBAS_DATA } from '../src/data/garbas.ts';

const DATABASE_URL = process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('NEON_DATABASE_URL is not set. Add it to .env (see .env.example).');
  process.exit(1);
}

async function seed() {
  console.log('🚀 Connecting to Neon PostgreSQL...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('🚀 Initializing Neon PostgreSQL garbas table schema...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS garbas (
      id TEXT PRIMARY KEY,
      title JSONB NOT NULL,
      category TEXT NOT NULL,
      deity TEXT,
      is_featured BOOLEAN DEFAULT false,
      is_popular BOOLEAN DEFAULT false,
      tags JSONB NOT NULL,
      description JSONB NOT NULL,
      artwork_url TEXT,
      lyrics_source JSONB,
      audio_reference JSONB,
      lyrics JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ garbas table created/verified successfully!');

  console.log(`📦 Seeding ${GARBAS_DATA.length} Garbas into Neon PostgreSQL...`);

  for (const garba of GARBAS_DATA) {
    await client.query(
      `
      INSERT INTO garbas (
        id, title, category, deity, is_featured, is_popular, tags, description, artwork_url, lyrics_source, audio_reference, lyrics
      ) VALUES (
        $1, $2::jsonb, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10::jsonb, $11::jsonb, $12::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        deity = EXCLUDED.deity,
        is_featured = EXCLUDED.is_featured,
        is_popular = EXCLUDED.is_popular,
        tags = EXCLUDED.tags,
        description = EXCLUDED.description,
        artwork_url = EXCLUDED.artwork_url,
        lyrics_source = EXCLUDED.lyrics_source,
        audio_reference = EXCLUDED.audio_reference,
        lyrics = EXCLUDED.lyrics;
      `,
      [
        garba.id,
        JSON.stringify(garba.title),
        garba.category,
        garba.deity || null,
        garba.isFeatured || false,
        garba.isPopular || false,
        JSON.stringify(garba.tags || []),
        JSON.stringify(garba.description),
        garba.artworkUrl || null,
        garba.lyricsSource ? JSON.stringify(garba.lyricsSource) : null,
        garba.audioReference ? JSON.stringify(garba.audioReference) : null,
        JSON.stringify(garba.lyrics)
      ]
    );
    console.log(`  └─ Synced Garba: ${garba.title.en} (${garba.id})`);
  }

  console.log('🎉 All Garbas successfully seeded into Neon PostgreSQL database!');
  await client.end();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
