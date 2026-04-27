# Starter App Recommendation: Product Wishlist

> Complete documentation for building a Product Wishlist starter feature.

---

## Comparing with Shopify Official Template

### Shopify React Router Template (Official)
> https://github.com/Shopify/shopify-app-template-react-router

| Aspect | Shopify Official | Your Project (Radius) | Notes |
|-------|-------------------|----------------------|-------|
| **Framework** | React Router 7 | Next.js 16 | Different routing |
| **State** | React Router loaders/actions | Server Actions + React Query | Similar patterns |
| **Database** | Prisma (SQLite default) | Prisma (PostgreSQL) | Both supported |
| **UI** | Basic HTML/CSS | Polaris Web Components | Radius has design system |
| **Sessions** | PrismaSessionStorage | PrismaSessionStorage | Similar |
| **GraphQL** | Via shopify.server.ts | Via lib/graphql/client | Similar |

### Official Template Structure

```
shopify-app-template-react-router/
├── app/
│   ├── routes/
│   │   ├── _index.tsx              # Home (products list)
│   │   ├── app._index.tsx          # Redirect to _index
│   │   ├── auth.[...auth].tsx    # Auth flow
│   │   └── webhooks.tsx          # Webhook handler
│   ├── shopify.server.ts         # Shopify config
│   └── styles/
│       └── app.css
├── prisma/
│   └── schema.prisma           # Session storage only
├── shopify.app.toml          # App config
└── package.json
```

### Key Differences

| Component | Shopify Official | Radius (Your Project) |
|-----------|------------------|---------------------|
| **Feature Pattern** | Flat routes | 10-layer feature system |
| **State Management** | React Router loaders | React Query + Zustand |
| **UI Components** | Basic | Polaris + custom |
| **GraphQL** | Simple queries | Full codegen pipeline |
| **Extensions** | Not included | Theme + Function |

### Recommendation for Template Extraction

The Shopify template is **too simple** for a starter. Your project's architecture has:
- ✅ Better feature pattern (10 layers vs flat)
- ✅ Better state management (React Query + Zustand)
- ✅ Better design system (Polaris)
- ✅ Complete extension system

**Extract from YOUR project**, not the Shopify template. The template is just a scaffold - your project has the patterns.

---

<br>

# Part 1: Why This Feature

## 1. Why This Feature

### Feature: Product Wishlist

| Criteria | Assessment |
|----------|-----------|
| **Demand** | High (~50K+ install volume for similar apps) |
| **Complexity** | Simple CRUD - add, remove, list |
| **Architecture** | Shows all 10-layer pattern cleanly |
| **Business Logic** | Minimal - easy to understand |
| **Prisma Model** | Simple - just wishlist + items |
| **GraphQL** | Standard - read products, create/update wishlist |
| **UI Pattern** | Common - list view + detail view |
| **Extension** | Show visible storefront integration |

### Why Not Other Popular Features

| Feature | Why Not |
|---------|--------|
| Product Labels/Badges | Requires complex theming + many variant edge cases |
| Bulk Edit | Complex filtering + pagination + batch operations |
| SEO Tools | Requires crawler + external integrations |
| Form Builder | Complex form builder logic + file uploads |
| Loyalty/Referral | Complex referral logic + fraud detection |
| Product Options | Already built into Shopify natively |

---

<br>

# Part 2: Prisma Schema

## 2. Database - Complete Wishlist Schema

### Full Prisma Models

```prisma
// Add to web/prisma/schema.prisma

model Wishlist {
  id           String          @id @default(cuid())
  shop         String          // Shopify shop domain
  customerId   String?         // Shopify customer ID (logged in)
  email        String?         // Guest email
  anonymousId String?         // Anonymous session ID
  isActive    Boolean        @default(true)
  products    WishlistItem[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([shop, customerId])
  @@unique([shop, email])
  @@unique([shop, anonymousId])
  @@index([shop])
  @@map("wishlists")
}

model WishlistItem {
  id           String    @id @default(cuid())
  wishlistId    String
  productId    BigInt    // Shopify product ID
  variantId    BigInt?   // Optional variant
  productHandle String   // Cache for quick lookup
  addedAt      DateTime  @default(now())
  
  wishlist     Wishlist  @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  
  @@unique([wishlistId, productId, variantId])
  @@index([productId])
  @@index([wishlistId])
  @@map("wishlist_items")
}

model WishlistAnalytics {
  id            String   @id @default(cuid())
  productId     BigInt   @unique
  productHandle String
  wishlistCount Int     @default(1)
  lastAdded    DateTime @default(now())

  @@map("wishlist_analytics")
}
```

