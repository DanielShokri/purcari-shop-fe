# Analytics Setup Guide

## Appwrite Collection Setup

The analytics page requires an `analytics_events` collection in your Appwrite database. Follow these steps to set it up:

### 1. Create the Collection

In your Appwrite Console:
- Go to **Databases** → **cms_db** → **Collections**
- Click **Create Collection**
- Collection ID: `analytics_events`
- Name: `Analytics Events`

### 2. Create Attributes

Add the following attributes to the collection:

#### Required Attributes:

1. **type** (String, 255 chars)
   - Required: Yes
   - Default: None
   - Description: Event type (e.g., 'page_view', 'product_view', 'user_action')

2. **userId** (String, 255 chars)
   - Required: No
   - Default: None
   - Description: User ID for authenticated users (optional for anonymous tracking)

3. **productId** (String, 255 chars)
   - Required: No
   - Default: None
   - Description: Product ID for product-specific events

### 3. Create Indexes

Create indexes for better query performance:

1. **Index on `type`**
   - Type: Key
   - Attributes: `type`
   - Order: ASC

2. **Index on `userId`**
   - Type: Key
   - Attributes: `userId`
   - Order: ASC

3. **Index on `productId`**
   - Type: Key
   - Attributes: `productId`
   - Order: ASC

4. **Index on `$createdAt`**
   - Type: Key
   - Attributes: `$createdAt`
   - Order: DESC

### 4. Set Permissions

Configure collection permissions:
- **Read**: Users (authenticated)
- **Create**: Users (authenticated) or Server (for automated tracking)
- **Update**: Server only
- **Delete**: Server only

### 5. Test the Collection

After creating the collection, the analytics page should:
- Load without errors (showing zeros if no data exists)
- Display empty states gracefully
- Be ready to receive analytics events

## Adding Analytics Events

To track events, create documents in the `analytics_events` collection:

```typescript
import { databases, APPWRITE_CONFIG } from './services/appwrite';
import { ID } from 'appwrite';

// Track a page view
await databases.createDocument({
  databaseId: APPWRITE_CONFIG.DATABASE_ID,
  collectionId: APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
  documentId: ID.unique(),
  data: {
    type: 'page_view',
    userId: currentUser?.$id, // Optional
    productId: null, // Optional
  }
});

// Track a product view
await databases.createDocument({
  databaseId: APPWRITE_CONFIG.DATABASE_ID,
  collectionId: APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
  documentId: ID.unique(),
  data: {
    type: 'product_view',
    userId: currentUser?.$id, // Optional
    productId: product.$id,
  }
});
```

## Current Status

✅ **Code is fully wired to Appwrite**
- All API endpoints query real Appwrite collections
- Error handling in place (won't crash if collection doesn't exist)
- Returns empty arrays/zeros if no data exists

⚠️ **Action Required**
- Create the `analytics_events` collection in Appwrite Console
- Add the required attributes and indexes
- Start tracking events to see data in the analytics page
