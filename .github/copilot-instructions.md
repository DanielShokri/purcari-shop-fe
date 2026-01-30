# Project Guidelines

## Code Style
- **Framework**: React 19 + TypeScript (Strict mode).
- **Component Pattern**: Use functional components with `export default function ComponentName()`.
- **Props**: Define component props interfaces inline for simple components or exported from `*.types.ts` files for complex data.
- **RTL & Language**: 
  - The application is **Hebrew first** and **RTL** (`dir="rtl"`).
  - Use Hebrew for all UI labels, error messages (`'שגיאה בהתחברות'`), and buttons.
  - Use `dir="ltr"` specifically for technical data like email addresses, dates using `type="date"`, or English text.
  - Charts (Recharts) require a container with `style={{ direction: 'ltr' }}`.
- **UI Library**: **Chakra UI v3**. Use the new compound component syntax (e.g., `Card.Root`, `Table.Root`, `Table.Header`, `Checkbox.Root`). Avoid v2 syntax (`<Table>`, `<thead`> etc directly).
- **Imports**: Use the `@/` alias for project root imports.

## Architecture
- **State Management**: **Redux Toolkit** with **RTK Query** is mandated for all data fetching.
  - API logic resides in `services/api/` and uses `fakeBaseQuery()` to wrap Appwrite SDK calls.
  - Do NOT use `useEffect` for data fetching.
  - Global UI state (like Auth) is managed in Redux slices (`store.ts`).
- **Backend Service**: **Appwrite** (Cloud).
  - Use the SDK configured in `@/services/appwrite.ts`.
  - Database, Storage, and Authentication are all handled via Appwrite.
- **Routing**: React Router DOM v7 (configured with `HashRouter` pattern for deployment compatibility).
- **Forms**: `react-hook-form` is the standard for form handling.

## Build and Test
- **Build Tool**: Vite 6 (`vite.config.ts`).
- **Commands**:
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Preview: `npm run preview`
- **Linting**: TypeScript strict checks are enabled.

## Project Conventions
- **Appwrite Configuration**: Always import `APPWRITE_CONFIG` from `@/services/appwrite.ts` to reference Collection IDs, Database IDs, and Function IDs. **Never hardcode IDs.**
- **Type Definitions**:
  - Suffix type files with `.types.ts`.
  - Central export file is `types/index.ts`.
  - Prefer `interface` over `type`.
  - Appwrite documents must include `$id`, `$createdAt`, and `$updatedAt`.
- **Navigation**: Update `components/layout-parts/routeConfig.ts` when adding new pages or sidebar items.
- **Icons**: Use Material Symbols Outlined via `className="material-symbols-outlined"`.
- **Error Handling**:
  - API errors should return `{ error: error.message }` to be handled by RTK Query.
  - UI should display user-friendly Hebrew error messages.
  - Wrap `localStorage` access in `try/catch` (or use the `safeLocalStorage` helper in `store.ts` pattern).

## Integration Points
- **Appwrite Collections**:
  - Uses `APPWRITE_CONFIG.DATABASE_ID` ('cms_db').
  - Key Collections: `products`, `orders`, `users`, `categories`, `coupons`, `cart_rules`, `analytics_events`.
- **Cloud Functions**:
  - User management (create, delete, update labels) is handled via the `users-management` Cloud Function (ID: `APPWRITE_CONFIG.FUNCTION_USERS`).
  - Do not attempt to modify users directly from the client side using the Account API for admin tasks; use the functions API wrapper in `services/appwrite.ts` (`usersApi`).

## Security
- **Admin Only**: This is a strict Admin Dashboard.
  - Login requires verifying the `admin` label via Cloud Function.
  - Non-admin users are denied access.
- **Environment Variables**:
  - Use `import.meta.env.VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`.
  - Never commit sensitive keys; rely on `.env.local`.
- **Data Protection**:
  - Ensure sensitive user data is handled via the backend/functions, not exposed to the client unnecessarily.
