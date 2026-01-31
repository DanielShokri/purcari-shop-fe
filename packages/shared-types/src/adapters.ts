/**
 * Type Adapters: Convert Convex database types to Appwrite-compatible types
 * 
 * Convex stores:
 *   - IDs as `_id: Id<"tableName">` (branded string type)
 *   - Timestamps as `_creationTime: number` (milliseconds)
 * 
 * Appwrite-compatible types expect:
 *   - IDs as `$id: string`
 *   - Timestamps as `$createdAt: string` (ISO 8601)
 * 
 * These adapters handle the conversion while preserving all data.
 */

import type { Id, Doc } from '../../../convex/_generated/dataModel';
import {
  Product,
  User,
  AuthUser,
  Order,
  Notification,
  Category,
  CartRule,
  Coupon,
  CouponUsageRecord,
  Address,
} from './index';

/**
 * Convert Convex product document to Appwrite-compatible Product type
 * 
 * Usage:
 *   const convexProduct = await db.get(productId);
 *   const appwriteProduct = dbProductToAppwrite(convexProduct);
 */
export function dbProductToAppwrite(
  doc: Doc<'products'> & { _id: Id<'products'>; _creationTime: number }
): Product {
  return {
    $id: doc._id as unknown as string, // Convert Id<"products"> to string
    $createdAt: new Date(doc._creationTime).toISOString(),
    productName: doc.productName,
    productNameHe: doc.productNameHe,
    description: doc.description,
    descriptionHe: doc.descriptionHe,
    shortDescription: doc.shortDescription,
    shortDescriptionHe: doc.shortDescriptionHe,
    price: doc.price,
    salePrice: doc.salePrice,
    onSale: doc.onSale,
    quantityInStock: Number(doc.quantityInStock), // Convert bigint to number
    sku: doc.sku,
    stockStatus: doc.stockStatus,
    status: doc.status,
    category: doc.category,
    dateAdded: doc.dateAdded,
    tags: doc.tags,
    relatedProducts: doc.relatedProducts,
    isFeatured: doc.isFeatured,
    featuredImage: doc.featuredImage,
    images: doc.images,
    wineType: doc.wineType,
    region: doc.region,
    vintage: doc.vintage ? Number(doc.vintage) : undefined,
    alcoholContent: doc.alcoholContent,
    volume: doc.volume,
    grapeVariety: doc.grapeVariety,
    servingTemperature: doc.servingTemperature,
    tastingNotes: doc.tastingNotes,
  };
}

/**
 * Convert Convex user document to Appwrite-compatible User type
 */
export function dbUserToAppwrite(
  doc: Doc<'users'> & { _id: Id<'users'>; _creationTime: number }
): User {
  return {
    $id: doc._id as unknown as string,
    $createdAt: new Date(doc._creationTime).toISOString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    prefs: {},
  };
}

/**
 * Convert Convex user document to Appwrite-compatible AuthUser type
 * (Lighter weight than User, used for authentication)
 */
export function dbUserToAuthUser(
  doc: Doc<'users'> & { _id: Id<'users'>; _creationTime: number }
): AuthUser {
  return {
    $id: doc._id as unknown as string,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    prefs: {},
  };
}

/**
 * Convert Convex order document to Appwrite-compatible Order type
 */
export function dbOrderToAppwrite(
  doc: Doc<'orders'> & { _id: Id<'orders'>; _creationTime: number }
): Order {
  return {
    $id: doc._id as unknown as string,
    $createdAt: new Date(doc._creationTime).toISOString(),
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerPhone: doc.customerPhone,
    customerAvatar: doc.customerAvatar,
    total: doc.total,
    subtotal: doc.subtotal,
    shippingCost: doc.shippingCost,
    tax: doc.tax,
    status: doc.status as any,
    shippingStreet: doc.shippingStreet,
    shippingApartment: doc.shippingApartment,
    shippingCity: doc.shippingCity,
    shippingPostalCode: doc.shippingPostalCode,
    shippingCountry: doc.shippingCountry,
    paymentMethod: doc.paymentMethod,
    paymentCardExpiry: doc.paymentCardExpiry,
    paymentTransactionId: doc.paymentTransactionId,
    paymentChargeDate: doc.paymentChargeDate,
  };
}

/**
 * Convert Convex notification document to Appwrite-compatible Notification type
 */
export function dbNotificationToAppwrite(
  doc: Doc<'notifications'> & { _id: Id<'notifications'>; _creationTime: number }
): Notification {
  return {
    $id: doc._id as unknown as string,
    title: doc.title,
    message: doc.message,
    type: doc.type,
    isRead: doc.isRead,
    icon: doc.icon,
    createdAt: new Date(doc._creationTime).toISOString(),
  };
}

