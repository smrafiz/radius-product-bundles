# Admin API Migration Guide: 2025-10 → 2026-01

> Generated: 2026-02-22 | Branch: `caching-test`
> Sources: Shopify Dev MCP (Admin GraphQL API, Changelog), `@shopify/shopify-api@12.3.0` ApiVersion enum, Codebase Analysis

---

## Overview

| Item                            | Current   | Target                                        |
| ------------------------------- | --------- | --------------------------------------------- |
| **Admin API**                   | `2025-10` | `2026-01` (latest stable)                     |
| **Webhook API**                 | `2025-10` | `2026-01`                                     |
| **Discount Function Extension** | `2025-04` | `2026-01` (optional, see notes)               |
| **Theme Extension**             | `2025-07` | `2026-01` (optional, see notes)               |
| **`@shopify/shopify-api`**      | `12.3.0`  | `12.3.0` (already has `ApiVersion.January26`) |
| **Risk Level**                  | —         | **Low** (no breaking changes affect this app) |

---

## 2026-01 Changelog (What's New)

### Changes Relevant to This App

| Change                                                                                   | Impact                                                                                                 | Action Needed                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **Subscription billing attempts throttling**                                             | New `throttled` error code on `BillingAttemptUserErrorCode`                                            | None — app doesn't use subscription billing  |
| **`visible_to_storefront_api` removed from `StandardMetaobjectDefinitionFieldTemplate`** | Breaking for apps using metaobject field definitions with storefront visibility                        | None — app uses metafields, not metaobjects  |
| **Events data limited to 1 year retention**                                              | Events older than 1 year no longer returned via Event interface                                        | None — app doesn't query Event API           |
| **Inventory `changeFromQuantity` field**                                                 | New optional field on `inventorySetQuantities`, `inventoryAdjustQuantities`, `inventoryMoveQuantities` | None — app doesn't manage inventory directly |
| **`compareQuantity` / `ignoreCompareQuantity` deprecated** on inventory mutations        | Deprecated (removal in 2026-04)                                                                        | None — not used                              |

### Important Upcoming Deprecation (2026-04)

