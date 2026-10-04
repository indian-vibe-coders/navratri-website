import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Heart, Loader2, Search } from 'lucide-react';
import type { GarbaSummary, Language, LibrarySection } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { fetchLibrary, fetchSongs } from '../lib/apiClient';
import { LIBRARY_SECTIONS, prettifySlug, sectionLabel } from '../data/library';

interface LibraryPageProps {
  onSelectGarba: (garba: GarbaSummary) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  loadingSongId: string | null;
}

const PAGE_SIZE = 30;
const MAX_CHIPS = 24; // more sub-collections than this (e.g. ~200 ragas) switch to a dropdown

const TEXT: Record<string, Record<Language, string>> = {
  title: { gu: 'ભજન અને ગીત સંગ્રહ', hi: 'भजन और गीत संग्रह', en: 'Song Library' },
  subtitle: {
    gu: 'ગરબા, ભજન, સંતવાણી, રાગ, સ્તવન અને વધુ — ગુજરાતી, હિન્દી અને અંગ્રેજીમાં',
    hi: 'गरबा, भजन, संतवाणी, राग, स्तवन और अधिक — गुजराती, हिंदी और अंग्रेज़ी में',
    en: 'Garbas, bhajans, santvani, ragas, stavans and more in Gujarati, Hindi and English',
  },
  search: { gu: 'ગીત, ભજન અથવા કલાકાર શોધો...', hi: 'गीत, भजन या कलाकार खोजें...', en: 'Search songs, bhajans or artists...' },
  songs: { gu: 'ગીતો', hi: 'गीत', en: 'songs' },
  all: { gu: 'બધા', hi: 'सभी', en: 'All' },
  back: { gu: 'બધા વિભાગ', hi: 'सभी विभाग', en: 'All sections' },
  loadMore: { gu: 'વધુ જુઓ', hi: 'और देखें', en: 'Load more' },
  noResults: { gu: 'કોઈ ગીત મળ્યું નહીં', hi: 'कोई गीत नहीं मिला', en: 'No songs found' },
  error: { gu: 'ગીતો લોડ થઈ શક્યા નહીં', hi: 'गीत लोड नहीं हो सके', en: 'Could not load songs' },
  results: { gu: 'પરિણામ', hi: 'परिणाम', en: 'results' },
};

