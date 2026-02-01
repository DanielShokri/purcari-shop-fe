import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed data function for populating the Convex database with initial data.
 * This mutation creates categories, products, and promotional content for the wine shop.
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const results: any = {
      categories: [],
      products: [],
      coupons: [],
    };

    // ============================================
    // 1. CREATE CATEGORIES
    // ============================================
    const categoryData = [
      {
        name: "Red Wines",
        nameHe: "יינות אדומים",
        slug: "red-wines",
        description: "Premium red wines from Israel and around the world",
        order: 1n,
      },
      {
        name: "White Wines",
        nameHe: "יינות לבנים",
        slug: "white-wines",
        description: "Crisp and refreshing white wines",
        order: 2n,
      },
      {
        name: "Rosé Wines",
        nameHe: "יינות רוזה",
        slug: "rose-wines",
        description: "Light and elegant rosé wines",
        order: 3n,
      },
      {
        name: "Sparkling Wines",
        nameHe: "יינות מבעבעים",
        slug: "sparkling-wines",
        description: "Celebratory sparkling wines and champagne",
        order: 4n,
      },
      {
        name: "Special Collections",
        nameHe: "אוספים מיוחדים",
        slug: "special-collections",
        description: "Limited edition and exclusive wine collections",
        order: 5n,
      },
    ];

    const categoryMap: { [key: string]: string } = {};

    for (const cat of categoryData) {
      const categoryId = await ctx.db.insert("categories", {
        ...cat,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      categoryMap[cat.slug] = categoryId;
      results.categories.push({ slug: cat.slug, id: categoryId });
    }

    // ============================================
    // 2. CREATE PRODUCTS
    // ============================================
    const productData = [
      // Red Wines
      {
        productName: "Cabernet Sauvignon Reserve 2018",
        productNameHe: "קברנה סוביניון הקדיש 2018",
        price: 89.99,
        salePrice: 74.99,
        onSale: true,
        quantityInStock: 45n,
        sku: "RED-CABERNET-2018",
        category: categoryMap["red-wines"],
        description: "Full-bodied red with notes of blackberry and oak",
        descriptionHe: "יין אדום גוף מלא עם טעמי פירות יער ועץ",
        shortDescription: "Premium Israeli Cabernet",
        shortDescriptionHe: "קברנה סוביניון ישראלי פרימיום",
        wineType: "Red",
        region: "Judean Hills",
        vintage: 2018n,
        alcoholContent: 14.5,
        volume: "750ml",
        grapeVariety: "Cabernet Sauvignon",
        servingTemperature: "16-18°C",
        tastingNotes: "Dark cherry, blackberry, vanilla, oak",
        isFeatured: true,
        status: "active",
        stockStatus: "in_stock",
      },
      {
        productName: "Merlot Selection 2019",
        productNameHe: "מרלו בחירה 2019",
        price: 65.99,
        quantityInStock: 60n,
        sku: "RED-MERLOT-2019",
        category: categoryMap["red-wines"],
        description: "Smooth and elegant Merlot with fruit-forward character",
        descriptionHe: "מרלו חלק ועדין עם אופי עשיר בפירות",
        wineType: "Red",
        region: "Galilee",
        vintage: 2019n,
        alcoholContent: 13.8,
        volume: "750ml",
        grapeVariety: "Merlot",
        servingTemperature: "16-18°C",
        tastingNotes: "Plum, cherry, herbs, spice",
        status: "active",
        stockStatus: "in_stock",
      },
      {
        productName: "Shiraz Vineyard 2017",
        productNameHe: "שיראז כרם 2017",
        price: 79.99,
        salePrice: 64.99,
        onSale: true,
        quantityInStock: 30n,
        sku: "RED-SHIRAZ-2017",
        category: categoryMap["red-wines"],
        description: "Intense and complex Shiraz from premium vineyards",
        descriptionHe: "שיראז עמוק ומורכב מכרמים פרימיום",
        wineType: "Red",
        region: "Negev",
        vintage: 2017n,
        alcoholContent: 14.8,
        volume: "750ml",
        grapeVariety: "Syrah/Shiraz",
        servingTemperature: "17-19°C",
        tastingNotes: "Pepper, dark berry, licorice, leather",
        isFeatured: true,
        status: "active",
        stockStatus: "in_stock",
      },

      // White Wines
      {
        productName: "Sauvignon Blanc 2022",
        productNameHe: "סוביניון בלאן 2022",
        price: 45.99,
        quantityInStock: 80n,
        sku: "WHITE-SAUVIGNON-2022",
        category: categoryMap["white-wines"],
        description: "Crisp and refreshing with citrus and mineral notes",
        descriptionHe: "עדין וטרי עם טעמים של לימון וכרך",
        shortDescription: "Fresh Israeli White Wine",
        shortDescriptionHe: "יין לבן ישראלי טרי",
        wineType: "White",
        region: "Coastal Region",
        vintage: 2022n,
        alcoholContent: 12.5,
        volume: "750ml",
        grapeVariety: "Sauvignon Blanc",
        servingTemperature: "8-10°C",
        tastingNotes: "Grapefruit, green apple, herbaceous",
        status: "active",
        stockStatus: "in_stock",
      },
      {
        productName: "Chardonnay Barrel Aged 2021",
        productNameHe: "שרדונה בחבית 2021",
        price: 72.99,
        quantityInStock: 35n,
        sku: "WHITE-CHARDONNAY-2021",
        category: categoryMap["white-wines"],
        description: "Elegant Chardonnay with oak aging complexity",
        descriptionHe: "שרדונה אלגנטי עם מורכבות של העמקה בחבית",
        wineType: "White",
        region: "Judean Hills",
        vintage: 2021n,
        alcoholContent: 13.5,
        volume: "750ml",
        grapeVariety: "Chardonnay",
        servingTemperature: "9-11°C",
        tastingNotes: "Butter, vanilla, stone fruit, hazelnut",
        isFeatured: true,
        status: "active",
        stockStatus: "in_stock",
      },
      {
        productName: "Riesling Sweet 2021",
        productNameHe: "ריזלינג מתוק 2021",
        price: 52.99,
        quantityInStock: 25n,
        sku: "WHITE-RIESLING-2021",
        category: categoryMap["white-wines"],
        description: "Sweet Riesling with perfect dessert balance",
        descriptionHe: "ריזלינג מתוק עם איזון מושלם לקינוח",
        wineType: "White",
        region: "Upper Galilee",
        vintage: 2021n,
        alcoholContent: 10.5,
        volume: "750ml",
        grapeVariety: "Riesling",
        servingTemperature: "6-8°C",
        tastingNotes: "Honey, apricot, floral, sweetness",
        status: "active",
        stockStatus: "in_stock",
      },

      // Rosé Wines
      {
        productName: "Provence Style Rosé 2022",
        productNameHe: "רוזה בסגנון פרובנס 2022",
        price: 39.99,
        quantityInStock: 70n,
        sku: "ROSE-PROVENCE-2022",
        category: categoryMap["rose-wines"],
        description: "Light and dry rosé perfect for summer",
        descriptionHe: "רוזה קל וייבוש מושלם לקיץ",
        shortDescription: "Summer Rosé Wine",
        shortDescriptionHe: "רוזה לקיץ",
        wineType: "Rosé",
        region: "Coastal Region",
        vintage: 2022n,
        alcoholContent: 12.0,
        volume: "750ml",
        grapeVariety: "Grenache, Cinsault",
        servingTemperature: "6-8°C",
        tastingNotes: "Strawberry, citrus, melon, dry",
        status: "active",
        stockStatus: "in_stock",
      },
      {
        productName: "Strawberry Rosé Premium 2022",
        productNameHe: "רוזה פרימיום תות 2022",
        price: 59.99,
        salePrice: 47.99,
        onSale: true,
        quantityInStock: 40n,
        sku: "ROSE-STRAWBERRY-2022",
        category: categoryMap["rose-wines"],
        description: "Premium rosé with subtle strawberry notes",
        descriptionHe: "רוזה פרימיום עם טעמים עדינים של תות",
        wineType: "Rosé",
        region: "Judean Hills",
        vintage: 2022n,
        alcoholContent: 12.8,
        volume: "750ml",
        grapeVariety: "Grenache Rose",
        servingTemperature: "7-9°C",
        tastingNotes: "Strawberry, watermelon, citrus, floral",
        isFeatured: true,
        status: "active",
        stockStatus: "in_stock",
      },

      // Sparkling Wines
      {
        productName: "Israeli Champagne Brut 2020",
        productNameHe: "שמפניה ישראלית ברוט 2020",
        price: 84.99,
        quantityInStock: 50n,
        sku: "SPARKLING-BRUT-2020",
        category: categoryMap["sparkling-wines"],
        description: "Elegant sparkling wine perfect for celebrations",
        descriptionHe: "יין מבעבע אלגנטי מושלם לחגיגות",
        shortDescription: "Premium Israeli Sparkling",
        shortDescriptionHe: "שמפניה ישראלית פרימיום",
        wineType: "Sparkling",
        region: "Galilee",
        vintage: 2020n,
        alcoholContent: 12.5,
        volume: "750ml",
        grapeVariety: "Chardonnay, Pinot Noir",
        servingTemperature: "4-6°C",
        tastingNotes: "Citrus, apple, brioche, elegant bubbles",
        isFeatured: true,
        status: "active",
        stockStatus: "in_stock",
      },
      {
        productName: "Sparkling Moscato 2021",
        productNameHe: "מוסקטו מבעבע 2021",
        price: 48.99,
        quantityInStock: 55n,
        sku: "SPARKLING-MOSCATO-2021",
        category: categoryMap["sparkling-wines"],
        description: "Sweet and bubbly Moscato for joyful moments",
        descriptionHe: "מוסקטו מתוק ומבעבע לרגעים שמחים",
        wineType: "Sparkling",
        region: "Coastal Region",
        vintage: 2021n,
        alcoholContent: 11.0,
        volume: "750ml",
        grapeVariety: "Muscat",
        servingTemperature: "3-5°C",
        tastingNotes: "Peach, apricot, floral, sweet",
        status: "active",
        stockStatus: "in_stock",
      },

      // Special Collections
      {
        productName: "Limited Edition Opus 2016",
        productNameHe: "אופוס מהדורה מוגבלת 2016",
        price: 199.99,
        quantityInStock: 12n,
        sku: "SPECIAL-OPUS-2016",
        category: categoryMap["special-collections"],
        description: "Rare limited edition blend from our vault",
        descriptionHe: "תערובת נדירה מהדורה מוגבלת מחוברת שלנו",
        shortDescription: "Collector's Limited Edition",
        shortDescriptionHe: "מהדורה מוגבלת לאספנים",
        wineType: "Red",
        region: "Judean Hills",
        vintage: 2016n,
        alcoholContent: 15.0,
        volume: "750ml",
        grapeVariety: "Cabernet, Merlot, Petit Verdot",
        servingTemperature: "17-19°C",
        tastingNotes: "Complex blend with 20+ tasting notes",
        isFeatured: true,
        status: "active",
        stockStatus: "low_stock",
      },
      {
        productName: "Vineyard Reserve 1995",
        productNameHe: "הקדיש הכרם 1995",
        price: 299.99,
        quantityInStock: 5n,
        sku: "SPECIAL-RESERVE-1995",
        category: categoryMap["special-collections"],
        description: "Aged to perfection, exceptional vintage",
        descriptionHe: "בוגר לשלמות, יין מיוחד וחריג",
        wineType: "Red",
        region: "Judean Hills",
        vintage: 1995n,
        alcoholContent: 13.5,
        volume: "750ml",
        grapeVariety: "Cabernet Sauvignon",
        servingTemperature: "18-20°C",
        tastingNotes: "Mature, complex, historical significance",
        isFeatured: true,
        status: "active",
        stockStatus: "low_stock",
      },
    ];

    for (const prod of productData) {
      const productId = await ctx.db.insert("products", {
        ...prod,
        createdAt: now,
        updatedAt: now,
      });
      results.products.push({
        name: prod.productName,
        id: productId,
        price: prod.price,
      });
    }

    // ============================================
    // 3. CREATE COUPONS
    // ============================================
    const couponData = [
      {
        code: "WELCOME10",
        status: "active",
        description: "Welcome discount for new customers",
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        minimumOrder: 99.99,
        usageLimit: 100n,
        usageLimitPerUser: 1n,
        firstPurchaseOnly: true,
        excludeOtherCoupons: false,
      },
      {
        code: "SUMMER25",
        status: "active",
        description: "Summer collection special - 25 shekels off",
        discountType: "fixed_amount",
        discountValue: 25,
        startDate: now,
        endDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        minimumOrder: 150,
        usageLimit: 200n,
        usageLimitPerUser: 3n,
        excludeOtherCoupons: false,
      },
      {
        code: "FREESHIP",
        status: "active",
        description: "Free shipping on orders over 300 shekels",
        discountType: "free_shipping",
        discountValue: 29.9,
        startDate: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        minimumOrder: 300,
        usageLimit: 500n,
        usageLimitPerUser: 5n,
        excludeOtherCoupons: false,
      },
      {
        code: "BULK3SAVE",
        status: "active",
        description: "Buy 3 bottles, get 15% off",
        discountType: "percentage",
        discountValue: 15,
        startDate: now,
        endDate: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        minimumOrder: 200,
        usageLimit: 150n,
        usageLimitPerUser: 2n,
        excludeOtherCoupons: false,
      },
      {
        code: "EXCLUSIVE50",
        status: "active",
        description: "VIP exclusive coupon",
        discountType: "fixed_amount",
        discountValue: 50,
        startDate: now,
        endDate: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        minimumOrder: 250,
        usageLimit: 50n,
        usageLimitPerUser: 1n,
        excludeOtherCoupons: true,
      },
      {
        code: "EXPIRED_PROMO",
        status: "expired",
        description: "This coupon has expired",
        discountType: "percentage",
        discountValue: 20,
        startDate: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 100n,
        usageLimitPerUser: 1n,
      },
      {
        code: "HOLIDAY15",
        status: "scheduled",
        description: "Holiday special - coming soon",
        discountType: "percentage",
        discountValue: 15,
        startDate: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        endDate: new Date(new Date().getTime() + 50 * 24 * 60 * 60 * 1000).toISOString(),
        minimumOrder: 199.99,
        usageLimit: 300n,
        usageLimitPerUser: 2n,
      },
    ];

    for (const coupon of couponData) {
      const couponId = await ctx.db.insert("coupons", {
        ...coupon,
        usageCount: 0n,
        createdAt: now,
        updatedAt: now,
      });
      results.coupons.push({ code: coupon.code, id: couponId });
    }

    // ============================================
    // 4. CREATE CART RULES
    // ============================================
    const cartRuleId = await ctx.db.insert("cartRules", {
      name: "Buy 2 Reds, Get 10% Off",
      description: "Automatic discount when buying 2 or more red wines",
      status: "active",
      ruleType: "bulk_discount",
      config: {
        trigger: "red_wine_count_gte_2",
        discount: { type: "percentage", value: 10 },
      },
      createdAt: now,
      updatedAt: now,
    });

    results.cartRules = [{ name: "Buy 2 Reds, Get 10% Off", id: cartRuleId }];

    // ============================================
    // Summary
    // ============================================
    console.log("✅ Database seeding completed successfully!");
    console.log(`📦 Created ${results.categories.length} categories`);
    console.log(`🍷 Created ${results.products.length} products`);
    console.log(`🎟️  Created ${results.coupons.length} coupons`);
    console.log(`📋 Created ${results.cartRules.length} cart rules`);

    return {
      success: true,
      message: "Database seeding completed successfully!",
      summary: results,
    };
  },
});
