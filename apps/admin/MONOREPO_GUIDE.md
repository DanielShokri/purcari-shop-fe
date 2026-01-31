# Monorepo Conversion Guide: Admin Dashboard + Storefront

## Executive Summary

**Yes, this is absolutely possible with Appwrite!** Converting to a monorepo is actually a natural fit for your project. Both the admin dashboard and storefront will share:
- Same Appwrite backend
- Same database + auth system
- Shared API layer
- Shared types and utilities

However, they'll be **completely separate frontend applications** with independent routing, builds, and deployments.

---

## Current Architecture Analysis

### Today's Setup (Single App)
```
hebrew-admin-dashboard/
├── package.json (admin-specific)
├── vite.config.ts (admin-specific)
├── App.tsx (admin routing)
├── components/ (admin UI)
├── pages/ (admin pages)
├── services/
│   ├── appwrite.ts (SHARED)
│   └── api/ (admin-specific)
├── store.ts (admin Redux)
└── ...
```

### Problem with Current Setup
- Vite dev server runs on one port (3000)
- Can't run both admin and storefront simultaneously during development
- Both apps point to same Appwrite backend (good!)
- But no way to distinguish which app a user is accessing

---

## Proposed Monorepo Architecture

### Recommended Structure: Root-Level Package.json + Separate Apps

```
shop-system/                          ← New monorepo root
├── package.json                      ← Root (workspace manager)
├── pnpm-workspace.yaml               ← Or use Yarn workspaces
├── .env.local                        ← Shared Appwrite config
├── turbo.json                        ← Optional: build orchestration
│
├── apps/
│   ├── admin/                        ← Your current admin app
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── appwrite.ts
│   │   └── ...
│   │
│   └── storefront/                   ← New storefront app
│       ├── package.json
│       ├── vite.config.ts
│       ├── App.tsx
│       ├── pages/
│       ├── components/
│       ├── services/
│       │   └── appwrite.ts
│       └── ...
│
├── packages/                         ← Shared code
│   ├── shared-types/
│   │   ├── package.json
│   │   └── src/
│   │       ├── types.ts              ← Product, Order, User types
│   │       ├── constants.ts          ← APPWRITE_CONFIG
│   │       └── utils.ts              ← Shared helpers
│   │
│   ├── shared-ui/                    ← (Optional) Shared components
│   │   ├── package.json
│   │   └── src/
│   │       └── components/           ← Buttons, cards, etc.
│   │
│   └── shared-api/                   ← (Optional) Shared RTK Query setup
│       ├── package.json
│       └── src/
│           └── api/
│
└── .github/
    └── workflows/
        ├── build-admin.yml
        └── build-storefront.yml
```

---

## How Appwrite Works in This Setup

### Single Backend, Multiple Frontends

```
┌─────────────────────────────────┐
│   Appwrite Backend (Single)     │
│  • auth.appwrite.io             │
│  • api.appwrite.io              │
│  • database (1 database)        │
│  • collections (products, etc)  │
│  • users collection             │
└─────────────────────────────────┘
         ↑              ↑
         │              │
    [Admin App]   [Storefront App]
   localhost:3001  localhost:5173
```

### Key Points
- **One Appwrite project** serves both apps
- **One database** with shared collections
- **One auth system** - users are the same across both apps
- **One user = multiple roles**
  - User with `admin` label → can access admin dashboard
  - Any user → can access storefront

---

## Routing Strategy: How Apps Coexist

### Option 1: Port-Based (Development + Production)

**Development:**
```bash
# Terminal 1: Admin dashboard
pnpm --filter admin dev
# Runs on localhost:3001

# Terminal 2: Storefront
pnpm --filter storefront dev
# Runs on localhost:5173
```

**Production:**
```
https://admin.yourshop.com     → Admin dashboard (built files)
https://shop.yourshop.com      → Storefront (built files)
```

**How it Works:**
- Both apps access same Appwrite via API keys
- Users log in to whichever app they're using
- Auth stored in each app's Redux + localStorage separately
- Admin-specific routes protected by admin label check
- Storefront routes open to all users

---

### Option 2: Path-Based (Single Domain - Advanced)

