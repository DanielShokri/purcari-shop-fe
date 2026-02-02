# GitHub Copilot Instructions for Purcari Israel

This document outlines the coding standards, architectural patterns, and project conventions for the Purcari Israel ecommerce project.

## 1. Code Style & Language Preferences

- **Frameworks**: React 18.2, TypeScript (Strict), Tailwind CSS 4, Framer Motion 12.
- **Language**: TypeScript is mandatory. Avoid `any`. Use explicit interfaces for all props and data structures (defined in `types.ts`).
- **Component Syntax**:
  - Use `React.FC` with typed props: `const Component: React.FC<Props> = ({ prop }) => { ... }`.
  - Place interfaces immediately above the component definition.
  - Export components as `export default ComponentName`.
  - Use PascalCase for filenames: `ProductCard.tsx`, `HomePage.tsx`.
- **State Management**:
  - Prefer **Redux Toolkit (RTK)** for global state (cart, UI).
  - Use **Convex hooks** for data fetching (`useQuery`, `useMutation`).
  - Use `useAppDispatch` and `useAppSelector` typed hooks for Redux.
- **Imports**: Use the `@` alias for the project root (e.g., `import Component from '@/components/Component'`).

## 2. Architecture & Service Boundaries

### State Layers

1. **Remote State**: Convex queries and mutations in `convex/*.ts` files.
2. **Global UI State**: Redux slices in `store/slices/` (`cartSlice.ts`, `uiSlice.ts`).
3. **Local State**: `useState` only for ephemeral UI logic (e.g., form inputs, open/close toggles).

### Backend: Convex

- **Convex Configuration**: Backend functions defined in `convex/` folder.
- **Database**: Convex Cloud with tables defined in `convex/schema.ts`.
- **Auth**: Convex Auth with Password provider (defined in `convex/auth.ts`).
- **Key Tables**:
  - `users` - User profiles (email required, name required, phone optional)
  - `orders` - Customer orders
  - `products` - Product catalog
  - `userAddresses` - User shipping addresses
  - `authTables` - Convex Auth internal tables (authAccounts, authSessions, authVerificationTokens)

### Data Flow

- **Convex Queries**: Components subscribe via `useQuery(api.functionName)` from generated API.
- **Convex Mutations**: Updates via `useMutation(api.functionName)`.
- **Authentication**: Convex Auth handles session management automatically.

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

- **Package Manager**: NPM (uses pnpm under the hood).
- **Scripts**:
  - Dev: `npm run dev` (Vite, port 5173)
  - Convex Dev: `npx convex dev` (backend development, port 5171)
  - Build: `npm run build`
  - Preview: `npm run preview`
- **Environment**:
  - Requires `.env.local` with `VITE_CONVEX_URL` for Convex connection.
  - Run `npx convex dev` to start the Convex dev server alongside frontend.

## 6. Security & Auth

### Authentication: Convex Auth

- **Provider**: Password provider with email/password authentication.
- **Configuration**: Defined in `convex/auth.ts`.
- **Validation**: Zod schemas for email (required, valid), password (min 4 chars), name (min 2 chars).

### User Profile Management

- **Creation**: Users created automatically via `createOrUpdateUser` callback when signing up.
- **Fields**:
  - **Required**: `email`, `name` (set by auth callback)
  - **Optional**: `phone`, `image`, `role`, `status`, `cart`
- **Queries**: Use email-based lookups: `withIndex("email", q.eq("email", identity.email))`

### Authorization

- **Admin features**: Restricted, requires role check.
- **Consumer-facing**: Main storefront is customer-facing.
- **Protected routes**: Dashboard (`/dashboard`) requires authentication.

### Common Auth Patterns

**Getting current user:**
```typescript
const convexUser = useQuery(api.users.get); // Returns user or null
```

**Signing up:**
```typescript
signIn("password", { email, password, name, flow: "signUp" });
```

