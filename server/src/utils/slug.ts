export function slugifyText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface SongSlugTarget {
  id: string | number;
  title?: {
    en?: string;
    gu?: string;
    hi?: string;
  };
  isBuiltin?: boolean;
  is_builtin?: boolean | number;
}

export function getGarbaSlug(song: SongSlugTarget): string {
  const idStr = String(song.id);
  const isBuiltin = !!(song.isBuiltin || song.is_builtin || isNaN(Number(idStr)));

  if (isBuiltin) {
    return idStr;
  }

  const enSlug = song.title?.en ? slugifyText(song.title.en) : '';
  if (enSlug) {
    return `${enSlug}-${idStr}`;
  }

  return idStr;
}

export function parseIdFromSlug(slug: string, builtinIds: string[] = []): string {
  const normalized = decodeURIComponent(slug).toLowerCase().trim().replace(/\/+$/, '');

  // 1. Check if slug matches or ends with a known built-in ID
  for (const bId of builtinIds) {
    const lowerBId = bId.toLowerCase();
    if (normalized === lowerBId || normalized.endsWith('-' + lowerBId)) {
      return bId;
    }
  }

  // 2. Trailing numeric ID check for DB songs (e.g. "pankhida-o-pankhida-1234" -> "1234")
  const match = normalized.match(/(?:^|-)(\d+)$/);
  if (match) {
    return match[1];
  }

  // 3. Fallback: exact slug as ID
  return normalized;
}
