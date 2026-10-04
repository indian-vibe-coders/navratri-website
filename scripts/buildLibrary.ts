/**
 * Converts the scraped LokDayro data in ./output into one compressed import file:
 *   migration-data/library.ndjson.gz  (one song per line)
 *
 * Upload that file to <api folder>/migration-data/ on the server and restart the app;
 * the API imports it in the background (see server/src/migrations.ts).
 *
 * Usage: npm run library:build [-- <output dir>]
 */
import { createHash } from 'node:crypto';
import { createWriteStream, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createGzip } from 'node:zlib';

const SOURCE_DIR = path.resolve(process.argv[2] ?? 'output');
const OUT_FILE = path.resolve('migration-data/library.ndjson.gz');

// These two are already built into the site (src/data/garbas.ts) with hand-curated content
const SKIP_URLS = new Set([
  'https://www.lokdayro.com/category/navratri/(1)old-and-new-evergreen-garbas/garba-lyrics/3.php',
  'https://www.lokdayro.com/category/navratri/(1)old-and-new-evergreen-garbas/garba-lyrics/49.php',
]);

const NAVRATRI_COVERS = [
  '/images/covers/cover_maa_durga.jpg',
  '/images/covers/cover_garba_dancers.jpg',
  '/images/covers/cover_lotus_diya.jpg',
  '/images/covers/cover_sacred_om.jpg',
];
const LIBRARY_COVERS = ['/images/covers/cover_lotus_diya.jpg', '/images/covers/cover_sacred_om.jpg'];

const SECTION_NAMES: Record<string, { gu: string; hi: string; en: string }> = {
  navratri: { gu: 'નવરાત્રી ગરબો', hi: 'नवरात्रि गरबा', en: 'Navratri Garba' },
  'gujarati-artist': { gu: 'ભજન', hi: 'भजन', en: 'Bhajan' },
  'classical-artists-and-pandits': { gu: 'શાસ્ત્રીય રચના', hi: 'शास्त्रीय रचना', en: 'Classical composition' },
  'jain-content': { gu: 'જૈન સ્તવન', hi: 'जैन स्तवन', en: 'Jain stavan' },
  'chalisa-and-namavali': { gu: 'ચાલીસા / નામાવલી', hi: 'चालीसा / नामावली', en: 'Chalisa / Namavali' },
  'lagna-geeto': { gu: 'લગ્ન ગીત', hi: 'लग्न गीत', en: 'Wedding song' },
  'prarthana-collection': { gu: 'પ્રાર્થના', hi: 'प्रार्थना', en: 'Prayer' },
  'bal-geet': { gu: 'બાળ ગીત', hi: 'बाल गीत', en: "Children's song" },
  'deshbhakti-songs': { gu: 'દેશભક્તિ ગીત', hi: 'देशभक्ति गीत', en: 'Patriotic song' },
};
const TRADITIONAL_SECTIONS = new Set(['navratri', 'lagna-geeto', 'bal-geet', 'deshbhakti-songs']);

interface ScrapedSong {
  title: string;
  url: string;
  category: string;
  number: number;
  lyrics: { gujarati: string; hindi: string; english: string };
}

const GUJARATI_CHARS = /[઀-૿]/;

// Gujarati and Devanagari Unicode blocks are laid out in parallel (both derive from ISCII)
function gujaratiToDevanagari(text: string): string {
  return text.replace(/[઀-૿]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x180));
}

function stanzas(text: string): string[][] {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);
}

function firstLine(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  // Skip headings like "॥ દોહા", "સ્થાઈ :-", "****108 Names...****": prefer a real Gujarati lyric line
  const isLyric = (l: string) =>
    (l.match(/[઀-૿]/g) ?? []).length >= 6 && !/:-?\s*$/.test(l) && !/^\*/.test(l);
  const line = lines.find(isLyric) ?? lines.find((l) => GUJARATI_CHARS.test(l)) ?? '';
  // Drop decorative symbols and trailing verse numbers (Gujarati or ASCII digits)
  return line
    .replace(/^[\s*॥।|]+/u, '')
    .replace(/[\s,.;:!।॥|*\-૦-૯0-9]+$/u, '')
    .slice(0, 150);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const squash = (s: string) => s.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();

/** Bracketed groups at the top level, nesting-aware: "a (b (c) d) e" → ["(b (c) d)"] */
function topLevelGroups(text: string): string[] {
  const groups: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      if (depth++ === 0) start = i;
    } else if (text[i] === ')' && depth > 0 && --depth === 0) {
      groups.push(text.slice(start, i + 1));
    }
  }
  return groups;
}

