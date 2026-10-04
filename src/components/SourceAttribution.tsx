import React from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { LyricsSource } from '../types';

interface SourceAttributionProps {
  source?: LyricsSource;
  onNavigateLibrary?: () => void;
}

export const SourceAttribution: React.FC<SourceAttributionProps> = ({
  source,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-xl mx-auto my-8 bg-[#500000] text-[#FFF8ED] rounded-2xl p-5 md:p-6 shadow-lg border border-[#D4AF37]/50 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#3B1111] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-inner mt-0.5">
          <BookOpen className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-serif-title font-bold text-[#D4AF37] uppercase tracking-wider">
              {t.attribution.sourceLabel || 'Garba Literature'}
            </span>
            {source?.name && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                {source.name}
              </span>
            )}
          </div>
          <p className="text-sm text-[#FFF8ED]/90 font-serif-heading mt-1 leading-relaxed">
            {t.attribution.disclaimer || 'Preserving Gujarati Garba literature and cultural heritage for Navratri.'}
          </p>
        </div>
      </div>

      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState(null, '', '/');
        }}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B1111] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 self-stretch sm:self-auto whitespace-nowrap"
      >
        <span>{t.attribution.viewOriginal || 'GARBA LITERATURE →'}</span>
      </a>
    </div>
  );
};
