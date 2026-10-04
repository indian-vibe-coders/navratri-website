import type { RowDataPacket } from 'mysql2';
import type { Garba, GarbaSummary, LyricsSection } from '../../src/types/index.ts';
import { parseJson } from './db.ts';
import { getGarbaSlug } from './utils/slug.ts';

// Columns for list views: everything except the large lyrics/audio JSON
export const SUMMARY_COLUMNS =
  'id, title, category, deity, is_featured, is_popular, is_builtin, tags, description, artwork_url, lyrics_source, collection, subcollection';

export function rowToSummary(row: RowDataPacket): GarbaSummary {
  const title = parseJson<GarbaSummary['title']>(row.title);
  const isBuiltin = !!row.is_builtin;
  const summary: GarbaSummary = {
    id: row.id,
    title,
    category: row.category,
    deity: row.deity ?? '',
    isFeatured: !!row.is_featured,
    isPopular: !!row.is_popular,
    tags: parseJson<string[]>(row.tags) ?? [],
    description: parseJson<GarbaSummary['description']>(row.description),
    artworkUrl: row.artwork_url ?? '',
    lyricsSource: parseJson<GarbaSummary['lyricsSource']>(row.lyrics_source) ?? { name: '', url: '#' },
    collection: row.collection ?? undefined,
    subcollection: row.subcollection ?? undefined,
  };
  summary.slug = getGarbaSlug({ id: row.id, title, isBuiltin });
  return summary;
}

export function rowToGarba(row: RowDataPacket): Garba {
  const lyrics = parseJson<Partial<Garba['lyrics']>>(row.lyrics);
  const sections: LyricsSection[] = lyrics.sections ?? [];
  // Library songs store only sections; derive the flat per-script line lists from them
  const flat = (script: 'gu' | 'hi' | 'en') =>
    lyrics[script]?.length ? lyrics[script]! : sections.flatMap((s) => s.lines[script] ?? []);

  return {
    ...rowToSummary(row),
    audioReference: parseJson(row.audio_reference) ?? undefined,
    lyrics: { gu: flat('gu'), hi: flat('hi'), en: flat('en'), sections },
  };
}