```
https://yourshop.com/admin/     → Admin dashboard
https://yourshop.com/shop/      → Storefront
```

**This is more complex and requires:**
- Single React app with conditional rendering
- Shared routing with path prefixes
- Shared Redux store
- Not recommended unless you want complete integration

**For your case: Stick with Option 1 (Port-Based) - Much simpler!**

---

## Step-by-Step Conversion Plan

### Phase 1: Restructure as Monorepo (30 mins)

```bash
# 1. Create new root directory
mkdir shop-system
cd shop-system

# 2. Create monorepo structure
mkdir apps packages

# 3. Move your admin app
mv /path/to/hebrew-admin-dashboard apps/admin

# 4. Initialize root package.json
npm init -w
# Or use:
cat > package.json << 'EOF'
{
  "name": "shop-system",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm --filter=admin --filter=storefront dev --parallel",
    "build": "pnpm --filter=admin --filter=storefront build",
    "build:admin": "pnpm --filter admin build",
    "build:storefront": "pnpm --filter storefront build"
  },
  "devDependencies": {
    "pnpm": "^9.0.0"
  }
}
EOF
```

### Phase 2: Create Shared Packages (20 mins)

**Create shared-types package:**
```bash
mkdir -p packages/shared-types/src
cat > packages/shared-types/package.json << 'EOF'
{
  "name": "@shop/shared-types",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "files": ["src"]
}
EOF
```

**Create types file:**
```bash
cat > packages/shared-types/src/index.ts << 'EOF'
// Shared types used by both admin and storefront

export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  prefs: Record<string, unknown>;
}

export interface Product {
  $id: string;
  productName: string;
  price: number;
  description: string;
  // ... rest of fields
}

export const APPWRITE_CONFIG = {
  ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
  PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  API_KEY: import.meta.env.VITE_APPWRITE_API_KEY,
  DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  // ... rest of config
} as const;
EOF
```

### Phase 3: Create Storefront App (Copy Admin, Customize)

```bash
cp -r apps/admin apps/storefront

# Remove admin-specific code:
rm -rf apps/storefront/pages/Users
rm -rf apps/storefront/pages/Analytics
# Keep: Products, Orders (for order history)

# Update storefront routing
# Remove: ProtectedRoute (or make public)
# Keep: Product browsing, shopping cart, checkout
```

### Phase 4: Update Both Apps to Use Shared Types

**In admin/package.json:**
```json
{
  "dependencies": {
    "@shop/shared-types": "workspace:*",
    // ... other deps
  }
}
```

**In admin/src/types.ts:**
```typescript
// Re-export shared types
export * from '@shop/shared-types';

// Add admin-specific types
export interface AdminUser extends AuthUser {
  isAdmin: boolean;
}
```

**Same pattern for storefront/src/types.ts**

---

## Environment Variables Strategy

### Root .env.local (Shared Appwrite Config)
```bash
# .env.local (in root)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_API_KEY=your_api_key
VITE_APPWRITE_DATABASE_ID=your_db_id
# ... collection IDs, etc

# Admin-specific (optional)
VITE_ADMIN_SECRET_KEY=...

# Storefront-specific (optional)
VITE_STRIPE_KEY=...
```

### Vite Config in Each App
```typescript
// apps/admin/vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', 'VITE_'); // Load from root
  return {
    // ... config
    define: {
      'process.env.APPWRITE_ENDPOINT': JSON.stringify(env.VITE_APPWRITE_ENDPOINT),
    }
  }
});
```

---

## Redux Store Strategy

### Each App Has Its Own Store

**Admin Store:**
```typescript
// apps/admin/src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { api as adminApi } from './services/api';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    [adminApi.reducerPath]: adminApi.reducer,
    auth: authSlice,
    // Admin-specific slices
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});
```

**Storefront Store:**
```typescript
// apps/storefront/src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { api as storefrontApi } from './services/api';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice'; // Storefront-specific

export const store = configureStore({
  reducer: {
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    auth: authSlice,
    cart: cartSlice,
    // Storefront-specific slices
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storefrontApi.middleware),
});
```

### Key Point
- **Same Appwrite backend**
- **Different Redux stores** (completely separate)
- **Users can be logged into admin AND storefront at the same time** (in different browser windows)

