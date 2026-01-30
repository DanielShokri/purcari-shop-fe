# GitHib Copilot Instructions for Purcari Israel

This document outlines the coding standards, architectural patterns, and project conventions for the defined workspace.

## 1. Code Style & Language Preferences

- **Frameworks**: React 18.2, TypeScript (Strict), Tailwind CSS 4, Framer Motion 12.
- **Language**: TypeScript is mandatory. Avoid `any`. Use explicit interfaces for all props and data structures (defined in `types.ts`).
- **Component Syntax**:
  - Use `React.FC` with typed props: `const Component: React.FC<Props> = ({ prop }) => { ... }`.
  - Place interfaces immediately above the component definition.
  - Export components as `export default ComponentName`.
  - Use PascalCase for filenames: `ProductCard.tsx`, `HomePage.tsx`.
- **State Management**:
  - Prefer **Redux Toolkit (RTK)** for global state.
  - Use **RTK Query** for all async data fetching (`services/api/*.ts`).
  - Use `useAppDispatch` and `useAppSelector` typed hooks.
- **Imports**: Use the `@` alias for the project root (e.g., `import Component from '@/components/Component'`).

## 2. Architecture & Service Boundaries

- **State Layers**:
  1. **Remote State**: RTK Query slices in `services/api/` (e.g., `productsApi.ts`, `cartRulesApi.ts`).
  2. **Global UI State**: Redux slices in `store/slices/` (`cartSlice.ts`, `uiSlice.ts`).
  3. **Local State**: `useState` only for ephemeral UI logic (e.g., form inputs, open/close toggles).
- **Backend as a Service (BaaS)**: **Appwrite** is the sole backend.
  - Configuration in `services/appwrite.ts`.
  - Database ID: `cms_db`.
  - Collections: `products`, `orders`, `coupons`, `analytics_events`.
- **Data Flow**:
  - Components subscribe to data via RTK Query hooks (e.g., `useGetProductsQuery`).
  - Mutations (updates) trigger automatic cache invalidation via `providesTags`/`invalidatesTags`.

## 3. RTL & Hebrew Localization (CRITICAL)

- **Language**: All user-facing text **MUST** be in Hebrew (עברית).
  - Code comments and variable names remain in English.
  - Brand name "Purcari" remains in English.
- **Layout Direction**: The app runs in `dir="rtl"`.
- **Tailwind CSS for RTL**:
  - **NEVER** use physical properties like `left-`, `right-`, `ml-`, `mr-`.
  - **ALWAYS** use logical properties:
    - `start-0` / `end-0` (positioning)
    - `ms-4` (margin-start), `me-4` (margin-end)
    - `ps-4` (padding-start), `pe-4` (padding-end)
    - `text-start` / `text-end` (alignment)

## 4. Styling & Design System

- **Colors**:
  - Primary: `#1a1a1a` (Dark/Black)
  - Secondary: `#8c2438` (Wine Red - Main Brand)
  - Accent: `#d4af37` (Gold - Luxury)
- **Typography**: `Noto Sans Hebrew` for all text.
- **Conventions**:
  - Use `lucide-react` for icons.
  - Use `framer-motion` for complex animations (page transitions, fade-ins).
  - Currency format: `₪` symbol (e.g., `₪120`).

## 5. Build, Test & Run

- **Package Manager**: NPM
- **Scripts**:
  - Dev: `npm run dev` (Vite, port 3000)
  - Build: `npm run build`
  - Preview: `npm run preview`
- **Environment**:
  - Requires `.env.local` with `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`.

## 6. Security & Auth

- **Authentication**: Managed via Appwrite Account API (`authApi.ts`).
- **Authorization**:
  - Admin features are restricted; the frontend is consumer-facing.
  - Secure login/register flows exist in `pages/LoginPage.tsx` and `components/login/`.

## 7. Common implementation patterns

- **Adding API Endpoints**:
  1. Add endpoint to relevant file in `services/api/` using `injectEndpoints`.
  2. Export the generated and typed hook.
- **Cart Logic**:
  - Cart state persists to `localStorage`.
  - Coupons are validated against cart totals via Appwrite backend logic.
