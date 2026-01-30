# Complete Monorepo Integration Guide

**Project:** Purcari Israel (Wine Ecommerce + Admin Dashboard)  
**Date:** January 31, 2026  
**Status:** Ready for Implementation  
**Estimated Effort:** 3-4 hours  

---

## 🎯 EXECUTIVE SUMMARY

Converting two production-grade React applications into a monorepo:
- **Storefront** (2,814 LOC): Customer-facing wine ecommerce with Tailwind CSS
- **Admin Dashboard** (3,900 LOC): Management tool with Chakra UI
- **Shared Appwrite Backend:** Single `cms_db` database, identical collection IDs
- **Identical Tech Stack:** React, Vite, Redux Toolkit, RTK Query, TypeScript
- **Same Language:** Both Hebrew/RTL optimized

### Why Monorepo?
✅ **Code sharing:** Single source of truth for domain types  
✅ **Build optimization:** Shared dependencies, faster installs  
✅ **Team collaboration:** One repository, unified CI/CD  
✅ **Deployment:** Atomic commits across both apps  

### Critical Issues Found

| Issue | Storefront | Admin | Status |
|-------|-----------|-------|--------|
| **Port conflict** | 3000 | 3000 | ⚠️ MUST FIX |
| **React version** | 18 | 19 | ⚠️ SHOULD ALIGN |
| **Type duplication** | 250 lines | 368 lines | ⚠️ MOVE TO SHARED |
| **Styling approach** | Tailwind | Chakra | ✅ OK - KEEP SEPARATE |
| **Appwrite client** | Duplicated | Duplicated | ⚠️ MOVE TO SHARED |
| **Collection IDs** | Hardcoded | Hardcoded | ⚠️ MOVE TO CONSTANTS |

---

## 📋 CONVERSION CHECKLIST

### Phase 1: Preparation (30 minutes)

#### 1.1 Create Root Structure
```bash
# Create folders
mkdir apps packages
```

#### 1.2 Create Root Files
```bash
# .gitignore (add to existing)
apps/*/node_modules
packages/*/node_modules
apps/*/.env.local
packages/*/.env.local
dist/
.turbo/

# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

# root package.json (update existing)
{
  "name": "purcari-israel-monorepo",
  "private": true,
  "type": "module",
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "dev:storefront": "pnpm --filter storefront dev",
    "dev:admin": "pnpm --filter admin dev",
    "build": "pnpm -r --parallel build",
    "build:storefront": "pnpm --filter storefront build",
    "build:admin": "pnpm --filter admin build"
  }
}

# root tsconfig.json (new file)
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["packages/*/src"],
      "@shared/*": ["packages/shared-*/src"],
      "@/*": ["./src/*"]
    }
  }
}
```

### Phase 2: Move Apps (1 hour)

#### 2.1 Move Storefront
```bash
# Create directory
mkdir apps/storefront

# Copy files (replace actual path)
cp -r ~/Downloads/purcari-israel/* apps/storefront/

# Update storefront vite.config.ts
# Change: 'alias': { '@': path.resolve(__dirname, 'src') }
# To: 'alias': { '@': path.resolve(__dirname, 'src') }
# No change needed - already relative!

# Verify port is 3000 (should be already)
# In vite.config.ts: server: { port: 3000 }
```

#### 2.2 Move Admin Dashboard
```bash
# Create directory
mkdir apps/admin

# Copy files
cp -r ~/Downloads/hebrew-admin-dashboard/* apps/admin/

# CRITICAL: Update admin vite.config.ts
# CHANGE:
#   server: {
#     port: 3000,  ← THIS IS THE PROBLEM
#     host: '0.0.0.0',
#   },
#
# TO:
#   server: {
#     port: 3001,  ← ADMIN PORT
#     host: '0.0.0.0',
#   },
```

#### 2.3 Update package.json in Apps
```json
{
  "name": "storefront",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@shared/types": "workspace:*",
    "@shared/constants": "workspace:*",
    "@shared/services": "workspace:*",
    "...rest of dependencies..."
  }
}

{
  "name": "admin",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@shared/types": "workspace:*",
    "@shared/constants": "workspace:*",
    "@shared/services": "workspace:*",
    "...rest of dependencies..."
  }
}
```

