import React from 'react';
import { Music2, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import maaDurgaImg from '../assets/maa-durga.jpg';

interface HeroProps {
  onExplore: () => void;
  onBrowseLyrics: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const { language, t } = useLanguage();


  return (
    <div className="relative text-[#FFF7E8] overflow-hidden border-b border-[#D4AF37]/30 min-h-[500px] sm:min-h-[580px] md:min-h-[620px] flex items-center bg-[#5A0808]">
      {/* Background Maa Durga Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={maaDurgaImg} 
          alt="Maa Durga Devotional Background"
          className="w-full h-full object-cover object-[center_top] filter contrast-[1.05] brightness-[0.95]"
        />
      </div>

      {/* Cinematic Vignette & Tonal Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A0505] via-[#5A0808]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A0505]/80 via-transparent to-[#4A0505]/80" />

      {/* Subtle Background Pattern */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] rounded-full border border-[#D4AF37]/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 relative z-10 w-full text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Navratri Festival Date Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#3A0404]/85 border border-[#D4AF37]/40 px-3 sm:px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md max-w-full">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="font-serif-heading text-[10px] sm:text-xs font-semibold text-[#D4AF37] tracking-wider uppercase truncate">
              {language === 'gu'
                ? 'શારદીય નવરાત્રી ૨૦૨૬: ૧૧ – ૨૦ ઓક્ટોબર'
                : language === 'hi'
                ? 'शारदीय नवरात्रि 2026: 11 – 20 अक्टूबर'
                : 'Shardiya Navratri 2026: Oct 11 – Oct 20'}
            </span>
          </div>

          {/* Main Headings */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="font-serif-title text-2xl sm:text-5xl md:text-6xl font-extrabold text-[#FFF7E8] leading-tight tracking-tight drop-shadow-md">
              {t.hero.mainTitle}
            </h1>
            <p className="font-serif-heading text-base sm:text-2xl md:text-3xl text-gold-gradient font-bold tracking-wide">
              {t.hero.subTitle}
            </p>
          </div>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-base md:text-lg text-[#FFF7E8]/90 font-gujarati leading-relaxed max-w-2xl mx-auto">
            {t.hero.description}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto flex items-center justify-center gap-8 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#351010] font-bold text-sm shadow-md hover:brightness-105 transition-all"
            >
              <Music2 className="w-4 h-4 text-[#351010]" />
              <span>{t.hero.ctaExplore}</span>
            </button>
          </div>


          {/* Feature Badges */}
          <div className="pt-8 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-center gap-6 text-xs text-[#FFF7E8]/80 font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Multilingual Garba Literature</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Audio Reference Recordings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Devotional Community</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

