import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { GARBAS_DATA } from '../../src/data/garbas.ts';
import type { Garba } from '../../src/types/index.ts';
import { pool } from './db.ts';
import { rowToGarba } from './rows.ts';
import { escapeHtml, escapeXml, escapeJsonLd } from './utils/html.ts';
import { getGarbaSlug, parseIdFromSlug } from './utils/slug.ts';

let cachedTemplate: string | null = null;
let sitemapCache: { at: number; xml: string } | null = null;

const SITEMAP_CACHE_MS = 3 * 60 * 60 * 1000; // 3 hours

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : process.cwd();

export function getIndexTemplate(): string {
  if (cachedTemplate) return cachedTemplate;

  const candidates = [
    path.resolve(currentDir, 'index.html'),
    path.resolve(currentDir, '../public_html/index.html'),
    path.resolve(process.cwd(), 'dist/index.html'),
    path.resolve(process.cwd(), 'index.html'),
    path.resolve(currentDir, '../dist/index.html'),
    path.resolve(currentDir, '../../dist/index.html'),
  ];

  let html = '';
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      html = readFileSync(candidate, 'utf-8');
      break;
    }
  }


  if (!html) {
    html = `<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NavSwar Divine Garba</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }

  // Ensure all asset paths are absolute (/assets/... and /favicon.svg)
  html = html.replace(/(href|src)=["'](?!\/|http|https|data:)([^"']+)["']/g, '$1="/$2"');

  cachedTemplate = html;
  return cachedTemplate;
}

export function resetTemplateCache() {
  cachedTemplate = null;
}

function buildHeadTags(opts: {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  ogImage: string;
  isFallbackImage: boolean;
  imageAlt: string;
  noindex?: boolean;
}): string {
  const titleEsc = escapeHtml(opts.title);
  const descEsc = escapeHtml(opts.description);
  const urlEsc = escapeHtml(opts.canonicalUrl);
  const imgEsc = escapeHtml(opts.ogImage);
  const altEsc = escapeHtml(opts.imageAlt);

  let tags = `
  <title>${titleEsc}</title>
  <meta name="description" content="${descEsc}" />
  <link rel="canonical" href="${urlEsc}" />
`;

  if (opts.noindex) {
    tags += `  <meta name="robots" content="noindex" />\n`;
  }

  tags += `
  <!-- OpenGraph Meta Tags -->
  <meta property="og:site_name" content="Garbaraas" />
  <meta property="og:locale" content="gu_IN" />
  <meta property="og:type" content="${opts.ogType}" />
  <meta property="og:title" content="${titleEsc}" />
  <meta property="og:description" content="${descEsc}" />
  <meta property="og:url" content="${urlEsc}" />
  <meta property="og:image" content="${imgEsc}" />
  <meta property="og:image:alt" content="${altEsc}" />
`;

  if (opts.isFallbackImage) {
    tags += `  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />\n`;
  }

  tags += `
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titleEsc}" />
  <meta name="twitter:description" content="${descEsc}" />
  <meta name="twitter:image" content="${imgEsc}" />