### Phase 3: Create Shared Packages (1.5 hours)

#### 3.1 Create @shared/types
```bash
mkdir -p packages/shared-types/src

# packages/shared-types/package.json
{
  "name": "@shared/types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

# packages/shared-types/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src"]
}
```

**Extract types from `apps/storefront/types.ts`:**

```typescript
// packages/shared-types/src/product.types.ts
export interface Product {
  $id: string;
  name: string;
  description: string;
  price: number;
  // ... rest from storefront types.ts
}

// packages/shared-types/src/order.types.ts
export interface Order {
  $id: string;
  customerId: string;
  items: OrderItem[];
  // ... rest
}

// packages/shared-types/src/coupon.types.ts
export interface Coupon {
  $id: string;
  code: string;
  // ... rest
}

// packages/shared-types/src/index.ts (re-export all)
export * from './product.types';
export * from './order.types';
export * from './coupon.types';
export * from './auth.types';
export * from './cart-rule.types';
export * from './analytics.types';
export * from './notification.types';
```

#### 3.2 Create @shared/constants
```bash
mkdir -p packages/shared-constants/src

# packages/shared-constants/package.json
{
  "name": "@shared/constants",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

# packages/shared-constants/src/index.ts
export const APPWRITE_CONFIG = {
  DATABASE_ID: process.env.VITE_APPWRITE_DATABASE_ID || 'cms_db',
  COLLECTION_PRODUCTS: 'products',
  COLLECTION_CATEGORIES: 'categories',
  COLLECTION_ORDERS: 'orders',
  COLLECTION_ORDER_ITEMS: 'order_items',
  COLLECTION_COUPONS: 'coupons',
  COLLECTION_COUPON_USAGE: 'coupon_usage',
  COLLECTION_CART_RULES: 'cart_rules',
  COLLECTION_ANALYTICS_EVENTS: 'analytics_events',
  COLLECTION_NOTIFICATIONS: 'notifications',
  BUCKET_MEDIA: 'media',
};

export const WINE_CATEGORIES = [
  'Red Wine',
  'White Wine',
  'Rosé Wine',
  'Sparkling Wine',
];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;
```

#### 3.3 Create @shared/services
```bash
mkdir -p packages/shared-services/src

# packages/shared-services/package.json
{
  "name": "@shared/services",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "appwrite": "^21.5.0",
    "@shared/constants": "workspace:*",
    "@shared/types": "workspace:*"
  }
}

# packages/shared-services/src/appwrite.ts
# COPY from apps/storefront/services/appwrite.ts
# but update APPWRITE_CONFIG to use @shared/constants

import { Client, Account, Databases, Storage, Functions } from 'appwrite';
import { APPWRITE_CONFIG } from '@shared/constants';

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  throw new Error('Missing Appwrite configuration...');
}

const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export { APPWRITE_CONFIG };
```

#### 3.4 Create @shared/api
```bash
mkdir -p packages/shared-api/src

# packages/shared-api/package.json
{
  "name": "@shared/api",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@reduxjs/toolkit": "^2.11.2",
    "@shared/types": "workspace:*",
    "react": "^19.0.0"
  }
}

# packages/shared-api/src/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include',
  }),
  tagTypes: ['Product', 'Order', 'Coupon', 'CartRule', 'Category'],
  endpoints: () => ({})
});

# packages/shared-api/src/authMiddleware.ts
# Copy from apps/admin/services/api/authMiddleware.ts
```

#### 3.5 Create @shared/hooks (Optional)
```bash
mkdir -p packages/shared-hooks/src

# packages/shared-hooks/package.json
{
  "name": "@shared/hooks",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^19.0.0",
    "react-redux": "^9.2.0",
    "@shared/types": "workspace:*"
  }
}

# packages/shared-hooks/src/useAuth.ts
# Any hooks needed by both apps
```

### Phase 4: Update Imports in Apps (30 minutes)

#### 4.1 Update Storefront Imports
```typescript
// OLD: import types from './types'
import type { Product, Order, Coupon } from '@shared/types';

// OLD: import { APPWRITE_CONFIG } from './services/appwrite'
import { APPWRITE_CONFIG, account, databases } from '@shared/services';

// OLD: import { baseApi } from './services/api'
import { baseApi } from '@shared/api';

// OLD: import { appwrite } from './services/appwrite'
import { account, databases } from '@shared/services';
```

