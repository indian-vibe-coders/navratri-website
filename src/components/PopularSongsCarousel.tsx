import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Music2, Flame, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { GarbaSummary } from '../types';

interface PopularSongsCarouselProps {
  garbas: GarbaSummary[];
  selectedGarba: GarbaSummary;
  onSelectGarba: (garba: GarbaSummary) => void;
  onViewAll: () => void;
}

export const PopularSongsCarousel: React.FC<PopularSongsCarouselProps> = ({
  garbas,
  selectedGarba,
  onSelectGarba,
  onViewAll,
}) => {
  const { language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#FFF7E8] tracking-wide">
            {language === 'gu' ? 'લોકપ્રિય ગરબા' : language === 'hi' ? 'लोकप्रिय गरबा' : 'Popular Songs'}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewAll}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:text-[#FFF7E8] transition-colors"
          >
            <span>{language === 'gu' ? 'બધા જુઓ' : language === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full bg-[#5A0808] border border-[#D4AF37]/30 flex items-center justify-center text-[#FFF7E8]/80 hover:text-[#FFF7E8] hover:border-[#D4AF37] transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full bg-[#5A0808] border border-[#D4AF37]/30 flex items-center justify-center text-[#FFF7E8]/80 hover:text-[#FFF7E8] hover:border-[#D4AF37] transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-0.5 scroll-smooth"
      >
        {garbas.map((garba) => {
          const isSelected = selectedGarba.id === garba.id;
          const title = garba.title[language] || garba.title.gu;

          return (
            <button
              key={garba.id}
              onClick={() => onSelectGarba(garba)}
              className={`shrink-0 w-52 sm:w-56 rounded-xl overflow-hidden border transition-all duration-300 text-left group bg-[#FFF7E8] text-[#351010] shadow-card-elevated hover:-translate-y-1 ${
                isSelected
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40'
                  : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/60'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="w-full h-32 relative overflow-hidden bg-[#5A0808]">
                <img
                  src={garba.artworkUrl}
                  alt={garba.title.en}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#351010]/80 via-transparent to-transparent opacity-60" />
                
                {/* Category Pill Tag */}
                <span className="absolute bottom-2 left-2 bg-[#5A0808]/90 text-[#FFF7E8] text-[10px] font-medium px-2 py-0.5 rounded border border-[#D4AF37]/30 backdrop-blur-sm">
                  {garba.category}
                </span>
              </div>

              {/* Title & Info */}
              <div className="p-3 space-y-1">
                <h4 className="font-serif-heading text-sm font-bold text-[#351010] line-clamp-1 group-hover:text-[#720909] transition-colors">
                  {title}
                </h4>
                <div className="flex items-center text-[11px] text-[#351010]/70">
                  <span className="flex items-center gap-1 text-[#720909]">
                    <Music2 className="w-3 h-3 text-[#D4AF37]" />
                    <span className="font-medium">{garba.deity}</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

