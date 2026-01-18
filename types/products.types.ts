// Product and Category Types

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME = 'home',
  BEAUTY = 'beauty',
  SPORTS = 'sports'
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

export enum CategoryStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  HIDDEN = 'hidden'
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
