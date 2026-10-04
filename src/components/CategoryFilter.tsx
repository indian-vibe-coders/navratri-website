import React from 'react';
import type { GarbaCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: GarbaCategory;
  onSelectCategory: (category: GarbaCategory) => void;
}

const CATEGORIES: GarbaCategory[] = [
  'All',
  'Traditional',
  'Devotional',
  '3 Tali',
  'Dodhiyu',
  'Hich',
  'Titoda',
  'Aarti',
  'Dakla',
  'Evergreen',
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const label = cat === 'All' ? t.explore.allCategories : cat;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 focus:outline-none border ${
              isSelected
                ? 'bg-[#D4AF37] text-[#351010] border-[#D4AF37] font-bold shadow-sm'
                : 'bg-[#5A0808]/40 text-[#FFF7E8]/80 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:text-[#FFF7E8]'
            }`}
          >
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

