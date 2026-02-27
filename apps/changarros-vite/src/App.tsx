'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from './components/Navbar';
import { CategoryRail } from './components/CategoryRail';
import { ProductDetail } from './components/ProductDetail';
import { StorefrontHero } from './components/StorefrontHero';
import { HowToBuy } from './components/HowToBuy';
import { ProductGrid } from './components/ProductGrid';
import { StorefrontFooter } from './components/StorefrontFooter';
import { WhatsAppButton } from './components/WhatsAppButton';
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  const showCategoryRail = categories.length > 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 font-serif text-lg italic">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-serif text-3xl text-stone-800 mb-2">Oops.</p>
          <p className="text-stone-500 text-sm">{error ?? 'No se pudo cargar la tienda.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-20">
      <Navbar tenantName={tenant.name} tenantLogo={tenant.logo} />

      <main className="pt-16 max-w-7xl mx-auto">
        {selectedCategory === 'all' && <StorefrontHero />}
        {selectedCategory === 'all' && <HowToBuy />}

        {showCategoryRail && (
          <CategoryRail
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />
        )}

        <div className="px-6 mt-6">
          <ProductGrid
            products={filteredProducts}
            onProductClick={handleProductClick}
            onClearCategory={() => setSelectedCategory('all')}
          />
        </div>

        {selectedCategory === 'all' && <StorefrontFooter tenant={tenant} />}
      </main>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          whatsappPhone={tenant.whatsappPhone}
          onClose={handleCloseDetail}
        />
      )}

      {!selectedProduct && <WhatsAppButton phone={tenant.whatsappPhone} />}
    </div>
  );
}