| Deprecation                                                                                            | Deadline         | Impact                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product/Order/Shipping Discount Function APIs deprecated** in favor of unified Discount Function API | Before `2026-04` | **Relevant** — your Rust function uses `cart.lines.discounts.generate.run` and `cart.delivery-options.discounts.generate.run`. Review the [migration guide](https://shopify.dev/changelog/deprecation-product-order-shipping-discount-function-apis) to confirm your targets are on the unified API. |
| **`deliveryShippingOriginAssign` mutation deprecated**                                                 | `2026-04`        | None — not used                                                                                                                                                                                                                                                                                      |

---

## Files to Change (9 locations)

### 1. App Configuration — TOML Files

#### `shopify.app.toml` (line 20)

```diff
[webhooks]
-api_version = "2025-10"
+api_version = "2026-01"
```

#### `shopify.app.product-bundles.toml` (line 20)

```diff
[webhooks]
-api_version = "2025-10"
+api_version = "2026-01"
```

#### `shopify.app.app-next-vercel.toml` (line 21)

```diff
[webhooks]
-api_version = "2025-10"
+api_version = "2026-01"
```

### 2. SDK Version Constant

#### `web/shared/constants/shopify.constants.ts` (line 3)

```diff
-export const SHOPIFY_API_VERSION = ApiVersion.October25;
+export const SHOPIFY_API_VERSION = ApiVersion.January26;
```

### 3. GraphQL Codegen Schema

#### `web/codegen.ts` (line 5)

```diff
-schema: "https://shopify.dev/admin-graphql-direct-proxy/2025-10",
+schema: "https://shopify.dev/admin-graphql-direct-proxy/2026-01",
```

### 4. Hardcoded API Endpoints

#### `web/lib/graphql/client/server-action.ts` (line 79)

```diff
-const endpoint = `https://${shop}/admin/api/2025-10/graphql.json`;
+const endpoint = `https://${shop}/admin/api/2026-01/graphql.json`;
```

#### `web/lib/graphql/client/proxy-client.ts` (line 43)

```diff
-const endpoint = `https://${shop}/admin/api/2025-10/graphql.json`;
+const endpoint = `https://${shop}/admin/api/2026-01/graphql.json`;
```

#### `web/lib/shopify/setup/app-setup.ts` (line 61)

```diff
-const endpoint = `https://${shop}/admin/api/2025-10/graphql.json`;
+const endpoint = `https://${shop}/admin/api/2026-01/graphql.json`;
```

### 5. Extension API Versions (Optional)

#### `extension/extensions/radius-discount-function/shopify.extension.toml` (line 1)

```diff
-api_version = "2025-04"
+api_version = "2026-01"
```

> **Note**: Test the Rust discount function thoroughly after bumping. The discount function extension targets are stable, but verify the input query schemas haven't changed for your targets.

#### `extension/extensions/product-bundle-widget/shopify.extension.toml` (line 2)

```diff
-api_version = "2025-07"
+api_version = "2026-01"
```

> **Note**: Theme extensions are generally version-agnostic, but verify Liquid block schemas still pass `shopify app dev` validation.

---

## GraphQL Schema Compatibility Audit

All 14 `.graphql` schema files were reviewed against 2026-01 changes:

| Schema File                    | Operations                                                                                                                         | Status | Notes                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `fragments/common.graphql`     | `ImageFields`, `MoneyFields`, `PageInfoFields`                                                                                     | Safe   | No changes to `Image`, `MoneyV2`, `PageInfo` types                                 |
| `fragments/product.graphql`    | `ProductFields`, `ProductCardFields`, `VariantFields`                                                                              | Safe   | No changes to `Product`, `ProductVariant` types. `priceRangeV2` still supported    |
| `fragments/collection.graphql` | `CollectionFilterFields`, `CollectionFields`, `CollectionDetailsFields`                                                            | Safe   | No changes to `Collection` type                                                    |
| `mutations/discounts.graphql`  | `CreateBundleAutomaticDiscount`, `UpdateBundleDiscountCombinesWith`, `UpdateBundleDiscountMetafield`                               | Safe   | `discountAutomaticAppCreate`, `discountAutomaticAppUpdate` unchanged               |
| `mutations/media.graphql`      | `StagedUploadsCreate`, `fileDelete`, `fileUpdateRemoveRefs`                                                                        | Safe   | No changes to file/media mutations                                                 |
| `mutations/metafields.graphql` | `MetafieldsSet`, `MetafieldDefinitionCreate`                                                                                       | Safe   | `metafieldsSet` and `metafieldDefinitionCreate` unchanged                          |
| `mutations/products.graphql`   | `ProductCreate`, `ProductUpdate`, `ProductVariantsBulkUpdate`, `ProductDelete`, `PublishablePublish`                               | Safe   | All mutations stable                                                               |
| `queries/collections.graphql`  | `GetCollectionsForFilters`, `GetCollections`, `GetCollectionByHandle`                                                              | Safe   | `collectionByIdentifier` still valid                                               |
| `queries/discounts.graphql`    | `CheckBundleDiscountExists`                                                                                                        | Safe   | `discountNodes` unchanged                                                          |
| `queries/files.graphql`        | `filesCheckOrphaned`                                                                                                               | Safe   | `files` query unchanged                                                            |
| `queries/metafields.graphql`   | `GetProductBundleMetafield`, `GetProductsBundleMetafields`, `CheckMetafieldDefinition`, `GetShopMetafields`, `GetBundleDiscountId` | Safe   | `metafieldDefinitions`, `metafield` unchanged                                      |
| `queries/products.graphql`     | `GetProducts`, `GetProductById`, `GetProductsByIds`, `GetBundleProducts`                                                           | Safe   | `products`, `nodes` queries unchanged                                              |
| `queries/shop.graphql`         | `GetShopId`, `GetShopInfo`, `GetPublications`                                                                                      | Safe   | `shop`, `publications` queries unchanged. `billingAddress.countryCode` still valid |
| `queries/webhooks.graphql`     | `GetWebhookSubscriptions`                                                                                                          | Safe   | `webhookSubscriptions` unchanged                                                   |

**Result: All 14 schema files are compatible with 2026-01. No GraphQL changes required.**

---

## Migration Steps

### Step 1: Update version references

Apply the 9 file changes listed above (7 required + 2 optional extensions).

### Step 2: Regenerate GraphQL types

```bash
cd web && bun run graphql-codegen
```

This regenerates types from the `2026-01` schema. Expect no breaking type changes based on the audit above.

### Step 3: Deploy app config

```bash
shopify app deploy
```

This pushes the new `api_version` in TOML to Shopify, updating webhook delivery version.

### Step 4: Test

- [ ] `bun run dev` — app starts without errors
- [ ] GraphQL queries work (product CRUD, metafield reads, discount creation)
- [ ] Webhook delivery still works (`products/update`, `shop/update`)
- [ ] Discount function applies correctly on storefront
- [ ] Theme extension renders bundle widget
- [ ] `bun run test` — all tests pass

### Step 5: (Recommended) Centralize the API version

Currently the API version `2025-10` is hardcoded in 3 places (`server-action.ts`, `proxy-client.ts`, `app-setup.ts`). Consider refactoring to use the centralized constant:

```typescript
// In server-action.ts, proxy-client.ts, app-setup.ts:
import { SHOPIFY_API_VERSION } from "@/shared/constants";

const endpoint = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
```

This way future version bumps only require changing one file (`shopify.constants.ts`).

---

## Summary

| Category                          | Verdict                                            |
| --------------------------------- | -------------------------------------------------- |
| **Breaking changes for this app** | **None**                                           |
| **GraphQL schema compatibility**  | **All 14 files safe**                              |
| **Files to change**               | **9** (7 required + 2 optional extensions)         |
| **Post-migration tasks**          | Regenerate codegen types, deploy, test             |
| **Future watch**                  | Discount Function API unification before `2026-04` |
| **Recommended refactor**          | Centralize hardcoded API version strings           |
