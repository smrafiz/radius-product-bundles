# Variant Support Implementation Plan

## Verification Status

| Tool                | Status      | Notes                                                    |
| ------------------- | ----------- | -------------------------------------------------------- |
| Shopify Dev MCP     | ✅ VERIFIED | GraphQL query already fetches variant ID - see Phase 3.1 |
| Sequential Thinking | ✅ VERIFIED | Logic confirmed for all phases                           |
| Next.js MCP         | ✅ N/A      | Standard TypeScript changes                              |

---

## Overview

This document outlines the implementation plan to add variant-level support to the Radius Bundles app. Currently, bundles only track products by their parent product ID. The goal is to optionally track specific variants per product, enable variant display in the storefront, and validate variant-level matches in the discount function.

---

## Current State Analysis

### What's Already Implemented ✅

| Component        | Status | Notes                                             |
| ---------------- | ------ | ------------------------------------------------- |
| Database Schema  | ✅     | `BundleProduct.variantId` field exists            |
| TypeScript Types | ✅     | `variantId` in `BundleProduct` and `SelectedItem` |
| Zod Validation   | ✅     | Validates variant GID format                      |
| Product Picker   | ✅     | Already supports selecting specific variants      |
| Zustand Store    | ✅     | `updateProductVariants()` action exists           |
| Widget Types     | ✅     | `variantId` in `BundleProduct` interface          |
| Widget Rendering | ✅     | Uses `data-variant-id` in HTML                    |
| Add to Cart      | ✅     | Sends variant ID to `/cart/add.js`                |
| Price Fetching   | ✅     | Matches by variant ID for tax-inclusive prices    |

### Identified Gaps ❌

1. **Metafield Sync**: Doesn't store per-product variant IDs for storefront
2. **Rust Function**: Only matches by product ID, not variant
3. **Widget Display**: Doesn't show variant title (e.g., "Blue / Large")
4. **Admin UX**: Default variant selection could be clearer

---

## Implementation Phases

### Phase 1: Backend & Data Layer

#### 1.1 Verify Bundle Product Storage

**Status**: Already implemented ✅

The database schema already supports variants:

```prisma
// web/prisma/schema.prisma
model BundleProduct {
  id        String   @id @default(cuid())
  bundleId  String
  productId String   // gid://shopify/Product/123
  variantId String?  // gid://shopify/ProductVariant/456 (OPTIONAL)
  quantity  Int      @default(1)
  // ...
}
```

**No changes needed.**

---

#### 1.2 Verify Variant Data Persistence in Bundle Creation

**File**: `web/features/bundles/services/shopify-operation.service.ts`

**Note**: This handles **standalone product bundles** (`mainVariantId` field), not per-bundle-product variant selection. For bundle products, variant selection happens via the product picker.

**Current behavior** (lines 90-103):

```typescript
const variantId = product.variants?.nodes?.[0]?.id ?? null;
mainVariantId: variantId,
```

**Status**: Already implemented for standalone products. Bundle products use product picker for variant selection.

---

#### 1.3 Update Metafield Sync to Include Variant IDs

**File**: `web/lib/graphql/operations/metafield.operations.ts`

**Current state**: Only stores `mainProductId` and `mainVariantId` (for standalone bundles).

**Required changes**:

1. Update `buildShopBundlesMetafieldValue()` (lines 421-497) to include productVariantIds map. Add after line 475:

```typescript
// Build productVariantIds map (productId → variantId)
const productVariantIdsMap: Record<string, string> = {};
for (const bp of bundleProducts) {
    if (bp.variantId) {
        productVariantIdsMap[bp.productId] = bp.variantId;
    }
}

// Add to bundleMap (around line 475)
productVariantIds: Object.keys(productVariantIdsMap).length > 0 ? productVariantIdsMap : null,
```

2. Update `buildDiscountBundlesMetafieldValue()` (lines 504-561) similarly. Add after line 546:

```typescript
// Build productVariantIds map
const productVariantIdsMap: Record<string, string> = {};
for (const bp of bundleProducts) {
    if (bp.variantId) {
        productVariantIdsMap[bp.productId] = bp.variantId;
    }
}

// Add to bundleMap (around line 546)
productVariantIds: Object.keys(productVariantIdsMap).length > 0 ? productVariantIdsMap : null,
```

**Expected metafield output**:

```json
{
    "bundle-123": {
        "productQuantities": { "gid://shopify/Product/123": 1 },
        "productVariantIds": {
            "gid://shopify/Product/123": "gid://shopify/ProductVariant/456"
        }
        // ...
    }
}
```

2. Update `buildShopBundlesMetafieldValue()` similarly (around line 470-497).

---

### Phase 2: Storefront Widget

#### 2.1 Product API - Verify Variant Info

**File**: `web/app/api/proxy/products/route.ts`

**Status**: Returns `variantId` but **missing `variantTitle`** (line 243).

---

#### 2.1.5 Add variantTitle Transformation (CRITICAL - NEW STEP)

**File**: `web/app/api/proxy/products/route.ts`

**Current** (lines 241-255):

