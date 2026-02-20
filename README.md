# Purcari Israel - Premium Wine Ecommerce

A modern, high-performance ecommerce platform for **Purcari Winery Israel**, featuring full Right-to-Left (RTL) support in Hebrew and Convex backend.

## Project Overview

This is a premium wine shop tailored for the Israeli market with a customer storefront and admin dashboard.

### Key Features

- Full RTL Support - Native Hebrew interface with logical layout properties
- Complete Shop Flow - Product browsing, filtering by category, detailed product views
- Multi-step Checkout - Streamlined checkout process with Rivhit payment integration
- Customer Authentication - Secure login with password and Google OAuth
- Admin Dashboard - Full store management (products, orders, users, coupons, categories)
- Analytics - Real-time event tracking with @convex-dev/aggregate
- Coupon System - Dynamic coupon validation against cart totals
- Fully Responsive - Optimized for mobile, tablet, and desktop
- Polished UI/UX - Smooth animations with Framer Motion (storefront) and Chakra UI v3 (admin)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 6 |
| Storefront UI | Tailwind CSS 4 + Framer Motion |
| Admin UI | Chakra UI v3 |
| State | Redux Toolkit (storefront) + Convex hooks (admin) |
| Backend | Convex (Database, Auth, Functions) |
| Payment | Rivhit (Israeli payment gateway) |

## Project Structure

```
purcari-israel/
├── apps/
│   ├── storefront/       # Customer React app
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── store/       # Redux Toolkit
│   │       └── services/
│   │
│   └── admin/           # Admin dashboard
│       └── src/
│           ├── components/
│           ├── pages/
│           └── hooks/       # Convex hooks
│
├── packages/
│   └── shared-types/    # Shared TypeScript types
│
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── auth.ts          # Authentication
│   └── *.ts             # API functions
│
└── package.json         # pnpm workspace root
```

## Getting Started

### 1. Prerequisites
- Node.js 18+
- pnpm 8+

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```env
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_URL=https://your-convex-deployment.convex.cloud
```

### 3. Installation
```bash
pnpm install
```

### 4. Run Development
```bash
# Start Convex dev server (required)
npx convex dev

# Run all apps
pnpm dev

# Or run individually
pnpm dev:storefront   # http://localhost:5173
pnpm dev:admin       # http://localhost:5174
```

### 5. Build
```bash
pnpm build
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in parallel |
| `pnpm dev:storefront` | Run storefront only |
| `pnpm dev:admin` | Run admin only |
| `pnpm build` | Build all apps |
| `pnpm type-check` | Type-check all packages |

## Development

### Adding Dependencies
```bash
pnpm --filter @apps/storefront add <package>
pnpm --filter @apps/admin add <package>
```

### Convex Functions
```bash
npx convex dev          # Start dev server & generate types
npx convex deploy       # Deploy to cloud
npx convex run <func> --args '{}'  # Run function locally
```

## Resources

- [AGENTS.md](./AGENTS.md) - Developer instructions for AI agents
- [Convex Docs](https://docs.convex.dev)
- [Chakra UI v3 Docs](https://www.chakra-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

---

Developed with ❤️ for Purcari Winery Israel.
