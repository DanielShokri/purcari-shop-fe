import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // From Convex Auth
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"))
    ),
    status: v.optional(
      v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
    cart: v.optional(
      v.object({
        items: v.array(v.any()),
        appliedCoupon: v.optional(v.any()),
        updatedAt: v.string(),
      })
    ),
  })
    .index("by_email", ["email"])
    .index("by_tokenIdentifier", ["tokenIdentifier"]),

  userAddresses: defineTable({
    userId: v.id("users"),
    name: v.string(),
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
    // Required fields
    productName: v.string(),
    productNameHe: v.optional(v.string()),
    price: v.float64(),
    quantityInStock: v.int64(),
    sku: v.string(),
    category: v.string(), // category ID reference

    // Optional fields
    description: v.optional(v.string()),
    descriptionHe: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    shortDescriptionHe: v.optional(v.string()),
    salePrice: v.optional(v.float64()),
    onSale: v.optional(v.boolean()),

    // Wine-specific fields
    wineType: v.optional(
      v.union(
        v.literal("Red"),
        v.literal("White"),
        v.literal("Rosé"),
        v.literal("Sparkling")
      )
    ),
    region: v.optional(v.string()),
    vintage: v.optional(v.int64()),
    alcoholContent: v.optional(v.float64()),
    volume: v.optional(v.string()), // e.g., "750ml"
    grapeVariety: v.optional(v.string()),
    servingTemperature: v.optional(v.string()),
    tastingNotes: v.optional(v.string()),

    // Media
    featuredImage: v.optional(v.string()), // Full URL
    images: v.optional(v.array(v.string())), // URL array

    // Catalog management
    isFeatured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    relatedProducts: v.optional(v.array(v.string())), // Product IDs

    // Status & tracking
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
    parentId: v.optional(v.string()), // For nested categories
    order: v.optional(v.int64()),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"), v.literal("hidden"))),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    // Customer info
    customerId: v.optional(v.id("users")), // If logged in
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAvatar: v.optional(v.string()),

    // Totals
    subtotal: v.float64(),
    tax: v.float64(),
    shippingCost: v.float64(),
    total: v.float64(),

    // Flattened shipping address (denormalized for performance)
    shippingStreet: v.string(),
    shippingApartment: v.optional(v.string()),
    shippingCity: v.string(),
    shippingPostalCode: v.string(),
    shippingCountry: v.string(),

    // Flattened payment info (denormalized for audit)
    paymentMethod: v.string(),
    paymentCardExpiry: v.optional(v.string()),
    paymentTransactionId: v.string(),
    paymentChargeDate: v.string(),

    // Order management
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("shipped")
    ),

    // Coupon tracking
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
    quantity: v.int64(),
    price: v.float64(),
    total: v.float64(),
  }).index("by_orderId", ["orderId"]),

  coupons: defineTable({
    // Identity & status
    code: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("expired"),
      v.literal("scheduled")
    ),
    description: v.optional(v.string()),

    // Discount type & value
    discountType: v.union(
      v.literal("percentage"), // % off subtotal
      v.literal("fixed_amount"), // ₪X off
      v.literal("free_shipping"), // Free shipping
      v.literal("free_product"), // Free item
      v.literal("buy_x_get_y") // Buy quantity X, get Y free
    ),
    discountValue: v.float64(),

    // For buy_x_get_y type
    buyQuantity: v.optional(v.int64()),
    getQuantity: v.optional(v.int64()),

    // Validity & limits
    startDate: v.string(), // ISO 8601
    endDate: v.optional(v.string()),
    minimumOrder: v.optional(v.float64()),
    maximumDiscount: v.optional(v.float64()),

    // Usage constraints
    usageLimit: v.optional(v.int64()), // Global limit
    usageLimitPerUser: v.optional(v.int64()), // Per-user limit
    usageCount: v.int64(), // Current usage

    // Restrictions
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
    usageCount: v.int64(),
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
    userId: v.id("users"), // Admin recipient
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    isRead: v.boolean(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),
});
