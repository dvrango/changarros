import React from 'react';
import { Menu, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  tenantName: string;
  tenantLogo?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ tenantName, tenantLogo }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-100 h-16 flex items-center justify-between px-6 transition-all duration-300">
      <button className="p-2 -ml-2 text-stone-600 hover:text-stone-900 transition-colors">
        <Menu size={24} strokeWidth={1.5} />
      </button>

      <div className="flex flex-col items-center">
        {tenantLogo ? (
          <img
            src={tenantLogo}
            alt={tenantName}
            className="h-8 max-w-[120px] object-contain"
          />
        ) : (
          <h1 className="font-serif text-2xl tracking-tight text-stone-900">
            {tenantName}
          </h1>
        )}
      </div>

      <button className="p-2 -mr-2 text-stone-600 hover:text-stone-900 transition-colors relative">
        <ShoppingBag size={24} strokeWidth={1.5} />
        <span className="absolute top-2 right-1 w-2 h-2 bg-bazaar-clay rounded-full" />
      </button>
    </nav>
  );
};
