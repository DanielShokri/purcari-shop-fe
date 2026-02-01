# Convex Database - Developer Integration Guide

## 🔌 Database Connection

Your Convex database is live and ready for queries. All sample data has been seeded and verified.

---

## 📝 Common Patterns

### Pattern 1: Fetch All Products

```typescript
// In your component or page
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductList() {
  const products = useQuery(api.products.list, {});

  if (products === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {products.map((product) => (
        <div key={product._id}>
          <h3>{product.productName}</h3>
          <p>₪{product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 2: Search Products

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductSearch({ searchTerm }: { searchTerm: string }) {
  const results = useQuery(api.products.search, {
    query: searchTerm,
    language: "en",
  });

  return (
    <ul>
      {results?.map((product) => (
        <li key={product._id}>{product.productName}</li>
      ))}
    </ul>
  );
}
```

### Pattern 3: Get Products by Category

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function RedWinesList() {
  // Category slug from seed data
  const redWines = useQuery(api.products.list, {
    category: "red-wines",
  });

  return (
    <div className="red-wines-section">
      {redWines?.map((wine) => (
        <WineCard key={wine._id} wine={wine} />
      ))}
    </div>
  );
}
```

### Pattern 4: Validate Coupon

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CouponValidator({
  code,
  subtotal,
  email,
}: {
  code: string;
  subtotal: number;
  email: string;
}) {
  const validation = useQuery(api.coupons.validate, {
    code,
    subtotal,
    userEmail: email,
    itemCount: 2, // from cart
  });

  if (!validation) return null;

  if (!validation.valid) {
    return <span className="error">{validation.error}</span>;
  }

  return (
    <div className="discount">
      <p>✅ Coupon applied!</p>
      <p>Discount: ₪{validation.discountAmount}</p>
    </div>
  );
}
```

### Pattern 5: Check Stock Availability

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StockChecker({
  cartItems,
}: {
  cartItems: Array<{ productId: string; quantity: number }>;
}) {
  const stockInfo = useQuery(api.products.validateStock, {
    items: cartItems,
  });

  if (!stockInfo?.valid) {
    return (
      <div className="stock-error">
        <p>Some items are out of stock:</p>
        {stockInfo?.issues.map((issue) => (
          <p key={issue.productId}>
            Product {issue.productId}: {issue.available} available
          </p>
        ))}
      </div>
    );
  }

  return <p className="success">✅ All items in stock!</p>;
}
```

### Pattern 6: Fetch Categories

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CategoryNav() {
  const categories = useQuery(api.categories.list, {});

  return (
    <nav className="categories">
      {categories?.map((category) => (
        <a
          key={category._id}
          href={`/wines/${category.slug}`}
          className="category-link"
        >
          {category.name}
        </a>
      ))}
    </nav>
  );
}
```

### Pattern 7: Add to Cart (Mutation)

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AddToCart({ productId, quantity }: Props) {
  const addItem = useMutation(api.cart.addItem);

  const handleAdd = async () => {
    await addItem({
      productId,
      quantity,
    });
    // Cart updated in database
  };

  return <button onClick={handleAdd}>Add to Cart</button>;
}
```

### Pattern 8: Create Order

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Checkout({ cartItems, shippingInfo }: Props) {
  const createOrder = useMutation(api.orders.create);

  const handleCheckout = async () => {
    const orderId = await createOrder({
      items: cartItems,
      shippingAddress: shippingInfo.street,
      shippingCity: shippingInfo.city,
      // ... other order data
    });

    // Redirect to success page with orderId
  };

  return <button onClick={handleCheckout}>Place Order</button>;
}
```

---

## 🔍 Available Data

### Product Fields

```typescript
interface Product {
  _id: string;
  productName: string;
  productNameHe: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  quantityInStock: number;
  sku: string;
  category: string; // Category ID
  description?: string;
  descriptionHe?: string;
  wineType?: "Red" | "White" | "Rosé" | "Sparkling";
  region?: string;
  vintage?: number;
  alcoholContent?: number;
  volume?: string;
  grapeVariety?: string;
  tastingNotes?: string;
  isFeatured?: boolean;
  status: "draft" | "active" | "hidden" | "discontinued";
  stockStatus: "in_stock" | "out_of_stock" | "low_stock";
  createdAt: string;
  updatedAt: string;
}
```

### Category Fields

```typescript
interface Category {
  _id: string;
  name: string;
  nameHe?: string;
  slug: string;
  description?: string;
  order?: number;
  status?: "active" | "draft" | "hidden";
  createdAt: string;
  updatedAt: string;
}
```

### Coupon Fields

