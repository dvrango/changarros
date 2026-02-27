import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // createdAt puede ser segundos (Firestore) o milisegundos (Date.now())
  const createdAtMs =
    product.createdAt > 1e12 ? product.createdAt : product.createdAt * 1000;
  const isNew = Date.now() - createdAtMs < FOURTEEN_DAYS_MS;

  return (
    <div
      className="group cursor-pointer mb-6 break-inside-avoid"
      onClick={() => onClick(product)}
    >
      <div className="relative overflow-hidden rounded-xl bg-stone-200 mb-3 aspect-[3/4]">
        {/* Shimmer skeleton mientras carga la imagen */}
        {!imageLoaded && product.images?.[0] && (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-shimmer" />
        )}

        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
            <span className="font-serif italic">Sin imagen</span>
          </div>
        )}

        {/* Badge "Nuevo" */}
        {isNew && (
          <span className="absolute top-2.5 left-2.5 text-[10px] uppercase tracking-widest bg-stone-900 text-stone-50 px-2 py-0.5 rounded-full">
            Nuevo
          </span>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      <div className="flex flex-col items-start space-y-0.5 px-1">
        <h3 className="font-serif text-lg text-stone-900 leading-tight group-hover:underline decoration-stone-400 decoration-1 underline-offset-4">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-stone-500">
          ${product.price.toLocaleString('es-MX')}
        </p>
      </div>
    </div>
  );
};
