export function slugifyText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getGarbaSlug(song: { id: string | number; title?: { en?: string; gu?: string }; isBuiltin?: boolean }): string {
  const idStr = String(song.id);
  const isBuiltin = song.isBuiltin || isNaN(Number(idStr));
  if (isBuiltin) return idStr;
  const enSlug = song.title?.en ? slugifyText(song.title.en) : '';
  return enSlug ? `${enSlug}-${idStr}` : idStr;
}

export function parseIdFromSlug(slug: string, builtinIds: string[] = []): string {
  if (!slug) return '';
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

