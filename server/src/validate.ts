import type { Garba, GarbaCategory } from '../../src/types/index.ts';

export class ValidationError extends Error {}

const CATEGORIES: GarbaCategory[] = [
  'Traditional', 'Devotional', '3 Tali', 'Dodhiyu', 'Hich', 'Titoda', 'Aarti', 'Dakla', 'Evergreen',
];

function str(value: unknown, field: string, max: number, optional = false): string {
  if (value === undefined || value === null || value === '') {
    if (optional) return '';
    throw new ValidationError(`${field} is required`);
  }
  if (typeof value !== 'string') throw new ValidationError(`${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new ValidationError(`${field} is too long (max ${max} characters)`);
  return trimmed;
}

function strArray(value: unknown, field: string, maxItems: number, maxLen: number, optional = false): string[] | undefined {
  if (value === undefined || value === null) {
    if (optional) return undefined;
    throw new ValidationError(`${field} is required`);
  }
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new ValidationError(`${field} must be a list of at most ${maxItems} items`);
  }
  return value.map((v, i) => str(v, `${field}[${i}]`, maxLen, true));
}

function trilingual(value: unknown, field: string, max: number) {
  const obj = (value ?? {}) as Record<string, unknown>;
  const gu = str(obj.gu, `${field}.gu`, max);
  return {
    gu,
    hi: str(obj.hi, `${field}.hi`, max, true) || gu,
    en: str(obj.en, `${field}.en`, max, true) || gu,
  };
}

// Only allow site-relative paths or https URLs, never javascript:/data: URLs
function safeUrl(value: unknown, field: string): string | null {
  const url = str(value, field, 500, true);
  if (!url || url === '#') return url || null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (/^https:\/\//i.test(url)) return url;
  throw new ValidationError(`${field} must be an https:// URL or a site path`);
}

/** Validates a user-submitted Garba and returns a clean copy (server assigns the id). */
export function validateNewGarba(input: unknown): Omit<Garba, 'id'> {
  const g = (input ?? {}) as Record<string, any>;

  const category = g.category as GarbaCategory;
  if (!CATEGORIES.includes(category)) throw new ValidationError('category is invalid');

  const lyrics = (g.lyrics ?? {}) as Record<string, unknown>;
  const rawSections = Array.isArray(lyrics.sections) ? lyrics.sections : [];
  if (rawSections.length > 60) throw new ValidationError('too many lyrics sections');

  const sections = rawSections.map((s: any, i: number) => ({
    type: s?.type === 'chorus' ? ('chorus' as const) : ('verse' as const),
    label: s?.label ? trilingual(s.label, `lyrics.sections[${i}].label`, 100) : undefined,
    lines: {
      gu: strArray(s?.lines?.gu, `lyrics.sections[${i}].lines.gu`, 40, 300)!,
      hi: strArray(s?.lines?.hi, `lyrics.sections[${i}].lines.hi`, 40, 300, true),
      en: strArray(s?.lines?.en, `lyrics.sections[${i}].lines.en`, 40, 300, true),
    },
  }));

  const audio = g.audioReference;
  const source = g.lyricsSource ?? {};

  return {
    title: trilingual(g.title, 'title', 200),
    category,
    description: trilingual(g.description, 'description', 1000),
    deity: str(g.deity, 'deity', 120, true),
    isFeatured: false,
    isPopular: false,
    tags: strArray(g.tags ?? [], 'tags', 20, 40)!,
    lyrics: {
      gu: strArray(lyrics.gu, 'lyrics.gu', 400, 300)!,
      hi: strArray(lyrics.hi, 'lyrics.hi', 400, 300, true),
      en: strArray(lyrics.en, 'lyrics.en', 400, 300, true),
      sections,
    },
    audioReference: audio?.url
      ? {
          url: safeUrl(audio.url, 'audioReference.url') ?? '',
          duration: str(audio.duration, 'audioReference.duration', 10, true),
          tempo: str(audio.tempo, 'audioReference.tempo', 100, true) || undefined,
          notes: str(audio.notes, 'audioReference.notes', 500, true) || undefined,
        }
      : undefined,
    lyricsSource: {
      name: str(source.name, 'lyricsSource.name', 200, true) || 'Community Submission',
      url: safeUrl(source.url, 'lyricsSource.url') ?? '#',
    },
    artworkUrl: safeUrl(g.artworkUrl, 'artworkUrl') ?? '/images/covers/cover_maa_durga.jpg',
  };
}

export function validateComment(body: Record<string, unknown>) {
  const durationRaw = Number(body.audioDuration);
  return {
    authorName: str(body.authorName, 'authorName', 80, true) || 'Devotee Singer',
    commentText: str(body.commentText, 'commentText', 2000, true),
    audioDuration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.min(Math.round(durationRaw), 3600) : null,
  };
}