---

## API Layer Strategy

### Option A: Completely Separate (Recommended for your case)

```
apps/
├── admin/
│   └── services/
│       └── api/
│           ├── authApi.ts
│           ├── productsApi.ts
│           ├── usersApi.ts
│           └── baseApi.ts
│
└── storefront/
    └── services/
        └── api/
            ├── authApi.ts
            ├── productsApi.ts      ← Similar but different queries
            ├── cartApi.ts
            └── baseApi.ts
```

**Why separate?**
- Admin queries products with admin filters (cost, profit margins)
- Storefront queries products with customer filters (price, availability)
- Different mutations (admin creates products, customers add to cart)
- Different error handling
- Different caching strategies

### Option B: Shared API Layer (Advanced)

If you want to share:
```
packages/
└── shared-api/
    └── src/
        └── api/
            ├── productsApi.ts      ← Shared queries
            ├── baseApi.ts
            └── hooks.ts
```

**More complex but saves code duplication.** Skip this for now.

---

## Routing in Each App

### Admin App (Your Current Setup)
```typescript
// apps/admin/src/App.tsx
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      {/* ... more admin routes */}
    </Routes>
  );
}

// ProtectedRoute checks: if (!user || !user.isAdmin) → redirect to /login
```

### Storefront App (New)
```typescript
// apps/storefront/src/App.tsx
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/products" element={<ProductsCatalog />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />  ← Login/Register
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// No ProtectedRoute needed - all pages public (or just cart/checkout)
// Users can browse anonymously, login for checkout
```

---

## Authentication Flow

### Admin Dashboard
```
1. User visits https://admin.yourshop.com
2. ProtectedRoute checks: if (!user || !user.labels?.includes('admin'))
3. If not admin → redirect to /login
4. Login form authenticates via Appwrite
5. Check admin label from users collection
6. Store session in admin's Redux + localStorage
7. User has access to admin features
```

### Storefront
```
1. User visits https://shop.yourshop.com
2. User can browse products (NO login required)
3. Add to cart → stored in localStorage + Redux (storefront app only)
4. Checkout → prompts login if not logged in
5. Creates order in Appwrite
6. Redirect to order confirmation
```

### Same User, Both Apps
```
User logs into admin app → admin session created
Later, opens storefront app in same browser
→ User is NOT automatically logged in to storefront
→ Because storefront's Redux/localStorage doesn't have session
→ But Appwrite recognizes them (session cookie)
→ When they log in on storefront, same user record retrieved
```

---

## Development Workflow

### Run Both Apps Simultaneously

```bash
# Terminal 1: Install monorepo dependencies
pnpm install

# Terminal 2: Run admin
pnpm --filter admin dev
# Runs on localhost:3001

# Terminal 3: Run storefront  
pnpm --filter storefront dev
# Runs on localhost:5173

# Now you can:
# - Edit admin code → hot reload on port 3001
# - Edit storefront code → hot reload on 5173
# - Both hit same Appwrite backend
# - Test user flow: admin → storefront in same browser
```

### Build Both for Production

```bash
# Build both
pnpm build

# Or build individually
pnpm build:admin    # → apps/admin/dist/
pnpm build:storefront  # → apps/storefront/dist/
```

---

## Deployment Strategy

### Infrastructure Options

#### Option 1: Separate Subdomains (Recommended)
```
admin.yourshop.com        ← Admin app (Vercel, Netlify, etc)
shop.yourshop.com         ← Storefront app (separate deployment)
api.appwrite.io           ← Shared Appwrite backend
```

**Build & Deploy:**
```bash
# CI/CD detects changes in apps/admin → deploy to admin.yourshop.com
# CI/CD detects changes in apps/storefront → deploy to shop.yourshop.com
# If changes in packages/shared-types → rebuild both apps
```

#### Option 2: Same Domain, Different Paths
```
yourshop.com/admin/       ← Admin app
yourshop.com/             ← Storefront app
```

**Requires:**
- Single build output or reverse proxy
- More complex routing setup
- Not recommended for your case

#### Option 3: Monorepo on One Deployment
```
Single server/deployment runs both Vite builds on different ports
Example: Nginx reverse proxy
  - /admin/* → localhost:3001
  - /shop/* → localhost:5173
```

