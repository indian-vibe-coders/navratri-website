import React from 'react';
import { BookOpen, Mic, Heart, Star, Sparkles } from 'lucide-react';
import type { Garba } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FeaturedGarbaCardProps {
  garba: Garba;
  onSelect: (garba: Garba, defaultTab?: 'lyrics' | 'audio') => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FeaturedGarbaCard: React.FC<FeaturedGarbaCardProps> = ({
  garba,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const { language, t } = useLanguage();

  const titleText = garba.title[language] || garba.title.gu;
  const secondaryTitle = language === 'en' ? garba.title.gu : garba.title.en;

  return (
    <div className="relative bg-[#5A0808] rounded-2xl border border-[#D4AF37]/30 p-6 sm:p-8 shadow-devotional overflow-hidden text-[#FFF7E8]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
        
        {/* Left Artwork Showcase */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-lg group">
            <img
              src={garba.artworkUrl}
              alt={garba.title.en}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#351010]/80 via-transparent to-black/20" />

            {/* Featured Badge */}
            <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#351010] px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{t.featured.badge}</span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => onToggleFavorite(garba.id, e)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#351010]/80 backdrop-blur-md border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] hover:scale-105 active:scale-95 transition-all shadow-md"
              title={isFavorite ? t.lyricsView.favoriteRemoved : t.lyricsView.favoriteAdded}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-[#B71C1C] text-[#B71C1C]' : 'text-[#FFF7E8]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/15 px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.featured.badge}</span>
            </div>

            {/* Main Title based on active language */}
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFF7E8] leading-tight ${
              language === 'gu' ? 'font-gujarati' : language === 'hi' ? 'font-hindi' : 'font-serif-title'
            }`}>
              {titleText}
            </h2>

            {/* Transliteration & Hindi Titles */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm pt-0.5 text-[#FFF7E8]/80">
              <span className="font-hindi text-[#D4AF37] font-semibold">
                {garba.title.hi}
              </span>
              <span>•</span>
              <span className="font-serif-heading font-medium tracking-wide">
                {secondaryTitle}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className={`text-xs sm:text-sm text-[#FFF7E8]/85 leading-relaxed max-w-2xl ${
            language === 'gu' ? 'font-gujarati' : language === 'hi' ? 'font-hindi' : 'font-sans'
          }`}>
            {garba.description[language] || garba.description.gu}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onSelect(garba, 'lyrics')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#351010] font-bold text-xs shadow-md hover:brightness-105 transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#351010]" />
              <span>{t.featured.readLyrics}</span>
            </button>

            <button
              onClick={() => onSelect(garba, 'lyrics')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#351010]/80 text-[#FFF7E8] font-semibold text-xs border border-[#D4AF37]/40 hover:bg-[#6A0909] transition-all"
            >
              <Mic className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.featured.listenReference}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

