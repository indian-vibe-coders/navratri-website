import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';

import navswarLogo from '../assets/navswar_logo.png';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  favoritesCount,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });


  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'garbas', label: t.nav.garbas },
    { id: 'library', label: t.nav.library },
    { id: 'favorites', label: t.nav.favorites, badge: favoritesCount },
    { id: 'about', label: t.nav.about },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'gu', label: 'ગુજરાતી' },
    { id: 'hi', label: 'हिंदी' },
    { id: 'en', label: 'English' },
  ];

  // Update sliding gold line indicator whenever activeTab or window resizes
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = navItemRefs.current[activeTab];
      const containerEl = navContainerRef.current;
      if (activeEl && containerEl) {
        const activeRect = activeEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        setIndicatorStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        });
      } else {
        setIndicatorStyle({ left: 0, width: 0 });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, language, favoritesCount]);

  return (
    <header className="sticky top-0 z-40 bg-[#5A0808] border-b border-[#D4AF37]/30 shadow-md text-[#FFF7E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* LEFT: Logo & Branding */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group text-left focus:outline-none flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#D4AF37]/60 shadow-md group-hover:scale-105 transition-transform bg-[#3B0505] p-0.5">
              <img src={navswarLogo} alt="GarbaRaas Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="font-serif-title text-xl sm:text-2xl font-extrabold text-[#FFF8ED] tracking-wide block leading-tight group-hover:text-[#D4AF37] transition-colors">
                {t.brandName}
              </span>
              <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-[0.22em] block opacity-85 mt-0.5">
                SONGS • LYRICS • BHAKTI
              </span>
            </div>
          </button>

          {/* CENTER: Text Navigation Links with Smooth Sliding Golden Underline */}
          <nav ref={navContainerRef} className="hidden md:flex items-center gap-6 lg:gap-8 relative">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    navItemRefs.current[item.id] = el;
                  }}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 text-sm font-medium tracking-wide transition-colors duration-250 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#D4AF37] font-bold'
                      : 'text-[#FFF8ED]/80 hover:text-[#D4AF37]'
                  }`}
                >
                  <span>{item.label}</span>

                  {/* Favorites Count Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#8B0000] text-[#D4AF37] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#D4AF37]/60">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Smooth Sliding Active Gold Underline Accent */}
            <span
              className="absolute bottom-0 h-[2.5px] bg-gradient-to-r from-[#D4AF37]/40 via-[#D4AF37] to-[#D4AF37]/40 rounded-full transition-all duration-300 ease-out pointer-events-none shadow-[0_0_8px_rgba(212,175,55,0.6)]"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.width > 0 ? 1 : 0,
              }}
            />
          </nav>

          {/* RIGHT: Language Selector, Clean Search Icon & Sign In */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            
            {/* 1. Language Selector: Clean inline text with gold vertical dividers */}
            <div className="flex items-center text-xs text-[#FFF8ED]/70 font-medium">
              {languages.map((lang, idx) => (
                <React.Fragment key={lang.id}>
                  {idx > 0 && <span className="text-[#D4AF37]/40 mx-2 font-normal">|</span>}
                  <button
                    onClick={() => setLanguage(lang.id)}
                    className={`transition-colors py-1 ${
                      language === lang.id
                        ? 'text-[#D4AF37] font-bold underline underline-offset-4 decoration-[#D4AF37]/80'
                        : 'hover:text-[#FFF8ED]'
                    }`}
                  >
                    {lang.label}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Subtle Vertical Divider */}
            <div className="h-4 w-[1px] bg-[#D4AF37]/30" />

            {/* 2. Search Icon Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-[#FFF8ED]/85 hover:text-[#D4AF37] hover:bg-[#800000]/40 transition-all focus:outline-none"
              title="Search Garbas"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* MOBILE / TABLET UTILITY BAR */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#FFF8ED]/90 hover:text-[#D4AF37]"
            >
              <Search className="w-5 h-5" />
            </button>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#FFF8ED] hover:text-[#D4AF37]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#4A0505] border-b border-[#D4AF37]/40 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#700000] text-[#D4AF37] font-bold border-l-2 border-[#D4AF37]'
                      : 'text-[#FFF8ED]/85 hover:text-[#FFF8ED] hover:bg-[#600000]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#8B0000] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Language Selector */}
          <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
            <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Language
            </span>
            <div className="flex items-center gap-2 text-xs">
              {languages.map((lang, idx) => (
                <React.Fragment key={lang.id}>
                  {idx > 0 && <span className="text-[#D4AF37]/30">|</span>}
                  <button
                    onClick={() => setLanguage(lang.id)}
                    className={`py-1 ${
                      language === lang.id
                        ? 'text-[#D4AF37] font-bold underline'
                        : 'text-[#FFF8ED]/70'
                    }`}
                  >
                    {lang.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>

  );
};