---

## Appwrite Security Considerations

### Permissions Model

**Users Collection:**
```
User Document {
  $id: "user123",
  name: "John",
  email: "john@example.com",
  labels: ["admin"],  ← Only admins have this
  createdAt: "..."
}
```

**Products Collection:**
```
Document {
  $id: "prod456",
  name: "Wine",
  costPrice: 100,     ← Hidden from storefront
  sellingPrice: 200,
  adminNotes: "...",  ← Hidden from storefront
}
```

**Permissions Setup in Appwrite:**
```
Collections:
- products: 
  - Read: all users (public browsing)
  - Write: only admins (manage inventory)
  
- orders:
  - Read: user's own orders (via queries)
  - Write: any user (checkout creates order)
  
- users:
  - Read: user's own data
  - Write: admins only (for user management)
```

**API Key Strategy:**
```
Option A: One API Key (Current)
- Shared between admin and storefront
- Works because Appwrite permissions handle access control
- Fine for small shops

Option B: Multiple API Keys (Enterprise)
- Admin API key: full permissions
- Storefront API key: limited to read products, write orders
- More secure but more complex setup
```

---

## Migration Checklist

### Before Starting
- [ ] Backup current admin app repo
- [ ] Backup .env.local with Appwrite credentials
- [ ] Test current admin app works (npm run dev)

### Step 1: Create Monorepo Structure
- [ ] Create root shop-system folder
- [ ] Create apps/ and packages/ folders
- [ ] Create root package.json with workspaces config
- [ ] Move admin app to apps/admin/

### Step 2: Create Shared Packages
- [ ] Create packages/shared-types/
- [ ] Move shared types to shared-types/src/
- [ ] Create packages/shared-types/package.json

### Step 3: Update Imports (Admin App)
- [ ] Import types from @shop/shared-types
- [ ] Update vite.config.ts to load env from root
- [ ] Test: pnpm --filter admin dev

### Step 4: Create Storefront App
- [ ] Copy admin app to apps/storefront/
- [ ] Remove admin-specific pages (Users, Analytics, etc)
- [ ] Create storefront pages (Homepage, ProductCatalog, Cart, etc)
- [ ] Remove admin-only middleware/protections
- [ ] Update storefront routing
- [ ] Create storefront-specific Redux slices (cart, checkout)

### Step 5: Test Full Setup
- [ ] Root package.json pnpm install works
- [ ] pnpm --filter admin dev works
- [ ] pnpm --filter storefront dev works
- [ ] Both apps can authenticate with Appwrite
- [ ] Admin app shows admin features only
- [ ] Storefront app works for customers

### Step 6: Git & CI/CD
- [ ] Initialize git in root
- [ ] Create .github/workflows for separate builds
- [ ] Test that changes in apps/admin trigger admin deployment only

---

## Important Notes

### ✅ What Works Great with Appwrite

- **Shared database** - One database serves both apps
- **Shared authentication** - Same Appwrite auth, different sessions
- **User roles** - Admin label determines access level
- **Collections** - All collections accessible from both apps
- **Real-time updates** - Both apps can subscribe to same data
- **File storage** - Both apps access same storage buckets
- **Environment variables** - Shared Appwrite config (.env.local)

### ⚠️ What Needs Careful Planning

- **Sessions are separate** - Admin session ≠ Storefront session (unless you share tokens)
- **Caching strategies** - Each app's RTK Query cache is independent
- **localStorage** - Each app has its own localStorage (good for security)
- **API call patterns** - Duplicate logic between admin and storefront APIs
- **Testing** - Need to test both apps against same backend

### ❌ What Won't Work

- **Sharing Redux stores** - Too tightly coupled
- **Path-based routing** - Would require major refactoring
- **Single vite server** - Monorepo tools don't merge two SPAs

---

## Answers to Your Specific Questions

### 1. Is it possible with Appwrite?
**YES! Perfect fit.**
- Appwrite is backend-agnostic
- Multiple frontends hitting same backend is the standard pattern
- No special configuration needed in Appwrite

