import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      className="group cursor-pointer mb-6 break-inside-avoid"
      onClick={() => onClick(product)}
    >
      <div className="relative overflow-hidden rounded-xl bg-stone-200 mb-3 aspect-[3/4]">
        <img 
          src={product.images[0]} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      
      <div className="flex flex-col items-start space-y-0.5 px-1">
        <h3 className="font-serif text-lg text-stone-900 leading-tight group-hover:underline decoration-stone-400 decoration-1 underline-offset-4">
          {product.title}
        </h3>
        <p className="text-sm font-medium text-stone-500">
          ${product.price.toLocaleString('es-MX')}
        </p>
      </div>
    </div>
  );
};