```typescript
return {
    id: bp.productId,
    variantId: bp.variantId || variant?.id || "",
    // MISSING: variantTitle
    quantity: bp.quantity,
    ...
};
```

**Add** after line 243:

```typescript
variantTitle: variant?.title || "",
```

---

#### 2.2 Widget - Display Variant Title

**Files to modify**:

1. **`web/widgets/src/lib/types.ts`** - Add variant title field:

```typescript
export interface BundleProduct {
    id: string;
    variantId: string;
    variantTitle?: string; // ADD: "Blue / Large"
    quantity: number;
    // ... rest
}
```

2. **`web/widgets/src/lib/fixed-renderer.ts`** - Show variant in product card:

```typescript
// Around line 142-144, modify productTitleHtml
const variantPart = product.variantTitle ? ` / ${product.variantTitle}` : "";
const productTitleHtml = ctx.enableHyperLink
    ? `<h3 class="radius-bundle__product-title"><a href="${productUrl}">${escapeHtml(product.title)}${variantPart}</a></h3>`
    : `<h3 class="radius-bundle__product-title">${escapeHtml(product.title)}${variantPart}</h3>`;
```

3. **`web/widgets/src/lib/bogo-renderer.ts`** - 6 locations to update:

| Function                                             | Lines     | Variable    |
| ---------------------------------------------------- | --------- | ----------- |
| `renderBxgyProducts()` → `renderCard()`              | 116-118   | `titleHtml` |
| `renderClassicCardProducts()` → `renderProduct()`    | 254-256   | `titleHtml` |
| `renderBogoSleekProducts()` → `renderCard()`         | 448-450   | `titleHtml` |
| `renderBogoMinimalistProducts()` → `renderMinItem()` | 620-622   | `titleHtml` |
| `renderBogoCompactGridProducts()` → `renderTile()`   | 767-769   | `titleHtml` |
| Split layout renderer                                | 1339-1340 | `titleHtml` |

Add variant to title:

```typescript
const variantPart = product.variantTitle ? ` / ${product.variantTitle}` : "";
const titleHtml = `<h3>${escapeHtml(product.title)}${variantPart}</h3>`;
```

---

#### 2.3 Widget - Add to Cart Uses Configured Variant

**Status**: Already implemented ✅

The widget already uses `product.variantId` when adding to cart at `bundle-widget.ts:1112-1115`.

**No changes needed** - verify during testing.

---

### Phase 3: Rust Discount Function (Variant Matching)

> ⚠️ **VERIFIED via Shopify Dev MCP**: The GraphQL query already fetches both `id` (variant GID) and `product { id }` - NO CHANGE needed to the .graphql file!

This is the **critical change** - makes the function validate variant-level matches.

#### 3.1 Update GraphQL Input Query

**File**: `extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.graphql`

**Current** (lines 20-28 - ALREADY HAS VARIANT ID):

```graphql
merchandise {
    __typename
    ... on ProductVariant {
        id
        product {
            id
        }
    }
}
```

**Status**: ✅ ALREADY IMPLEMENTED - No change needed! The query already fetches both `id` (variant GID) and `product { id }` (product GID).

---

#### 3.2 Update Rust Structs

**File**: `extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs`

**Current MetafieldBundleConfig** (lines 36-55):

```rust
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MetafieldBundleConfig {
    status: Option<String>,
    discount_type: String,
    discount_value: f64,
    // ... existing fields ...
    product_roles: Option<HashMap<String, String>>,
}
```

**Add to `MetafieldBundleConfig`** (after line 54):

```rust
    // ADD:
    product_variant_ids: Option<HashMap<String, String>>, // productId → variantId
}
```

---

#### 3.3 Add Variant ID Extraction Function

**Add after `get_product_gid()` function (lines 70-78)**:

```rust
/// Extracts the Shopify variant GID from a line's merchandise.
fn get_variant_gid(
    line: &schema::cart_lines_discounts_generate_run::input::cart::Lines,
) -> Option<String> {
    match line.merchandise() {
        Merchandise::ProductVariant(variant) => Some(variant.id().to_string()),
        _ => None,
    }
}
```

---

#### 3.4 Update Product Matching Logic

**Current function** (lines 57-68):

```rust
fn is_product_in_bundle(product_gid: &str, settings: &MetafieldBundleConfig) -> bool {
    // ... current logic
}
```

**Replace with**:

```rust
/// Checks if a Shopify product GID belongs to this bundle.
/// If variant_ids are specified in the bundle config, also validates variant match.
fn is_product_in_bundle(
    product_gid: &str,
    variant_gid: Option<&str>, // ADD variant parameter
    settings: &MetafieldBundleConfig,
) -> bool {
    // 1. Check if product is in bundle
    let in_bundle = if let Some(ref qty_map) = settings.product_quantities {
        qty_map.contains_key(product_gid)
    } else {
        false
    };

    if !in_bundle {
        return false;
    }

    // 2. If bundle specifies variant IDs, validate variant matches
    if let Some(ref variant_ids) = settings.product_variant_ids {
        if let Some(expected_variant) = variant_ids.get(product_gid) {
            match variant_gid {
                Some(cart_variant) => {
                    // Compare variant IDs
                    return cart_variant == expected_variant;
                }
                None => return false, // Bundle requires specific variant but cart has none
            }
        }
    }

    // 3. No variant restriction - any variant of product is fine (backward compatible)
    true
}
```

