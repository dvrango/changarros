'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, MessageCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CategoryRail } from './components/CategoryRail';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
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

  // Conteo de productos por categoría para el CategoryRail
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  // Solo mostrar el rail si hay más de una categoría real
  const showCategoryRail = categories.length > 2;

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
            <h2 className="font-serif text-4xl sm:text-6xl text-stone-800 leading-[0.9] mb-6">
              Curaduría <br />
              <span className="italic text-stone-500">consciente</span> & <br />
              atemporal.
            </h2>

            {/* Address → Google Maps link */}
            {tenant.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(tenant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm group mb-5"
              >
                <MapPin size={13} strokeWidth={1.5} className="flex-shrink-0" />
                <span className="underline decoration-stone-200 decoration-1 underline-offset-4 group-hover:decoration-stone-400">
                  {tenant.address}
                </span>
              </a>
            )}

            {/* WhatsApp CTA */}
            <div className="mt-2">
              <a
                href={`https://wa.me/${tenant.whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-900 text-stone-50 text-sm px-5 py-2.5 rounded-full hover:bg-stone-700 active:scale-95 transition-all duration-150"
              >
                <MessageCircle size={14} strokeWidth={1.5} />
                Contactar por WhatsApp
              </a>
            </div>

            {/* ¿Cómo comprar? */}
            <div className="mt-10 pt-8 border-t border-stone-100">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-medium mb-5">
                ¿Cómo comprar?
              </p>
              <div className="flex gap-6 sm:gap-10">
                {[
                  {
                    n: '01',
                    label: 'Explora',
                    desc: 'Navega el catálogo y encuentra algo especial.',
                  },
                  {
                    n: '02',
                    label: 'Escríbenos',
                    desc: 'Contáctanos por WhatsApp con lo que te gustó.',
                  },
                  {
                    n: '03',
                    label: 'Recibe',
                    desc: 'Coordinamos entrega o recoge en tienda.',
                  },
                ].map(({ n, label, desc }) => (
                  <div key={n} className="flex-1 min-w-0">
                    <span className="font-serif text-3xl text-stone-200 leading-none">
                      {n}
                    </span>
                    <p className="text-sm font-medium text-stone-800 mt-1">{label}</p>
                    <p className="text-xs text-stone-400 leading-relaxed mt-0.5">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCategoryRail && (
          <CategoryRail
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />
        )}

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

      {/* WhatsApp flotante — visible mientras se navega el catálogo */}
      {!selectedProduct && (
        <a
          href={`https://wa.me/${tenant.whatsappPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-stone-900 text-stone-50 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-stone-700 active:scale-95 transition-all duration-150 text-sm font-medium"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={17} strokeWidth={1.5} />
          WhatsApp
        </a>
      )}
    </div>
  );
}
