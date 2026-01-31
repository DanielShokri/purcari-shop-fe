# Shop Frontend Integration Contract

> **Complete Integration Guide for E-commerce Storefront Application**
>
> This document defines the contract between a customer-facing shop frontend (React + RTK Query + Tailwind CSS) and the Appwrite backend shared with the admin dashboard.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Appwrite Configuration](#2-appwrite-configuration)
3. [Database Schemas](#3-database-schemas)
4. [TypeScript Interfaces](#4-typescript-interfaces)
5. [RTK Query API Endpoints](#5-rtk-query-api-endpoints)
6. [Authentication Contract](#6-authentication-contract)
7. [Permission Model](#7-permission-model)
8. [Data Mapping](#8-data-mapping)
9. [Error Handling](#9-error-handling)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPWRITE CLOUD                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Database: cms_db                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ products │ │categories│ │  orders  │ │order_items│ │ coupons  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐    │
│  │ Storage: media  │  │ Authentication  │  │ Functions: users-mgmt   │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │ Appwrite SDK                       │ Appwrite SDK
                    │ (Customer Access)                  │ (Admin Access)
                    ▼                                    ▼
        ┌───────────────────────┐            ┌───────────────────────┐
        │    SHOP FRONTEND      │            │   ADMIN DASHBOARD     │
        │  React + RTK Query    │            │  React + RTK Query    │
        │  + Tailwind CSS       │            │  + Chakra UI          │
        │                       │            │                       │
        │  • Browse Products    │            │  • Manage Products    │
        │  • Shopping Cart      │            │  • Manage Orders      │
        │  • Checkout           │            │  • Manage Users       │
        │  • Order History      │            │  • Analytics          │
        │  • User Profile       │            │  • Coupons CRUD       │
        └───────────────────────┘            └───────────────────────┘
                    │                                    │
                    ▼                                    ▼
              CUSTOMERS                              ADMINS
           (Regular Users)                    (Users with 'admin' label)
```

### Data Flow - Shopping Operations

```
┌──────────────────────────────────────────────────────────────────────┐
│                        SHOPPING FLOW                                  │
└──────────────────────────────────────────────────────────────────────┘

1. BROWSE
   User → getProducts() → Appwrite → Product List → Display

2. ADD TO CART
   User → Select Product → Redux Cart Slice → Local State

3. APPLY COUPON
   User → Enter Code → validateCoupon() → Appwrite → Apply Discount

4. CHECKOUT
   User → Submit → createOrder() → Appwrite → Order + Order Items

5. ORDER CONFIRMATION
   Appwrite → Order ID → Display Confirmation → Email (optional)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18+ | UI Framework |
| State Management | Redux Toolkit + RTK Query | API calls & caching |
| Styling | Tailwind CSS | Utility-first CSS |
| Backend | Appwrite Cloud | BaaS (Database, Auth, Storage) |
| Language | TypeScript | Type safety |
| Build Tool | Vite | Fast development |

---

## 2. Appwrite Configuration

### Environment Variables

```env
# .env.local (gitignored)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id

# Optional: Storage bucket for product images
VITE_APPWRITE_BUCKET_ID=media
```

### Appwrite Client Setup

```typescript
// services/appwrite.ts
import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database configuration
export const APPWRITE_CONFIG = {
  databaseId: 'cms_db',
  collections: {
    products: 'products',
    categories: 'categories',
    orders: 'orders',
    orderItems: 'order_items',
    coupons: 'coupons',
  },
  buckets: {
    media: 'media',
  },
} as const;
```

### Collections Access Matrix

| Collection | Shop Access | Operations |
|------------|-------------|------------|
| `products` | READ | List, Get by ID, Filter, Search |
| `categories` | READ | List, Get by slug |
| `orders` | READ/WRITE (own) | Create, List own, Get own |
| `order_items` | READ/WRITE (own) | Create with order |
| `coupons` | READ | Validate code |
| `analytics_events` | WRITE | Track events (optional) |
| `notifications` | - | Not accessed by shop |

---

## 3. Database Schemas

### 3.1 Products Collection

**Collection ID:** `products`

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `productName` | string (256) | Yes | - | Product display name |
| `description` | string (10000) | No | - | Rich text description (HTML) |
| `shortDescription` | string (500) | No | - | Plain text for listings |
| `price` | float | Yes | - | Regular price in ILS |
| `salePrice` | float | No | - | Discounted price |
| `onSale` | boolean | No | false | Sale flag |
| `quantityInStock` | integer | Yes | - | Available quantity |
| `sku` | string (64) | Yes | - | Stock keeping unit (unique) |
| `category` | string (36) | Yes | - | Category ID reference |
| `dateAdded` | datetime | No | - | Product creation date |
| `tags` | string[] | No | [] | Product tags for filtering |
| `relatedProducts` | string[] | No | [] | Related product IDs |
| `isFeatured` | boolean | No | false | Featured product flag |
| `featuredImage` | string (2048) | No | - | Image URL |
| `stockStatus` | enum | No | in_stock | `in_stock`, `out_of_stock`, `low_stock` |
| `wineType` | enum | No | - | `red`, `white`, `rose`, `sparkling` |
| `volume` | string (32) | No | - | e.g., "750 מ״ל" |
| `grapeVariety` | string (128) | No | - | e.g., "100% שרדונה" |
| `vintage` | integer | No | - | Wine year (e.g., 2019) |
| `servingTemperature` | string (32) | No | - | e.g., "10-12°" |

**Indexes:**
- `category_idx`: Key index on `category` for filtering
- `sku_idx`: Unique index on `sku`
- `featured_idx`: Key index on `isFeatured` for featured products
- `stock_idx`: Key index on `stockStatus` for availability filtering

---

### 3.2 Categories Collection

**Collection ID:** `categories`

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string (128) | Yes | - | Category name (Hebrew) |
| `slug` | string (128) | Yes | - | URL-friendly identifier |
| `parentId` | string (36) | No | null | Parent category ID (hierarchy) |
| `status` | enum | Yes | active | `active`, `draft`, `hidden` |
| `displayOrder` | integer | Yes | 0 | Sort order |
| `description` | string (1000) | No | - | Category description |
| `image` | string (2048) | No | - | Category image URL |
| `icon` | string (64) | No | - | Material icon name |
| `iconColor` | string (32) | No | - | Icon color (hex/name) |

**Indexes:**
- `slug_idx`: Unique index on `slug`
- `status_idx`: Key index on `status` for active filtering
- `order_idx`: Key index on `displayOrder` for sorting
- `parent_idx`: Key index on `parentId` for hierarchy

---

### 3.3 Orders Collection (Flattened Structure)

**Collection ID:** `orders`

> **Note:** Nested objects (shipping address, payment info) are flattened into individual fields for Appwrite compatibility.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| **Customer Info** |
| `customerName` | string (128) | Yes | Customer full name |
| `customerEmail` | string (256) | Yes | Customer email |
| `customerPhone` | string (32) | No | Customer phone |
| `customerAvatar` | string (2048) | No | Customer avatar URL |
| **Order Totals** |
| `total` | float | Yes | Order total (after discounts) |
| `subtotal` | float | Yes | Before shipping/tax |
| `shippingCost` | float | Yes | Shipping fee |
| `tax` | float | Yes | Tax amount |
| **Shipping Address (Flattened)** |
| `shippingStreet` | string (256) | Yes | Street address |
| `shippingApartment` | string (64) | No | Apartment/unit |
| `shippingCity` | string (128) | Yes | City |
| `shippingPostalCode` | string (16) | Yes | Postal code |
| `shippingCountry` | string (64) | Yes | Country |
| **Payment Info (Flattened)** |
| `paymentMethod` | string (64) | Yes | e.g., "Visa מסתיים ב-4242" |
| `paymentCardExpiry` | string (8) | No | e.g., "12/25" |
| `paymentTransactionId` | string (128) | Yes | Payment gateway transaction ID |
| `paymentChargeDate` | string (32) | Yes | Charge timestamp |
| **Status** |
| `status` | enum | Yes | `pending`, `processing`, `completed`, `cancelled` |

**Indexes:**
- `status_idx`: Key index on `status` for filtering
- `customer_email_idx`: Key index on `customerEmail` for customer order lookup
- `created_idx`: Key index on `$createdAt` for sorting

---

### 3.4 Order Items Collection

**Collection ID:** `order_items`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | string (36) | Yes | Parent order ID |
| `productName` | string (256) | Yes | Product name (snapshot) |
| `productImage` | string (2048) | No | Product image URL (snapshot) |
| `variant` | string (128) | No | Variant info, e.g., "צבע: אדום" |
| `quantity` | integer | Yes | Quantity ordered |
| `price` | float | Yes | Unit price at time of order |
| `total` | float | Yes | Line total (quantity × price) |

**Indexes:**
- `order_idx`: Key index on `orderId` for order item lookup

---

### 3.5 Coupons Collection

**Collection ID:** `coupons`

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `code` | string (32) | Yes | - | Unique coupon code |
| `description` | string (256) | No | - | Internal description |
| `discountType` | enum | Yes | - | See discount types below |
| `discountValue` | float | Yes | - | Discount amount/percentage |
| `buyQuantity` | integer | No | - | Buy X (for buy_x_get_y) |
| `getQuantity` | integer | No | - | Get Y (for buy_x_get_y) |
| `startDate` | datetime | Yes | - | Valid from |
| `endDate` | datetime | No | - | Valid until (null = no expiry) |
| `minimumOrder` | float | No | 0 | Minimum order value |
| `maximumDiscount` | float | No | - | Maximum discount cap |
| `usageLimit` | integer | No | - | Total usage limit |
| `usageLimitPerUser` | integer | No | - | Per-user limit |
| `usageCount` | integer | Yes | 0 | Current usage count |
| `categoryIds` | string[] | No | [] | Applicable category IDs |
| `productIds` | string[] | No | [] | Applicable product IDs |
| `userIds` | string[] | No | [] | Eligible user IDs (empty = all) |
| `firstPurchaseOnly` | boolean | No | false | First purchase only |
| `excludeOtherCoupons` | boolean | No | false | Cannot combine |
| `status` | enum | Yes | - | `active`, `paused`, `expired`, `scheduled` |

**Discount Types:**
- `percentage` - Percentage off (discountValue = percentage)
- `fixed_amount` - Fixed amount off (discountValue = ILS)
- `free_shipping` - Free shipping (discountValue ignored)
- `free_product` - Free product (with productIds)
- `buy_x_get_y` - Buy X get Y (uses buyQuantity/getQuantity)

**Indexes:**
- `code_idx`: Unique index on `code`
- `status_idx`: Key index on `status`
- `dates_idx`: Key index on `startDate`, `endDate`

---

## 4. TypeScript Interfaces

### 4.1 Product Types

```typescript
// types/products.types.ts

export enum WineType {
  RED = 'red',
  WHITE = 'white',
  ROSE = 'rose',
  SPARKLING = 'sparkling',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Product {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  
  // Basic Info
  productName: string;
  description?: string;
  shortDescription?: string;
  
  // Pricing
  price: number;
  salePrice?: number;
  onSale?: boolean;
  
  // Inventory
  quantityInStock: number;
  sku: string;
  stockStatus?: StockStatus;
  
  // Organization
  category: string;
  tags?: string[];
  relatedProducts?: string[];
  
  // Display
  isFeatured?: boolean;
  featuredImage?: string;
  dateAdded?: string;
  
  // Wine-specific
  wineType?: WineType;
  volume?: string;
  grapeVariety?: string;
  vintage?: number;
  servingTemperature?: string;
}

// For product listings (minimal data)
export interface ProductListItem {
  $id: string;
  productName: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  featuredImage?: string;
  stockStatus?: StockStatus;
  category: string;
}
```

### 4.2 Category Types

```typescript
// types/categories.types.ts

export enum CategoryStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  HIDDEN = 'hidden',
}

export interface Category {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  
  name: string;
  slug: string;
  parentId?: string | null;
  status: CategoryStatus;
  displayOrder: number;
  description?: string;
  image?: string;
  icon?: string;
  iconColor?: string;
}

// Category with children for tree display
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
```

### 4.3 Cart Types (Client-Side State)

```typescript
// types/cart.types.ts

export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  salePrice?: number;
  quantity: number;
  variant?: string;
  maxQuantity: number; // For stock validation
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  appliedCoupon?: AppliedCoupon;
}

export interface AppliedCoupon {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number; // Calculated discount in ILS
}
```

### 4.4 Order Types

```typescript
// types/orders.types.ts

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: string;
  cardExpiry?: string;
  transactionId: string;
  chargeDate: string;
}

export interface OrderItem {
  $id: string;
  orderId: string;
  productName: string;
  productImage?: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

// Order summary (for list views)
export interface Order {
  $id: string;
  $createdAt: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  total: number;
  status: OrderStatus;
}

// Full order details
export interface OrderDetails extends Order {
  customerPhone?: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  items: OrderItem[];
}

// Order creation payload
export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    variant?: string;
    quantity: number;
    price: number;
  }>;
  couponCode?: string;
}
```

### 4.5 Coupon Types

```typescript
// types/coupons.types.ts

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  FREE_PRODUCT = 'free_product',
  BUY_X_GET_Y = 'buy_x_get_y',
}

export enum CouponStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  SCHEDULED = 'scheduled',
}

export interface Coupon {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  
  // Buy X Get Y
  buyQuantity?: number;
  getQuantity?: number;
  
  // Validity
  startDate: string;
  endDate?: string;
  
  // Limits
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  
  // Restrictions
  categoryIds?: string[];
  productIds?: string[];
  userIds?: string[];
  firstPurchaseOnly?: boolean;
  excludeOtherCoupons?: boolean;
  
  status: CouponStatus;
}

// Coupon validation result
export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}
```

### 4.6 User/Auth Types

```typescript
// types/auth.types.ts

export interface ShopUser {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  prefs?: {
    avatar?: string;
    address?: ShippingAddress;
    savedPaymentMethods?: string[];
  };
}

export interface AuthState {
  user: ShopUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Registration payload
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Login payload
export interface LoginPayload {
  email: string;
  password: string;
}

// Profile update payload
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: ShippingAddress;
}
```

### 4.7 Index Exports

```typescript
// types/index.ts

export * from './products.types';
export * from './categories.types';
export * from './cart.types';
export * from './orders.types';
export * from './coupons.types';
export * from './auth.types';
```

---

## 5. RTK Query API Endpoints

### 5.1 Base API Setup

```typescript
// services/api/baseApi.ts
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Products',
    'Categories',
    'Cart',
    'Orders',
    'Coupons',
    'User',
  ],
  endpoints: () => ({}),
});
```

### 5.2 Products API

```typescript
// services/api/productsApi.ts
import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import type { Product, ProductListItem } from '@/types';

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // Get all published products
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.products,
            [
              Query.orderDesc('$createdAt'),
              Query.limit(100),
            ]
          );
          return { data: response.documents as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    // Get single product by ID
    getProductById: builder.query<Product, string>({
      queryFn: async (productId) => {
        try {
          const response = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.products,
            productId
          );
          return { data: response as Product };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),

    // Get products by category
    getProductsByCategory: builder.query<Product[], string>({
      queryFn: async (categoryId) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.products,
            [
              Query.equal('category', categoryId),
              Query.orderDesc('$createdAt'),
              Query.limit(100),
            ]
          );
          return { data: response.documents as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    // Get featured products
    getFeaturedProducts: builder.query<Product[], number | void>({
      queryFn: async (limit = 8) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.products,
            [
              Query.equal('isFeatured', true),
              Query.limit(limit),
            ]
          );
          return { data: response.documents as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    // Get products on sale
    getSaleProducts: builder.query<Product[], number | void>({
      queryFn: async (limit = 12) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.products,
            [
              Query.equal('onSale', true),
              Query.limit(limit),
            ]
          );
          return { data: response.documents as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    // Search products
    searchProducts: builder.query<Product[], string>({
      queryFn: async (searchTerm) => {
        try {
          if (searchTerm.length < 2) {
            return { data: [] };
          }
          
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.products,
            [Query.limit(100)]
          );
          
          // Client-side search (Appwrite doesn't support full-text search on all fields)
          const term = searchTerm.toLowerCase();
          const filtered = response.documents.filter((doc: any) => 
            doc.productName?.toLowerCase().includes(term) ||
            doc.description?.toLowerCase().includes(term) ||
            doc.sku?.toLowerCase().includes(term) ||
            doc.tags?.some((tag: string) => tag.toLowerCase().includes(term))
          );
          
          return { data: filtered as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    // Validate stock availability
    validateStock: builder.query<{ valid: boolean; errors: string[] }, CartItem[]>({
      queryFn: async (items) => {
        try {
          const errors: string[] = [];
          
          for (const item of items) {
            const product = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.products,
              item.productId
            );
            
            if (product.quantityInStock < item.quantity) {
              errors.push(
                `${item.productName}: רק ${product.quantityInStock} יחידות במלאי`
              );
            }
            
            if (product.stockStatus === 'out_of_stock') {
              errors.push(`${item.productName}: אזל מהמלאי`);
            }
          }
          
          return { data: { valid: errors.length === 0, errors } };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),
    
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useGetFeaturedProductsQuery,
  useGetSaleProductsQuery,
  useSearchProductsQuery,
  useValidateStockQuery,
  useLazyValidateStockQuery,
} = productsApi;
```

### 5.3 Categories API

```typescript
// services/api/categoriesApi.ts
import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import type { Category, CategoryWithChildren } from '@/types';

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // Get all active categories
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.categories,
            [
              Query.equal('status', 'active'),
              Query.orderAsc('displayOrder'),
              Query.limit(100),
            ]
          );
          return { data: response.documents as Category[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Categories'],
    }),

    // Get category by slug
    getCategoryBySlug: builder.query<Category | null, string>({
      queryFn: async (slug) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.categories,
            [
              Query.equal('slug', slug),
              Query.equal('status', 'active'),
              Query.limit(1),
            ]
          );
          
          if (response.documents.length === 0) {
            return { data: null };
          }
          
          return { data: response.documents[0] as Category };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: (result, error, slug) => [{ type: 'Categories', id: slug }],
    }),

    // Get category tree (nested structure)
    getCategoryTree: builder.query<CategoryWithChildren[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.categories,
            [
              Query.equal('status', 'active'),
              Query.orderAsc('displayOrder'),
              Query.limit(100),
            ]
          );
          
          const categories = response.documents as Category[];
          
          // Build tree structure
          const buildTree = (parentId: string | null): CategoryWithChildren[] => {
            return categories
              .filter(cat => cat.parentId === parentId)
              .map(cat => ({
                ...cat,
                children: buildTree(cat.$id),
              }));
          };
          
          return { data: buildTree(null) };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Categories'],
    }),
    
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryTreeQuery,
} = categoriesApi;
```

### 5.4 Orders API

```typescript
// services/api/ordersApi.ts
import { api } from './baseApi';
import { databases, account, APPWRITE_CONFIG } from '../appwrite';
import { Query, ID } from 'appwrite';
import type { Order, OrderDetails, OrderItem, CreateOrderPayload, OrderStatus } from '@/types';

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // Get customer's orders
    getMyOrders: builder.query<Order[], void>({
      queryFn: async () => {
        try {
          // Get current user
          const user = await account.get();
          
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.orders,
            [
              Query.equal('customerEmail', user.email),
              Query.orderDesc('$createdAt'),
              Query.limit(50),
            ]
          );
          
          const orders: Order[] = response.documents.map((doc: any) => ({
            $id: doc.$id,
            $createdAt: doc.$createdAt,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerAvatar: doc.customerAvatar,
            total: doc.total,
            status: doc.status as OrderStatus,
          }));
          
          return { data: orders };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Orders'],
    }),

    // Get single order by ID
    getOrderById: builder.query<OrderDetails, string>({
      queryFn: async (orderId) => {
        try {
          // Get current user for authorization
          const user = await account.get();
          
          // Get order
          const order = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.orders,
            orderId
          );
          
          // Verify ownership
          if (order.customerEmail !== user.email) {
            return { error: 'אין לך הרשאה לצפות בהזמנה זו' };
          }
          
          // Get order items
          const itemsResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.orderItems,
            [
              Query.equal('orderId', orderId),
              Query.limit(100),
            ]
          );
          
          const orderDetails: OrderDetails = {
            $id: order.$id,
            $createdAt: order.$createdAt,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            customerAvatar: order.customerAvatar,
            total: order.total,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            tax: order.tax,
            status: order.status as OrderStatus,
            shippingAddress: {
              street: order.shippingStreet,
              apartment: order.shippingApartment,
              city: order.shippingCity,
              postalCode: order.shippingPostalCode,
              country: order.shippingCountry,
            },
            payment: {
              method: order.paymentMethod,
              cardExpiry: order.paymentCardExpiry,
              transactionId: order.paymentTransactionId,
              chargeDate: order.paymentChargeDate,
            },
            items: itemsResponse.documents as OrderItem[],
          };
          
          return { data: orderDetails };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    // Create new order
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      queryFn: async (payload) => {
        try {
          // Calculate totals
          const subtotal = payload.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const shippingCost = subtotal >= 300 ? 0 : 29.90; // Free shipping over 300 ILS
          const tax = subtotal * 0.17; // 17% VAT
          const total = subtotal + shippingCost + tax;
          
          // Create order document (flattened)
          const orderId = ID.unique();
          const order = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.orders,
            orderId,
            {
              customerName: payload.customerName,
              customerEmail: payload.customerEmail,
              customerPhone: payload.customerPhone || '',
              total,
              subtotal,
              shippingCost,
              tax,
              status: 'pending',
              // Flattened shipping address
              shippingStreet: payload.shippingAddress.street,
              shippingApartment: payload.shippingAddress.apartment || '',
              shippingCity: payload.shippingAddress.city,
              shippingPostalCode: payload.shippingAddress.postalCode,
              shippingCountry: payload.shippingAddress.country,
              // Flattened payment info
              paymentMethod: payload.payment.method,
              paymentCardExpiry: payload.payment.cardExpiry || '',
              paymentTransactionId: payload.payment.transactionId,
              paymentChargeDate: payload.payment.chargeDate,
            }
          );
          
          // Create order items
          await Promise.all(
            payload.items.map((item) =>
              databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.orderItems,
                ID.unique(),
                {
                  orderId,
                  productName: item.productName,
                  productImage: item.productImage || '',
                  variant: item.variant || '',
                  quantity: item.quantity,
                  price: item.price,
                  total: item.price * item.quantity,
                }
              )
            )
          );
          
          return {
            data: {
              $id: order.$id,
              $createdAt: order.$createdAt,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              total: order.total,
              status: order.status as OrderStatus,
            },
          };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Orders'],
    }),
    
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
} = ordersApi;
```

### 5.5 Coupons API

```typescript
// services/api/couponsApi.ts
import { api } from './baseApi';
import { databases, account, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import type { Coupon, CouponValidationResult, CartItem } from '@/types';

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // Validate coupon code
    validateCoupon: builder.query<CouponValidationResult, { 
      code: string; 
      cartItems: CartItem[]; 
      subtotal: number;
    }>({
      queryFn: async ({ code, cartItems, subtotal }) => {
        try {
          // Find coupon by code
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.coupons,
            [
              Query.equal('code', code.toUpperCase()),
              Query.limit(1),
            ]
          );
          
          if (response.documents.length === 0) {
            return { 
              data: { 
                valid: false, 
                error: 'קוד קופון לא תקין' 
              } 
            };
          }
          
          const coupon = response.documents[0] as Coupon;
          const now = new Date();
          
          // Check status
          if (coupon.status !== 'active') {
            return { 
              data: { 
                valid: false, 
                error: 'קופון זה אינו פעיל' 
              } 
            };
          }
          
          // Check dates
          if (new Date(coupon.startDate) > now) {
            return { 
              data: { 
                valid: false, 
                error: 'קופון זה עדיין לא בתוקף' 
              } 
            };
          }
          
          if (coupon.endDate && new Date(coupon.endDate) < now) {
            return { 
              data: { 
                valid: false, 
                error: 'תוקף הקופון פג' 
              } 
            };
          }
          
          // Check usage limit
          if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { 
              data: { 
                valid: false, 
                error: 'הקופון הגיע למגבלת השימושים' 
              } 
            };
          }
          
          // Check minimum order
          if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
            return { 
              data: { 
                valid: false, 
                error: `מינימום הזמנה לקופון זה: ₪${coupon.minimumOrder}` 
              } 
            };
          }
          
          // Check first purchase only
          if (coupon.firstPurchaseOnly) {
            try {
              const user = await account.get();
              const orders = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.orders,
                [
                  Query.equal('customerEmail', user.email),
                  Query.limit(1),
                ]
              );
              
              if (orders.documents.length > 0) {
                return { 
                  data: { 
                    valid: false, 
                    error: 'קופון זה לרכישה ראשונה בלבד' 
                  } 
                };
              }
            } catch {
              // User not logged in - allow for now, will check at checkout
            }
          }
          
          // Calculate discount
          let discountAmount = 0;
          
          switch (coupon.discountType) {
            case 'percentage':
              discountAmount = subtotal * (coupon.discountValue / 100);
              break;
            case 'fixed_amount':
              discountAmount = coupon.discountValue;
              break;
            case 'free_shipping':
              discountAmount = 29.90; // Standard shipping cost
              break;
            default:
              discountAmount = 0;
          }
          
          // Apply maximum discount cap
          if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
            discountAmount = coupon.maximumDiscount;
          }
          
          return { 
            data: { 
              valid: true, 
              coupon,
              discountAmount,
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Coupons'],
    }),
    
  }),
});

export const {
  useValidateCouponQuery,
  useLazyValidateCouponQuery,
} = couponsApi;
```

### 5.6 Auth API

```typescript
// services/api/authApi.ts
import { api } from './baseApi';
import { account, ID } from '../appwrite';
import type { ShopUser, RegisterPayload, LoginPayload, UpdateProfilePayload } from '@/types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // Register new customer
    register: builder.mutation<ShopUser, RegisterPayload>({
      queryFn: async (payload) => {
        try {
          // Create account
          await account.create(
            ID.unique(),
            payload.email,
            payload.password,
            payload.name
          );
          
          // Auto-login after registration
          await account.createEmailPasswordSession(
            payload.email,
            payload.password
          );
          
          // Update phone if provided
          if (payload.phone) {
            await account.updatePhone(payload.phone, payload.password);
          }
          
          // Get user data
          const user = await account.get();
          
          return {
            data: {
              $id: user.$id,
              name: user.name,
              email: user.email,
              phone: user.phone || undefined,
              prefs: user.prefs,
            },
          };
        } catch (error: any) {
          // Handle common errors with Hebrew messages
          if (error.code === 409) {
            return { error: 'כתובת אימייל זו כבר רשומה במערכת' };
          }
          if (error.code === 400) {
            return { error: 'הסיסמה חייבת להכיל לפחות 8 תווים' };
          }
          return { error: error.message };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Login
    login: builder.mutation<ShopUser, LoginPayload>({
      queryFn: async ({ email, password }) => {
        try {
          await account.createEmailPasswordSession(email, password);
          const user = await account.get();
          
          // Check if user is admin - admins should use admin dashboard
          if (user.labels?.includes('admin')) {
            await account.deleteSession('current');
            return { error: 'משתמשי מנהל צריכים להשתמש בפאנל הניהול' };
          }
          
          return {
            data: {
              $id: user.$id,
              name: user.name,
              email: user.email,
              phone: user.phone || undefined,
              prefs: user.prefs,
            },
          };
        } catch (error: any) {
          if (error.code === 401) {
            return { error: 'אימייל או סיסמה שגויים' };
          }
          return { error: error.message };
        }
      },
      invalidatesTags: ['User', 'Orders'],
    }),

    // Logout
    logout: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
          await account.deleteSession('current');
          return { data: true };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['User', 'Orders'],
    }),

    // Get current user
    getCurrentUser: builder.query<ShopUser | null, void>({
      queryFn: async () => {
        try {
          const user = await account.get();
          
          // Prevent admins from using shop
          if (user.labels?.includes('admin')) {
            return { data: null };
          }
          
          return {
            data: {
              $id: user.$id,
              name: user.name,
              email: user.email,
              phone: user.phone || undefined,
              prefs: user.prefs,
            },
          };
        } catch {
          return { data: null };
        }
      },
      providesTags: ['User'],
    }),

    // Update profile
    updateProfile: builder.mutation<ShopUser, UpdateProfilePayload>({
      queryFn: async (payload) => {
        try {
          // Update name
          if (payload.name) {
            await account.updateName(payload.name);
          }
          
          // Update preferences (address, etc.)
          if (payload.address) {
            const currentPrefs = (await account.get()).prefs || {};
            await account.updatePrefs({
              ...currentPrefs,
              address: payload.address,
            });
          }
          
          const user = await account.get();
          
          return {
            data: {
              $id: user.$id,
              name: user.name,
              email: user.email,
              phone: user.phone || undefined,
              prefs: user.prefs,
            },
          };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Request password reset
    requestPasswordReset: builder.mutation<boolean, string>({
      queryFn: async (email) => {
        try {
          await account.createRecovery(
            email,
            `${window.location.origin}/reset-password`
          );
          return { data: true };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),

    // Complete password reset
    resetPassword: builder.mutation<boolean, { userId: string; secret: string; password: string }>({
      queryFn: async ({ userId, secret, password }) => {
        try {
          await account.updateRecovery(userId, secret, password);
          return { data: true };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),
    
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
```

### 5.7 API Index

```typescript
// services/api/index.ts
export { api } from './baseApi';
export * from './productsApi';
export * from './categoriesApi';
export * from './ordersApi';
export * from './couponsApi';
export * from './authApi';
```

---

## 6. Authentication Contract

### Customer vs Admin

| Aspect | Customer (Shop) | Admin (Dashboard) |
|--------|-----------------|-------------------|
| User Type | Regular Appwrite user | User with `admin` label |
| Self-Registration | Allowed | Not allowed |
| Access Check | No label check | Must have `admin` label |
| Session | Standard Appwrite session | Standard Appwrite session |

### Auth Flow Diagrams

#### Registration Flow

```
┌──────────┐     ┌──────────────────┐     ┌─────────────┐
│   User   │────▶│ account.create() │────▶│  New User   │
└──────────┘     └──────────────────┘     └─────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │ createEmailPasswordSession│
              └──────────────────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │   Return ShopUser data   │
              └──────────────────────────┘
```

#### Login Flow

```
┌──────────┐     ┌──────────────────────────┐
│   User   │────▶│ createEmailPasswordSession│
└──────────┘     └──────────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  account.get()  │
                 └─────────────────┘
                          │
                          ▼
               ┌────────────────────┐
               │ Check for 'admin' │
               │     label?        │
               └────────────────────┘
                    │         │
             No     │         │  Yes
                    ▼         ▼
           ┌───────────┐  ┌─────────────────┐
           │  Success  │  │ Destroy session │
           └───────────┘  │ Return error    │
                          └─────────────────┘
```

### Session Management

```typescript
// Session is stored in cookies by Appwrite
// Check session on app load:

const App = () => {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthContext.Provider>
  );
};
```

---

## 7. Permission Model

### Appwrite Collection Permissions

Configure these permissions in the Appwrite Console:

#### Products Collection
```
Read: role("all")     # Anyone can read (public catalog)
Create: -             # Only admins via admin dashboard
Update: -             # Only admins via admin dashboard
Delete: -             # Only admins via admin dashboard
```

#### Categories Collection
```
Read: role("all")     # Anyone can read (public navigation)
Create: -             # Only admins
Update: -             # Only admins
Delete: -             # Only admins
```

#### Orders Collection
```
Read: role("users")   # Logged in users
Create: role("users") # Logged in users
Update: -             # Only admins can update status
Delete: -             # Only admins

Document Security: Enabled
# Each order has permissions set to the creating user
```

#### Order Items Collection
```
Read: role("users")   # Logged in users
Create: role("users") # Logged in users
Update: -             # Immutable
Delete: -             # Only admins

Document Security: Enabled
```

#### Coupons Collection
```
Read: role("all")     # Anyone can validate coupons
Create: -             # Only admins
Update: -             # Only admins
Delete: -             # Only admins
```

### Document-Level Security

For orders, set document permissions when creating:

```typescript
// When creating an order
await databases.createDocument(
  APPWRITE_CONFIG.databaseId,
  APPWRITE_CONFIG.collections.orders,
  orderId,
  orderData,
  [
    Permission.read(Role.user(userId)),    // Only this user can read
    Permission.update(Role.user(userId)),  // Optional: allow user updates
  ]
);
```

---

## 8. Data Mapping

### 8.1 Appwrite Document → TypeScript Interface

```typescript
// Appwrite returns documents with system fields
interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
  // ... custom fields
}

// Map to clean interface
const mapProduct = (doc: AppwriteDocument): Product => ({
  $id: doc.$id,
  $createdAt: doc.$createdAt,
  $updatedAt: doc.$updatedAt,
  productName: doc.productName,
  description: doc.description,
  // ... rest of fields
});
```

### 8.2 Cart Items → Order Creation Payload

```typescript
const mapCartToOrderPayload = (
  cart: Cart,
  user: ShopUser,
  shippingAddress: ShippingAddress,
  paymentInfo: PaymentInfo
): CreateOrderPayload => ({
  customerName: user.name,
  customerEmail: user.email,
  customerPhone: user.phone,
  shippingAddress,
  payment: paymentInfo,
  items: cart.items.map(item => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    variant: item.variant,
    quantity: item.quantity,
    price: item.salePrice || item.price,
  })),
  couponCode: cart.appliedCoupon?.code,
});
```

### 8.3 Flattened Order → Nested OrderDetails

```typescript
const mapFlatOrderToDetails = (
  order: any, 
  items: OrderItem[]
): OrderDetails => ({
  $id: order.$id,
  $createdAt: order.$createdAt,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  customerPhone: order.customerPhone,
  customerAvatar: order.customerAvatar,
  total: order.total,
  subtotal: order.subtotal,
  shippingCost: order.shippingCost,
  tax: order.tax,
  status: order.status,
  
  // Nest shipping address
  shippingAddress: {
    street: order.shippingStreet,
    apartment: order.shippingApartment,
    city: order.shippingCity,
    postalCode: order.shippingPostalCode,
    country: order.shippingCountry,
  },
  
  // Nest payment info
  payment: {
    method: order.paymentMethod,
    cardExpiry: order.paymentCardExpiry,
    transactionId: order.paymentTransactionId,
    chargeDate: order.paymentChargeDate,
  },
  
  items,
});
```

---

## 9. Error Handling

### Standard Error Response Format

```typescript
interface ApiError {
  code: number;
  message: string;
  type: string;
}

// RTK Query error handling
const handleAppwriteError = (error: any): string => {
  const errorMessages: Record<number, string> = {
    400: 'בקשה לא תקינה',
    401: 'נדרשת התחברות',
    403: 'אין לך הרשאה לפעולה זו',
    404: 'הפריט לא נמצא',
    409: 'פריט עם נתונים אלו כבר קיים',
    429: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
    500: 'שגיאת שרת, נסה שוב מאוחר יותר',
  };
  
  return errorMessages[error.code] || error.message || 'שגיאה לא צפויה';
};
```

### Domain-Specific Error Messages

```typescript
// Authentication errors
const authErrors = {
  'Invalid credentials': 'אימייל או סיסמה שגויים',
  'User already exists': 'כתובת אימייל זו כבר רשומה במערכת',
  'Password too short': 'הסיסמה חייבת להכיל לפחות 8 תווים',
  'Session expired': 'ההתחברות פגה, יש להתחבר מחדש',
};

// Cart/Order errors
const orderErrors = {
  'Out of stock': 'המוצר אזל מהמלאי',
  'Insufficient stock': 'אין מספיק יחידות במלאי',
  'Invalid coupon': 'קוד קופון לא תקין',
  'Coupon expired': 'תוקף הקופון פג',
  'Minimum order not met': 'לא עברת את מינימום ההזמנה לקופון זה',
};

// Validation errors
const validationErrors = {
  'Required field': 'שדה חובה',
  'Invalid email': 'כתובת אימייל לא תקינה',
  'Invalid phone': 'מספר טלפון לא תקין',
  'Invalid postal code': 'מיקוד לא תקין',
};
```

### Error Display Component

```typescript
// components/ErrorMessage.tsx
interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-right">
    <p className="text-red-700">{error}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="mt-2 text-red-600 underline hover:no-underline"
      >
        נסה שוב
      </button>
    )}
  </div>
);
```

---

## 10. Implementation Guide

### 10.1 Project Setup

```bash
# Create Vite project
npm create vite@latest wine-shop -- --template react-ts
cd wine-shop

# Install dependencies
npm install @reduxjs/toolkit react-redux appwrite
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional utilities
npm install react-router-dom react-hook-form
```

### 10.2 Tailwind Configuration for RTL

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'sans-serif'], // Hebrew-optimized font
      },
    },
  },
  plugins: [],
}
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>חנות היין</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 10.3 Redux Store Setup

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 10.4 Cart Slice (Client-Side State)

```typescript
// slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Cart, CartItem, AppliedCoupon } from '@/types';

const initialState: Cart = {
  items: [],
  subtotal: 0,
  discount: 0,
  shippingCost: 0,
  tax: 0,
  total: 0,
  appliedCoupon: undefined,
};

// Load cart from localStorage
const loadCart = (): Cart => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : initialState;
  } catch {
    return initialState;
  }
};

// Calculate totals
const calculateTotals = (state: Cart): void => {
  state.subtotal = state.items.reduce(
    (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
    0
  );
  state.shippingCost = state.subtotal >= 300 ? 0 : 29.90;
  state.tax = state.subtotal * 0.17;
  state.total = state.subtotal + state.shippingCost + state.tax - state.discount;
};

// Save to localStorage
const saveCart = (state: Cart): void => {
  try {
    localStorage.setItem('cart', JSON.stringify(state));
  } catch {
    // Silent fail
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        item => item.productId === action.payload.productId
      );
      
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + action.payload.quantity,
          existing.maxQuantity
        );
      } else {
        state.items.push(action.payload);
      }
      
      calculateTotals(state);
      saveCart(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(i => i.productId === action.payload.productId);
      if (item) {
        item.quantity = Math.min(action.payload.quantity, item.maxQuantity);
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== action.payload.productId);
        }
      }
      calculateTotals(state);
      saveCart(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      calculateTotals(state);
      saveCart(state);
    },
    
    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      state.appliedCoupon = action.payload;
      state.discount = action.payload.discountAmount;
      calculateTotals(state);
      saveCart(state);
    },
    
    removeCoupon: (state) => {
      state.appliedCoupon = undefined;
      state.discount = 0;
      calculateTotals(state);
      saveCart(state);
    },
    
    clearCart: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem('cart');
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
```

### 10.5 Recommended Folder Structure

```
src/
├── components/
│   ├── common/           # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Layout.tsx
│   ├── products/         # Product components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductDetails.tsx
│   ├── cart/             # Cart components
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/         # Checkout components
│   │   ├── CheckoutForm.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── PaymentForm.tsx
│   │   └── OrderSummary.tsx
│   └── auth/             # Auth components
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── ProtectedRoute.tsx
├── pages/
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Category.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderConfirmation.tsx
│   ├── Account.tsx
│   ├── OrderHistory.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── services/
│   ├── appwrite.ts       # Appwrite client
│   └── api/              # RTK Query APIs
│       ├── baseApi.ts
│       ├── productsApi.ts
│       ├── categoriesApi.ts
│       ├── ordersApi.ts
│       ├── couponsApi.ts
│       ├── authApi.ts
│       └── index.ts
├── slices/
│   ├── cartSlice.ts
│   └── authSlice.ts
├── types/
│   ├── products.types.ts
│   ├── categories.types.ts
│   ├── cart.types.ts
│   ├── orders.types.ts
│   ├── coupons.types.ts
│   ├── auth.types.ts
│   └── index.ts
├── hooks/
│   ├── useCart.ts
│   ├── useAuth.ts
│   └── useProducts.ts
├── utils/
│   ├── formatters.ts     # Price, date formatting
│   ├── validators.ts     # Form validation
│   └── storage.ts        # LocalStorage helpers
├── contexts/
│   └── AuthContext.tsx
├── App.tsx
├── main.tsx
├── store.ts
└── index.css             # Tailwind imports
```

---

## Appendix A: Appwrite Query Reference

```typescript
import { Query } from 'appwrite';

// Common queries used in shop
const queries = {
  // Pagination
  paginate: (page: number, limit: number) => [
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ],
  
  // Sorting
  sortByNewest: () => Query.orderDesc('$createdAt'),
  sortByPrice: (asc = true) => 
    asc ? Query.orderAsc('price') : Query.orderDesc('price'),
  sortByName: () => Query.orderAsc('productName'),
  
  // Filtering
  byCategory: (id: string) => Query.equal('category', id),
  inStock: () => Query.notEqual('stockStatus', 'out_of_stock'),
  onSale: () => Query.equal('onSale', true),
  featured: () => Query.equal('isFeatured', true),
  priceRange: (min: number, max: number) => [
    Query.greaterThanEqual('price', min),
    Query.lessThanEqual('price', max),
  ],
  byWineType: (type: WineType) => Query.equal('wineType', type),
  
  // Status
  active: () => Query.equal('status', 'active'),
  
  // Search (limited - Appwrite doesn't support full-text on all fields)
  searchByName: (term: string) => Query.search('productName', term),
};
```

---

## Appendix B: Hebrew UI Text Reference

```typescript
// Common Hebrew labels for the shop
const hebrewLabels = {
  // Navigation
  home: 'דף הבית',
  products: 'מוצרים',
  categories: 'קטגוריות',
  cart: 'עגלת קניות',
  account: 'החשבון שלי',
  login: 'התחברות',
  register: 'הרשמה',
  logout: 'התנתקות',
  
  // Product
  addToCart: 'הוסף לעגלה',
  outOfStock: 'אזל מהמלאי',
  onSale: 'במבצע',
  featured: 'מומלץ',
  price: 'מחיר',
  quantity: 'כמות',
  
  // Cart
  cartEmpty: 'העגלה ריקה',
  subtotal: 'סכום ביניים',
  shipping: 'משלוח',
  tax: 'מע"מ',
  total: 'סה"כ',
  checkout: 'לתשלום',
  continueShopping: 'המשך קניות',
  freeShipping: 'משלוח חינם',
  
  // Checkout
  shippingAddress: 'כתובת למשלוח',
  paymentMethod: 'אמצעי תשלום',
  placeOrder: 'בצע הזמנה',
  orderConfirmation: 'אישור הזמנה',
  
  // Account
  myOrders: 'ההזמנות שלי',
  orderHistory: 'היסטוריית הזמנות',
  profile: 'פרטים אישיים',
  savedAddresses: 'כתובות שמורות',
  
  // Status
  pending: 'ממתין',
  processing: 'בטיפול',
  completed: 'הושלם',
  cancelled: 'בוטל',
  
  // Messages
  loading: 'טוען...',
  error: 'שגיאה',
  success: 'הצלחה',
  orderPlaced: 'ההזמנה בוצעה בהצלחה!',
  loginRequired: 'יש להתחבר כדי להמשיך',
};
```

---

## Appendix C: Environment Setup Checklist

Before deploying the shop frontend:

- [ ] Create `.env.local` with Appwrite credentials
- [ ] Configure Appwrite collection permissions (Section 7)
- [ ] Enable document security on orders/order_items collections
- [ ] Test customer registration flow
- [ ] Test order creation flow
- [ ] Verify coupon validation logic
- [ ] Set up proper CORS in Appwrite Console
- [ ] Add shop domain to allowed platforms in Appwrite

---

## Document Info

| | |
|---|---|
| **Version** | 1.0.0 |
| **Last Updated** | January 2026 |
| **Target Stack** | React + RTK Query + Tailwind CSS |
| **Backend** | Appwrite Cloud |
| **Database** | cms_db |

---

*This document is the single source of truth for shop frontend integration with the Appwrite backend.*
