# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bazar Aura is a **multi-tenant e-commerce platform** for artisanal/vintage product sellers ("changarros" — small shops). It consists of two Next.js apps in an **Nx monorepo**.

- **Storefront** (`apps/changarros-vite`): Customer-facing product showcase with an AI-powered shopping assistant ("Aura") powered by Gemini.
- **Admin** (`apps/admin`): Inventory management, lead tracking, and WhatsApp order integration for shop owners.

## Commands

From the repo root (uses Nx):

```bash
# Development
npm run dev                # Start storefront dev server
npm run dev:admin          # Start admin dev server

# Build
npm run build              # Build storefront
npm run build:admin        # Build admin
npm run build:all          # Build both apps

# Lint (per app)
cd apps/admin && npm run lint
```

No test runner is configured.

## Architecture

### Tech Stack

- **Framework**: Next.js 16 + React 19 (both apps)
- **Backend**: Firebase (Firestore, Auth, Storage) — project ID `changarros-2474c`
- **AI**: Google Generative AI (`@google/genai`) with `gemini-2.0-flash-preview`
- **Styling**: Tailwind CSS 3 with custom palettes per app
- **Build system**: Nx 22 (monorepo task orchestration)

### Firestore Data Model

```
tenants/{tenantId}
  memberships/{userId}   — role: 'owner' | 'admin' | 'staff'
  products/{productId}
  leads/{leadId}         — status: 'new' | 'contacted' | 'closed'
users/{userId}           — global user profiles
```

Tenants are identified by a `slug` field used as the URL path in the storefront (e.g., `/:tenantSlug`).

### Storefront (`apps/changarros-vite`)

- Entry: `src/App.tsx` — React Router routes: `/:tenantSlug`, `/:tenantSlug/producto/:productId`
- Data fetching: `src/lib/useTenantData.ts` — single hook that loads tenant + products from Firestore
- AI concierge: `src/services/geminiService.ts` feeds product catalog into Gemini context; `BazaarConcierge` component is the chat UI
- Categories are derived dynamically from products (no separate collection)
- UI is primarily in Spanish

### Admin (`apps/admin`)

- Entry: `src/app/layout.tsx` — wraps everything in `AuthProvider`
- Auth: `src/lib/auth.tsx` — Firebase Auth context; `isPlatformAdmin` flag gates superuser access via `NEXT_PLATFORM_ADMIN_EMAIL`
- Multi-tenant switching: users can belong to multiple tenants via `memberships`
- Leads are linked to WhatsApp order flow

### Security

- Firestore rules in `firestore.rules` enforce tenant isolation — public read on storefronts, write restricted to authenticated tenant members
- Storage rules in `storage.rules`

### Environment Variables

Both apps use `NEXT_PUBLIC_FIREBASE_*` keys. The admin also requires:

- `NEXT_PLATFORM_ADMIN_EMAIL` — email that gets platform-wide admin access
- `NEXT_PUBLIC_STOREFRONT_URL` — base URL for storefront links
- `NEXT_PUBLIC_GEMINI_API_KEY` — Gemini API access (storefront)

### Code Style

- Prettier: `singleQuote: true`
- ESLint flat config (`eslint.config.mjs`) with `@nx/eslint-plugin`, `@next/eslint-plugin-next`, and standard React rules
