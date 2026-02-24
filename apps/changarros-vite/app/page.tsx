import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="font-serif text-4xl text-stone-800 mb-3">
          Changarros
        </h1>
        <p className="text-stone-500 text-sm">
          Navega a{" "}
          <span className="font-mono bg-stone-100 px-1 rounded">
            /:nombre-de-tienda
          </span>{" "}
          para ver el catálogo.
        </p>
      </div>
    </div>
  );
}