### 2. How will routing work?
**Port-based in dev, domain-based in production:**
- Dev: `localhost:3001` (admin) and `localhost:5173` (storefront)
- Prod: `admin.yourshop.com` and `shop.yourshop.com`
- Each app has its own Router/Routes
- Each app has its own routing logic
- No conflict because they're completely separate SPAs

### 3. What adjustments needed?
**In order of importance:**

**Must Do:**
- Create monorepo folder structure
- Create root package.json with workspaces
- Create apps/admin and apps/storefront folders
- Update apps to import from root .env.local
- Create storefront app (copy of admin, customized)

**Should Do:**
- Create shared-types package for DRY types
- Update import paths in both apps
- Create separate build scripts for each app
- Setup CI/CD for independent deployments

**Nice to Have:**
- Shared UI components package
- Shared API setup package
- Turborepo for faster builds
- Shared utilities package

---

## File Structure After Conversion

```
shop-system/
├── .env.local                          ← Shared Appwrite config
├── .env.example
├── package.json                        ← Root with workspaces
├── pnpm-workspace.yaml                 ← Workspace config
├── .gitignore
├── .github/
│   └── workflows/
│       ├── deploy-admin.yml
│       └── deploy-storefront.yml
│
├── apps/
│   ├── admin/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── appwrite.ts
│   │   │   └── api/
│   │   ├── store.ts
│   │   ├── types.ts                    ← Imports from @shop/shared-types
│   │   └── ...
│   │
│   └── storefront/
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.tsx
│       ├── App.tsx
│       ├── pages/
│       │   ├── Homepage.tsx
│       │   ├── ProductsCatalog.tsx
│       │   ├── ProductDetail.tsx
│       │   ├── Cart.tsx
│       │   ├── Checkout.tsx
│       │   ├── Account.tsx
│       │   └── ...
│       ├── components/
│       ├── services/
│       │   ├── appwrite.ts
│       │   └── api/
│       ├── store.ts
│       ├── types.ts                    ← Imports from @shop/shared-types
│       └── ...
│
└── packages/
    ├── shared-types/
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── types.ts                ← Product, Order, AuthUser, etc
    │   │   ├── constants.ts            ← APPWRITE_CONFIG
    │   │   └── utils.ts                ← Helper functions
    │   └── tsconfig.json
    │
    ├── shared-ui/                      ← (Optional) Common components
    │   ├── package.json
    │   └── src/
    │       └── components/
    │           ├── Button.tsx
    │           ├── Card.tsx
    │           └── ...
    │
    └── shared-api/                     ← (Optional) Common API setup
        ├── package.json
        └── src/
            ├── baseApi.ts
            └── ...
```

---

## Next Steps (When Ready to Convert)

1. **Read this guide thoroughly** - Understand the architecture
2. **Backup your current repo** - Safety first
3. **Create new root folder** - Start fresh monorepo
4. **Follow checklist** - Step by step migration
5. **Test thoroughly** - Both apps with same Appwrite backend
6. **Setup CI/CD** - Independent deployments for each app
7. **Deploy to production** - Separate subdomains

---

## Additional Resources

- **pnpm Workspaces**: https://pnpm.io/workspaces
- **Turborepo**: https://turbo.build/repo/docs
- **Vite Multi-App Setup**: https://vitejs.dev/guide/
- **Appwrite Multi-App Pattern**: https://appwrite.io/docs/products/databases/collections
- **Redux Store Design**: https://redux.js.org/usage/structuring-reducers

---

## TL;DR

| Question | Answer |
|----------|--------|
| **Possible with Appwrite?** | ✅ Yes, perfect fit |
| **Single or multiple Appwrite projects?** | 1 shared project |
| **Single or multiple databases?** | 1 shared database |
| **Single or multiple Redux stores?** | 2 separate stores |
| **Same auth system?** | Yes (same Appwrite auth, different sessions) |
| **Port-based routing?** | Yes (dev: 3001 & 5173, prod: separate subdomains) |
| **Code sharing?** | Yes (shared-types package) |
| **Independent deployments?** | Yes (each app deploys separately) |
| **Estimated setup time?** | 2-4 hours for full conversion |
| **Complexity level?** | Medium (straightforward if following checklist) |