### Table Structure

| Table | Purpose | Keys |
|-------|---------|------|
| `wishlists` | One per customer per shop | `shop + customerId` (unique) |
| `wishlist_items` | Products in each wishlist | `wishlistId + productId + variantId` |
| `wishlist_analytics` | Most wishlisted products | `productId` (unique) |

### User Types Supported

| Type | Field | Description |
|------|-------|------------|
| Logged in customer | `customerId` | Shopify customer ID |
| Guest with email | `email` | Customer provided email |
| Anonymous | `anonymousId` | Browser session ID |

---

<br>

# Part 3: Feature Architecture

## 3. Feature Architecture - 10-Layer Pattern

### Data Flow

```
React Component
    ↓
React Query (api/wishlist-queries.ts)
    ↓
Server Action (actions/wishlist-read.actions.ts)
    ↓
Service (services/wishlist.service.ts)
    ↓
Repository (repositories/wishlist.repository.ts)
    ↓
Prisma Client → PostgreSQL
    ↓
Shopify Admin API (GraphQL - for product details)
```

### 10-Layer Feature Structure

```
web/features/wishlist/
├── actions/              # 1. API Boundary
│   ├── wishlist-read.actions.ts
│   └── wishlist-write.actions.ts
├── api/                 # 2. React Query
│   ├── wishlist-keys.ts
│   ├── wishlist-queries.ts
│   └── wishlist-mutations.ts
├── components/          # 3. UI
│   ├── wishlist-button.tsx
│   ├── wishlist-page.tsx
│   └── wishlist-card.tsx
├── hooks/               # 4. Custom Hooks
│   ├── use-wishlist.ts
│   └── use-wishlist-item.ts
├── repositories/        # 5. Data Access
│   ├── wishlist.repository.ts
│   └── wishlist-item.repository.ts
├── services/            # 6. Business Logic
│   ├── wishlist.service.ts
│   └── wishlist-validator.ts
├── stores/              # 7. State
│   └── wishlist.store.ts
├── types/              # 8. Types
│   └── wishlist.types.ts
├── constants/         # 9. Constants
│   └── wishlist-status.ts
└── validation/       # 10. Validation
    └── wishlist.zod.ts
```

---

<br>

# Part 4: Repository Queries

## 4. Repository - Queries You'll Need

### Standard Queries

```typescript
// In wishlist.repository.ts

// Find wishlist by shop and customer
async function findByShopAndCustomer(shop: string, customerId: string) {
  return prisma.wishlist.findUnique({
    where: { shop_customerId: { shop, customerId } },
    include: { products: true }
  });
}

// Find wishlist by email (guest)
async function findByEmail(shop: string, email: string) {
  return prisma.wishlist.findUnique({
    where: { shop_email: { shop, email } },
    include: { products: true }
  });
}

// Find wishlist by anonymous ID
async function findByAnonymous(shop: string, anonymousId: string) {
  return prisma.wishlist.findUnique({
    where: { shop_anonymousId: { shop, anonymousId } },
    include: { products: true }
  });
}

// Create new wishlist
async function create(data: { shop: string; customerId?: string; email?: string }) {
  return prisma.wishlist.create({ data });
}

// Add product to wishlist
async function addProduct(wishlistId: string, productId: BigInt, variantId?: BigInt, handle?: string) {
  return prisma.wishlistItem.create({
    data: {
      wishlistId,
      productId,
      variantId,
      productHandle: handle || ''
    }
  });
}

// Remove product from wishlist
async function removeProduct(wishlistId: string, productId: BigInt, variantId?: BigInt) {
  return prisma.wishlistItem.delete({
    where: {
      wishlistId_productId_variantId: {
        wishlistId,
        productId,
        variantId: variantId || 0
      }
    }
  });
}

// Delete entire wishlist
async function deleteWishlist(id: string) {
  return prisma.wishlist.delete({ where: { id } });
}
```

### Analytics Queries

