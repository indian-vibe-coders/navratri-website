export type Language = 'gu' | 'hi' | 'en';

export type GarbaCategory = 
  | 'All'
  | 'Traditional' 
  | 'Devotional' 
  | '3 Tali' 
  | 'Dodhiyu' 
  | 'Hich' 
  | 'Titoda' 
  | 'Aarti' 
  | 'Dakla' 
  | 'Evergreen';

export type SectionType = 'chorus' | 'verse';

export interface LyricsSection {
  type: SectionType;
  label?: {
    gu?: string;
    hi?: string;
    en?: string;
  };
  lines: {
    gu: string[];
    hi?: string[];
    en?: string[];
  };
}

export interface AudioReference {
  url: string;
  duration: string; // e.g. "04:12"
  tempo?: string; // e.g. "Traditional 3-Tali"
  notes?: string;
}

export interface LyricsSource {
  name: string;
  url: string;
}

export interface Garba {
  id: string;
  slug?: string;
  isBuiltin?: boolean;
  title: {
    gu: string;
    hi: string;
    en: string;
  };
  category: GarbaCategory;
  description: {
    gu: string;
    hi: string;
    en: string;
  };
  deity: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  tags: string[];
  lyrics: {
    gu: string[];
    hi?: string[];
    en?: string[];
    sections: LyricsSection[];
  };
  audioReference?: AudioReference;
  lyricsSource: LyricsSource;
  artworkUrl: string;
  /** Library section slug, e.g. "navratri", "gujarati-artist" (see data/library.ts) */
  collection?: string;
  /** Artist / raga / sub-collection slug within the section */
  subcollection?: string;
}

/** What list endpoints return: everything except the (large) lyrics. */
export type GarbaSummary = Omit<Garba, 'lyrics' | 'audioReference'>;

export interface LibrarySection {
  slug: string;
  count: number;
  subcollections: { slug: string; count: number }[];
}

export interface Navdurga {
  id: number;
  name: {
    gu: string;
    hi: string;
    en: string;
  };
  night: number;
  mantra: string;
  color: string;
  colorHex: string;
  description: {
    gu: string;
    hi: string;
    en: string;
  };
  iconName: string;
  image: string;
}
