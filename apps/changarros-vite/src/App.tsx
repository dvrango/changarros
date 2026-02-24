'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from './components/Navbar';
import { CategoryRail } from './components/CategoryRail';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { BazaarConcierge } from './components/BazaarConcierge';
import { useTenantData } from './lib/useTenantData';
import { Product } from './types';

export default function App() {
  const { tenant, products, categories, loading, error } = useTenantData();
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;
  const productId = params?.productId as string;
  const [selectedCategory, setSelectedCategory] = useState('all');

  const selectedProduct = useMemo(() => {
    if (!productId) return null;
    return products.find((p) => p.id === productId) ?? null;
  }, [productId, products]);

  const handleProductClick = (product: Product) => {
    if (!tenantSlug) return;
    router.push(`/${tenantSlug}/producto/${product.id}`);
  };

  const handleCloseDetail = () => {
    if (!tenantSlug) return;
    router.push(`/${tenantSlug}`);
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 font-serif text-lg italic">
            Cargando tienda...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-serif text-3xl text-stone-800 mb-2">Oops.</p>
          <p className="text-stone-500 text-sm">
            {error ?? 'No se pudo cargar la tienda.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-20">
      <Navbar tenantName={tenant.name} tenantLogo={tenant.logo} />

      <main className="pt-16 max-w-7xl mx-auto">
        {/* Hero Section */}
        {selectedCategory === 'all' && (
          <div className="px-6 py-8 mb-4">
            <h2 className="font-serif text-4xl sm:text-6xl text-stone-800 leading-[0.9] mb-4">
              Curaduría <br />
              <span className="italic text-stone-500">consciente</span> & <br />
              atemporal.
            </h2>
            {tenant.address && (
              <p className="text-stone-500 max-w-md text-sm sm:text-base leading-relaxed">
                {tenant.address}
              </p>
            )}
          </div>
        )}

        <CategoryRail
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="px-6 mt-6">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
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
          whatsappPhone={tenant.whatsappPhone}
          onClose={handleCloseDetail}
        />
      )}

      <BazaarConcierge />
    </div>
  );
}
