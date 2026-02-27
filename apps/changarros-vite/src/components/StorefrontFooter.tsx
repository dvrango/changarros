import React from 'react';
import { MapPin } from 'lucide-react';
import { Tenant } from '../types';

interface StorefrontFooterProps {
  tenant: Tenant;
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ tenant }) => {
  const hasContactInfo =
    tenant.address ||
    tenant.socialLinks?.instagram ||
    tenant.socialLinks?.facebook ||
    tenant.socialLinks?.tiktok;

  if (!hasContactInfo) return null;

  return (
    <div className="px-6 mt-16 pb-4">
      {/* Dirección y Redes Sociales */}
      {hasContactInfo && (
        <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-4">
          {tenant.address && (
            <a
              href={
                tenant.mapsUrl ||
                `https://maps.google.com/?q=${encodeURIComponent(tenant.address)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm group"
            >
              <MapPin size={13} strokeWidth={1.5} className="flex-shrink-0" />
              <span className="underline decoration-stone-200 decoration-1 underline-offset-4 group-hover:decoration-stone-400">
                {tenant.address}
              </span>
            </a>
          )}
          {tenant.socialLinks?.instagram && (
            <a
              href={`https://instagram.com/${tenant.socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm group"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="underline decoration-stone-200 decoration-1 underline-offset-4 group-hover:decoration-stone-400">
                @{tenant.socialLinks.instagram}
              </span>
            </a>
          )}
          {tenant.socialLinks?.facebook && (
            <a
              href={`https://facebook.com/${tenant.socialLinks.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm group"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="underline decoration-stone-200 decoration-1 underline-offset-4 group-hover:decoration-stone-400">
                {tenant.socialLinks.facebook}
              </span>
            </a>
          )}
          {tenant.socialLinks?.tiktok && (
            <a
              href={`https://tiktok.com/@${tenant.socialLinks.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm group"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.24 8.24 0 0 0 4.82 1.54V7.07a4.85 4.85 0 0 1-1.05-.38z" />
              </svg>
              <span className="underline decoration-stone-200 decoration-1 underline-offset-4 group-hover:decoration-stone-400">
                @{tenant.socialLinks.tiktok}
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