```typescript
interface Coupon {
  _id: string;
  code: string;
  status: "active" | "paused" | "expired" | "scheduled";
  discountType: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  discountValue: number;
  startDate: string;
  endDate?: string;
  minimumOrder?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 📊 Sample Data Reference

### Featured Products (Homepage)
```typescript
const featured = await ctx.query(api.products.list, {
  isFeatured: true,
});
// Returns 5 premium wine selections
```

### Products on Sale
```typescript
const onSale = await ctx.query(api.products.list, {
  onSale: true,
});
// Returns 3 discounted wines
```

### Red Wines
```typescript
const redWines = await ctx.query(api.products.list, {
  category: "red-wines", // Slug from seed data
});
// Returns 3 red wine products
```

### Active Coupons
```typescript
const coupons = await ctx.query(api.coupons.list, {});
const activeCoupons = coupons.filter(c => c.status === "active");
// Returns 5 active coupon codes ready to use
```

---

## 🧪 Testing Coupon Codes

All these codes exist in your database:

```
WELCOME10    ✅ Active    | 10% off  | First-time buyers | Min: ₪99.99
SUMMER25     ✅ Active    | ₪25 off  | Summer special    | Min: ₪150
FREESHIP     ✅ Active    | Free ship| Orders over ₪300  |
BULK3SAVE    ✅ Active    | 15% off  | Bulk purchases    | Min: ₪200
EXCLUSIVE50  ✅ Active    | ₪50 off  | VIP only          | Min: ₪250
EXPIRED_PROMO ❌ Expired  | 20% off  | Past date - test error handling
HOLIDAY15    🔜 Scheduled | 15% off  | Future date - test validation
```

---

## 🛠️ Debugging

### View Database Records

```bash
# List all products
npx convex data products

# View specific table with limit
npx convex data products --limit 5

# Export data for analysis
npx convex export --output backup.zip
```

### Query Functions

```bash
# Run a specific function
npx convex run products:list

# With arguments
npx convex run products:list '{ "category": "red-wines" }'

# Search example
npx convex run products:search '{ 
  "query": "Cabernet", 
  "language": "en" 
}'
```

### Check Function Metadata

```bash
# View all available functions
npx convex function-spec

# See argument and return types
npx convex function-spec | grep "products"
```

---

## 📈 Real-World Examples

### Homepage Banner - Featured Wines

```typescript
export function FeaturedWines() {
  const featured = useQuery(api.products.list, { isFeatured: true });

  return (
    <section className="featured-wines">
      <h2>Premium Selection</h2>
      <div className="carousel">
        {featured?.map((wine) => (
          <div key={wine._id} className="wine-card">
            <img src={wine.featuredImage} alt={wine.productName} />
            <h3>{wine.productName}</h3>
            <p className="price">
              {wine.onSale ? (
                <>
                  <span className="original">₪{wine.price}</span>
                  <span className="sale">₪{wine.salePrice}</span>
                </>
              ) : (
                <span>₪{wine.price}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Product Listing - By Category

```typescript
export function WineCategory({ slug }: { slug: string }) {
  const products = useQuery(api.products.list, {
    category: slug,
  });

  return (
    <div className="category-page">
      <h1>{slug.replace("-", " ")}</h1>
      <div className="products-grid">
        {products?.map((product) => (
          <WineCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Checkout - Coupon Validation

```typescript
export function DiscountSection({ subtotal, email }: Props) {
  const [couponCode, setCouponCode] = useState("");
  const validation = useQuery(api.coupons.validate, {
    code: couponCode,
    subtotal,
    userEmail: email,
    itemCount: 3, // from cart
  });

  return (
    <div className="discount-form">
      <input
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="Enter coupon code"
      />

      {validation && (
        <>
          {validation.valid ? (
            <div className="success">
              <p>✅ Coupon applied!</p>
              <p className="discount-amount">
                -₪{validation.discountAmount}
              </p>
              <p className="new-total">
                New total: ₪{(subtotal - validation.discountAmount).toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="error">{validation.error}</div>
          )}
        </>
      )}
    </div>
  );
}
```

### Search - Bilingual Support

```typescript
export function ProductSearch({ locale }: { locale: "en" | "he" }) {
  const [term, setTerm] = useState("");
  const results = useQuery(api.products.search, {
    query: term,
    language: locale,
  });

  return (
    <form className="search">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={locale === "he" ? "חיפוש יינות..." : "Search wines..."}
      />

      {results && (
        <ul className="results">
          {results.map((product) => (
            <li key={product._id}>
              <a href={`/product/${product._id}`}>
                {locale === "he"
                  ? product.productNameHe || product.productName
                  : product.productName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
```

---

## 🚀 Performance Tips

1. **Use Indexes**: Queries using indexed fields are faster
   - Category lookups use `by_category` index
   - Coupon codes use `by_code` index
   - Search uses full-text indexes

2. **Pagination**: For large datasets, implement cursor-based pagination
   ```typescript
   const products = useQuery(api.products.list, { limit: 20 });
   // Add pagination support in your API
   ```

3. **Caching**: React query caches results automatically
   - Queries re-run only when arguments change
   - Use `refetchInterval` for real-time updates

4. **Mutations**: Always validate on client before sending to server
   ```typescript
   if (!validateInput(data)) return; // Client-side validation
   await mutation(data); // Server-side validation in Convex
   ```

---

## 📚 File Reference

Your Convex backend structure:

```
convex/
├── schema.ts              # Database schema
├── products.ts            # Product queries/mutations
├── categories.ts          # Category management
├── coupons.ts             # Coupon logic
├── orders.ts              # Order processing
├── users.ts               # User management
├── auth.ts                # Authentication
├── seed.ts                # Database seeding (you just created!)
└── _generated/
    ├── api.d.ts           # Generated API types
    └── dataModel.d.ts     # Generated data types
```

---

## ✅ Ready to Build!

Your database is populated and ready for integration. Start by:

1. ✅ Database seeded with 25 documents
2. ✅ Categories and products configured
3. ✅ Coupons and promotional data ready
4. ✅ All indexes active
5. ✅ TypeScript types generated

Use the patterns above to start building your e-commerce features!

---

**Last Updated**: February 1, 2025  
**Database Status**: ✅ Production Ready for Development
