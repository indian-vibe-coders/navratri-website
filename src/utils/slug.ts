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
