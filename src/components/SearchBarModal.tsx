import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Play } from 'lucide-react';
import type { Garba, GarbaSummary } from '../types';
import { fetchSongs } from '../lib/apiClient';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarModalProps {
  garbas: GarbaSummary[];
  isOpen: boolean;
  onClose: () => void;
  onSelectGarba: (garba: GarbaSummary, tab?: 'lyrics' | 'audio') => void;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({
  garbas,
  isOpen,
  onClose,
  onSelectGarba,
}) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [remoteResults, setRemoteResults] = useState<GarbaSummary[]>([]);
  const [remoteTotal, setRemoteTotal] = useState(0);
  useEffect(() => {
    const q = query.trim();
    if (!isOpen || q.length < 2) {
      setRemoteResults([]);
      setRemoteTotal(0);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSongs({ q, limit: 25 }, controller.signal)
        .then((res) => {
          setRemoteResults(res.items);
          setRemoteTotal(res.total);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') console.warn('Library search failed:', err);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  const localMatches = query.trim()
    ? garbas.filter((g) => {
        const q = query.toLowerCase();
        return (
          g.title.gu.toLowerCase().includes(q) ||
          g.title.hi.toLowerCase().includes(q) ||
          g.title.en.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.deity.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          ('lyrics' in g && (g as Garba).lyrics.gu.some((l) => l.toLowerCase().includes(q)))
        );
      })
    : garbas.slice(0, 5);

  const localIds = new Set(localMatches.map((g) => g.id));
  const filteredGarbas = [...localMatches, ...remoteResults.filter((g) => !localIds.has(g.id))];
  const resultCount = Math.max(filteredGarbas.length, remoteTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFF7E8] border border-[#D4AF37]/30 rounded-2xl max-w-2xl w-full shadow-devotional overflow-hidden text-[#351010] flex flex-col max-h-[85vh]">
        
        {/* Search Bar Header */}
        <div className="p-4 bg-[#351010] border-b border-[#D4AF37]/25 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.explore.searchBarPlaceholder}
            className="w-full bg-transparent text-[#FFF7E8] placeholder-[#FFF7E8]/50 text-sm outline-none font-gujarati font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#FFF7E8]/70 hover:text-[#FFF7E8] hover:bg-[#5A0808] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <div className="flex items-center justify-between text-xs text-[#720909] font-bold uppercase tracking-wider px-1">
            <span>
              {query
                ? `Search Results (${resultCount > filteredGarbas.length ? `${filteredGarbas.length} of ${resultCount}` : resultCount})`
                : 'Popular Garbas'}
            </span>
            <span className="text-[10px] text-[#351010]/60 font-sans">ESC to close</span>
          </div>

          {filteredGarbas.length > 0 ? (
            filteredGarbas.map((garba) => {
              const titleText = garba.title[language] || garba.title.gu;
              const secondaryTitle = language === 'en' ? garba.title.gu : garba.title.en;

              return (
                <div
                  key={garba.id}
                  className="bg-[#FFF7E8] p-3 rounded-xl border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 shadow-card-elevated hover:shadow-editorial transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#D4AF37]/30 shrink-0 bg-[#5A0808]">
                      <img src={garba.artworkUrl} alt={garba.title.en} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-bold text-sm text-[#351010] truncate ${
                        language === 'gu' ? 'font-gujarati' : language === 'hi' ? 'font-hindi' : 'font-serif-heading'
                      }`}>
                        {titleText}
                      </h4>
                      <p className="font-serif-heading text-xs text-[#720909]/80 truncate">
                        {secondaryTitle} • <span className="font-sans text-[10px] text-[#351010]/70">{garba.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onSelectGarba(garba, 'lyrics');
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5A0808] text-[#FFF7E8] text-xs font-semibold hover:bg-[#720909] transition-colors border border-[#D4AF37]/30"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Lyrics</span>
                    </button>
                    {'audioReference' in garba && (garba as Garba).audioReference && (
                      <button
                        onClick={() => {
                          onSelectGarba(garba, 'audio');
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF7E8] text-[#351010] text-xs font-medium border border-[#D4AF37]/30 hover:bg-[#5A0808]/10 transition-colors"
                        title="Listen to audio reference"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-[#720909]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-[#351010]/70 font-gujarati">
              <p className="text-sm font-bold">{t.explore.noResults}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

