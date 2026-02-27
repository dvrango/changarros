import React from 'react';

interface NavbarProps {
  tenantName: string;
  tenantLogo?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ tenantName, tenantLogo }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-100 h-16 flex items-center justify-center px-6">
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
    </nav>
  );
};
