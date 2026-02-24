import React from 'react';
import { Category } from '../types';

interface CategoryRailProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryRail: React.FC<CategoryRailProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-6 pl-6 bg-stone-50 sticky top-16 z-30">
      <div className="flex space-x-3 pr-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`
              whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
              ${selectedCategory === cat.id 
                ? 'bg-stone-800 text-stone-50 border-stone-800 shadow-md transform scale-105' 
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};