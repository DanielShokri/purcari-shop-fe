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

export interface User {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  joinedAt: string; // ISO Date string
  prefs?: Record<string, any>;
}

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

export interface Product {
  $id: string;
  title: string;
  slug: string;
  content: string;
  status: ProductStatus;
  categoryId: string;
  publishedAt: string; // ISO Date string
  views: number;
  // Pricing
  price: number;
  onSale: boolean;
  salePrice?: number;
  // Inventory
  sku: string;
  stockStatus: StockStatus;
  // Features
  isFeatured: boolean;
  relatedProducts?: string[]; // Array of product IDs
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