const DEVANAGARI = /[ऀ-ॿ]/;

function parseTitles(raw: string, lyrics: ScrapedSong['lyrics']) {
  const t = parseTitlesRaw(raw, lyrics);
  // English title: Latin only. Some sources embed Devanagari/Gujarati in it.
  let en = squash(t.en.replace(/[ऀ-ॿ઀-૿][ऀ-ॿ઀-૿\s,.।॥]*/g, ' '));
  if ((en.match(/[A-Za-z]/g) ?? []).length < 3) en = capitalize(firstLine(lyrics.english) || squash(lyrics.english.split('\n')[0] ?? ''));
  // A few classical pieces only have Devanagari lyrics; show that rather than nothing
  const devanagariLine = squash(lyrics.hindi.split('\n').find((l) => DEVANAGARI.test(l)) ?? '').slice(0, 150);
  const gu = t.gu && (GUJARATI_CHARS.test(t.gu) || DEVANAGARI.test(t.gu)) ? t.gu : t.hi || devanagariLine || en;
  const hi = t.hi || gujaratiToDevanagari(gu);
  return { en: en || gu, gu, hi };
}

function parseTitlesRaw(raw: string, lyrics: ScrapedSong['lyrics']) {
  const cleaned = squash(raw);

  // Kabir duha / classical titles: "english // हिन्दी // ગુજરાતી (taal notes)"
  const parts = cleaned.split(' // ').map((p) => p.trim());
  if (parts.length === 3) {
    // Latin-only notes like "(taal- jap tal)" belong with the English title
    const notes = topLevelGroups(parts[2]).filter((g) => !GUJARATI_CHARS.test(g));
    const stripNotes = (s: string) => squash(notes.reduce((acc, n) => acc.replace(n, ''), s));
    const en = squash([parts[0], ...notes.filter((n) => !parts[0].includes(n))].join(' '));
    return { en: capitalize(en), hi: gujaratiToDevanagari(stripNotes(parts[1])), gu: stripNotes(parts[2]) };
  }
  // "english // ગુજરાતી"
  if (parts.length === 2 && GUJARATI_CHARS.test(parts[1])) {
    return { en: capitalize(parts[0]), gu: parts[1], hi: gujaratiToDevanagari(parts[1]) };
  }

  // Many titles carry the Gujarati name in brackets: "pratham ganesh besado (ગણેશ સ્થાપના ૧)"
  const guGroup = topLevelGroups(cleaned).find((g) => GUJARATI_CHARS.test(g));
  if (guGroup) {
    const gu = squash(guGroup.slice(1, -1));
    const en = squash(cleaned.replace(guGroup, ''));
    return { en: capitalize(en || gu), gu, hi: gujaratiToDevanagari(gu) };
  }

  // Gujarati outside brackets: keep the Latin part as the English title
  if (GUJARATI_CHARS.test(cleaned)) {
    const latin = squash(cleaned.replace(/[઀-૿][઀-૿\s,.।॥]*/g, ' '));
    const gu = squash(cleaned.replace(/[A-Za-z][A-Za-z\s,.'-]*/g, ' ')) || firstLine(lyrics.gujarati);
    return { en: capitalize(latin || firstLine(lyrics.english)), gu, hi: gujaratiToDevanagari(gu) };
  }

  const gu = squash(firstLine(lyrics.gujarati)) || cleaned;
  return { en: capitalize(cleaned), gu, hi: gujaratiToDevanagari(gu) };
}

// Re-chunk a transliteration that lost its blank lines, using the Gujarati stanza sizes,
// as long as the total line counts still match
function alignTo(reference: string[][], other: string[][]): string[][] {
  if (other.length === reference.length) return other;
  const flat = other.flat();
  if (flat.length !== reference.flat().length) return other;
  let offset = 0;
  return reference.map((stanza) => flat.slice(offset, (offset += stanza.length)));
}

function buildSections(lyrics: ScrapedSong['lyrics']) {
  const gu = stanzas(lyrics.gujarati);
  const hi = alignTo(gu, stanzas(lyrics.hindi));
  const en = alignTo(gu, stanzas(lyrics.english));

  // Stanza-by-stanza only when all three scripts split the same way; otherwise one block
  if (gu.length > 1 && gu.length === hi.length && gu.length === en.length) {
    return gu.map((lines, i) => ({ type: 'verse' as const, lines: { gu: lines, hi: hi[i], en: en[i] } }));
  }
  return [{ type: 'verse' as const, lines: { gu: gu.flat(), hi: hi.flat(), en: en.flat() } }];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '');
}

function hashPick<T>(key: string, list: T[]): T {
  return list[createHash('sha1').update(key).digest()[0] % list.length];
}

function toRow(song: ScrapedSong) {
  const parts = song.category.split('/');
  const collection = parts[0];
  // Classical songs are grouped by raga (3rd level); everything else by the 2nd level
  const subcollection = collection === 'classical-artists-and-pandits' ? parts[2] : parts[1];
  const subLabel = subcollection.replace(/-/g, ' ');
  const section = SECTION_NAMES[collection] ?? { gu: collection, hi: collection, en: collection };
  const title = parseTitles(song.title, song.lyrics);
  const isNavratri = collection === 'navratri';

  return {
    id: `${slugify(title.en) || 'song'}-${createHash('sha1').update(song.url).digest('hex').slice(0, 8)}`,
    title,
    category: isNavratri && /aarti|arti\b|આરતી/i.test(song.title)
      ? 'Aarti'
      : TRADITIONAL_SECTIONS.has(collection) ? 'Traditional' : 'Devotional',
    deity: isNavratri ? '' : subLabel,
    tags: [section.en, subLabel],
    description: {
      gu: `${section.gu} · ${subLabel}`,
      hi: `${section.hi} · ${subLabel}`,
      en: `${section.en} · ${subLabel}`,
    },
    artworkUrl: hashPick(song.url, isNavratri ? NAVRATRI_COVERS : LIBRARY_COVERS),
    lyricsSource: { name: 'LokDayro', url: song.url },
    lyrics: { sections: buildSections(song.lyrics) },
    collection,
    subcollection,
    sortOrder: song.number,
  };
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.json')) yield full;
  }
}

async function main() {
  mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  const gzip = createGzip({ level: 9 });
  const done = new Promise<void>((resolve, reject) => {
    gzip.pipe(createWriteStream(OUT_FILE)).on('finish', resolve).on('error', reject);
  });

  const ids = new Set<string>();
  const perSection: Record<string, number> = {};
  let skipped = 0;

  for (const file of walk(SOURCE_DIR)) {
    const song = JSON.parse(readFileSync(file, 'utf8')) as ScrapedSong;
    // Skip duplicates of built-ins and placeholder pages from the source site
    const isPlaceholder = /^xyz$|lyrics[_ ]is[_ ]not[_ ]available/i.test(song.title.trim());
    if (SKIP_URLS.has(song.url) || isPlaceholder || (song.lyrics?.gujarati?.trim().length ?? 0) < 20) {
      skipped++;
      continue;
    }
    const row = toRow(song);
    if (ids.has(row.id)) throw new Error(`Duplicate id ${row.id} (${file})`);
    ids.add(row.id);
    perSection[row.collection] = (perSection[row.collection] ?? 0) + 1;
    if (!gzip.write(JSON.stringify(row) + '\n')) await new Promise((r) => gzip.once('drain', r));
  }

  gzip.end();
  await done;

  console.table(perSection);
  console.log(`✅ ${ids.size} songs written to ${OUT_FILE} (${skipped} skipped)`);
}

main().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