`;

  return tags;
}

function prepareHtmlResponse(rawHtml: string, headTags: string, bodyInject: string = ''): string {
  // 1. Remove any existing title, description, canonical link, og:*, or twitter:* tags to prevent duplicates
  let cleaned = rawHtml
    .replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+(property|name)=["'](og:|twitter:)[^"']*["'][^>]*>\s*/gi, '')
    .replace(/<!--[\s\S]*?Google Identity Services[\s\S]*?-->/gi, '')
    .replace(/<script[^>]*accounts\.google\.com[^>]*><\/script>/gi, '');

  // 2. Inject fresh tags into <head>

  cleaned = cleaned.replace('</head>', `${headTags}\n</head>`);

  // 3. Inject body content if present
  if (bodyInject) {
    cleaned = cleaned.replace('</body>', `${bodyInject}\n</body>`);
  }

  return cleaned;
}

export function handleHomepageSsr(_req: Request, res: Response) {
  const template = getIndexTemplate();
  const title = 'Garbaraas | Multilingual Navratri Garba Lyrics & Reference Library';
  const description =
    'Discover traditional Gujarati Navratri Garba lyrics, listen to reference audio, and learn the rhythm, chorus, and verses. Multilingual support in Gujarati, Hindi, and English.';
  const canonicalUrl = 'https://garbaraas.in/';
  const ogImage = 'https://garbaraas.in/images/og-garba-share.png';

  const headTags = buildHeadTags({
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    ogImage,
    isFallbackImage: true,
    imageAlt: 'Garbaraas Garba Lyrics Library',
  });

  const html = prepareHtmlResponse(template, headTags);
  res.set('Cache-Control', 'public, max-age=300');
  res.send(html);
}

export async function handleGarbaSsr(req: Request, res: Response) {
  const rawParam = req.params.slug;
  const rawSlug = (Array.isArray(rawParam) ? rawParam[0] : rawParam) || '';
  const builtinIds = GARBAS_DATA.map((g) => g.id);
  const targetId = parseIdFromSlug(rawSlug, builtinIds);

  let song: Garba | null = null;
  let dbError = false;

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM garbas WHERE id = ?', [targetId]);
    if (rows.length > 0) {
      song = rowToGarba(rows[0]);
    }
  } catch (err) {
    console.error('SSR DB lookup failed for id:', targetId, err);
    dbError = true;
  }

  // Fallback to built-in garbas if DB did not return a row or DB was unavailable
  if (!song) {
    const builtin = GARBAS_DATA.find((g) => g.id.toLowerCase() === targetId.toLowerCase());
    if (builtin) {
      song = builtin;
    }
  }

  // Handle DB Failure (503 with Retry-After)
  if (!song && dbError) {
    res.status(503).setHeader('Retry-After', '5');
    const template = getIndexTemplate();
    const headTags = `
  <title>503 Service Temporarily Unavailable - Garbaraas</title>
  <meta name="robots" content="noindex" />
  <script>window.__DB_ERROR__ = true;</script>`;
    const html = prepareHtmlResponse(template, headTags);
    res.send(html);
    return;
  }

  // Handle 404 Song Not Found
  if (!song) {
    res.status(404);
    const template = getIndexTemplate();
    const headTags = `
  <title>Garba Not Found - Garbaraas</title>
  <meta name="robots" content="noindex" />
  <script>window.__NOT_FOUND__ = true;</script>`;
    const html = prepareHtmlResponse(template, headTags);
    res.send(html);
    return;
  }

  // Canonical Slug Check & 301 Redirect
  const canonicalSlug = song.slug || getGarbaSlug({ id: song.id, title: song.title, isBuiltin: GARBAS_DATA.some((g) => g.id === song!.id) });
  const normalizedIncoming = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/\/+$/, '');
  const normalizedCanonical = canonicalSlug.toLowerCase().trim().replace(/\/+$/, '');

  if (normalizedIncoming !== normalizedCanonical) {
    res.redirect(301, `/garba/${canonicalSlug}`);
    return;
  }

  // Build Metadata
  const primaryTitle = song.title.gu || song.title.en || 'Garba Lyrics';
  const secondaryTitle = song.title.en || song.title.hi || '';
  const pageTitle = `${primaryTitle}${secondaryTitle ? ` (${secondaryTitle})` : ''} - Garbaraas Garba Lyrics`;

  const lyricsLines = song.lyrics.gu?.length
    ? song.lyrics.gu
    : song.lyrics.en?.length
    ? song.lyrics.en
    : [];
  const rawDesc = lyricsLines.join(' ').trim() || song.description?.gu || song.description?.en || 'Gujarati Garba lyrics and audio reference on Garbaraas.';
  const metaDesc = rawDesc.substring(0, 160).trim();

  const canonicalUrl = `https://garbaraas.in/garba/${canonicalSlug}`;

  const isAbsoluteHttpsArtwork = typeof song.artworkUrl === 'string' && song.artworkUrl.startsWith('https://');
  const ogImage = isAbsoluteHttpsArtwork ? song.artworkUrl : 'https://garbaraas.in/images/og-garba-share.png';
  const isFallbackImage = !isAbsoluteHttpsArtwork;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: song.title.gu,
    alternateName: [song.title.en, song.title.hi].filter(Boolean),
    inLanguage: 'gu',
    genre: song.category || 'Garba',
    composer: {
      '@type': 'Person',
      name: song.lyricsSource?.name || 'Traditional Gujarati Devotional',
    },
    lyrics: {
      '@type': 'Lyrics',
      text: lyricsLines.join('\n'),
    },
  };

  let headTags = buildHeadTags({
    title: pageTitle,
    description: metaDesc,
    canonicalUrl,
    ogType: 'article',
    ogImage,
    isFallbackImage,
    imageAlt: `${primaryTitle} Garba Lyrics - Garbaraas`,
  });

  headTags += `\n  <!-- JSON-LD Structured Data -->\n  <script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>\n`;

  const ssrLyricsHtml = `<div id="ssr-garba-content">
  <h1>${escapeHtml(primaryTitle)}</h1>
  ${lyricsLines.map((line) => `<p>${escapeHtml(line)}</p>`).join('\n  ')}
</div>`;

  const template = getIndexTemplate();
  const html = prepareHtmlResponse(template, headTags, ssrLyricsHtml);

  res.set('Cache-Control', 'public, max-age=300');
  res.send(html);
}

export async function handleSitemapXml(_req: Request, res: Response) {
  if (sitemapCache && Date.now() - sitemapCache.at < SITEMAP_CACHE_MS) {
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=10800');
    res.send(sitemapCache.xml);
    return;
  }

  const songsMap = new Map<string, { id: string; title: { en?: string; gu?: string }; is_builtin?: boolean }>();

  // Add Built-ins
  for (const b of GARBAS_DATA) {
    songsMap.set(b.id, { id: b.id, title: b.title, is_builtin: true });
  }

  // Add DB songs (deduped by ID)
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, title, is_builtin FROM garbas');
    for (const r of rows) {
      songsMap.set(r.id, {
        id: r.id,
        title: typeof r.title === 'string' ? JSON.parse(r.title) : r.title,
        is_builtin: !!r.is_builtin,
      });
    }
  } catch (err) {
    console.error('Sitemap DB query error:', err);
  }

  const urls: string[] = [
    `  <url>\n    <loc>https://garbaraas.in/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ];

  for (const song of songsMap.values()) {
    const slug = getGarbaSlug({ id: song.id, title: song.title, isBuiltin: song.is_builtin });
    const fullUrl = `https://garbaraas.in/garba/${escapeXml(slug)}`;
    urls.push(`  <url>\n    <loc>${fullUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  sitemapCache = { at: Date.now(), xml };
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=10800');
  res.send(xml);
}

export function handleRobotsTxt(_req: Request, res: Response) {
  const content = `User-agent: *
Allow: /
Sitemap: https://garbaraas.in/sitemap.xml
`;
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(content);
}
