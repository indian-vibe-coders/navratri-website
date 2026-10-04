import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import navswarLogo from '../assets/navswar_logo.png';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#5A0808] border-t border-[#D4AF37]/30 text-[#FFF7E8] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Col 1: Brand & Cultural Vision */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37]/40 shadow bg-[#351010] p-0.5">
              <img src={navswarLogo} alt="GarbaRaas Emblem" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-serif-title text-xl font-bold text-[#D4AF37] tracking-wide">
              {t.brandName}
            </span>
          </div>
          <p className="text-xs text-[#FFF7E8]/80 font-gujarati leading-relaxed max-w-sm">
            {t.footer.disclaimer}
          </p>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="md:col-span-3 space-y-2">
          <h4 className="font-serif-heading text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
            Navigation
          </h4>
          <ul className="space-y-1.5 text-xs text-[#FFF7E8]/80">
            <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Home</a></li>
            <li><a href="#garbas" className="hover:text-[#D4AF37] transition-colors">Garbas</a></li>
            <li><a href="#library" className="hover:text-[#D4AF37] transition-colors">Library</a></li>
            <li><a href="#about" className="hover:text-[#D4AF37] transition-colors">About Archives</a></li>
          </ul>
        </div>

        {/* Col 3: Source Attribution & Devotional Note */}
        <div className="md:col-span-4 space-y-3 border-t md:border-t-0 md:border-l border-[#D4AF37]/20 pt-6 md:pt-0 md:pl-6">
          <div className="inline-flex items-center gap-2 bg-[#351010] px-3 py-1 rounded-full border border-[#D4AF37]/30 text-xs font-medium text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.attribution.sourceLabel}</span>
          </div>
          <p className="text-xs text-[#FFF7E8]/70 font-serif-heading leading-snug">
            {t.footer.copyright}
          </p>
        </div>

      </div>
    </footer>
  );
};

