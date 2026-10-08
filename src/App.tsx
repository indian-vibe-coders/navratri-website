import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchBarModal } from './components/SearchBarModal';
import { LyricsViewer } from './components/LyricsViewer';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AddGarbaModal } from './components/AddGarbaModal';
import { Home } from './pages/Home';
import { GarbasPage } from './pages/GarbasPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage } from './pages/AboutPage';
import { LibraryPage } from './pages/LibraryPage';
import { GARBAS_DATA } from './data/garbas';
import type { Garba, GarbaSummary } from './types';
import { useFavorites } from './hooks/useFavorites';
import { fetchSong, fetchSongs, postGarba } from './lib/apiClient';
import { getGarbaSlug, parseIdFromSlug } from './utils/slug';

type ReturnTab = 'home' | 'garbas' | 'library' | 'favorites';

declare global {
  interface Window {
    __NOT_FOUND__?: boolean;
    __DB_ERROR__?: boolean;
  }
}

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedGarba, setSelectedGarba] = useState<Garba | null>(null);
  const [defaultTab, setDefaultTab] = useState<'lyrics' | 'audio'>('lyrics');
  const [returnTab, setReturnTab] = useState<ReturnTab>('garbas');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddGarbaOpen, setIsAddGarbaOpen] = useState(false);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  // Navratri garbas from the API (summaries only; lyrics load when a song is opened)
  const [remoteGarbas, setRemoteGarbas] = useState<GarbaSummary[]>([]);
  // Favorited songs from other library sections, which aren't in the Navratri list
  const [extraFavorites, setExtraFavorites] = useState<GarbaSummary[]>([]);

  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites(user?.email);

  // Load garba specified in URL (/garba/:slug) on mount or popstate
  const loadSongFromPath = useCallback(async (path: string) => {
    if (window.__NOT_FOUND__) {
      setNotFoundError(true);
      return;
    }

    if (path.startsWith('/garba/')) {
      const cleanPath = path.split('?')[0].split('#')[0];
      const rawSlug = cleanPath.replace(/^\/garba\//, '').replace(/\/+$/, '');
      if (!rawSlug) return;
      const slug = decodeURIComponent(rawSlug).trim();

      const builtinIds = GARBAS_DATA.map((g) => g.id);
      const targetId = parseIdFromSlug(slug, builtinIds);

      const builtin = GARBAS_DATA.find(
        (g) =>
          g.id.toLowerCase() === targetId.toLowerCase() ||
          g.id.toLowerCase() === slug.toLowerCase() ||
          g.slug?.toLowerCase() === slug.toLowerCase(),
      );

      if (builtin) {
        setSelectedGarba(builtin);
        setActiveTab('lyrics');
        setNotFoundError(false);
        return;
      }

      try {
        const song = await fetchSong(slug);
        setSelectedGarba(song);
        setActiveTab('lyrics');
        setNotFoundError(false);
      } catch {
        // Fallback try with targetId if slug fetch fails
        try {
          if (targetId && targetId !== slug) {
            const song = await fetchSong(targetId);
            setSelectedGarba(song);
            setActiveTab('lyrics');
            setNotFoundError(false);
            return;
          }
        } catch {
          // ignore
        }
        setNotFoundError(true);
      }
    } else {
      setNotFoundError(false);
    }
  }, []);

  useEffect(() => {
    loadSongFromPath(window.location.pathname);

    const handlePopState = () => {
      loadSongFromPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadSongFromPath]);

  useEffect(() => {
    fetchSongs({ collection: 'navratri', limit: 1000 })
      .then(({ items }) => {
        const builtinIds = new Set(GARBAS_DATA.map((g) => g.id));
        setRemoteGarbas(items.filter((g) => !builtinIds.has(g.id)));
      })
      .catch((err) => {
        console.warn('Garba API fetch failed, showing built-in collection only:', err);
      });
  }, []);

  // Built-ins ship with full lyrics in the bundle, so they come first and open instantly
  const allGarbas: GarbaSummary[] = [...GARBAS_DATA, ...remoteGarbas];
  const featuredGarba = GARBAS_DATA.find((g) => g.id === 'amba-abhay-pad-dayini') || GARBAS_DATA[0];

  const missingFavoriteIds = favorites
    .filter((id) => !allGarbas.some((g) => g.id === id))
    .join(',');
  useEffect(() => {
    if (!missingFavoriteIds) {
      setExtraFavorites([]);
      return;
    }
    const ids = missingFavoriteIds.split(',');
    fetchSongs({ ids, limit: ids.length })
      .then(({ items }) => setExtraFavorites(items))
      .catch((err) => console.warn('Failed to load favorite songs:', err));
  }, [missingFavoriteIds]);

  // Select Garba: Open lyrics and audio player (public to all users)
  const handleSelectGarba = async (
    garba: GarbaSummary | Garba,
    tab: 'lyrics' | 'audio' = 'lyrics',
    skipPushState = false,
  ) => {
    if (activeTab !== 'lyrics') setReturnTab(activeTab as ReturnTab);

    let full: Garba;
    if ('lyrics' in garba) {
      full = garba;
    } else {
      setLoadingSongId(garba.id);
      try {
        full = await fetchSong(garba.id);
      } catch (e) {
        alert(`Could not load this song: ${(e as Error).message}`);
        return;
      } finally {
        setLoadingSongId(null);
      }
    }

    const slug = full.slug || getGarbaSlug(full);
    if (!skipPushState && window.location.pathname !== `/garba/${slug}`) {
      window.history.pushState({ navSwarPushed: true, garbaId: full.id }, '', `/garba/${slug}`);
    }

    setSelectedGarba(full);
    setDefaultTab(tab);
    setActiveTab('lyrics');
    setNotFoundError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close / Back button handling for lyrics view
  const handleCloseGarba = () => {
    if (window.history.state?.navSwarPushed) {
      window.history.back();
    } else {
      window.history.pushState(null, '', '/');
      setSelectedGarba(null);
      setActiveTab(returnTab || 'garbas');
    }
  };

  const goTo = (tab: string) => {
    if (activeTab === 'lyrics' && tab !== 'lyrics') {
      if (window.history.state?.navSwarPushed) {
        window.history.back();
      } else {
        window.history.pushState(null, '', '/');
      }
    }
    setActiveTab(tab);
    setSelectedGarba(null);
    setNotFoundError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('Please sign in to save your favorite Garbas!');
      return;
    }
    toggleFavorite(id);
  };

  const handleAddCustomGarba = async (newGarba: Garba): Promise<boolean> => {
    try {
      const saved = await postGarba(newGarba, user?.email);
      setRemoteGarbas((prev) => [saved, ...prev]);
      handleSelectGarba(saved, 'lyrics');
      return true;
    } catch (e) {
      alert(`Could not publish your Garba: ${(e as Error).message}`);
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8ED] text-[#3B1111] antialiased">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'favorites' && !isAuthenticated) {
            openAuthModal('Please sign in to access your favorite Garbas!');
            return;
          }
          goTo(tab);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {notFoundError ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
            <div className="w-20 h-20 rounded-full bg-[#D97706]/10 flex items-center justify-center mb-6 text-[#D97706] text-4xl font-serif">
              🪔
            </div>
            <h1 className="text-3xl font-serif text-[#3B1111] mb-3">Garba Not Found / ગરબા મળ્યો નથી</h1>
            <p className="text-gray-600 max-w-md mb-8">
              The garba lyrics you are looking for do not exist or may have been moved. Discover our collection of authentic Gujarati Garbas.
            </p>
            <button
              onClick={() => {
                setNotFoundError(false);
                if (window.history.state?.navSwarPushed) {
                  window.history.back();
                } else {
                  window.history.pushState(null, '', '/');
                }
                setActiveTab('garbas');
                setSelectedGarba(null);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              Explore All Garbas
            </button>
          </div>
        ) : (
          <div key={activeTab} className="animate-in fade-in duration-300 ease-in-out">
            {activeTab === 'home' && (
              <Home
                garbas={allGarbas}
                featuredGarba={featuredGarba}
                onSelectGarba={handleSelectGarba}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onNavigateToGarbas={() => goTo('garbas')}
              />
            )}

            {activeTab === 'garbas' && (
              <GarbasPage
                garbas={allGarbas}
                onSelectGarba={handleSelectGarba}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onOpenAddGarba={() => {
                  if (!isAuthenticated) {
                    openAuthModal('Please sign in with Google to publish your custom Garba!');
                    return;
                  }
                  setIsAddGarbaOpen(true);
                }}
              />
            )}

            {activeTab === 'lyrics' && (
              <LyricsViewer
                garba={selectedGarba || featuredGarba}
                onBack={handleCloseGarba}
                isFavorite={isFavorite((selectedGarba || featuredGarba).id)}
                onToggleFavorite={handleToggleFavorite}
                defaultTab={defaultTab}
              />
            )}

            {activeTab === 'library' && (
              <LibraryPage
                onSelectGarba={handleSelectGarba}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                loadingSongId={loadingSongId}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoritesPage
                garbas={[...allGarbas, ...extraFavorites]}
                favoriteIds={favorites}
                onSelectGarba={handleSelectGarba}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onNavigateToGarbas={() => goTo('garbas')}
              />
            )}

            {activeTab === 'about' && <AboutPage />}
          </div>
        )}
      </main>

      {/* Global Search Modal */}
      <SearchBarModal
        garbas={allGarbas}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectGarba={handleSelectGarba}
      />

      {/* Add Custom Garba Modal */}
      <AddGarbaModal
        isOpen={isAddGarbaOpen}
        onClose={() => setIsAddGarbaOpen(false)}
        onAddGarba={handleAddCustomGarba}
      />

      {/* Devotional Google Sign-In Modal Portal */}
      <GoogleAuthModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
