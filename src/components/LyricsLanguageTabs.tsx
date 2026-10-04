import React from 'react';
import type { Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LyricsLanguageTabsProps {
  activeTab: Language;
  onTabChange: (lang: Language) => void;
}

export const LyricsLanguageTabs: React.FC<LyricsLanguageTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useLanguage();

  const tabs: { id: Language; label: string; sublabel: string }[] = [
    {
      id: 'gu',
      label: 'ગુજરાતી',
      sublabel: t.lyricsView.originalGujarati || 'Original Garba',
    },
    {
      id: 'hi',
      label: 'हिंदी',
      sublabel: t.lyricsView.hindiTranslation || 'Hindi Script',
    },
    {
      id: 'en',
      label: 'English',
      sublabel: t.lyricsView.englishTransliteration || 'English Translation',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto my-6 bg-[#500000] p-1.5 rounded-2xl border border-[#D4AF37]/40 shadow-lg">
      <div className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all duration-200 focus:outline-none min-w-0 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#FFF7E8] to-[#F3E5AB] text-[#3B0A0A] font-bold shadow-md scale-[1.02]'
                  : 'text-[#FFF7E8]/70 hover:text-[#FFF7E8] hover:bg-[#600000]'
              }`}
            >
              <span
                className={`text-base md:text-lg tracking-wide truncate max-w-full ${
                  tab.id === 'gu'
                    ? 'font-gujarati font-bold'
                    : tab.id === 'hi'
                    ? 'font-hindi font-bold'
                    : 'font-serif-title uppercase text-sm font-bold tracking-wider'
                } ${isSelected ? 'text-[#3B0A0A]' : 'text-[#FFF7E8]'}`}
              >
                {tab.label}
              </span>
              <span className={`text-[10px] md:text-xs mt-0.5 truncate max-w-full hidden sm:inline-block ${
                isSelected ? 'text-[#5A0808]/80 font-medium' : 'text-[#FFF8ED]/60'
              }`}>
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
