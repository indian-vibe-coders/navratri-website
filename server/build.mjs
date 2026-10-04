// Bundles the API into standalone CommonJS files so the server needs no `npm install`.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

await build({
  entryPoints: { app: 'server/src/app.ts', migrate: 'server/src/migrate.ts' },
  outdir: 'server/dist',
  outExtension: { '.js': '.cjs' },
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  minify: false,
  sourcemap: false,
  logLevel: 'info',
});

writeFileSync(
  'server/dist/package.json',
  JSON.stringify({ name: 'navswar-api', private: true, main: 'app.cjs' }, null, 2) + '\n',
);

// Passenger restarts the app when tmp/restart.txt changes; a fresh timestamp makes
// every FTP deploy upload it, which triggers the restart.
mkdirSync('server/dist/tmp', { recursive: true });
writeFileSync('server/dist/tmp/restart.txt', `${new Date().toISOString()}\n`);
