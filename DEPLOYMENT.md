# Deploying NavSwar to MilesWeb (cPanel)

## How it fits together

```
Browser ──► https://<domain>/          public_html/        React build (dist/) + .htaccess
        └─► https://<domain>/api/...   ~/navswar-api/      Node.js app (app.cjs) ──► MySQL (localhost)
                                       ~/navswar-uploads/  comment audio files
```

- The database password exists only in `~/navswar-api/.env` on the server. The browser never sees it.
- `server/dist/app.cjs` is fully bundled, so the server needs no `npm install`.
- GitHub Actions (`.github/workflows/deploy.yml`) builds and uploads over **FTPS** on every push to
  `main` or `milesweb-migration`. Uploading a new `tmp/restart.txt` makes Passenger restart the app.
- SSH is not available on this account, so the API sets itself up when it starts: it creates any
  missing tables, syncs the built-in Garbas from `src/data/garbas.ts`, and imports a song-library
  file if one has been uploaded.

## One-time server setup

### 1. Create the Node.js app
cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | Highest offered (18 or newer) |
| Application mode | Production |
| Application root | `navswar-api` |
| Application URL | your domain + `api` |
| Application startup file | `app.cjs` |


### 2. Create the server `.env`
cPanel → **File Manager** → `navswar-api` → **+ File** → `.env` (enable "Show Hidden Files"):

```
NODE_ENV=production
DB_HOST=localhost
DB_NAME=<cpaneluser>_<dbname>
DB_USER=<cpaneluser>_<dbuser>
DB_PASSWORD=<password>
UPLOAD_DIR=/home/<cpaneluser>/navswar-uploads
```

Then right-click it → **Change Permissions** → `600`.

### 3. Create a dedicated FTP account for deploys
Don't put your main cPanel password in GitHub. cPanel → **FTP Accounts** → **Add FTP Account**:

- **Log in:** e.g. `deploy` (the full username becomes `deploy@<domain>`)
- **Password:** a long random one
- **Directory:** clear the box so it's the home folder `/home/<cpaneluser>/`. Deploys need both
  `public_html/` and `navswar-api/`, which are only both reachable from there.

The **FTP server hostname** is under "Configure FTP Client" next to the account. Use that hostname,
not the IP: the FTPS certificate is issued for the hostname, so connecting by IP fails the certificate
check. If you must use the IP, set the variable `FTP_SECURITY` to `loose`.

### 4. GitHub settings
Requires **admin** access to the repo: Settings → **Environments** → New environment `milesweb`.

**Secrets**

| Name | Value |
|---|---|
| `FTP_SERVER` | FTP hostname from step 3 |
| `FTP_USERNAME` | e.g. `deploy@garbaraas.in` |
| `FTP_PASSWORD` | the FTP account's password |

**Variables**

| Name | Value |
|---|---|
| `SITE_URL` | `https://garbaraas.in` (no trailing slash; use the `cpanel.site` address until DNS works) |
| `WEB_DIR` | only if not `public_html/`, e.g. `garbaraas.in/` for an addon domain (keep the trailing `/`) |
| `API_DIR` | only if the Node app root isn't `navswar-api/` |
| `FTP_SECURITY` | only if needed: `loose` |

## Domain: garbaraas.in

1. **DNS** (at the registrar): either set the nameservers to the ones in your MilesWeb welcome email,
   or add `A` records for `@` and `www` pointing to `103.212.121.53`. Changes can take a few hours.
2. **cPanel → Domains**: make sure `garbaraas.in` is listed. If it was added as an *addon* domain, its
   document root is something like `/home/<cpaneluser>/garbaraas.in`. Set `WEB_DIR` to `garbaraas.in/`.
3. **SSL**: cPanel → **SSL/TLS Status** → select `garbaraas.in` and `www.garbaraas.in` → **Run AutoSSL**
   (only works after DNS points to the server).
4. **Node app**: Setup Node.js App → edit the app → Application URL `garbaraas.in` / `api`.
5. `www.garbaraas.in` redirects to `https://garbaraas.in` via `public/.htaccess`.

## Importing the song library

The ~4,400 songs (garbas, bhajans, ragas, stavans...) come from the scraped LokDayro data in
`output/` (not committed to git). To load or refresh them:

1. `npm run library:build` → creates `migration-data/library.ndjson.gz` (~4 MB).
2. In File Manager, create `navswar-api/migration-data/` if needed and upload `library.ndjson.gz` into it.
3. Restart the app (Setup Node.js App → **Restart**). It starts serving immediately and imports in the
   background (a few seconds), then renames the file to `library.ndjson.gz.imported-<timestamp>`.
4. Check the **Library** tab, then delete the `.imported-…` file.

Re-importing is safe: songs are matched by id (derived from the source URL), so existing songs are
updated rather than duplicated, and comments on them are kept.

## Local development

```bash
cp .env.example .env      # point DB_* at a local MySQL/MariaDB
npm run db:migrate        # create tables + load built-in Garbas
npm run library:build     # optional: build the song library file from output/
node server/src/migrate.ts --import migration-data/library.ndjson.gz
npm run dev:server        # API on :3001
npm run dev               # Vite on :5173, proxies /api to :3001
```

## Troubleshooting

- **`/api/health` returns 500**: wrong `DB_*` values in `~/navswar-api/.env`, or the DB user lacks privileges.
- **`/api/...` returns the React page**: the Node app's Application URL isn't `api`, or the app is stopped.
- **App logs**: `~/navswar-api/stderr.log` in File Manager. Look for `Startup migration failed`.
- **Manual restart**: cPanel → Setup Node.js App → **Restart**.
- **Deploy fails with a certificate error**: use the FTP hostname instead of the IP, or set `FTP_SECURITY=loose`.

## If SSH gets enabled later
Deploys could switch to rsync over SSH, which is faster, and `node migrate.cjs` could be run by hand.
The FTP setup keeps working either way, so this is optional.
