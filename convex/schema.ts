import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Standard Convex Auth tables (authAccounts, authSessions, etc.)
  ...authTables,

   // Fix: Made fields optional where Auth providers might delay data
   // Fix: Added strict typing for the Cart object
   users: defineTable({
     // Required fields - must always be present after auth
     name: v.string(),
     email: v.string(),
     
     // Optional auth-related fields
     image: v.optional(v.string()),
     emailVerificationTime: v.optional(v.number()),
     phone: v.optional(v.string()),
     phoneVerificationTime: v.optional(v.number()),
     isAnonymous: v.optional(v.boolean()),

    role: v.optional(
      v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"))
    ),
    status: v.optional(
      v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))
    ),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    
    // Improved Cart Schema for type-safety
    cart: v.optional(
      v.object({
        items: v.array(v.object({
          productId: v.id("products"),
          quantity: v.number(),
          priceAtTimeOfAdding: v.number(),
        })),
        appliedCoupon: v.optional(v.string()), // Store the code
        updatedAt: v.string(),
      })
    ),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  userAddresses: defineTable({
    userId: v.id("users"),
    name: v.string(), // e.g., "בית" or "עבודה"
    street: v.string(),
    apartment: v.optional(v.string()),
    city: v.string(),
    postalCode: v.string(),
    country: v.string(),
    isDefault: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_default", ["userId", "isDefault"]),

  products: defineTable({
    productName: v.string(),
    productNameHe: v.optional(v.string()),
    price: v.float64(),
    // Fix: Using number instead of int64 for easier JS handling
    quantityInStock: v.number(), 
    sku: v.string(),
    category: v.string(), 

    description: v.optional(v.string()),
    descriptionHe: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    shortDescriptionHe: v.optional(v.string()),
    salePrice: v.optional(v.float64()),
    onSale: v.optional(v.boolean()),

    wineType: v.optional(
      v.union(
        v.literal("Red"),
        v.literal("White"),
        v.literal("Rosé"),
        v.literal("Sparkling")
      )
    ),
    region: v.optional(v.string()),
    vintage: v.optional(v.number()), // Changed from int64
    alcoholContent: v.optional(v.float64()),
    volume: v.optional(v.string()), 
    grapeVariety: v.optional(v.string()),
    servingTemperature: v.optional(v.string()),
    tastingNotes: v.optional(v.string()),

    featuredImage: v.optional(v.string()), 
    images: v.optional(v.array(v.string())), 

    isFeatured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    relatedProducts: v.optional(v.array(v.string())), 

    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("hidden"),
        v.literal("discontinued")
      )
    ),
    stockStatus: v.optional(
      v.union(
        v.literal("in_stock"),
        v.literal("out_of_stock"),
        v.literal("low_stock")
      )
    ),

    dateAdded: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .searchIndex("search_he", { searchField: "productNameHe" })
    .searchIndex("search_en", { searchField: "productName" })
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  categories: defineTable({
    name: v.string(),
    nameHe: v.optional(v.string()),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.string()), 
    order: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"), v.literal("hidden"))),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    customerId: v.optional(v.id("users")), 
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAvatar: v.optional(v.string()),

    subtotal: v.float64(),
    tax: v.float64(),
    shippingCost: v.float64(),
    total: v.float64(),

    shippingStreet: v.string(),
    shippingApartment: v.optional(v.string()),
    shippingCity: v.string(),
    shippingPostalCode: v.string(),
    shippingCountry: v.string(),

    paymentMethod: v.string(),
    paymentCardExpiry: v.optional(v.string()),
    paymentTransactionId: v.string(),
    paymentChargeDate: v.string(),

    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("shipped")
    ),

    appliedCouponCode: v.optional(v.string()),
    appliedCouponDiscount: v.optional(v.float64()),

    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_customerEmail", ["customerEmail"])
    .index("by_customerId", ["customerId"])
    .index("by_status", ["status"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    productName: v.string(),
    productImage: v.optional(v.string()),
    variant: v.optional(v.string()),
    quantity: v.number(),
    price: v.float64(),
    total: v.float64(),
  }).index("by_orderId", ["orderId"]),

  coupons: defineTable({
    code: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("expired"),
      v.literal("scheduled")
    ),
    description: v.optional(v.string()),

    discountType: v.union(
      v.literal("percentage"), 
      v.literal("fixed_amount"), 
      v.literal("free_shipping"), 
      v.literal("free_product"), 
      v.literal("buy_x_get_y") 
    ),
    discountValue: v.float64(),

    buyQuantity: v.optional(v.number()),
    getQuantity: v.optional(v.number()),

    startDate: v.string(), 
    endDate: v.optional(v.string()),
    minimumOrder: v.optional(v.float64()),
    maximumDiscount: v.optional(v.float64()),

    usageLimit: v.optional(v.number()), 
    usageLimitPerUser: v.optional(v.number()), 
    usageCount: v.number(), 

    categoryIds: v.optional(v.array(v.string())),
    productIds: v.optional(v.array(v.string())),
    userIds: v.optional(v.array(v.string())),
    firstPurchaseOnly: v.optional(v.boolean()),
    excludeOtherCoupons: v.optional(v.boolean()),

    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"]),

  couponUsage: defineTable({
    couponId: v.id("coupons"),
    couponCode: v.string(),
    userId: v.optional(v.id("users")),
    userEmail: v.string(),
    usageCount: v.number(),
    lastUsedAt: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_couponCode_userEmail", ["couponCode", "userEmail"]),

  cartRules: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    ruleType: v.union(v.literal("buy_x_get_y"), v.literal("bulk_discount")),
    config: v.any(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),

  analyticsEvents: defineTable({
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    event: v.string(),
    properties: v.any(),
    timestamp: v.string(),
  }).index("by_event", ["event"]),

  notifications: defineTable({
    userId: v.id("users"), 
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    isRead: v.boolean(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),
});