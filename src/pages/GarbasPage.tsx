import React, { useEffect, useState } from 'react';
import { Search, Music, Sparkles, Filter } from 'lucide-react';
import { GarbaCard } from '../components/GarbaCard';
import { CategoryFilter } from '../components/CategoryFilter';
import type { GarbaSummary, GarbaCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

const PAGE_SIZE = 24;

interface GarbasPageProps {
  garbas: GarbaSummary[];
  onSelectGarba: (garba: GarbaSummary, tab?: 'lyrics' | 'audio') => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddGarba?: () => void;
}

export const GarbasPage: React.FC<GarbasPageProps> = ({
  garbas,
  onSelectGarba,
  isFavorite,
  onToggleFavorite,
  onOpenAddGarba,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GarbaCategory>('All');
  // ~500 garbas: render a page at a time so the grid stays fast
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => setVisibleCount(PAGE_SIZE), [searchQuery, selectedCategory]);

  const filteredGarbas = garbas.filter((g) => {
    const matchesCategory =
      selectedCategory === 'All' || g.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      g.title.gu.toLowerCase().includes(q) ||
      g.title.hi.toLowerCase().includes(q) ||
      g.title.en.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-[#800000] min-h-screen text-[#FFF8ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto bg-[#6A0000] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#FFF8ED]">
              {t.explore.title}
            </h1>
          </div>

          {onOpenAddGarba && (
            <button
              onClick={onOpenAddGarba}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-extrabold px-5 py-3 rounded-2xl shadow-xl hover:brightness-110 text-xs transition-all border border-[#FFF8ED]/40"
            >
              <Sparkles className="w-4 h-4 text-[#3B1111]" />
              <span>+ Add Your Own Garba</span>
            </button>
          )}
        </div>

        {/* Search Input & Category Filters */}
        <div className="bg-[#6A0000] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="relative">
          <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.explore.searchBarPlaceholder}
            className="w-full bg-[#3B1111] text-[#FFF8ED] placeholder-[#FFF8ED]/60 pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#D4AF37]/50 text-base outline-none font-gujarati font-medium shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-[#D4AF37] text-[#3B1111] px-2.5 py-1 rounded-full"
            >
              Clear
            </button>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#D4AF37] uppercase tracking-wider mb-2">
            <Filter className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {t.explore.allCategories === 'બધા ગરબા'
                ? 'કેટેગરી મુજબ ફિલ્ટર કરો'
                : t.explore.allCategories === 'सभी गरबा'
                ? 'श्रेणी अनुसार फ़िल्टर करें'
                : 'Filter by Category'}
            </span>
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Garba Cards Grid */}
      {filteredGarbas.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarbas.slice(0, visibleCount).map((garba) => (
              <GarbaCard
                key={garba.id}
                garba={garba}
                onSelect={onSelectGarba}
                isFavorite={isFavorite(garba.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
          {visibleCount < filteredGarbas.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-extrabold text-xs shadow-lg hover:brightness-110"
              >
                Show more ({filteredGarbas.length - visibleCount} more)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#FFF8ED] border-2 border-[#D4AF37]/30 rounded-3xl p-12 text-center space-y-3">
          <Music className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
          <p className="font-gujarati text-xl font-bold text-[#3B1111]">
            {t.explore.noResults}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-6 py-2.5 rounded-xl bg-[#8B0000] text-[#FFF8ED] text-xs font-bold border border-[#D4AF37]"
          >
            Reset Search & Filters
          </button>
        </div>
      )}

    </div>
  </div>
);
};