```typescript
// In wishlist.repository.ts

// Increment wishlist count when item added
async function incrementWishlistCount(productId: BigInt, handle: string) {
  return prisma.wishlistAnalytics.upsert({
    where: { productId },
    update: { 
      wishlistCount: { increment: 1 },
      lastAdded: new Date()
    },
    create: { productId, productHandle: handle }
  });
}

// Decrement wishlist count when item removed
async function decrementWishlistCount(productId: BigInt) {
  return prisma.wishlistAnalytics.update({
    where: { productId },
    data: { wishlistCount: { decrement: 1 } }
  });
}

// Get top wishlisted products
async function getTopWishlisted(limit: number = 10) {
  return prisma.wishlistAnalytics.findMany({
    orderBy: { wishlistCount: 'desc' },
    take: limit
  });
}

// Get for specific product
async function getWishlistCount(productId: BigInt) {
  return prisma.wishlistAnalytics.findUnique({
    where: { productId }
  });
}
```

---

<br>

# Part 5: Admin Pages

## 5. Admin Pages (Inside Shopify Admin)

### Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/wishlist` | Wishlist overview | List all customer wishlists |
| `/wishlist/analytics` | Wishlist stats | Most wanted products |

### File Structure

```
web/app/(dashboard)/wishlist/
├── page.tsx           # Wishlist overview (Page component)
├── loading.tsx        # Loading skeleton
└── error.tsx        # Error boundary
```

### Page Example

```typescript
// web/app/(dashboard)/wishlist/page.tsx
import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { WishlistOverview } from "@/features/wishlist";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.wishlist");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <WishlistOverview />;
}
```

---

<br>

# Part 6: Storefront Extensions

## 6. Storefront Extensions - Theme App Extension

### Extension Structure

```
extension/extensions/wishlist-widget/
├── blocks/
│   └── wishlist-button.liquid    # Add to wishlist button
├── templates/
│   ├── product.json          # Product page template
│   └── collection.json     # Collection page
├── assets/
│   ├── wishlist-widget.js   # Storefront JS
│   └── wishlist-widget.css # Styles
├── locales/
│   └── en.default.json
└── shopify.extension.toml
```

### Liquid Button (App Block)

```liquid
<!-- blocks/wishlist-button.liquid -->
{% comment %}
  Wishlist button - auto-shows on product pages
{% endcomment %}

<div class="wishlist-button" data-product-id="{{ product.id }}">
  <button 
    type="button" 
    class="wishlist-btn {% if product.id == wishlist_product_ids %}in-wishlist{% endif %}"
    data-product-id="{{ product.id }}"
    data-product-handle="{{ product.handle }}"
  >
    {% if product.id == wishlist_product_ids %}
      <span class="icon">♥</span>
      <span class="text">{{ 'Remove from Wishlist' | t }}</span>
    {% else %}
      <span class="icon">♡</span>
      <span class="text">{{ 'Add to Wishlist' | t }}</span>
    {% endif %}
  </button>
</div>
```

### JavaScript Client

```javascript
// assets/wishlist-widget.js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wishlist-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = button.dataset.productId;
      const productHandle = button.dataset.productHandle;
      
      const response = await fetch('/apps/wishlist/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productHandle })
      });
      
      // Toggle button state based on response
    });
  });
});
```

### App Proxy (For Storefront)

```
web/app/api/proxy/wishlist/route.ts
```

This allows the storefront widget to communicate with your app without theme editing.

---

<br>

# Part 7: Complete File List

## 7. Implementation Files to Create

### Prisma Schema

| File | Purpose |
|------|---------|
| `web/prisma/schema.prisma` | Add Wishlist + WishlistItem + WishlistAnalytics models |

### Feature Files

