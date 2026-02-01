# Quick Reference: Using the Seeded Convex Database

## 🎯 What's in Your Database Now

Your Convex database is pre-loaded with realistic wine shop data ready for development and testing.

---

## 📦 Sample Data Overview

| Entity | Count | Status |
|--------|-------|--------|
| **Categories** | 5 | Ready |
| **Products** | 12 | Ready |
| **Coupons** | 7 | Ready |
| **Cart Rules** | 1 | Ready |

---

## 🍷 Product Categories

All products are organized into 5 wine categories:

```
1. Red Wines (3 products)
   - Cabernet Sauvignon Reserve 2018
   - Merlot Selection 2019
   - Shiraz Vineyard 2017

2. White Wines (3 products)
   - Sauvignon Blanc 2022
   - Chardonnay Barrel Aged 2021
   - Riesling Sweet 2021

3. Rosé Wines (2 products)
   - Provence Style Rosé 2022
   - Strawberry Rosé Premium 2022

4. Sparkling Wines (2 products)
   - Israeli Champagne Brut 2020
   - Sparkling Moscato 2021

5. Special Collections (2 products)
   - Limited Edition Opus 2016
   - Vineyard Reserve 1995
```

---

## 💰 Coupon Codes for Testing

Test your discount system with these active coupons:

### Percentage Discounts
- **WELCOME10** - 10% off (min: ₪99.99, first-time only)
- **BULK3SAVE** - 15% off (min: ₪200, max 2 uses per user)
- **HOLIDAY15** - 15% off (scheduled, available Feb 21)

### Fixed Amount Discounts
- **SUMMER25** - ₪25 off (min: ₪150)
- **EXCLUSIVE50** - ₪50 off VIP only (min: ₪250)

### Special Offers
- **FREESHIP** - Free shipping (min: ₪300, ₪29.90 value)

### Testing Invalid Coupons
- **EXPIRED_PROMO** - Expired (test error handling)
- **HOLIDAY15** - Scheduled (test date validation)

---

## 🔍 Common Queries

### Get All Products
```typescript
const products = await ctx.query("products:list", {});
```

### Get Products by Category
```typescript
const redWines = await ctx.query("products:list", { 
  category: "red-wines" 
});
```

### Search for Products
```typescript
const results = await ctx.query("products:search", {
  query: "Cabernet",
  language: "en"
});
```

### Get Featured Products (Homepage)
```typescript
const featured = await ctx.query("products:list", { 
  isFeatured: true 
});
// Returns: 5 featured wines
```

### Get On-Sale Products
```typescript
const sales = await ctx.query("products:list", { 
  onSale: true 
});
// Returns: 3 wine bottles on sale
```

### Validate a Coupon
```typescript
const validation = await ctx.query("coupons:validate", {
  code: "WELCOME10",
  subtotal: 150.00,
  userEmail: "customer@example.com",
  itemCount: 2
});
```

### Check Product Stock
```typescript
const validation = await ctx.query("products:validateStock", {
  items: [
    { productId: "...", quantity: 2 }
  ]
});
```

---

## 💳 Test Scenarios

### Scenario 1: First-Time Customer
```
Cart: 2x Sauvignon Blanc (₪45.99 each) = ₪91.98
Apply: WELCOME10 (doesn't apply - min ₪99.99)
Subtract: Shipping (₪29.90)
Total: ₪121.88

Or increase qty for discount to apply...
Cart: 3x Sauvignon Blanc = ₪137.97
Apply: WELCOME10
Discount: ₪13.80 (10%)
Final: ₪124.17 - ₪29.90 shipping = ₪94.27
```

### Scenario 2: Bulk Wine Purchase
```
Cart: 3x Cabernet + 2x Merlot = ₪503.92
Apply: BULK3SAVE (15% off)
Discount: ₪75.59
Subtotal: ₪428.33
Add: Free shipping with FREESHIP
Final: ₪428.33
```

### Scenario 3: Special Collection
```
Cart: 1x Limited Edition Opus (₪199.99)
Apply: EXCLUSIVE50 (₪50 off)
Note: Low stock (12 remaining)
Final: ₪149.99
```

---

## 📊 Product Details Reference

### High-Value Products (Premium Collection)
- **Limited Edition Opus 2016**: ₪199.99 (12 in stock)
- **Vineyard Reserve 1995**: ₪299.99 (5 in stock)

### Best Sellers (High Stock)
- **Sauvignon Blanc 2022**: 80 bottles ✅
- **Provence Style Rosé 2022**: 70 bottles ✅

### On Sale (Test Promotions)
- **Cabernet Sauvignon Reserve 2018**: ₪89.99 → ₪74.99
- **Shiraz Vineyard 2017**: ₪79.99 → ₪64.99
- **Strawberry Rosé Premium 2022**: ₪59.99 → ₪47.99

### Low Stock Items (Urgency)
- **Limited Edition Opus 2016**: 12 remaining
- **Vineyard Reserve 1995**: 5 remaining

---

## 🧪 Testing Checklist

- [ ] Display product categories on homepage
- [ ] Show featured products (5 items)
- [ ] Highlight on-sale items (3 items with strikethrough)
- [ ] Search products in Hebrew and English
- [ ] Filter by wine type (Red, White, Rosé, Sparkling)
- [ ] Apply coupon codes with validation
- [ ] Check stock availability before checkout
- [ ] Calculate discounts correctly
- [ ] Display shipping costs (₪29.90)
- [ ] Test all promotion types (%, fixed, free shipping)
- [ ] Verify low-stock warnings
- [ ] Test invalid/expired coupons

---

## 🗂️ File Locations

### Database Files
```
convex/
├── schema.ts              # Database schema definition
├── products.ts            # Product queries and mutations
├── categories.ts          # Category management
├── coupons.ts             # Coupon validation and tracking
├── seed.ts                # Seeding function
└── _generated/
    └── dataModel.d.ts     # Generated types
```

### Documentation
```
├── CONVEX_DATABASE_SEEDING.md    # Detailed seeding info
└── CONVEX_QUICK_REFERENCE.md     # This file
```

---

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```

### View Database in Convex Dashboard
```bash
npx convex dashboard
```

### Re-seed Database (if needed)
```bash
npx convex run seed:seedDatabase
```

### View Specific Table
```bash
npx convex data products --limit 10
npx convex data categories
npx convex data coupons
```

---

## 💡 Pro Tips

1. **Bilingual Support**: All products and categories have Hebrew names
2. **Search Ready**: Products are indexed for both Hebrew and English full-text search
3. **Price Testing**: Mix of regular and sale prices for discount testing
4. **Stock Variety**: Some products have low stock for testing urgency messaging
5. **Real Regions**: Products reference actual Israeli wine regions (Judean Hills, Galilee, Negev)

---

## ⚠️ Important Notes

- ✅ This is **development data only**
- ✅ Safe to clear and re-seed anytime
- ✅ All prices are in Israeli Shekels (₪)
- ✅ Dates are in ISO 8601 format
- ✅ No real customer data included

---

## 📞 Troubleshooting

**Problem**: Products not showing in queries
- **Solution**: Verify the `npx convex run seed:seedDatabase` completed successfully

**Problem**: Coupon code not applying
- **Solution**: Check the coupon status, date validity, and minimum order amount

**Problem**: Search not finding products
- **Solution**: Use Hebrew names with Hebrew language param, or English names with "en" param

**Problem**: Out of stock showing incorrectly
- **Solution**: Verify `quantityInStock > 0` for "in_stock" status

---

Last Updated: February 1, 2025
Database Version: 1.0
Ready for: Development ✅ | Staging ⚠️ | Production ❌
