import React from 'react';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata = {
  title: 'Bazar NINA',
  description: 'Curaduría consciente & atemporal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-stone-50 text-stone-800 antialiased selection:bg-stone-200 font-sans">
        {children}
      </body>
    </html>
  );
}
