import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onClearCategory: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
  onClearCategory,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400 italic font-serif text-xl">
          No hay tesoros en esta categoría por ahora.
        </p>
        <button
          onClick={onClearCategory}
          className="mt-4 text-sm text-stone-800 underline decoration-stone-300 underline-offset-4"
        >
          Ver todo
        </button>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={onProductClick} />
      ))}
    </div>
  );
};
