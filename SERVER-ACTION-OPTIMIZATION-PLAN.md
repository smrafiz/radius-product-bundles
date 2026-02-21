# Server Action Optimization Plan — Radius Product Bundles

> Generated: 2026-02-22 | Sources: Shopify Dev MCP (GraphQL rate limits, MetafieldsSet batching), Next.js MCP (caching, React `cache()`), Prisma schema analysis, Neon serverless config review

---

## Table of Contents

1. [Context & Findings](#context--findings)
2. [Phase 1: Quick Wins (~30 min each)](#phase-1-quick-wins-30-min-each-high-impact)
3. [Phase 2: Medium Effort (~2-4 hours each)](#phase-2-medium-effort-2-4-hours-each)
4. [Phase 3: Larger Refactors (~4-8 hours)](#phase-3-larger-refactors-4-8-hours)
5. [Database Index Fixes](#database-index-fixes)
6. [Expected Impact Summary](#expected-impact-summary)
7. [Critical Files to Modify](#critical-files-to-modify)
8. [Verification Checklist](#verification-checklist)

---

## Context & Findings

Server actions across bundles, settings, and analytics features have significant **sequential operation bottlenecks**. Most bundle mutations (create, update, delete, duplicate, status toggle) chain 5-8 sequential Shopify GraphQL API calls and DB queries where many could run in parallel.

Each Shopify API call adds **~200-400ms** latency. A typical `createBundleAction` currently takes **~2.5-4s**; this plan targets **~1.0-1.5s**.

**Key constraint**: Shopify GraphQL Admin API rate limit is 50 points/second with 1000-point bucket. Each mutation costs ~10 points. Parallelizing must stay within these limits.

### Key Bottlenecks Identified

| Action | Sequential Calls | Parallelizable | Wasted Time |
|--------|-----------------|----------------|-------------|
| `createBundleAction` | 6 sequential (ensure metafield → ensure discount → create → sync settings → add product metafields → add standalone metafield) | 4 of 6 | ~800-1200ms |
| `updateBundleAction` | 7 sequential (fetch old → ensure metafield → ensure discount → update → sync settings → sync products → add standalone) | 5 of 7 | ~1000-1500ms |
| `deleteBundlesAction` (N) | 3N sequential loops (fetch each → remove metafields each → delete product each) | All 3 loops | ~200ms × 3N |
| `bulkToggleStatus` (N) | N sequential `ProductUpdate` mutations + sync | All N mutations | ~300ms × N |
| `saveSettingsAction` | 3 sequential (save DB → sync metafields → update discount stacking) | 2 of 3 | ~400-600ms |

### Database Gaps Found

| Issue | Location | Impact |
|-------|----------|--------|
| Missing `@@index([bundleId])` on `BundleAnalytics` | schema.prisma | Slow `groupBy(["bundleId"])` at scale |
| Missing `@@index([bundleId, date])` on `BundleView` | schema.prisma | Slow deduplication queries |
| Useless `@@index([layout])` and `@@index([theme])` on `BundleSettings` | schema.prisma:186-187 | 4-value enums, PostgreSQL ignores these |
| Unbounded `findActiveBundlesByShop()` | bundle.queries.ts:321 | Loads ALL active bundles into memory |
| Unbounded `findBundlesByProductId()` | bundle.queries.ts:153 | Popular products → 100+ bundles loaded |
| Missing `@@index([testId])` on `TestResult` | schema.prisma | Slow test result lookups |

---

## Phase 1: Quick Wins (~30 min each, high impact)

### 1.1 Parallelize `ensureMetafieldDefinition` + `ensureBundleDiscount`

**Files**: `web/features/bundles/actions/bundle-mutations.action.ts`
**Lines**: 502-528 (create), 658-685 (update)

Both are independent idempotent checks — one creates metafield definitions, the other creates/verifies the discount node. Zero shared state.

```typescript
// Before (lines 502-528):
const metafieldSetupResult = await ensureMetafieldDefinition(sessionToken);
// ... error check ...
const discountSetupResult = await ensureBundleDiscount(sessionToken);
// ... error check ...

// After:
const [metafieldSetupResult, discountSetupResult] = await Promise.all([
    ensureMetafieldDefinition(sessionToken),
    ensureBundleDiscount(sessionToken),
]);
// ... error checks for both ...
```

Same pattern at lines 658-685 for `updateBundleAction`.

**Saves**: ~200-400ms per create/update (eliminates one sequential API round-trip)

---

### 1.2 Parallelize post-create metafield syncs

**File**: `web/features/bundles/actions/bundle-mutations.action.ts`
**Lines**: 547-577

Three sequential operations after bundle creation write to different metafield owners (shop vs products). Merge the two `addBundleIdToProducts` calls into one.

```typescript
// Before (lines 547-577):
await syncAllSettingsToMetafields(sessionToken, shop);           // shop metafields
const metafieldResult = await addBundleIdToProducts(...productIds); // product metafields
if (result.bundle?.mainProductId) {
    await addBundleIdToProducts(...[mainProductId]);              // product metafield
}

// After:
const allProductIds = [...productIds];
if (result.bundle?.mainProductId) allProductIds.push(result.bundle.mainProductId);

await Promise.all([
    syncAllSettingsToMetafields(sessionToken, shop),
    allProductIds.length > 0
        ? addBundleIdToProducts(sessionToken, result.bundle.id, allProductIds)
        : Promise.resolve({ success: true }),
]);
```

**Saves**: ~300-600ms per create

---

### 1.3 Parallelize post-update metafield syncs

**File**: `web/features/bundles/actions/bundle-mutations.action.ts`
**Lines**: 712-737

Same pattern — `syncAllSettingsToMetafields` (shop-level) and `syncBundleProductMetafields` + `addBundleIdToProducts` (product-level) are independent.

```typescript
// Before (lines 712-737):
await syncAllSettingsToMetafields(sessionToken, shop);
const metafieldResult = await syncBundleProductMetafields(...);
if (result.bundle?.mainProductId) {
    await addBundleIdToProducts(...);
}

// After:
const mainProductId = result.bundle?.mainProductId;
const adjustedNewIds = mainProductId ? [...newProductIds, mainProductId] : newProductIds;

await Promise.all([
    syncAllSettingsToMetafields(sessionToken, shop),
    syncBundleProductMetafields(sessionToken, bundleId, oldProductIds, adjustedNewIds),
]);
```

**Saves**: ~300-600ms per update

---

### 1.4 Parallelize settings save operations

**File**: `web/features/settings/actions/settings.action.ts`
**Lines**: 67-96

`syncAllSettingsToMetafields` and `updateDiscountCombinesWith` write to different resources (metafields vs discount node).

```typescript
// Before (lines 67-96):
const syncResult = await syncAllSettingsToMetafields(sessionToken, shop, savedSettings);
// ... warning check ...
if (data.allowDiscountStacking !== undefined) {
    const stackingResult = await updateDiscountCombinesWith(...);
}

// After:
const ops: Promise<any>[] = [
    syncAllSettingsToMetafields(sessionToken, shop, savedSettings),
];
if (data.allowDiscountStacking !== undefined && data.allowDiscountStacking !== null) {
    ops.push(updateDiscountCombinesWith(sessionToken, Boolean(data.allowDiscountStacking)));
}
const [syncResult, stackingResult] = await Promise.all(ops);
```

**Saves**: ~200-400ms per settings save

---

### 1.5 Parallelize bulk status toggle GraphQL mutations

**File**: `web/features/bundles/actions/bundle-mutations.action.ts`
**Lines**: 144-158

Sequential for-loop executes one `ProductUpdate` mutation per product. Parallelize with rate-limit-safe batching (4 concurrent, ~40 points/s, well within 50/s limit).

```typescript
// Before (lines 144-158):
for (const productId of result.mainProductIds ?? []) {
    const updateResult = await executeGraphQLMutation<ProductUpdateMutation>({...});
    // ... error handling ...
}

// After: batch in groups of 4 for rate limit safety
const ids = result.mainProductIds ?? [];
for (let i = 0; i < ids.length; i += 4) {
    const batch = ids.slice(i, i + 4);
    await Promise.all(batch.map(async (productId) => {
        const updateResult = await executeGraphQLMutation<ProductUpdateMutation>({
            query: ProductUpdateDocument,
            variables: { id: productId, status: productStatus },
            sessionToken,
        });
        if (isProductNotFoundError(updateResult)) {
            console.warn(`[bulkToggleStatus] Product ${productId} not found`);
            await clearMainProductByGid(shop, productId);
        }
    }));
}
```

**Saves**: For N products — from `N × ~300ms` to `ceil(N/4) × ~300ms`

---

## Phase 2: Medium Effort (~2-4 hours each)

### 2.1 Batch `deleteBundlesAction` — eliminate N+1 queries

**Files**:
- `web/features/bundles/actions/bundle-mutations.action.ts` (lines 288-342)
- `web/features/bundles/repositories/bundle.queries.ts` (new function)

**Problem**: Three sequential for-loops:
1. Lines 290-301: `findBundleByIdWithAllRelations()` per bundle (**N DB queries**)
2. Lines 311-326: `removeBundleIdFromProducts()` per bundle (**N × 2 API calls**)
3. Lines 329-342: `executeGraphQLMutation(ProductDelete)` per product (**N API calls**)

**Solution**:

**Step A** — Add batch query to `bundle.queries.ts`:
```typescript
export async function findBundlesByIdsWithAllRelations(ids: string[], shop: string) {
    return prisma.bundle.findMany({
        where: { id: { in: ids }, shop },
        include: INCLUDE_BUNDLE_FULL,
    });
}
```

**Step B** — Replace loop #1 with single batch call.

**Step C** — Collect all product IDs across bundles, call `removeBundleIdFromProducts` once per bundle but parallelize across bundles (they're already batched internally at 25/mutation via Shopify's `metafieldsSet`).

**Step D** — Parallelize product deletions (batched by 4 for rate limits).

**Saves**: For 5 bundles — from ~2.5s sequential to ~600ms parallel

---

### 2.2 Cache `getBundleStats` (missing from cache layer)

**Files**:
- `web/features/analytics/services/analytics.cached.ts` (add wrapper)
- `web/features/analytics/actions/analytics.action.ts` (line ~74)

All other analytics actions use cached wrappers (`getCachedAnalyticsMetrics`, `getCachedChartData`, `getCachedTopBundles`) except `getBundleStatsAction` which calls `getBundleStats()` directly.

**Action**: Add `getCachedBundleStats` wrapper following the exact same `"use cache"` + `cacheLife("dashboard")` + `cacheTag()` pattern used by siblings in `analytics.cached.ts`.

**Saves**: Eliminates redundant DB queries on concurrent/repeated dashboard loads (5 min cache)

---

### 2.3 Add `take()` limits to unbounded queries

**File**: `web/features/bundles/repositories/bundle.queries.ts`

Two queries load ALL matching results without limits:

1. **`findActiveBundlesByShop()`** (line ~321) — Called by `syncAllSettingsToMetafields()` on every bundle mutation. If a shop has 500+ active bundles, this loads all of them with products + settings.
   - **Fix**: Add `take: 200` with `orderBy: { priority: "desc" }`, log warning when limit hit.

2. **`findBundlesByProductId()`** (line ~153) — Called by app proxy for storefront. Popular products could match 100+ bundles.
   - **Fix**: Add `take: 50`.

---

### 2.4 Parallelize add/remove in `syncBundleProductMetafields`

**File**: `web/lib/graphql/operations/metafield.operations.ts`
**Lines**: ~298-339

When a bundle update changes products, the "add new" and "remove old" metafield operations run sequentially. They operate on mutually exclusive product ID sets.

```typescript
// After:
const ops: Promise<MetafieldResult>[] = [];
if (addedProducts.length > 0) ops.push(addBundleIdToProducts(...));
if (removedProducts.length > 0) ops.push(removeBundleIdFromProducts(...));
if (ops.length > 0) {
    const results = await Promise.all(ops);
    const failed = results.find(r => !r.success);
    if (failed) return failed;
}
```

**Saves**: ~300-600ms when both add and remove are needed during update

---

## Phase 3: Larger Refactors (~4-8 hours)

### 3.1 Module-level ID cache for `shopId` and `discountId`

**Files**:
- `web/lib/graphql/operations/metafield.operations.ts`
- New: `web/lib/graphql/operations/metafield-cache.ts`

`syncAllSettingsToMetafields` is called on every bundle mutation. Each call internally queries `getShopId()` and `getBundleDiscountId()` — 2 GraphQL queries (~400ms) that return stable values (only change on app reinstall).

**Solution**: Simple in-memory Map with 5-minute TTL. Invalidate on error.

```typescript
// metafield-cache.ts
const ID_CACHE = new Map<string, { value: string; expiresAt: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedId(key: string): string | null {
    const entry = ID_CACHE.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.value;
}

export function setCachedId(key: string, value: string): void {
    ID_CACHE.set(key, { value, expiresAt: Date.now() + TTL });
}

export function clearCachedId(key: string): void {
    ID_CACHE.delete(key);
}
```

Wrap `getBundleDiscountId` and `getShopId` to check cache first.

**Saves**: ~400ms on every metafield sync after first call (significant — called 6+ times across different actions)

---

### 3.2 DB flag fast-path for `ensureBundleDiscount`

**Files**:
- `web/prisma/schema.prisma` — Add `discountSetupDone Boolean @default(false)` to Shop model
- `web/lib/shopify/setup/ensure-setup.ts`
- `web/shared/repositories/shop.queries.ts` — Add `isDiscountSetupDone` / `markDiscountSetupDone`

Same pattern already used by `ensureMetafieldDefinition` (checks `metafieldSetupDone` DB flag). Currently `ensureBundleDiscount` queries Shopify API every time (~200-300ms). With DB flag, subsequent calls are ~5ms.

**Saves**: ~200-300ms per create/update after first setup

---

### 3.3 React `cache()` for request-level deduplication

**File**: `web/lib/shopify/setup/ensure-setup.ts`

Wrap `ensureMetafieldDefinition` and `ensureBundleDiscount` with React's `cache()` function for request-level memoization. If any composed action calls these multiple times within the same server request, only the first actually executes.

```typescript
import { cache } from "react";

export const ensureMetafieldDefinition = cache(
    async (sessionToken: string) => { ... }
);

export const ensureBundleDiscount = cache(
    async (sessionToken: string) => { ... }
);
```

**Saves**: ~200-400ms when redundant calls happen within same request

---

## Database Index Fixes

Apply these alongside the phases:

### Add Missing Indexes

```prisma
// BundleAnalytics — currently missing, needed for groupBy(["bundleId"])
@@index([bundleId])

// BundleView — currently missing, needed for deduplication queries
@@index([bundleId, date])

// TestResult — currently missing, only has unique constraint
@@index([testId])
```

### Remove Useless Indexes

```prisma
// BundleSettings lines 186-187 — enums with 4 values, PostgreSQL ignores these
// DELETE: @@index([layout])
// DELETE: @@index([theme])
```

### Add Schema Field

```prisma
// Shop model — fast-path for ensureBundleDiscount (Phase 3.2)
discountSetupDone Boolean @default(false)
```

**Run**: `cd web && bun run prisma:push` after all schema changes

---

## Expected Impact Summary

| Action | Current | After Phase 1 | After All Phases |
|--------|---------|---------------|------------------|
| `createBundleAction` | ~2.5-4.0s | ~1.5-2.5s | ~1.0-1.5s |
| `updateBundleAction` | ~2.5-4.0s | ~1.5-2.5s | ~1.0-1.5s |
| `deleteBundlesAction` (5 bundles) | ~4-6s | ~3-4s | ~1.5-2s |
| `bulkToggleStatus` (5 bundles) | ~2-3s | ~1-1.5s | ~0.8-1.2s |
| `saveSettingsAction` | ~1.5-2s | ~0.8-1.2s | ~0.8-1.2s |
| Dashboard load | ~0.5-1s | ~0.3-0.5s (cached) | ~0.3-0.5s |

**Overall improvement**: **40-60% faster** across all server actions.

---

## Critical Files to Modify

| # | File | Changes |
|---|------|---------|
| 1 | `web/features/bundles/actions/bundle-mutations.action.ts` | Promise.all in create/update/delete/bulk-toggle |
| 2 | `web/features/settings/actions/settings.action.ts` | Promise.all for sync + stacking |
| 3 | `web/lib/graphql/operations/metafield.operations.ts` | Parallel add/remove, ID caching |
| 4 | `web/features/bundles/repositories/bundle.queries.ts` | New batch query, take() limits |
| 5 | `web/features/analytics/services/analytics.cached.ts` | Add getCachedBundleStats |
| 6 | `web/features/analytics/actions/analytics.action.ts` | Use cached bundle stats |
| 7 | `web/prisma/schema.prisma` | Remove weak indexes, add missing indexes, add discountSetupDone |
| 8 | `web/lib/shopify/setup/ensure-setup.ts` | React cache(), DB flag fast-path |
| 9 | NEW: `web/lib/graphql/operations/metafield-cache.ts` | Simple TTL cache for shopId/discountId |

---

## Verification Checklist

1. **Unit testing**: Run `bun run test` after each phase
2. **Manual testing**: Create/update/delete bundles, verify metafields sync correctly on storefront
3. **Timing**: Add `console.time`/`console.timeEnd` wrappers around each action to measure before/after
4. **Rate limits**: Monitor Shopify GraphQL cost in response `extensions.cost` during bulk operations
5. **Cache validation**: Verify `getBundleStats` returns fresh data within 5-min window after bundle changes
6. **Edge cases**: Test bulk delete with 10+ bundles, bulk status toggle with 5+ bundles
7. **Regression**: Ensure metafield values on storefront products are correct after parallel sync

---

## References

- [Shopify GraphQL Rate Limits](https://shopify.dev/docs/api/usage/rate-limits#graphql-admin-api-rate-limits) — 50 points/s, 1000 bucket
- [Shopify `metafieldsSet` Mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafieldsSet) — Max 25 metafields per call
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching) — Data Cache, React `cache()`, `revalidateTag`
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance) — `findMany` with `in`, batching, indexes
- [Neon Serverless Pooling](https://neon.tech/docs/connect/connection-pooling) — Default 25 connections
