import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { CategoryPills } from '../components/CategoryPills';
import { PopularSongsCarousel } from '../components/PopularSongsCarousel';
import type { GarbaSummary } from '../types';

interface HomeProps {
  garbas: GarbaSummary[];
  featuredGarba: GarbaSummary;
  onSelectGarba: (garba: GarbaSummary, tab?: 'lyrics' | 'audio') => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigateToGarbas: () => void;
}

export const Home: React.FC<HomeProps> = ({
  garbas,
  featuredGarba,
  onSelectGarba,
  onNavigateToGarbas,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeGarba, setActiveGarba] = useState<GarbaSummary>(featuredGarba);

  // The carousel shows a handful, not all ~500 garbas
  const filteredGarbas = garbas
    .filter((g) => {
      if (selectedCategory === 'All') return true;
      return g.category === selectedCategory || g.tags.includes(selectedCategory);
    })
    .slice(0, 20);

  return (
    <div className="bg-[#800000] text-[#FFF8ED] min-h-screen space-y-10 pb-16">
      
      {/* 1. Hero Section with Navratri 2026 Dates & Sign-In Connection */}
      <Hero
        onExplore={onNavigateToGarbas}
        onBrowseLyrics={() => onSelectGarba(activeGarba, 'lyrics')}
      />

      {/* 2. Horizontal Category Filter Pills Bar */}
      <CategoryPills
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Popular Songs Carousel (Upgraded Sleek Layout) */}
      <PopularSongsCarousel
        garbas={filteredGarbas}
        selectedGarba={activeGarba}
        onSelectGarba={(garba) => {
          setActiveGarba(garba);
          onSelectGarba(garba, 'lyrics');
        }}
        onViewAll={onNavigateToGarbas}
      />

    </div>
  );
};
