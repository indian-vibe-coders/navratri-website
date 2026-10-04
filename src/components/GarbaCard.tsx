import React from 'react';
import { BookOpen, Mic, Heart } from 'lucide-react';
import type { GarbaSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface GarbaCardProps {
  garba: GarbaSummary;
  onSelect: (garba: GarbaSummary, defaultTab?: 'lyrics' | 'audio') => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const GarbaCard: React.FC<GarbaCardProps> = ({
  garba,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const { language, t } = useLanguage();

  const titleText = garba.title[language] || garba.title.gu;
  const subtitleText = language === 'en' ? garba.title.gu : garba.title.en;

  return (
    <div className="bg-[#FFF7E8] rounded-2xl border border-[#D4AF37]/25 shadow-card-elevated hover:shadow-editorial transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1 relative text-[#351010]">
      {/* Artwork Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-[#5A0808]">
        <img
          src={garba.artworkUrl}
          alt={garba.title.en}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#351010]/80 via-transparent to-black/20" />

        {/* Category Tag */}
        <div className="absolute top-3 left-3 bg-[#5A0808]/85 backdrop-blur-sm border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-md shadow-sm">
          <span className="text-[10px] font-semibold text-[#FFF7E8] uppercase tracking-wider">
            {garba.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(garba.id, e)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#5A0808]/80 backdrop-blur-sm border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:scale-105 active:scale-95 transition-all shadow-sm"
          title={isFavorite ? t.lyricsView.favoriteRemoved : t.lyricsView.favoriteAdded}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#B71C1C] text-[#B71C1C]' : 'text-[#FFF7E8]'
            }`}
          />
        </button>

        {/* Voice Reference Badge */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 bg-[#5A0808]/85 backdrop-blur-sm px-2 py-0.5 rounded border border-[#D4AF37]/20 text-[10px] text-[#FFF7E8]">
          <Mic className="w-3 h-3 text-[#D4AF37]" />
          <span className="text-[#D4AF37] font-medium">Voice Reference</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Main Title based on active language */}
          <h3 className={`text-lg font-bold text-[#351010] leading-snug group-hover:text-[#720909] transition-colors ${
            language === 'gu' ? 'font-gujarati' : language === 'hi' ? 'font-hindi' : 'font-serif-heading'
          }`}>
            {titleText}
          </h3>

          {/* Transliteration / Subtitle */}
          <p className="font-serif-heading text-xs font-medium text-[#720909]/80 tracking-wide mt-0.5">
            {subtitleText}
          </p>

          {/* Description */}
          <p className={`text-xs text-[#351010]/75 mt-1.5 line-clamp-2 leading-relaxed ${
            language === 'gu' ? 'font-gujarati' : language === 'hi' ? 'font-hindi' : 'font-sans'
          }`}>
            {garba.description[language] || garba.description.gu}
          </p>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center gap-2">
          {/* Read Lyrics Button */}
          <button
            onClick={() => onSelect(garba, 'lyrics')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#5A0808] text-[#FFF7E8] text-xs font-semibold shadow-sm hover:bg-[#720909] transition-all border border-[#D4AF37]/30"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.featured.readLyrics}</span>
          </button>

          {/* Record Voice Button */}
          <button
            onClick={() => onSelect(garba, 'lyrics')}
            className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-[#FFF7E8] text-[#351010] border border-[#D4AF37]/40 hover:bg-[#5A0808]/10 text-xs font-medium transition-all"
            title={t.voiceRecorder.startRecording}
          >
            <Mic className="w-3.5 h-3.5 text-[#720909]" />
            <span className="hidden sm:inline text-[11px]">{t.featured.listenReference}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

