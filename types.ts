import React from 'react';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

// AuthUser - represents the currently authenticated user from Appwrite Account API
export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  prefs?: Record<string, any>;
}

// AppwriteUser - raw user structure from Appwrite Users API
export interface AppwriteUser {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone: string;
  status: boolean; // true = active, false = blocked
  labels: string[]; // roles stored as labels (e.g., ['admin'])
  registration: string; // ISO Date string
  emailVerification: boolean;
  phoneVerification: boolean;
  mfa: boolean;
  prefs: Record<string, any>;
  accessedAt: string;
}

// User - represents a user entity for UI display (mapped from AppwriteUser)
export interface User {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  joinedAt: string; // ISO Date string (mapped from registration)
  prefs?: Record<string, any>;
}

// Helper to map Appwrite user to UI User type
export function mapAppwriteUserToUser(appwriteUser: AppwriteUser): User {
  // Extract role from labels (first matching role label, default to VIEWER)
  const roleLabels = [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER];
  const role = appwriteUser.labels.find(label => 
    roleLabels.includes(label as UserRole)
  ) as UserRole || UserRole.VIEWER;

  // Map boolean status to UserStatus enum
  const status = appwriteUser.status ? UserStatus.ACTIVE : UserStatus.SUSPENDED;

  return {
    $id: appwriteUser.$id,
    name: appwriteUser.name,
    email: appwriteUser.email,
    role,
    status,
    avatar: appwriteUser.prefs?.avatar,
    joinedAt: appwriteUser.registration,
    prefs: appwriteUser.prefs,
  };
}

// Product categories matching Appwrite enum
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME = 'home',
  BEAUTY = 'beauty',
  SPORTS = 'sports'
}

// Product interface matching Appwrite schema
export interface Product {
  $id: string;
  productName: string;        // required
  description?: string;       // optional (rich text)
  shortDescription?: string;  // optional (plain text for listings)
  price: number;              // required
  salePrice?: number;         // optional (discount price)
  onSale?: boolean;           // optional (default: false)
  quantityInStock: number;    // required
  sku: string;                // required
  category: string;           // required enum (stored as string)
  dateAdded?: string;         // optional datetime
  tags?: string[];            // optional array
  relatedProducts?: string[]; // optional array of product IDs
  isFeatured?: boolean;       // optional (default: false)
  featuredImage?: string;     // optional URL
  // UI-only fields (not stored in Appwrite)
  status?: ProductStatus;     // for UI compatibility
  stockStatus?: StockStatus;  // for UI compatibility
}

// Legacy enums kept for backwards compatibility with other parts of the app
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  HIDDEN = 'hidden'
}

export interface Category {
  $id: string;
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

export interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  $id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO Date string
}

export interface OrderItem {
  $id: string;
  productName: string;
  productImage?: string;
  variant?: string; // e.g., "צבע: אדום | מידה: 42"
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: string; // e.g., "Visa מסתיים ב-4242"
  cardExpiry?: string;
  transactionId: string;
  chargeDate: string;
}

export interface OrderDetails extends Order {
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  payment: PaymentInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
}

// Analytics Types
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  USER_ACTION = 'user_action',
}

export interface AnalyticsEvent {
  $id: string;
  type: AnalyticsEventType | string;
  userId?: string;
  productId?: string;
  $createdAt: string;
  $updatedAt: string;
}

export type AnalyticsInterval = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsSummary {
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  topProducts: Array<{
    productId: string;
    productName: string;
    views: number;
  }>;
  retention: {
    week1: number; // % returning after 1 day
    week7: number; // % returning after 7 days
    week30: number; // % returning after 30 days
  };
}

export interface TimeSeriesDataPoint {
  name: string;
  value: number;
}