const fontFor = (language: Language) =>
  language === 'gu' ? 'font-gujarati' : language === 'hi' ? 'font-hindi' : 'font-serif-heading';

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectGarba,
  isFavorite,
  onToggleFavorite,
  loadingSongId,
}) => {
  const { language } = useLanguage();
  const [sections, setSections] = useState<LibrarySection[]>([]);
  const [section, setSection] = useState<string | null>(null);
  const [sub, setSub] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query.trim(), 300);

  const [items, setItems] = useState<GarbaSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLibrary()
      .then(setSections)
      .catch(() => setError(true));
  }, []);

  const showList = section !== null || debouncedQuery.length > 0;

  // First page whenever the filters change; stale responses are aborted
  useEffect(() => {
    if (!showList) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(false);
    fetchSongs({ collection: section ?? undefined, sub, q: debouncedQuery, page: 1, limit: PAGE_SIZE }, controller.signal)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [showList, section, sub, debouncedQuery]);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSongs({ collection: section ?? undefined, sub, q: debouncedQuery, page: page + 1, limit: PAGE_SIZE });
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const orderedSections = useMemo(
    () => [...sections].sort((a, b) => (LIBRARY_SECTIONS[a.slug]?.order ?? 99) - (LIBRARY_SECTIONS[b.slug]?.order ?? 99)),
    [sections],
  );
  const current = sections.find((s) => s.slug === section);
  const subcollections = useMemo(
    () => [...(current?.subcollections ?? [])].sort((a, b) => prettifySlug(a.slug).localeCompare(prettifySlug(b.slug))),
    [current],
  );

  const openSection = (slug: string | null) => {
    setSection(slug);
    setSub('');
    setItems([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#5A0808] min-h-screen text-[#FFF7E8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Search Panel */}
        <div className="bg-[#351010]/90 border border-[#D4AF37]/30 rounded-2xl p-5 sm:p-6 shadow-devotional space-y-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            {section && (
              <button
                onClick={() => openSection(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5A0808] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold hover:bg-[#6A0909]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{TEXT.back[language]}</span>
              </button>
            )}
            <div className="min-w-0">
              <h1 className={`text-xl sm:text-3xl font-extrabold ${fontFor(language)}`}>
                {section ? `${LIBRARY_SECTIONS[section]?.emoji ?? ''} ${sectionLabel(section, language)}` : TEXT.title[language]}
              </h1>
              {!section && <p className="text-xs text-[#D4AF37] mt-0.5">{TEXT.subtitle[language]}</p>}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={TEXT.search[language]}
              className="w-full bg-[#250606] text-[#FFF7E8] placeholder-[#FFF7E8]/50 pl-11 pr-4 py-3 rounded-xl border border-[#D4AF37]/30 text-sm outline-none font-gujarati focus:border-[#D4AF37]/70 transition-colors"
            />
          </div>

          {/* Sub-collection filter */}
          {section && subcollections.length > 1 && (
            subcollections.length <= MAX_CHIPS ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[{ slug: '', count: current?.count ?? 0 }, ...subcollections].map((s) => (
                  <button
                    key={s.slug || 'all'}
                    onClick={() => setSub(s.slug)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      sub === s.slug
                        ? 'bg-[#D4AF37] text-[#351010] border-[#D4AF37] font-bold'
                        : 'bg-[#5A0808]/60 text-[#FFF7E8]/90 border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {s.slug ? prettifySlug(s.slug) : TEXT.all[language]} <span className="opacity-70">({s.count})</span>
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                className="w-full bg-[#250606] text-[#FFF7E8] px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/30 text-xs outline-none"
              >
                <option value="">
                  {TEXT.all[language]} ({current?.count})
                </option>
                {subcollections.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {prettifySlug(s.slug)} ({s.count})
                  </option>
                ))}
              </select>
            )
          )}
        </div>

        {error && <p className="text-center text-xs text-red-300">{TEXT.error[language]}</p>}

        {/* Section grid */}
        {!showList && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedSections.map((s) => (
              <button
                key={s.slug}
                onClick={() => openSection(s.slug)}
                className="text-left bg-[#FFF7E8] text-[#351010] rounded-xl border border-[#D4AF37]/25 p-5 shadow-card-elevated hover:shadow-editorial hover:-translate-y-0.5 transition-all"
              >
                <div className="text-2xl">{LIBRARY_SECTIONS[s.slug]?.emoji ?? '🎵'}</div>
                <h2 className={`mt-2 text-lg font-bold ${fontFor(language)}`}>{sectionLabel(s.slug, language)}</h2>
                <p className="text-xs font-semibold text-[#720909]/80 mt-1">
                  {s.count.toLocaleString()} {TEXT.songs[language]}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Song list */}
        {showList && (
          <div className="space-y-2.5">
            {!isLoading && items.length === 0 && !error && (
              <p className="text-center py-10 text-[#FFF7E8]/70 text-sm">{TEXT.noResults[language]}</p>
            )}
            {items.length > 0 && (
              <p className="text-xs text-[#D4AF37] font-semibold">
                {total.toLocaleString()} {TEXT.results[language]}
              </p>
            )}

            {items.map((song) => {
              const title = song.title[language] || song.title.gu;
              const subtitle = language === 'en' ? song.title.gu : song.title.en;
              return (
                <div
                  key={song.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectGarba(song)}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectGarba(song)}
                  className="flex items-center gap-3 bg-[#FFF7E8] text-[#351010] rounded-xl border border-[#D4AF37]/25 px-4 py-3 shadow-card-elevated hover:shadow-editorial hover:border-[#D4AF37]/50 cursor-pointer transition-all"
                >
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-[#5A0808] text-[#D4AF37] flex items-center justify-center">
                    {loadingSongId === song.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-bold text-sm sm:text-base leading-snug truncate ${fontFor(language)}`}>{title}</h3>
                    <p className="text-xs text-[#720909]/80 truncate">
                      {subtitle}
                      {song.subcollection && (
                        <span className="ml-2 inline-block bg-[#D4AF37]/20 text-[#351010] px-2 py-0.5 rounded text-[10px] font-medium align-middle">
                          {section ? prettifySlug(song.subcollection) : sectionLabel(song.collection, language)}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={(e) => onToggleFavorite(song.id, e)}
                    className="p-1.5 rounded-full hover:bg-[#D4AF37]/15"
                    aria-label="Toggle favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-[#B71C1C] text-[#B71C1C]' : 'text-[#720909]/50'}`} />
                  </button>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
              </div>
            )}

            {!isLoading && items.length < total && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={loadMore}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#351010] font-bold text-xs shadow-md hover:brightness-105"
                >
                  {TEXT.loadMore[language]} ({total - items.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