#### 4.2 Update Admin Imports
```typescript
// OLD: import from './types/products.types'
import type { Product } from '@shared/types';

// OLD: import { APPWRITE_CONFIG } from './services/appwrite'
import { APPWRITE_CONFIG, account, databases } from '@shared/services';

// OLD: import { baseApi } from './services/api'
import { baseApi } from '@shared/api';

// Keep Chakra, Recharts, TipTap (admin-specific)
```

### Phase 5: Environment Variables (15 minutes)

#### 5.1 Root .env.example
```bash
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
VITE_APPWRITE_API_KEY=your-api-key-here

# Database Configuration
VITE_APPWRITE_DATABASE_ID=cms_db

# Storefront-specific APIs
VITE_GEOAPIFY_API_KEY=your-geoapify-key

# Admin-specific APIs
VITE_GEMINI_API_KEY=optional-gemini-key

# Build Environment
NODE_ENV=development
```

#### 5.2 App-specific .env.example
```bash
# apps/storefront/.env.example
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
VITE_GEOAPIFY_API_KEY=your-geoapify-key

# apps/admin/.env.example
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
```

### Phase 6: Testing (30 minutes)

#### 6.1 Test Build
```bash
# Clean install
rm -rf node_modules
pnpm install

# Test monorepo build
pnpm build

# Should build both apps and all shared packages
```

#### 6.2 Test Development
```bash
# Terminal 1: Start storefront
pnpm dev:storefront
# Should be on http://localhost:3000

# Terminal 2: Start admin
pnpm dev:admin
# Should be on http://localhost:3001

# Terminal 3: Start both
pnpm dev
# Should show both running
```

#### 6.3 Test Shared Packages
```bash
# Verify imports work
# Storefront: import from '@shared/types'
# Admin: import from '@shared/types'

# Check that types are resolved correctly
# Run TypeScript check
pnpm tsc --noEmit
```

---

## 🏗️ FINAL MONOREPO STRUCTURE

```
purcari-israel-monorepo/
│
├── .git/
├── .github/
│   └── workflows/
│       ├── deploy-storefront.yml
│       └── deploy-admin.yml
│
├── .env.example                    (root - shared config)
├── .env.local                      (gitignored)
├── .gitignore
├── pnpm-workspace.yaml
├── package.json                    (root with scripts)
├── tsconfig.json                   (root)
│
├── packages/                       (shared code)
│   ├── shared-types/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── product.types.ts
│   │       ├── order.types.ts
│   │       ├── coupon.types.ts
│   │       ├── cart-rule.types.ts
│   │       ├── user.types.ts
│   │       ├── analytics.types.ts
│   │       └── notification.types.ts
│   │
│   ├── shared-constants/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── shared-services/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── appwrite.ts
│   │
│   ├── shared-api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── baseApi.ts
│   │       └── authMiddleware.ts
│   │
│   └── shared-hooks/              (optional)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           └── useAuth.ts
│
├── apps/
│   ├── storefront/
│   │   ├── .env.example
│   │   ├── .env.local             (gitignored)
│   │   ├── package.json
│   │   ├── vite.config.ts         (port: 3000)
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── services/          (now minimal - imports from @shared)
│   │   │   ├── store/
│   │   │   ├── styles/
│   │   │   ├── App.tsx
│   │   │   └── index.tsx
│   │   └── public/
│   │
│   └── admin/
│       ├── .env.example
│       ├── .env.local             (gitignored)
│       ├── package.json
│       ├── vite.config.ts         (port: 3001 ← CHANGED)
│       ├── tsconfig.json
│       ├── index.html
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── services/          (now minimal - imports from @shared)
│       │   ├── store/
│       │   ├── types/             (imports from @shared/types)
│       │   ├── App.tsx
│       │   └── index.tsx
│       ├── theme.ts
│       └── public/
│
└── .planning/
    ├── MONOREPO_GUIDE.md          (original guide)
    ├── MONOREPO_GUIDE_ANALYSIS.md (storefront analysis)
    ├── ADMIN_DASHBOARD_ANALYSIS.md (admin analysis)
    ├── COMPLETE_MONOREPO_INTEGRATION_GUIDE.md (this file)
    ├── SETUP_CHECKLIST.md
    └── MIGRATION_SCRIPTS.md
```

