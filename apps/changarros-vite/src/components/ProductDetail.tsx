import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { ArrowLeft, MessageCircle, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  whatsappPhone: string;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  whatsappPhone,
  onClose,
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [shared, setShared] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const images = product.images?.length ? product.images : [];
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hola! Me interesa "${product.name}" que vi en tu tienda. ¿Está disponible? 🙌`
    );
    window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      // Must be called synchronously inside the user gesture for Safari iOS
      navigator
        .share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
        .catch(() => {
          /* dismissed */
        });
    } else {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setShared(true);
            setTimeout(() => setShared(false), 2000);
          })
          .catch(() => {
            /* clipboard denied */
          });
      } else {
        // Fallback for HTTP or older browsers
        const el = document.createElement('textarea');
        el.value = url;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    }
  };

  const prevImage = () =>
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () =>
    setActiveImage((i) => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta < 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-stone-50 transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-stone-100 flex-shrink-0">
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Volver</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 text-stone-400 hover:text-stone-700 transition-colors relative"
          aria-label="Compartir"
        >
          <Share2 size={18} strokeWidth={1.5} />
          {shared && (
            <span className="absolute -bottom-6 right-0 text-[10px] text-stone-500 whitespace-nowrap">
              ¡Copiado!
            </span>
          )}
        </button>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Image gallery */}
        <div
          className="relative bg-stone-100 w-full overflow-hidden select-none"
          style={{ aspectRatio: '1 / 1' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.length > 0 ? (
            <>
              <img
                key={activeImage}
                src={images[activeImage]}
                alt={`${product.name} — imagen ${activeImage + 1}`}
                className="w-full h-full object-cover animate-fadeIn"
              />

              {/* Prev / Next arrows */}
              {hasMultiple && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-stone-700 hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={17} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-stone-700 hover:bg-white transition-colors"
                  >
                    <ChevronRight size={17} strokeWidth={1.5} />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hasMultiple && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeImage
                          ? 'w-5 bg-stone-800'
                          : 'w-1.5 bg-stone-400/50 hover:bg-stone-400'
                      }`}
                      aria-label={`Imagen ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image counter badge */}
              {hasMultiple && (
                <span className="absolute top-3 right-3 text-[11px] text-stone-600 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif italic text-xl text-stone-400">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  i === activeImage
                    ? 'border-stone-800 opacity-100'
                    : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* ── Product info ── */}
        <div className="px-5 pt-6 pb-36 space-y-6">

          {/* Category + Name + Price */}
          <div className="space-y-2">
            {product.category && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-medium">
                {product.category}
              </p>
            )}
            <h1 className="font-serif text-[2rem] leading-[1.1] text-stone-900">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl font-light text-stone-800">
                ${product.price.toLocaleString('es-MX')}
              </span>
              <span className="text-xs text-stone-400 font-medium">MXN</span>
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Description */}
          {product.description && (
            <p className="text-stone-600 text-sm leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Details table */}
          {(product.material || product.dimensions || product.care) && (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-medium">
                Detalles
              </p>
              <div className="divide-y divide-stone-100">
                {product.material && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-sm text-stone-400">Material</span>
                    <span className="text-sm text-stone-800 text-right max-w-[60%]">
                      {product.material}
                    </span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-sm text-stone-400">Medidas</span>
                    <span className="text-sm text-stone-800 text-right max-w-[60%]">
                      {product.dimensions}
                    </span>
                  </div>
                )}
                {product.care && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-sm text-stone-400">Cuidados</span>
                    <span className="text-sm text-stone-800 text-right max-w-[60%]">
                      {product.care}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[11px] text-stone-500 border border-stone-200 rounded-full tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-stone-50/95 backdrop-blur-md border-t border-stone-100">
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2.5 bg-stone-900 text-white py-4 rounded-2xl font-medium text-[15px] hover:bg-stone-800 active:scale-[0.98] transition-all duration-150 shadow-sm"
        >
          <MessageCircle size={19} strokeWidth={1.5} />
          Preguntar por WhatsApp
        </button>
      </div>
    </div>
  );
};
