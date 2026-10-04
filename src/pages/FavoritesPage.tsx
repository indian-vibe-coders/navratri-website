import React, { useState } from 'react';
import { Heart, Search, Music, Sparkles } from 'lucide-react';
import { GarbaCard } from '../components/GarbaCard';
import type { GarbaSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FavoritesPageProps {
  garbas: GarbaSummary[];
  favoriteIds: string[];
  onSelectGarba: (garba: GarbaSummary, tab?: 'lyrics' | 'audio') => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigateToGarbas: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  garbas,
  favoriteIds,
  onSelectGarba,
  isFavorite,
  onToggleFavorite,
  onNavigateToGarbas,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteGarbas = garbas.filter((g) => favoriteIds.includes(g.id));

  const filteredFavorites = favoriteGarbas.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      g.title.gu.toLowerCase().includes(q) ||
      g.title.hi.toLowerCase().includes(q) ||
      g.title.en.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#800000] min-h-screen text-[#FFF8ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Page Header Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto bg-[#6A0000] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#500000] border border-[#D4AF37]/70 flex items-center justify-center text-[#D4AF37]">
                <Heart className="w-4 h-4 fill-current text-[#D4AF37]" />
              </div>
              <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#FFF8ED]">
                {t.favoritesPage.title}
              </h1>
            </div>
            <p className="text-xs text-[#FFF8ED]/80 font-sans">
              Your personal collection of bookmarked Garba lyrics & audio references.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[#3B0505] text-[#D4AF37] px-3 py-1.5 rounded-full border border-[#D4AF37]/40 shadow-inner">
              {favoriteGarbas.length} Saved
            </span>
            <button
              onClick={onNavigateToGarbas}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-extrabold px-4 py-2 rounded-xl shadow-md hover:brightness-110 text-xs transition-all border border-[#FFF8ED]/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3B1111]" />
              <span>Explore More</span>
            </button>
          </div>
        </div>

        {/* Search Bar (Shown if user has favorites) */}
        {favoriteGarbas.length > 0 && (
          <div className="bg-[#6A0000] border-2 border-[#D4AF37]/50 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your saved Garbas..."
                className="w-full bg-[#3B1111] text-[#FFF8ED] placeholder-[#FFF8ED]/60 pl-12 pr-4 py-3 rounded-2xl border-2 border-[#D4AF37]/50 text-sm outline-none font-gujarati font-medium shadow-inner"
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
          </div>
        )}

        {/* Grid or Empty State */}
        {favoriteGarbas.length > 0 ? (
          filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((garba) => (
                <GarbaCard
                  key={garba.id}
                  garba={garba}
                  onSelect={onSelectGarba}
                  isFavorite={isFavorite(garba.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#6A0000]/80 border-2 border-[#D4AF37]/40 rounded-3xl p-10 text-center space-y-3 max-w-md mx-auto">
              <Music className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
              <p className="font-gujarati text-lg font-bold text-[#FFF8ED]">
                No matching Garbas found in your favorites
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2 rounded-xl bg-[#8B0000] text-[#FFF8ED] text-xs font-bold border border-[#D4AF37]"
              >
                Clear Search
              </button>
            </div>
          )
        ) : (
          <div className="bg-[#6A0000] border-2 border-[#D4AF37]/50 rounded-3xl p-12 sm:p-16 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#500000] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] shadow-md">
              <Heart className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-title text-2xl font-bold text-[#FFF8ED]">
                {t.favoritesPage.emptyState}
              </h3>
              <p className="text-xs text-[#FFF8ED]/80 font-sans max-w-md mx-auto leading-relaxed">
                Bookmark your favorite Garbas by clicking the heart icon on any Garba card across the site to build your sacred collection.
              </p>
            </div>
            <button
              onClick={onNavigateToGarbas}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] font-extrabold text-xs shadow-xl hover:brightness-110 transition-all border border-[#FFF8ED]/40 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#3B1111]" />
              <span>{t.favoritesPage.exploreBtn}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

