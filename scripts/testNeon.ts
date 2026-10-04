import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('NEON_DATABASE_URL is not set. Add it to .env (see .env.example).');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  console.log('Testing connection to Neon...');
  const result = await sql`SELECT 1 as connected, NOW() as current_time;`;
  console.log('QueryResult:', result);
}

main().catch(console.error);
