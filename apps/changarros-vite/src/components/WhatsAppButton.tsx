import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phone }) => {
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-stone-900 text-stone-50 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-stone-700 active:scale-95 transition-all duration-150 text-sm font-medium"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={17} strokeWidth={1.5} />
      WhatsApp
    </a>
  );
};