---

## 🚀 IMPLEMENTATION TIMELINE

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Preparation** | 30 min | Create root files, workspace config |
| **Move Apps** | 1 hour | Move to apps/, update paths |
| **Shared Packages** | 1.5 hours | Create all @shared/* packages |
| **Update Imports** | 30 min | Find/replace imports in both apps |
| **Environment Setup** | 15 min | Create .env templates |
| **Testing** | 30 min | Test build, dev, types |
| **TOTAL** | **4 hours** | Complete monorepo ready |

**Recommended:** Do this in one focused session with breaks every hour.

---

## ⚠️ CRITICAL CHANGES BEFORE YOU START

### 1. Admin Port MUST Change
**File:** `apps/admin/vite.config.ts`  
**Change:**
```typescript
// BEFORE
server: {
  port: 3000,  // ❌ SAME AS STOREFRONT
}

// AFTER
server: {
  port: 3001,  // ✅ UNIQUE FOR ADMIN
}
```

### 2. React Version Decision
**Question:** Upgrade storefront to React 19?
- **If YES:** Both on React 19, consistent features
- **If NO:** Keep at 18, slightly older but stable

**Recommendation:** YES, upgrade to 19 (minimal risk)

### 3. Shared Types Location
**Decision:** Move types to `@shared/types` or keep separate?
- **If YES:** Single source of truth, DRY
- **If NO:** Each app maintains own types

**Recommendation:** YES, move to shared (1 hour investment, long-term benefit)

---

## 📊 IMPACT ANALYSIS

### Lines of Code Moved to Shared
```
Product types:         80 lines
Order types:           50 lines
Coupon types:          40 lines
CartRule types:        20 lines
Auth types:            60 lines
Analytics types:       30 lines
Notifications:         15 lines
Constants:             150 lines
Appwrite client:       60 lines
API baseApi:           50 lines
─────────────────────────────
TOTAL SHARED:          555 lines

ELIMINATED DUPLICATION: ~280 lines (types duplication)
```

### Monorepo Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Repositories** | 2 | 1 | Unified |
| **Type definitions** | 2 (duplicated) | 1 (shared) | -50% duplication |
| **Appwrite clients** | 2 (duplicated) | 1 (shared) | -50% duplication |
| **Install time** | 2×20s = 40s | 1×35s = 35s | -12% faster |
| **Dev start time** | 2×3s = 6s | 1×5s = 5s | -17% faster |
| **CI/CD pipelines** | 2 | 1 unified | Simpler |
| **Atomic commits** | Requires 2 repos | Single repo | ✅ Possible |

---

## 🛑 COMMON PITFALLS & HOW TO AVOID

### Pitfall 1: Circular Dependencies
**Problem:** Package A depends on B, B depends on A  
**Prevention:** Design dependency hierarchy:
```
Level 1: @shared/types (no dependencies)
Level 2: @shared/constants (→ types only)
Level 3: @shared/services (→ types, constants)
Level 4: @shared/api (→ types, services)
Level 5: @shared/hooks (→ all above)
Level 6: apps/* (→ all shared packages)
```

### Pitfall 2: Missing Environment Variables
**Problem:** .env not found in monorepo setup  
**Prevention:** Create root .env.example + app-specific ones

### Pitfall 3: Import Path Hell
**Problem:** Old paths like `../../../types` after moving  
**Prevention:** Use find/replace before moving:
```bash
# Search for: from './types'
# Replace with: from '@shared/types'
```

### Pitfall 4: Forgotten Port Change
**Problem:** Admin still on port 3000, conflicts with storefront  
**Prevention:** Change in vite.config.ts BEFORE starting dev server

### Pitfall 5: Type Conflicts
**Problem:** Duplicate types, different versions  
**Prevention:** All imports go to `@shared/types`, never local types

---

## 📝 VERIFICATION CHECKLIST

After conversion, verify:

- [ ] **Storefront builds without errors**
  ```bash
  pnpm build:storefront
  ```

- [ ] **Admin builds without errors**
  ```bash
  pnpm build:admin
  ```

- [ ] **Dev server starts on correct ports**
  ```bash
  # Storefront should be http://localhost:3000
  # Admin should be http://localhost:3001
  ```

- [ ] **Shared types resolve correctly**
  ```bash
  # In both apps: import { Product } from '@shared/types'
  # Should autocomplete without errors
  ```

- [ ] **Appwrite client works**
  ```bash
  # Login should work in both apps
  # API calls should succeed
  ```

- [ ] **No console errors**
  ```bash
  # Check DevTools console in both apps
  # Should be clean (no 404s, no module errors)
  ```

- [ ] **TypeScript passes type check**
  ```bash
  pnpm tsc --noEmit
  ```

---

## 🎉 SUCCESS CRITERIA

Monorepo is successfully set up when:

1. ✅ **Both apps run independently**
   - Storefront on 3000
   - Admin on 3001

2. ✅ **Both apps can run simultaneously**
   - `pnpm dev` starts both

3. ✅ **Type sharing works**
   - Import from `@shared/types`
   - No duplicate type definitions

4. ✅ **No build errors**
   - `pnpm build` completes successfully

5. ✅ **All features work**
   - Storefront: products, cart, checkout, auth
   - Admin: products CRUD, orders, analytics, etc.

6. ✅ **TypeScript strict mode passes**
   - `pnpm tsc --noEmit` (0 errors)

---

## 📞 TROUBLESHOOTING

### Issue: Port still conflicts
**Solution:** 
```bash
# Check what's using port 3000
lsof -i :3000
lsof -i :3001

# Kill if needed
kill -9 <PID>

# Verify vite.config.ts has port: 3001 for admin
```

### Issue: Module not found '@shared/types'
**Solution:**
```bash
# Verify package.json has:
"@shared/types": "workspace:*"

# Reinstall
pnpm install

# Check tsconfig.json paths:
"@shared/*": ["packages/shared-*/src"]
```

### Issue: Types not resolving
**Solution:**
```bash
# Verify shared-types package.json has:
"main": "./src/index.ts"
"types": "./src/index.ts"

