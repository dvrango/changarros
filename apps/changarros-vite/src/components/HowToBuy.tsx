import React from 'react';

const STEPS = [
  { n: '01', label: 'Explora', desc: 'Navega el catálogo y encuentra algo especial.' },
  { n: '02', label: 'Escríbenos', desc: 'Contáctanos por WhatsApp con lo que te gustó.' },
  { n: '03', label: 'Recibe', desc: 'Coordinamos entrega o recoge en tienda.' },
];

export const HowToBuy: React.FC = () => {
  return (
    <div className="px-6 pt-8 pb-4 border-t border-stone-100">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-medium mb-5">
        ¿Cómo comprar?
      </p>
      <div className="flex gap-6 sm:gap-10">
        {STEPS.map(({ n, label, desc }) => (
          <div key={n} className="flex-1 min-w-0">
            <span className="font-serif text-3xl text-stone-200 leading-none">{n}</span>
            <p className="text-sm font-medium text-stone-800 mt-1">{label}</p>
            <p className="text-xs text-stone-400 leading-relaxed mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
