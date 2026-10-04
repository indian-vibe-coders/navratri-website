// Display metadata for the song library sections imported from LokDayro.
// Slugs match the top-level folders of the scraped data and the `collection` column.

type Trilingual = { gu: string; hi: string; en: string };

export const LIBRARY_SECTIONS: Record<string, { label: Trilingual; emoji: string; order: number }> = {
  navratri: {
    label: { gu: 'નવરાત્રી ગરબા', hi: 'नवरात्रि गरबा', en: 'Navratri Garbas' },
    emoji: '🪔',
    order: 1,
  },
  'gujarati-artist': {
    label: { gu: 'ભજન અને સંતવાણી', hi: 'भजन और संतवाणी', en: 'Bhajans & Santvani' },
    emoji: '🙏',
    order: 2,
  },
  'classical-artists-and-pandits': {
    label: { gu: 'શાસ્ત્રીય સંગીત (રાગ)', hi: 'शास्त्रीय संगीत (राग)', en: 'Classical Ragas' },
    emoji: '🎼',
    order: 3,
  },
  'jain-content': {
    label: { gu: 'જૈન સ્તવન', hi: 'जैन स्तवन', en: 'Jain Stavans' },
    emoji: '🕉️',
    order: 4,
  },
  'chalisa-and-namavali': {
    label: { gu: 'ચાલીસા અને નામાવલી', hi: 'चालीसा और नामावली', en: 'Chalisa & Namavali' },
    emoji: '📿',
    order: 5,
  },
  'lagna-geeto': {
    label: { gu: 'લગ્ન ગીત', hi: 'लग्न गीत', en: 'Wedding Songs' },
    emoji: '💐',
    order: 6,
  },
  'prarthana-collection': {
    label: { gu: 'પ્રાર્થના', hi: 'प्रार्थना', en: 'Prayers' },
    emoji: '🌼',
    order: 7,
  },
  'bal-geet': {
    label: { gu: 'બાળ ગીત', hi: 'बाल गीत', en: "Children's Songs" },
    emoji: '🧸',
    order: 8,
  },
  'deshbhakti-songs': {
    label: { gu: 'દેશભક્તિ ગીત', hi: 'देशभक्ति गीत', en: 'Patriotic Songs' },
    emoji: '🇮🇳',
    order: 9,
  },
};

/** "bageshree-(bageshvari)" → "Bageshree (Bageshvari)", "24-Tirthankaro-na-bhajano" → "24 Tirthankaro Na Bhajano" */
export function prettifySlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|[\s(])([a-z])/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
}

export function sectionLabel(slug: string | undefined, language: keyof Trilingual): string {
  if (!slug) return '';
  return LIBRARY_SECTIONS[slug]?.label[language] ?? prettifySlug(slug);
}
