import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryRail } from './components/CategoryRail';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { BazaarConcierge } from './components/BazaarConcierge';
import { CATEGORIES, PRODUCTS } from './constants';
import { Product } from './types';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-20">
      <Navbar />
      
      <main className="pt-16 max-w-7xl mx-auto">
        
        {/* Hero Section (Only show on 'all' or when no specific category search intent) */}
        {selectedCategory === 'all' && (
          <div className="px-6 py-8 mb-4">
            <h2 className="font-serif text-4xl sm:text-6xl text-stone-800 leading-[0.9] mb-4">
              Curaduría <br/>
              <span className="italic text-stone-500">consciente</span> & <br/>
              atemporal.
            </h2>
            <p className="text-stone-500 max-w-md text-sm sm:text-base leading-relaxed">
              Objetos con alma para espacios tranquilos. Envíos locales y nacionales.
            </p>
          </div>
        )}

        <CategoryRail 
          categories={CATEGORIES} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />

        <div className="px-6 mt-6">
          {/* Masonry Layout hack for Tailwind */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={setSelectedProduct} 
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-stone-400 italic font-serif text-xl">
                No hay tesoros en esta categoría por ahora.
              </p>
              <button 
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-sm text-stone-800 underline decoration-stone-300 underline-offset-4"
              >
                Ver todo
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Overlays */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      <BazaarConcierge />
      
    </div>
  );
}