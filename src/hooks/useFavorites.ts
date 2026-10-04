import { useState, useEffect } from 'react';
import { getUserFavorites, saveUserFavorite, removeUserFavorite } from '../lib/apiClient';

export const useFavorites = (userEmail?: string | null) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('navswar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites from DB whenever user signs in with Google
  useEffect(() => {
    if (!userEmail) return;
    let isMounted = true;
    getUserFavorites(userEmail)
      .then((dbFavs) => {
        if (isMounted && dbFavs) {
          setFavorites((prev) => Array.from(new Set([...prev, ...dbFavs])));
        }
      })
      .catch((err) => console.warn('Could not load user favorites from database:', err));

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  useEffect(() => {
    try {
      localStorage.setItem('navswar_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];

      if (userEmail) {
        if (exists) {
          removeUserFavorite(userEmail, id).catch((e) => console.warn('Failed to remove DB favorite:', e));
        } else {
          saveUserFavorite(userEmail, id).catch((e) => console.warn('Failed to save DB favorite:', e));
        }
      }

      return updated;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, setFavorites, toggleFavorite, isFavorite };
};