| File | Purpose |
|------|---------|
| `web/features/wishlist/actions/wishlist-read.actions.ts` | GET wishlist, get products |
| `web/features/wishlist/actions/wishlist-write.actions.ts` | POST add, PUT update, DELETE remove |
| `web/features/wishlist/api/wishlist-keys.ts` | React Query keys |
| `web/features/wishlist/api/wishlist-queries.ts` | useWishlist hook |
| `web/features/wishlist/api/wishlist-mutations.ts` | useAddToWishlist, useRemoveFromWishlist |
| `web/features/wishlist/repositories/wishlist.repository.ts` | Prisma queries |
| `web/features/wishlist/repositories/wishlist-item.repository.ts` | Item CRUD |
| `web/features/wishlist/services/wishlist.service.ts` | Business logic |
| `web/features/wishlist/services/wishlist-validator.ts` | Input validation |
| `web/features/wishlist/types/wishlist.types.ts` | TypeScript types |
| `web/features/wishlist/types/wishlist-item.types.ts` | Item types |
| `web/features/wishlist/constants/wishlist.ts` | Constants |
| `web/features/wishlist/stores/wishlist.store.ts` | Zustand store |
| `web/features/wishlist/components/WishlistButton.tsx` | Add button |
| `web/features/wishlist/components/WishlistPage.tsx` | Admin list page |
| `web/features/wishlist/components/WishlistCard.tsx` | Product card |
| `web/features/wishlist/components/WishlistEmptyState.tsx` | Empty state |
| `web/features/wishlist/hooks/use-wishlist.ts` | Main hook |
| `web/features/wishlist/hooks/use-wishlist-item.ts` | Item hook |
| `web/features/wishlist/validation/wishlist.zod.ts` | Zod schemas |
| `web/features/wishlist/index.ts` | Export barrel |

### Extension Files

| File | Purpose |
|------|---------|
| `extension/extensions/wishlist-widget/blocks/wishlist-button.liquid` | Display button |
| `extension/extensions/wishlist-widget/assets/wishlist-widget.js` | Client JS |
| `extension/extensions/wishlist-widget/assets/wishlist-widget.css` | Styles |
| `extension/extensions/wishlist-widget/shopify.extension.toml` | Config |
| `extension/extensions/wishlist-widget/locales/en.default.json` | i18n |

### Routes

| File | Purpose |
|------|---------|
| `web/app/(dashboard)/wishlist/page.tsx` | Admin overview page |
| `web/app/(dashboard)/wishlist/loading.tsx` | Loading skeleton |
| `web/app/(dashboard)/wishlist/error.tsx` | Error boundary |
| `web/app/api/proxy/wishlist/route.ts` | Storefront API |

---

<br>

# Part 8: Why NOT Shopify Function

## 8. Why NOT Shopify Function

### Comparison

| Criteria | Theme Extension | Shopify Function |
|----------|----------------|-----------------|
| **Language** | Liquid + JS | Rust/JS |
| **Complexity** | Easy | Hard |
| **Use Case** | Display, UI | Backend logic |
| **Debugging** | Easy (storefront visible) | Hard (no logs) |
| **Your Existing** | ✅ product-bundle-widget | ✅ radius-discount-function |

### When to Use Shopify Function

- ✅ Custom discount types
- ✅ Shipping rules
- ✅ Payment customization
- ✅ Cart validation
- ❌ Simple wishlist (not needed)

### Verdict

Your existing `radius-discount-function` already covers the Function use case. Adding another would be redundant and add complexity without learning value.

---

<br>

# Part 9: Learning Outcomes

## 9. Summary - What You'll Learn

After completing this starter, you will understand:

| # | Component | Demonstrated |
|---|-----------|---------------|
| 1 | Server Actions | ✅ |
| 2 | React Query | ✅ |
| 3 | UI (Polaris) | ✅ |
| 4 | Custom Hooks | ✅ |
| 5 | Repository | ✅ |
| 6 | Service | ✅ |
| 7 | Zustand Store | ✅ |
| 8 | Types | ✅ |
| 9 | Validation (Zod) | ✅ |
| 10 | Prisma | ✅ |
| 11 | GraphQL | ✅ |
| 12 | Theme Extension | ✅ |
| 13 | App Proxy | ✅ |
| 14 | Admin Page Route | ✅ |

### Complete Starter Coverage

| Category | Wishlist Coverage |
|----------|-------------------|
| **Backend (API)** | Server Actions → Service → Repository |
| **Frontend** | React Query → Hooks → Components |
| **State** | Zustand store |
| **Database** | Prisma models |
| **Shopify** | GraphQL + Webhooks |
| **Storefront** | Theme Extension + JS |
| **Admin** | Polaris pages |

**That's ALL the layers.** One feature demonstrates the entire architecture.

---

*Generated: April 2026*
*For: Radius Bundles Starter App*