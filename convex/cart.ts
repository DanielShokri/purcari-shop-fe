// @ts-nocheck - TypeScript issues with Convex db.get() type inference
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get current user's cart.
 * Returns cart items array or empty array if no cart.
 */
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return user.cart ?? null;
  },
});

/**
 * Add item to cart.
 * Validates stock availability and builds CartItem from fresh product data (not client-submitted).
 * Prevents price manipulation by fetching product from DB.
 */
export const addItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("יש להתחבר למערכת כדי להוסיף לעגלה");
    }

    const { productId, quantity } = args;

    // Fetch product from DB to get current price and stock
    const product = await ctx.db.get(productId);
    if (!product) {
      throw new Error("המוצר לא נמצא");
    }

    // Validate product is active
    if (product.status === "discontinued") {
      throw new Error("המוצר הופסק מהמכירה");
    }

    // Validate stock
    if (product.quantityInStock < quantity) {
      throw new Error("המוצר אזל מהמלאי");
    }

    // Get current user cart
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const currentCart = user.cart ?? { items: [], updatedAt: "" };
    const items = [...currentCart.items];

    // Check if item already exists in cart
    const existingIndex = items.findIndex(
      (item: any) => item.productId === productId
    );

    // Build CartItem from fresh product data
    const cartItem: any = {
      id: `${productId}_${Date.now()}`,
      productId: productId,
      title: product.productNameHe || product.productName,
      price: product.price,
      salePrice: product.salePrice,
      originalPrice: product.price,
      quantity: 0, // Will be set below
      maxQuantity: product.quantityInStock,
      imgSrc: product.featuredImage || "",
    };

    if (existingIndex >= 0) {
      // Increment quantity (capped at stock)
      const existing = items[existingIndex];
      const newQuantity = Math.min(
        existing.quantity + quantity,
        product.quantityInStock
      );
      items[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        maxQuantity: product.quantityInStock,
      };
    } else {
      // Add new item with quantity capped at stock
      cartItem.quantity = Math.min(quantity, product.quantityInStock);
      items.push(cartItem);
    }

    // Update cart
    await ctx.db.patch(userId, {
      cart: {
        items,
        appliedCoupon: currentCart.appliedCoupon,
        updatedAt: new Date().toISOString(),
      },
    });

    // Return the added/updated item
    const updatedItem =
      existingIndex >= 0
        ? items[existingIndex]
        : items[items.length - 1];

    return {
      success: true,
      item: updatedItem,
    };
  },
});

/**
 * Remove item from cart.
 */
export const removeItem = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("יש להתחבר למערכת כדי להסיר מהעגלה");
    }

    const { productId } = args;

    // Get current user cart
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const currentCart = user.cart ?? { items: [], updatedAt: "" };
    const items = currentCart.items.filter(
      (item: any) => item.productId !== productId
    );

    // Update cart
    await ctx.db.patch(userId, {
      cart: {
        items,
        appliedCoupon: currentCart.appliedCoupon,
        updatedAt: new Date().toISOString(),
      },
    });

    return { success: true };
  },
});

/**
 * Update item quantity in cart.
 * Validates stock availability. Removes item if quantity <= 0.
 */
export const updateQuantity = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("יש להתחבר למערכת כדי לעדכן כמות");
    }

    const { productId, quantity } = args;

    // Get current user cart
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const currentCart = user.cart ?? { items: [], updatedAt: "" };
    const items = [...currentCart.items];

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const filtered = items.filter(
        (item: any) => item.productId !== productId
      );
      await ctx.db.patch(userId, {
        cart: {
          items: filtered,
          appliedCoupon: currentCart.appliedCoupon,
          updatedAt: new Date().toISOString(),
        },
      });
      return { success: true };
    }

    // Fetch product to validate stock
    const product = await ctx.db.get(productId);
    if (!product) {
      throw new Error("המוצר לא נמצא");
    }

    // Update quantity, capped at stock
    const index = items.findIndex(
      (item: any) => item.productId === productId
    );
    if (index >= 0) {
      const actualQuantity = Math.min(quantity, product.quantityInStock);
      const wasAdjusted = actualQuantity !== quantity;

      items[index] = {
        ...items[index],
        quantity: actualQuantity,
        maxQuantity: product.quantityInStock,
      };

      await ctx.db.patch(userId, {
        cart: {
          items,
          appliedCoupon: currentCart.appliedCoupon,
          updatedAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        adjusted: wasAdjusted,
        availableQuantity: product.quantityInStock,
      };
    }

    throw new Error("המוצר לא נמצא בעגלה");
  },
});

