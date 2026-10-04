import type { Garba } from '../../src/types/index.ts';

type Searchable = Pick<Garba, 'title' | 'tags' | 'deity'> & {
  subcollection?: string;
  lyrics?: Partial<Garba['lyrics']>;
};

const LYRIC_LINES_PER_SCRIPT = 4;

/**
 * Lower-cased text that song search matches with LIKE: titles in all three scripts, tags,
 * artist/sub-collection, and the opening lines of the lyrics (how people usually remember a song).
 */
export function buildSearchText(song: Searchable): string {
  const firstLines = (script: 'gu' | 'hi' | 'en') => {
    const flat = song.lyrics?.[script]?.length
      ? song.lyrics[script]!
      : (song.lyrics?.sections ?? []).flatMap((s) => s.lines[script] ?? []);
    return flat.slice(0, LYRIC_LINES_PER_SCRIPT);
  };

  return [
    song.title.en,
    song.title.gu,
    song.title.hi,
    song.deity,
    song.subcollection?.replace(/-/g, ' '),
    ...(song.tags ?? []),
    ...firstLines('en'),
    ...firstLines('gu'),
    ...firstLines('hi'),
  ]
    .filter(Boolean)
    .join(' \n ')
    .toLowerCase()
    .slice(0, 4000);
}