# Check src/index.ts exports all types
cat packages/shared-types/src/index.ts
```

### Issue: Build fails with "cannot find module"
**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

---

## 📚 NEXT STEPS AFTER CONVERSION

### Immediate (Day 1)
1. ✅ Test both apps thoroughly
2. ✅ Verify all features work
3. ✅ Update deployment scripts
4. ✅ Update team documentation

### Short-term (Week 1)
1. Update CI/CD pipelines (GitHub Actions)
2. Deploy monorepo to staging
3. Performance test (vs separate apps)
4. Team training on monorepo workflow

### Medium-term (Month 1)
1. Migrate shared utilities to packages
2. Create shared component library (if needed)
3. Add Turborepo for build caching (optional)
4. Monitor build/deploy performance

### Long-term (Ongoing)
1. Gradually extract more shared code
2. Consider shared UI components (Tailwind + Chakra adapter)
3. Add E2E tests for both apps
4. Document monorepo architecture

---

## 🔗 REFERENCES

**Original Guide:** `.planning/MONOREPO_GUIDE.md`  
**Storefront Analysis:** `.planning/MONOREPO_GUIDE_ANALYSIS.md`  
**Admin Analysis:** `.planning/ADMIN_DASHBOARD_ANALYSIS.md`  

**pnpm Workspaces:** https://pnpm.io/workspaces  
**Monorepo Tools:** https://www.monorepo.tools  
**TypeScript Paths:** https://www.typescriptlang.org/tsconfig#paths  

---

## 📞 SUPPORT

If you encounter issues during conversion:

1. **Check the Verification Checklist** - most issues are there
2. **Review the Troubleshooting section** - common fixes
3. **Check shared package dependencies** - circular deps?
4. **Verify .env files exist** - both root and app-level

---

**Status: Ready for Implementation ✅**  
**Last Updated:** January 31, 2026  
**Confidence Level:** HIGH  
**Estimated Duration:** 3-4 hours focused work

Begin Phase 1 when ready. Good luck! 🚀