/**
 * Clear all items from cart.
 */
export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("יש להתחבר למערכת כדי לרוקן את העגלה");
    }

    await ctx.db.patch(userId, {
      cart: {
        items: [],
        appliedCoupon: null,
        updatedAt: new Date().toISOString(),
      },
    });

    return { success: true };
  },
});

/**
 * Merge guest cart on login.
 * Validates each item against current stock/price and returns sync result.
 */
export const mergeGuestCart = mutation({
  args: {
    guestItems: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("יש להתחבר למערכת");
    }

    const { guestItems } = args;

    // Get current cloud cart
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const cloudCart = user.cart ?? { items: [], appliedCoupon: null, updatedAt: "" };
    const cloudItems = cloudCart.items as any[];

    // Track sync issues
    const skippedItems: { productId: string; productName: string; reason: string }[] = [];
    const priceChanges: { productId: string; productName: string; oldPrice: number; newPrice: number }[] = [];
    const adjustedItems: { productId: string; productName: string; requestedQty: number; availableQty: number }[] = [];

    // Merge items
    const merged = new Map<string, any>();

    // First add cloud items
    cloudItems.forEach((item) => {
      merged.set(item.productId, { ...item });
    });

    // Process guest items
    for (const guestItem of guestItems) {
      const productId = guestItem.productId;

      // Fetch product from DB to validate
      const product = await ctx.db.get(productId as any);

      if (!product) {
        // Product no longer exists
        skippedItems.push({
          productId,
          productName: guestItem.title || "מוצר לא ידוע",
          reason: "המוצר כבר אינו קיים במערכת",
        });
        continue;
      }

      if (product.status === "discontinued") {
        // Product discontinued
        skippedItems.push({
          productId,
          productName: product.productNameHe || product.productName,
          reason: "המוצר הופסק מהמכירה",
        });
        continue;
      }

      if (product.quantityInStock <= 0) {
        // Out of stock
        skippedItems.push({
          productId,
          productName: product.productNameHe || product.productName,
          reason: "המוצר אזל מהמלאי",
        });
        continue;
      }

      // Check for price changes
      const oldPrice = guestItem.price;
      const newPrice = product.salePrice || product.price;
      if (oldPrice !== newPrice) {
        priceChanges.push({
          productId,
          productName: product.productNameHe || product.productName,
          oldPrice,
          newPrice,
        });
      }

      // Check quantity against stock
      let requestedQty = guestItem.quantity;
      let availableQty = product.quantityInStock;

      if (requestedQty > availableQty) {
        adjustedItems.push({
          productId,
          productName: product.productNameHe || product.productName,
          requestedQty,
          availableQty,
        });
        requestedQty = availableQty;
      }

      // Merge: take higher quantity between cloud and guest
      const existing = merged.get(productId);
      if (existing) {
        const newQuantity = Math.max(existing.quantity, requestedQty);
        merged.set(productId, {
          ...existing,
          quantity: newQuantity,
          maxQuantity: availableQty,
          price: newPrice,
          salePrice: product.salePrice,
        });
      } else {
        // Add new item from guest
        merged.set(productId, {
          id: `${productId}_${Date.now()}`,
          productId,
          title: product.productNameHe || product.productName,
          price: newPrice,
          salePrice: product.salePrice,
          originalPrice: product.price,
          quantity: requestedQty,
          maxQuantity: availableQty,
          imgSrc: product.featuredImage || "",
        });
      }
    }

    const mergedCart = Array.from(merged.values());

    // Update cart
    await ctx.db.patch(userId, {
      cart: {
        items: mergedCart,
        appliedCoupon: cloudCart.appliedCoupon,
        updatedAt: new Date().toISOString(),
      },
    });

    return {
      mergedCart,
      skippedItems,
      priceChanges,
      adjustedItems,
    };
  },
});