---

#### 3.5 Update BundleLineInfo Struct

**Current** (lines 80-84):

```rust
struct BundleLineInfo<'a> {
    line: &'a schema::cart_lines_discounts_generate_run::input::cart::Lines,
    product_id: Option<String>,
}
```

**Add variant_id**:

```rust
struct BundleLineInfo<'a> {
    line: &'a schema::cart_lines_discounts_generate_run::input::cart::Lines,
    product_id: Option<String>,
    variant_id: Option<String>, // ADD
}
```

---

#### 3.6 Update Cart Line Filter

**Current** (lines 455-464):

```rust
.filter_map(|line| {
    let product_id = get_product_gid(line);
    match &product_id {
        Some(pid) if is_product_in_bundle(pid, bundle_settings) => {
            Some(BundleLineInfo { line, product_id })
        }
        _ => None,
    }
})
```

**Update to**:

```rust
.filter_map(|line| {
    let product_id = get_product_gid(line);
    let variant_id = get_variant_gid(line); // ADD
    match &product_id {
        Some(pid) if is_product_in_bundle(pid, variant_id.as_deref(), bundle_settings) => {
            Some(BundleLineInfo { line, product_id, variant_id }) // Pass variant_id
        }
        _ => None,
    }
})
```

---

#### 3.7 Apply Same Changes to Delivery Options Function

**Files to update**:

1. `extension/extensions/radius-discount-function/src/cart_delivery_options_discounts_generate_run.graphql`
2. `extension/extensions/radius-discount-function/src/cart_delivery_options_discounts_generate_run.rs`

**GraphQL Change** (cart_delivery_options_discounts_generate_run.graphql):

**Current** (lines 14-21):

```graphql
merchandise {
    __typename
    ... on ProductVariant {
        product {
            id
        }
    }
}
```

**Add variant ID**:

```graphql
merchandise {
    __typename
    ... on ProductVariant {
        id  # ADD: variant GID
        product {
            id
        }
    }
}
```

**Rust Changes**: Apply same pattern as cart_lines (struct, get_variant_gid, matching logic).

---

### Phase 4: Testing & Validation

#### 4.1 Admin Testing

1. Create a bundle with products
2. Select specific variants for each product
3. Save bundle
4. Verify metafield contains `productVariantIds`

#### 4.2 Storefront Testing

1. Load bundle on storefront
2. Verify variant titles display (e.g., "Blue / Large")
3. Click add to cart
4. Verify correct variant added to cart

#### 4.3 Discount Function Testing

1. Add correct variant to cart → Discount applies ✅
2. Add different variant of same product → Discount does NOT apply ✅
3. Add product with no variant configured → Any variant gets discount ✅

---

## File Change Summary

| Phase | File                                                   | Change Type                          | Status          |
| ----- | ------------------------------------------------------ | ------------------------------------ | --------------- |
| 1.3   | `web/lib/graphql/operations/metafield.operations.ts`   | Add `productVariantIds` to metafield | PENDING         |
| 2.1.5 | `web/app/api/proxy/products/route.ts`                  | Add `variantTitle` to response       | PENDING         |
| 2.2   | `web/widgets/src/lib/types.ts`                         | Add `variantTitle` field             | PENDING         |
| 2.2   | `web/widgets/src/lib/fixed-renderer.ts`                | Display variant title                | PENDING         |
| 2.2   | `web/widgets/src/lib/bogo-renderer.ts` (6 locations)   | Display variant title                | PENDING         |
| 3.1   | `cart_lines_discounts_generate_run.graphql`            | Fetch variant ID                     | ✅ ALREADY DONE |
| 3.2   | `cart_lines_discounts_generate_run.rs`                 | Add struct fields                    | PENDING         |
| 3.3   | `cart_lines_discounts_generate_run.rs`                 | Add `get_variant_gid()`              | PENDING         |
| 3.4   | `cart_lines_discounts_generate_run.rs`                 | Update matching logic                | PENDING         |
| 3.5   | `cart_lines_discounts_generate_run.rs`                 | Update struct                        | PENDING         |
| 3.6   | `cart_lines_discounts_generate_run.rs`                 | Update filter                        | PENDING         |
| 3.7   | `cart_delivery_options_discounts_generate_run.graphql` | Fetch variant ID                     | PENDING         |
| 3.7   | `cart_delivery_options_discounts_generate_run.rs`      | Apply same pattern                   | PENDING         |

---

## Implementation Order

1. **Phase 1**: Backend data layer (metafield sync)
2. **Phase 2.1.5**: Add variantTitle to products API (CRITICAL - data pipeline)
3. **Phase 2.2**: Widget display (variant titles)
4. **Phase 3**: Rust function (variant validation)
5. **Phase 4**: Testing

---

## Backward Compatibility

- If `productVariantIds` is null/missing in metafield, the Rust function falls back to product-only matching (any variant works)
- Existing bundles without variant selection continue to work as before