**Adding phone after signup:**
```typescript
createUserProfile({ phone, name, email }); // Via mutation
```

**Query with arguments (defensive):**
```typescript
useQuery(api.orders.listByCustomer, 
  convexUser && convexUser.email ? { email: convexUser.email } : "skip"
);
```

## 7. Common Implementation Patterns

### Adding Convex Queries

1. Add query function in `convex/*.ts`:
   ```typescript
   export const getData = query({
     args: { param: v.string() },
     handler: async (ctx, args) => {
       const identity = await ctx.auth.getUserIdentity();
       if (!identity) return null;
       // Query logic
       return await ctx.db.query("table").withIndex("field").eq("field", args.param).unique();
     },
   });
   ```

2. Use in component:
   ```typescript
   const data = useQuery(api.tableName.getData, args);
   ```

### Adding Convex Mutations

1. Add mutation function in `convex/*.ts`:
   ```typescript
   export const updateData = mutation({
     args: { id: v.id("table"), data: v.object({...}) },
     handler: async (ctx, args) => {
       await ctx.db.patch(args.id, args.data);
     },
   });
   ```

2. Use in component:
   ```typescript
   const updateMutation = useMutation(api.tableName.updateData);
   await updateMutation({ id, data });
   ```

### Cart Logic

- **State**: Redux-based with `localStorage` persistence.
- **Rules**: Cart rules fetched via Convex and applied via selectors.
- **Coupons**: Validated against cart totals via Convex backend logic.

### User Lookups Pattern

Always use email-based lookups for user queries (NOT tokenIdentifier):
```typescript
ctx.db
  .query("users")
  .withIndex("email", (q) => q.eq("email", identity.email))
  .unique();
```

### Loading States

Use defensive checks for query loading states:
```typescript
// Correct pattern - only loading when actively fetching
const isLoading = (convexUser && convexUser.email) ? queryResult === undefined : false;
```

## 8. Project Structure

```
purcari-israel/
├── apps/
│   ├── admin/              # Admin dashboard
│   └── storefront/         # Main storefront (React + Vite)
├── convex/                 # Convex backend functions
│   ├── auth.ts             # Auth configuration
│   ├── schema.ts           # Database schema
│   ├── users.ts            # User queries/mutations
│   ├── orders.ts           # Order queries/mutations
│   └── ...
├── .github/
│   └── copilot-instructions.md  # This file
└── .planning/              # Documentation & guides
```

## 9. Key Conventions

- **Hebrew First**: Default all UI text to Hebrew.
- **Strict Types**: No `any`; use explicit types.
- **RTL Safe**: Always use logical CSS properties.
- **Auth Patterns**: Use `email` for user lookups.
- **Error Handling**: User-friendly messages in Hebrew.
- **Documentation**: Reference `.planning/` folder for detailed guides.

## 10. Recent Important Fixes

### Email Field Required (Bug Fix)
- **Issue**: Schema had `email: v.optional(v.string())` causing validation errors
- **Fix**: Changed to `email: v.string()` (required)
- **Reason**: Email is always provided by auth and required by downstream queries

### Loading State Fix
- **Issue**: Empty orders/addresses lists showed infinite loader
- **Fix**: Improved loading state logic to distinguish between "not called" and "empty result"
- **Pattern**: `isLoading = (condition) ? queryResult === undefined : false`

### Auth Callback Pattern
- Users created via `createOrUpdateUser` callback with `args.profile` (contains email, name)
- Users looked up by email in all queries
- Phone stored separately via `createOrUpdateUserProfile` mutation

## 11. Documentation Resources

For detailed information, see files in `.planning/`:
- `AUTH_SYSTEM_COMPLETE.md` - Full authentication system guide
- `AUTH_QUICK_REFERENCE.md` - Quick start guide
- `BUG_FIX_EMAIL_FIELD.md` - Email field schema fix
- `BUG_FIX_EMPTY_LOADER.md` - Loading state fix
- `GEMINI.md` - Complete project context