/**
 * Convert Convex category document to Appwrite-compatible Category type
 */
export function dbCategoryToAppwrite(
  doc: Doc<'categories'> & { _id: Id<'categories'>; _creationTime: number }
): Category {
  return {
    $id: doc._id as unknown as string,
    $createdAt: new Date(doc._creationTime).toISOString(),
    name: doc.name,
    nameHe: doc.nameHe,
    slug: doc.slug,
    parentId: doc.parentId,
    status: doc.status || 'active',
    displayOrder: doc.order || 0,
    description: doc.description,
    descriptionHe: doc.descriptionHe,
  };
}

/**
 * Convert Convex cartRules document to Appwrite-compatible CartRule type
 */
export function dbCartRuleToAppwrite(
  doc: Doc<'cartRules'> & { _id: Id<'cartRules'>; _creationTime: number }
): CartRule {
  return {
    $id: doc._id as unknown as string,
    name: doc.name,
    description: doc.description,
    type: doc.type,
    ruleType: doc.ruleType,
    priority: doc.priority,
    status: doc.status || 'active',
    value: doc.value,
    config: doc.config,
  };
}

/**
 * Convert Convex coupon document to Appwrite-compatible Coupon type
 */
export function dbCouponToAppwrite(
  doc: Doc<'coupons'> & { _id: Id<'coupons'>; _creationTime: number }
): Coupon {
  return {
    $id: doc._id as unknown as string,
    $createdAt: new Date(doc._creationTime).toISOString(),
    code: doc.code,
    description: doc.description,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    buyQuantity: doc.buyQuantity,
    getQuantity: doc.getQuantity,
    startDate: doc.startDate,
    endDate: doc.endDate,
    minimumOrder: doc.minimumOrder,
    maximumDiscount: doc.maximumDiscount,
    usageLimit: doc.usageLimit,
    usageLimitPerUser: doc.usageLimitPerUser,
    usageCount: doc.usageCount,
    categoryIds: doc.categoryIds,
    productIds: doc.productIds,
    userIds: doc.userIds,
    firstPurchaseOnly: doc.firstPurchaseOnly,
    excludeOtherCoupons: doc.excludeOtherCoupons,
    status: doc.status || 'active',
  };
}

/**
 * Convert Convex couponUsage document to Appwrite-compatible CouponUsageRecord type
 */
export function dbCouponUsageToAppwrite(
  doc: Doc<'couponUsages'> & { _id: Id<'couponUsages'>; _creationTime: number }
): CouponUsageRecord {
  return {
    $id: doc._id as unknown as string,
    userId: doc.userId,
    userEmail: doc.userEmail,
    couponId: doc.couponId,
    couponCode: doc.couponCode,
    usageCount: doc.usageCount,
    lastUsedAt: doc.lastUsedAt,
    $createdAt: new Date(doc._creationTime).toISOString(),
  };
}

/**
 * Convert Convex userAddress document to Appwrite-compatible Address type
 */
export function dbUserAddressToAppwrite(
  doc: Doc<'userAddresses'> & { _id: Id<'userAddresses'>; _creationTime: number }
): Address {
  return {
    id: doc._id as unknown as string,
    name: doc.name,
    street: doc.street,
    city: doc.city,
    postalCode: doc.postalCode,
    country: doc.country,
    isDefault: doc.isDefault,
  };
}

/**
 * Batch converter for product arrays
 * Usage: const products = dbResults.map(dbProductToAppwrite);
 */
export function dbProductsToAppwrite(
  docs: Array<Doc<'products'> & { _id: Id<'products'>; _creationTime: number }>
): Product[] {
  return docs.map(dbProductToAppwrite);
}

/**
 * Batch converter for user arrays
 */
export function dbUsersToAppwrite(
  docs: Array<Doc<'users'> & { _id: Id<'users'>; _creationTime: number }>
): User[] {
  return docs.map(dbUserToAppwrite);
}

/**
 * Batch converter for order arrays
 */
export function dbOrdersToAppwrite(
  docs: Array<Doc<'orders'> & { _id: Id<'orders'>; _creationTime: number }>
): Order[] {
  return docs.map(dbOrderToAppwrite);
}

/**
 * Batch converter for category arrays
 */
export function dbCategoriesToAppwrite(
  docs: Array<Doc<'categories'> & { _id: Id<'categories'>; _creationTime: number }>
): Category[] {
  return docs.map(dbCategoryToAppwrite);
}

/**
 * Batch converter for address arrays
 */
export function dbUserAddressesToAppwrite(
  docs: Array<Doc<'userAddresses'> & { _id: Id<'userAddresses'>; _creationTime: number }>
): Address[] {
  return docs.map(dbUserAddressToAppwrite);
}
