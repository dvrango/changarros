import React, { useEffect, useState, useRef } from "react";
import { Product } from "../types";
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Info,
  Ruler,
  Sparkles,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "../constants";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle scroll effect for the header
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      setIsScrolled(scrollTop > 50);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hola Aura ✨ Me enamoré de este tesoro: ${product.title} ($${product.price}). ¿Aún está disponible?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-4 py-4 border-b border-stone-100 last:border-0">
        <div className="p-2 bg-stone-100 rounded-full text-stone-600">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
            {label}
          </p>
          <p className="text-stone-800 font-light">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-50 flex flex-col animate-in slide-in-from-bottom-10 duration-500">
      {/* Sticky Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-[70] px-4 py-3 flex justify-between items-center transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <button
          onClick={onClose}
          className={`p-3 rounded-full transition-colors ${
            isScrolled
              ? "hover:bg-stone-100 text-stone-800"
              : "bg-white/40 hover:bg-white/60 text-stone-900 backdrop-blur-sm"
          }`}
        >
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>

        <div
          className={`flex gap-2 transition-opacity duration-300 ${isScrolled ? "opacity-100" : "opacity-0"}`}
        >
          <span className="font-serif text-lg text-stone-900 truncate max-w-[150px]">
            {product.title}
          </span>
        </div>

        <button
          className={`p-3 rounded-full transition-colors ${
            isScrolled
              ? "hover:bg-stone-100 text-stone-800"
              : "bg-white/40 hover:bg-white/60 text-stone-900 backdrop-blur-sm"
          }`}
        >
          <Share2 size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32 bg-stone-50"
      >
        {/* Hero Image */}
        <div className="relative h-[65vh] w-full">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-stone-50/20" />
        </div>

        {/* Content Container */}
        <div className="-mt-12 relative z-10">
          <div className="bg-stone-50 pt-8 pb-4 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            {/* Title & Price */}
            <div className="mb-8 px-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 bg-stone-200 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-stone-500 text-sm font-medium uppercase tracking-widest">
                  {product.category}
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 leading-[1.1]">
                  {product.title}
                </h1>
                <p className="text-3xl font-light text-stone-600 mt-2">
                  ${product.price.toLocaleString("es-MX")}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-stone prose-lg text-stone-600 font-light leading-relaxed mb-10 px-6">
              <p>{product.description}</p>
            </div>

            {/* Technical Details Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-10 mx-6">
              <h3 className="font-serif text-xl text-stone-900 mb-4">
                Detalles del objeto
              </h3>
              <DetailItem
                icon={Ruler}
                label="Dimensiones"
                value={product.dimensions}
              />
              <DetailItem
                icon={Sparkles}
                label="Material"
                value={product.material}
              />
              <DetailItem icon={Info} label="Cuidados" value={product.care} />
            </div>

            {/* Image Gallery */}
            {product.images.length > 1 && (
              <div className="space-y-4 mb-8 px-6">
                <h3 className="font-serif text-2xl text-stone-900 px-2">
                  Galería
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {product.images.slice(1).map((img, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden aspect-[4/5] bg-stone-200"
                    >
                      <img
                        src={img}
                        alt={`${product.title} detalle ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mx-6 pt-4 border-t border-stone-200 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-stone-400 bg-stone-100 px-3 py-1.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-stone-100 z-[80]">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="hidden sm:flex flex-col">
            <span className="text-xs text-stone-500 uppercase tracking-wider">
              Total
            </span>
            <span className="font-serif text-xl text-stone-900">
              ${product.price.toLocaleString("es-MX")}
            </span>
          </div>
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-stone-900 text-stone-50 rounded-full py-4 px-6 font-medium text-lg hover:bg-stone-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-stone-900/10"
          >
            <MessageCircle size={20} className="fill-stone-50/20" />
            <span>Lo quiero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
