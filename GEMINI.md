# Purcari Israel - Project Context

## 1. Project Overview
**Purcari Israel** is a premium ecommerce storefront for Purcari Winery, tailored specifically for the Israeli market. It is a **React** application built with **Vite** and backed by **Appwrite Cloud**.

### Key Characteristics
*   **Language:** Hebrew (עברית) - **RTL (Right-to-Left)** layout is mandatory.
*   **Currency:** Israeli Shekel (₪).
*   **Design:** Premium, dark-themed (Primary: `#1a1a1a`, Secondary: `#8c2438`, Accent: `#d4af37`).
*   **Backend:** Appwrite (Auth, Database, Storage).
*   **State Management:** Redux Toolkit & RTK Query.

## 2. Tech Stack & Dependencies
*   **Framework:** React 18 + TypeScript
*   **Build Tool:** Vite 6
*   **Styling:** Tailwind CSS v4 + Framer Motion
*   **State:** `@reduxjs/toolkit`, `react-redux`
*   **Backend SDK:** `appwrite`
*   **Routing:** `react-router-dom` v6
*   **Forms:** `react-hook-form` + `zod`
*   **Icons:** `lucide-react`

## 3. Architecture & Structure
The project follows a feature-based folder structure:

```text
/
├── components/         # UI Components (split by domain: home, checkout, etc.)
├── pages/              # Route-level page components (e.g., HomePage, ShopPage)
├── services/           # Backend integration
│   ├── appwrite.ts     # Appwrite client & config
│   └── api/            # RTK Query API slices (productsApi, etc.)
├── store/              # Redux setup
│   ├── hooks.ts        # Typed hooks (useAppDispatch, useAppSelector)
│   └── slices/         # Redux slices (cartSlice, uiSlice)
├── theme/              # Design tokens and global styles
├── types.ts            # Shared TypeScript interfaces (Product, Order, etc.)
└── .cursor/rules/      # Project-specific coding rules (RTL, Redux patterns)
```

## 4. Key Workflows & Patterns

### Data Fetching (RTK Query)
API interactions are handled via RTK Query in `services/api/`.
*   **Pattern:** Define endpoints in an API slice (e.g., `productsApi`).
*   **Usage:** Use auto-generated hooks in components (e.g., `useGetProductsQuery`).
*   **Appwrite Integration:** The `queryFn` interacts directly with Appwrite's `databases` SDK.

### Appwrite Configuration (`services/appwrite.ts`)
*   **Database ID:** `cms_db`
*   **Collections:** `products`, `categories`, `orders`, `order_items`, `coupons`.
*   **Environment Variables:** `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`.

### RTL & Styling
*   **Crucial:** Use **Logical Properties** for Tailwind classes to ensure correct RTL behavior.
    *   ✅ Use: `ms-4` (margin-start), `pe-4` (padding-end), `start-0` (left in LTR, right in RTL).
    *   ❌ Avoid: `ml-4`, `pr-4`, `left-0`.
*   **Text:** All UI text must be in **Hebrew**. Variable names remain English.

### Type System (`types.ts`)
*   **Product:** Contains `productName` (English) and `productNameHe` (Hebrew). Use Hebrew fields for display.
*   **Cart/Order:** Strict typing for checkout flow and order validation.

### Cart Rules & Calculation Engine
*   **Dynamic Rules:** Fetched via `cartRulesApi` from the `cart_rules` collection in Appwrite.
*   **Calculation:** `calculateCartTotals` utility applies rules (shipping, restrictions, benefits, discounts) to cart items.
*   **Selectors:** Redux selectors (e.g., `selectCartSummary`) leverage `cartRulesApi` state to compute final totals and validation errors.

## 5. Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server (Port 3001) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 6. Important Context Rules
*   **Hebrew First:** When adding content or UI elements, default to Hebrew.
*   **RTL Awareness:** Always check if a styling change impacts directionality.
*   **Strict Types:** Maintain strict TypeScript compliance; avoid `any`.
*   **Appwrite Schema:** Respect the document structure defined in `types.ts` when interacting with the backend.
