# Performance Audit Report — 2026-04-12

**Audited by:** 5 specialist agents (Backend, Frontend, GraphQL, Storefront, Infra)
**Validated by:** 3 verification agents against official docs (Shopify Dev MCP, context7, Next.js)
**Total findings:** 80 unique | **Validated:** 20 key recommendations

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [GraphQL & Shopify API](#graphql--shopify-api)
3. [Frontend (React/Zustand/RHF)](#frontend)
4. [Storefront Widget](#storefront-widget)
5. [Backend (Prisma/Services/Actions)](#backend)
6. [Infrastructure & Caching](#infrastructure--caching)
7. [Cross-Cutting Themes](#cross-cutting-themes)
8. [Implementation Priority](#implementation-priority)
9. [Rejected Recommendations](#rejected-recommendations)

---

## Executive Summary

The app works correctly but leaves significant performance on the table across all layers. The highest-impact issues fall into 5 patterns:

1. **GraphQL over-fetching** — queries request 5000+ nodes when <100 are needed
2. **Re-render cascades** — Zustand + RHF patterns trigger full-tree re-renders on every keystroke
3. **Storefront asset bloat** — 91KB JS + 79KB CSS loaded for all layout types
4. **Cache bypasses** — product cache exists but is silently skipped on every mutation
5. **Redundant DB queries** — same Shop row fetched 2-3x per request in multiple flows

---

## GraphQL & Shopify API

### GQL-1: Remove duplicate `collections(first:100)` from `GetProducts`

**Files:** `web/lib/graphql/schema/queries/products.graphql:18-26`

**Problem:** `GetProducts` spreads `...ProductFields` (which has `collections(first:10)`) AND adds an inline `allCollections: collections(first:100)`. At 50 products/page: 50 × 110 = 5,500 collection node slots. Pushes toward the 1,000-point query cost ceiling.

**Pros:**
- Reduces Shopify API cost by 60-80% on list pages
- Eliminates risk of 429 throttling on stores with many products
- Zero behavioral change if inline `allCollections` is unused by callers

**Cons:**
- Must audit callers to confirm `allCollections` alias is not consumed anywhere
- If any feature uses all 100 collections per product, a separate lazy query is needed

**Validation:** CONFIRMED — Shopify cost model charges per `first` value on nested connections.

---

### GQL-2: Split `ProductFields` fragment — use `ProductCardFields` for lists

**Files:** `web/lib/graphql/schema/fragments/product.graphql:1-32` (heavy), `product.graphql:34-55` (lean)

**Problem:** `ProductFields` includes `variants(first:100)` with `inventoryItem`, `sku`, `barcode` — all unused by list views. At 50 products: 5,000 variant slots fetched and discarded. `ProductCardFields` already exists with `priceRangeV2` (scalar, zero cost) and no variants.

**Pros:**
- Massive cost reduction — eliminates 5,000 variant node slots per list query
- `ProductCardFields` already written and available in the codebase
- `priceRangeV2` is pre-aggregated by Shopify — more accurate for price display

**Cons:**
- Behavioral change: any list-view code consuming `variants` from `GetProducts` will break
- Must audit all consumers of `GetProducts` result before switching
- Edit/detail views still need full `ProductFields`

**Validation:** CONFIRMED — connection cost is sized by `first` argument per Shopify docs.

---

### GQL-3: Replace `products(first:100)` in `GetCollectionsForFilters` with `productTypes` API

**Files:** `web/lib/graphql/schema/queries/collections.graphql:13-19`

**Problem:** Fetches 100 full product nodes just to extract distinct `productType` strings for the filter panel. Shopify has a dedicated `productTypes(first:250)` query that returns `[String!]!` directly.

**Pros:**
- Eliminates 100 product nodes (high cost) — replaced by scalar strings (zero cost)
- `productTypes` returns all types in the store, not just first 100 products' types
- Simpler code — no need to deduplicate types client-side

**Cons:**
- `productTypes` has no `status` filter — if filtering by active products is needed, requires client-side filtering or a separate query
- Small API surface change — filter component needs to consume string array instead of product nodes

**Validation:** CONFIRMED — `productTypes` query verified in Shopify Admin API via shopify-dev-mcp.

---

### GQL-4: Pass `{shop, accessToken}` to `syncActiveBundlesToMetafield` to enable product cache

**Files:** `web/features/bundles/actions/bundle-mutations.action.ts:118,182,223,516,641`, `web/lib/graphql/operations/metafield.operations.ts:613-640`

**Problem:** All 6 callsites pass a raw `sessionToken` string. Inside `fetchProductsFromShopify`, the `unstable_cache` wrapper only activates when auth is `{shop, accessToken}` (object form). String tokens bypass caching — every bundle mutation does an uncached full-catalog Shopify product fetch.

**Pros:**
- Enables the existing 1-hour product cache for the most frequent mutation path
- Zero new code needed — just pass the already-available `session.accessToken` and `shop`
- Eliminates 1 uncached API call per bundle save

**Cons:**
- Must verify `syncActiveBundlesToMetafield` signature accepts `{shop, accessToken}` (may need refactor)
- If the `buildPriceMapForBundles` internal call also uses raw token, that path needs updating too

**Validation:** CONFIRMED — the cache bypass is real; actions already have `session.accessToken` available from `handleSessionToken`.

---

### GQL-5: Minimize `ProductUpdate` mutation response

**Files:** `web/lib/graphql/schema/mutations/products.graphql:38-83`

**Problem:** Returns `media(first:20)` and `descriptionHtml` in the response. Callers only check `isProductNotFoundError()` and `result.errors` — they never read the returned product data. 20 media nodes × cost per mutation = wasted budget.

**Pros:**
- Reduces mutation cost — media nodes in response are charged same as queries
- No behavioral change — callers already ignore the response data

**Cons:**
- If a future caller needs the response, the fields must be re-added or a separate query issued
- Minor: codegen types will change, requiring a `graphql-codegen` run

**Validation:** CONFIRMED — Shopify charges mutation responses identically to query responses.

---

### GQL-6: Use `priceRangeV2` instead of `variants(first:50)` in proxy route

**Files:** `web/app/api/proxy/products/route.ts:97-134`, `web/lib/graphql/schema/queries/products.graphql:84-92`

**Problem:** The `ids` path in the proxy fetches `variants(first:50)` but only uses the first variant for price. `priceRangeV2` is a pre-aggregated scalar (zero connection cost).

**Pros:**
- Eliminates 50-variant connection per product in the storefront-critical path
- `priceRangeV2` is always accurate (Shopify-computed) vs first-variant price (may not reflect default)

**Cons:**
- Only applies to the `ids` path — the `productId` path legitimately needs multiple variants for the selector UI
- May need a separate query definition for the `ids` path vs the `productId` path

**Validation:** PARTIALLY VALID — better to use `priceRangeV2` for display; keep variants for selector.

---

### GQL-7: Consolidate duplicate discount-check queries

**Files:** `web/lib/graphql/schema/queries/discounts.graphql`, `web/lib/graphql/schema/queries/metafields.graphql`

**Problem:** `CheckBundleDiscountExists` and `GetBundleDiscountId` both search `discountNodes(first:1)` with the same query pattern. Both run on bundle create/update — two discount lookups per mutation.

**Pros:**
- Eliminates 1 redundant Shopify API call per bundle mutation
- Simplifies codebase — one query instead of two

**Cons:**
- Minor refactor: `ensureBundleDiscount` and `getBundleDiscountId` must share a document
- The `CheckBundleDiscountExists` response includes `title` and `status` — verify these are truly unused

**Validation:** CONFIRMED.

---

## Frontend

### FE-1: Add Zustand selectors to all `useBundleStore()` calls

**Files:** ~20 locations across `web/features/bundles/components/` and `web/features/bundles/hooks/`

**Problem:** Calling `useBundleStore()` without a selector subscribes to the entire 700-line store. Any mutation anywhere triggers re-renders in all 20+ consuming components.

**Pros:**
- Eliminates the single largest source of unnecessary re-renders in the app
- Simple mechanical change — `useBundleStore()` → `useBundleStore((s) => s.field)`
- For multiple fields: use `useShallow` from `zustand/react/shallow`

**Cons:**
- Must identify exactly which fields each component uses
- Components destructuring many fields need `useShallow` wrapper — slightly more verbose
- Risk of missing a field in the selector, causing stale reads

**Validation:** CONFIRMED — official Zustand docs explicitly warn against no-selector usage.

---

### FE-2: Replace `watch(fieldName)` with `useWatch` + switch to `mode: "onTouched"`

**Files:** `web/features/bundles/hooks/form/use-bundle-field.ts:16`, `web/features/bundles/components/bundle-creation/form/bundle-form-provider.tsx:98,231`

**Problem:** `watch(fieldName)` subscribes to the entire form — every keystroke in any field re-renders all field components. Combined with `mode: "onChange"`, every keystroke also runs full Zod schema validation.

**Pros:**
- `useWatch` isolates re-renders to the specific field (when extracted to child component)
- `mode: "onTouched"` = validate on first blur, then on change for that field only — best UX/perf balance
- Full Zod validation stops running on every keystroke

**Cons:**
- `useWatch` isolation only works when extracted into a child component — in-place replacement gives no benefit
- Requires component restructuring (new wrapper components per field)
- `mode: "onTouched"` means no instant validation feedback until the user leaves a field once
- The `watch()` subscription in `BundleFormProvider:231` that syncs to Zustand needs a different approach (specific `useWatch` fields or deep-equality guard)

**Validation:** CONFIRMED with nuance — `useWatch` isolation requires child component extraction per official RHF docs.

---

### FE-3: Memoize `getGroupedItems()` in consuming components

**Files:** `web/features/bundles/components/bundle-creation/steps/products/product-list.tsx:88`, `web/features/bundles/components/bundle-creation/steps/review/bundle-summary.tsx:24`

**Problem:** `getGroupedItems()` builds a `Record` from `selectedItems` on every render — called 3+ times per wizard step render.

**Pros:**
- Simple `useMemo` wrapper eliminates redundant computation
- No API or structural changes needed

**Cons:**
- Must track correct dependency (`selectedItems` from store) to avoid stale memoization
- Alternative: expose as a derived selector in the store itself (more work but cleaner)

**Validation:** CONFIRMED.

---

### FE-4: Deduplicate metrics query keys on bundle listing page

**Files:** `web/features/bundles/hooks/data/use-bundles-data.ts:82-106`, `web/features/bundles/hooks/data/use-bundles-page.ts:22`

**Problem:** Two hooks on the same page use different query keys (`bundlesQueryKeys.metrics()` vs `analyticsQueryKeys.metrics(30)`) but call the same server action. React Query treats them as distinct — fetches twice.

**Pros:**
- Eliminates 1 redundant server action call per bundle listing page load
- React Query's dedup is automatic once keys align

**Cons:**
- Must decide which hook "owns" the metrics query — the other must consume it
- Query key change may affect cache invalidation patterns elsewhere

**Validation:** CONFIRMED — React Query deduplicates by key hash; different keys = different fetches.

---

### FE-5: Fix `getEffectiveData()` anti-pattern in Zustand selector

**Files:** `web/features/bundles/components/bundle-listing-page/bundle-listing-page.tsx:36`, `web/features/analytics/components/analytics-page/analytics-page.tsx:21`

**Problem:** `useSettingsStore((state) => { const settings = state.getEffectiveData(); ... })` — the getter accesses the whole state inside the selector, defeating Zustand's equality check. Re-runs on every store change.

**Pros:**
- Select raw data directly: `useSettingsStore((s) => s.localData ?? s.serverData)`
- Eliminates unnecessary selector re-evaluations

**Cons:**
- `getEffectiveData()` has fallback logic (`getDefaultValuesFromConfig()`) that must be preserved
- May need a memoized derived value in the store instead

**Validation:** CONFIRMED.

---

### FE-6: Add `placeholderData` to bundle detail query

**Files:** `web/features/bundles/api/bundles.queries.ts:46`

**Problem:** No `placeholderData` — edit page shows full loading skeleton when navigating back if cache was GC'd. The list query already uses `placeholderData: (prev) => prev`.

**Pros:**
- Instant perceived navigation on back/forward
- One-line change: `placeholderData: keepPreviousData`

**Cons:**
- User briefly sees stale data while fresh data loads — acceptable for edit pages
- Import `keepPreviousData` from `@tanstack/react-query`

**Validation:** CONFIRMED — `keepPreviousData` is the canonical v5 pattern.

---

## Storefront Widget

### SW-1: Eliminate N+1 per-product storefront price fetch

**Files:** `web/widgets/src/bundle-widget.ts:773-817`

**Problem:** For each product in the bundle, a separate `/products/{handle}.js` Ajax call fires in parallel. 5-product bundle = 5 network requests, all blocking widget render (`await Promise.all`).

**Pros:**
- Eliminates 3-5 network requests before widget renders
- Admin API prices are already available from the App Proxy response
- Estimated LCP improvement: 300-800ms on product pages

**Cons:**
- Storefront prices may differ from Admin API prices in multi-currency/market setups (tax-inclusive display)
- Need to verify the App Proxy response includes all necessary price data (compare-at, currency)
- May need a feature flag for markets where storefront prices differ

**Validation:** CONFIRMED.

---

### SW-2: Code-split widget JS by layout renderer

**Files:** `web/widgets/src/bundle-widget.ts`, `web/widgets/vite.config.ts`

**Problem:** 91KB monolithic JS contains all renderers (fixed, BOGO, BXGY, volume, slider, checklist). A merchant using `list` layout downloads and parses BOGO/volume code. On mid-tier Android: 200-500ms parse time.

**Pros:**
- Reduces per-page JS to ~30KB per layout (estimated)
- Layout is known from `data-bundle-layout` class — can trigger dynamic import immediately
- Vite supports dynamic `import()` for code splitting natively

**Cons:**
- Adds a second network request (chunk fetch) after initial script load
- Must handle the loading state between base script and layout chunk
- Increases build complexity (multiple chunks vs single file)
- Shopify theme assets have limited dynamic import support — may need to self-host chunks

**Validation:** CONFIRMED.

---

### SW-3: Non-render-blocking CSS or per-layout CSS split

**Files:** `extension/extensions/product-bundle-widget/assets/bundle-widget.css` (79KB), `extension/extensions/product-bundle-widget/blocks/app-block.liquid:52`

**Problem:** All layout CSS (12+ layouts) compiled into one 79KB render-blocking stylesheet. Loaded via synchronous `stylesheet_tag`.

**Pros:**
- Non-blocking load (`media="print" onload="this.media='all'"`) improves FCP
- Per-layout CSS split reduces download to ~15-20KB per layout

**Cons:**
- Non-blocking CSS causes FOUC (flash of unstyled content) — widget may briefly appear unstyled
- Per-layout CSS requires knowing the layout before CSS loads (chicken-and-egg with Liquid)
- Shopify theme extensions have limited control over asset loading strategy

**Validation:** CONFIRMED.

---

### SW-4: Debounce slider resize handler + use `requestAnimationFrame`

**Files:** `web/widgets/src/lib/slider.ts:63-65`, `web/widgets/src/bundle-widget.ts:1159`

**Problem:** `window.resize` fires `handleResize()` with no debounce — reads `getComputedStyle`, rewrites `dotsContainer.innerHTML`, creates new event listeners on every resize tick. `setTimeout(0)` for slider init causes layout thrash.

**Pros:**
- Debounce at 150ms eliminates layout thrashing on resize
- `requestAnimationFrame` batches the slider init correctly
- Fixes mobile keyboard show/hide triggering multiple resize handlers

**Cons:**
- 150ms debounce means a brief delay before slider adjusts on resize — usually imperceptible
- `ResizeObserver` (better alternative) has no IE11 support — likely fine for modern stores

**Validation:** CONFIRMED.

---

### SW-5: Pause cart polling when tab is backgrounded

**Files:** `web/widgets/src/radius-bundles.ts:721-737`

**Problem:** `setInterval` polls `/cart.js` every 10 seconds continuously, even when tab is inactive.

**Pros:**
- Eliminates unnecessary network requests when user isn't looking
- Simple: pause on `document.visibilityState === 'hidden'`, resume on `visibilitychange`

**Cons:**
- Cart state may be stale when user returns to tab — first poll after resume shows old data briefly
- Minor: need to handle the resume case (immediate fetch on visibility change)

**Validation:** CONFIRMED.

---

## Backend

### BE-1: Delete dead `performSecurityChecks` / `checkBundleSecurity` path

**Files:** `web/features/bundles/services/bundle-security.service.ts:16-38`, `web/features/bundles/services/bundle-operation.service.ts:128-148`

**Problem:** `performSecurityChecks` runs 3 sequential DB calls. Superseded by `fetchBundlePreflight` (parallel). But `checkBundleSecurity` still calls the old sequential path.

**Pros:**
- Removes dead code + eliminates risk of accidentally calling the slow path
- If `checkBundleSecurity` is reachable, saves 2 sequential DB round-trips

**Cons:**
- Must verify `checkBundleSecurity` is truly dead (no callers besides `bundle-operation.service`)
- If it's a fallback path, removing it removes the fallback

**Validation:** CONFIRMED.

---

### BE-2: Replace dynamic `import()` with static imports in security service

**Files:** `web/features/bundles/services/bundle-security.service.ts:262-295`

**Problem:** `validateShopPermissions` uses `await import("@/shared/services/plan.service")` twice in the hot write path — triggered on every bundle create/update.

**Pros:**
- Static imports resolve at build time — zero runtime cost
- Enables better tree-shaking

**Cons:**
- The dynamic import may have been intentional to avoid circular dependencies — must verify
- If `plan.service` has heavy side effects on import, static import moves that cost to module load

**Validation:** CONFIRMED.

---

### BE-3: Merge redundant Shop queries in settings service

**Files:** `web/features/settings/services/settings.service.ts:29-43` (get), `settings.service.ts:49-143` (save)

**Problem:** `getSettingsService` fetches the Shop row twice (once for appSettings, once for primaryLocale). `saveSettingsService` fetches it 3 times.

**Pros:**
- Eliminates 1-2 DB round-trips per settings read/save
- Simple: add `primaryLocale` to the existing `findSettingsByShopDomain` select

**Cons:**
- Must update the `findSettingsByShopDomain` return type
- Callers that don't need `primaryLocale` will receive it anyway (minor over-fetch from DB)

**Validation:** CONFIRMED.

---

### BE-4: Fix double `getShopSetupStatus` in webhook service

**Files:** `web/features/webhooks/services/webhook.service.ts:22-35`

**Problem:** `checkInitializationNeeded` calls `isSetupComplete` and `areWebhooksRegistered` in `Promise.all` — but after our fix, each now calls `getShopSetupStatus` independently, resulting in 2 identical queries.

**Pros:**
- Call `getShopSetupStatus` once, destructure both fields
- Saves 1 DB round-trip per webhook service check

**Cons:**
- None — pure optimization

**Validation:** CONFIRMED.

---

### BE-5: Use `updateMany` for bulk soft-delete instead of N individual updates

**Files:** `web/features/bundles/repositories/bundle.mutations.ts:747-782`

**Problem:** Bulk delete runs `Promise.all(bundles.map(b => tx.bundle.update(...)))` — N separate UPDATE statements.

**Pros:**
- Single `updateMany` for shared fields (status, deletedAt, isPublished)
- Reduces transaction duration and DB round-trips

**Cons:**
- The per-bundle name rename (`[deleted-timestamp]` suffix) cannot be done in `updateMany`
- If name rename is required, must keep individual updates for that field only
- Alternative: drop the rename (the `DELETED` status filter handles visibility)

**Validation:** CONFIRMED.

---

### BE-6: Missing `status != DELETED` filter in analytics queries

**Files:** `web/features/analytics/repositories/bundle-analytics.repository.ts:298`

**Problem:** `bundleWhereClause` is `{ shop }` only — includes deleted bundles in analytics tables. Over time this inflates counts and slows queries.

**Pros:**
- Correct data: deleted bundles excluded from performance metrics
- Improves query performance as deleted bundles accumulate

**Cons:**
- Historical analytics for deleted bundles become inaccessible (may want an "include deleted" toggle)
- Must also update raw SQL queries in `analytics.queries.ts:200,264`

**Validation:** CONFIRMED.

---

### BE-7: Use `findBundleStatusById` instead of full JOIN for status checks

**Files:** `web/features/bundles/services/bundle-write.service.ts:163-165`

**Problem:** `findBundleByIdWithAllRelations` (full JOIN across 3 tables) called just to check `status === 'DELETED'`. `findBundleStatusById` already exists, returns only `{id, status, type}`.

**Pros:**
- Eliminates 3-table JOIN for a single field check
- `findBundleStatusById` is already written and tested

**Cons:**
- None — pure optimization

**Validation:** CONFIRMED.

---

### BE-8: Parallelize independent deletes in uninstall handler

**Files:** `web/features/webhooks/repositories/webhook.repository.ts:242-315`

**Problem:** `deleteShopData` runs ~12 delete operations sequentially. Many are independent (appSettings, aBTest, aIInsight, notification, alertRule all depend only on shopId).

**Pros:**
- Groups independent deletes into `Promise.all` batches
- Reduces uninstall handler duration significantly

**Cons:**
- Must respect FK ordering — dependent deletes (e.g., AutomationLog before Automation) must stay sequential
- Transaction isolation may limit actual parallelism benefit in practice

**Validation:** CONFIRMED.

---

### BE-9: Targeted query in `deleteBundleAction` — only fetch product IDs

**Files:** `web/features/bundles/actions/bundle-mutations.action.ts:217-221`

**Problem:** `findBundleByIdWithAllRelations` (full JOIN) called before delete just to collect `mainProductId` and `bundleProducts[].productId`.

**Pros:**
- Replace with `select: { mainProductId: true, bundleProducts: { select: { productId: true } } }`
- Eliminates settings, groups, and all other relation data from the query

**Cons:**
- None — pure optimization

**Validation:** CONFIRMED.

---

### BE-10: Parallelize `getBundleActivity` count queries

**Files:** `web/features/bundles/repositories/bundle.queries.ts:366-393`

**Problem:** Two separate `COUNT` queries run sequentially.

**Pros:**
- `Promise.all([createdCount, deletedCount])` — halves the wall time

**Cons:**
- None

**Validation:** CONFIRMED.

---

## Infrastructure & Caching

### INF-1: `output: "standalone"` for EC2 deployment

**Files:** `web/next.config.js`

**Problem:** Current config produces full `node_modules` in build output. `output: "standalone"` traces only needed files.

**Pros:**
- Significantly smaller deployment footprint
- Faster startup time

**Cons:**
- `public/` and `.next/static/` NOT included — must copy manually in deploy script
- PM2 exec path changes from `next start` to `node .next/standalone/server.js`
- Deployment pipeline must be updated

**Validation:** CONFIRMED.

---

### INF-2: PM2 `listen_timeout`, `kill_timeout`, `exp_backoff_restart_delay`

**Files:** `web/ecosystem.config.cjs`

**Problem:** No `listen_timeout` (PM2 routes traffic before Next.js binds port), no `kill_timeout` (1.6s SIGKILL may interrupt in-flight requests during deploys).

**Pros:**
- `listen_timeout: 10000` — waits for port binding before routing traffic
- `kill_timeout: 5000` — graceful shutdown for in-flight Shopify API calls
- `exp_backoff_restart_delay: 100` — prevents crash loops from hammering the process

**Cons:**
- Slower deploy restarts (10s wait) — acceptable for production stability

**Validation:** CONFIRMED.

---

### INF-3: `SHOP_UPDATE` webhook handler is dead code

**Files:** `web/features/webhooks/handlers/shop-update.handler.ts:12-25`

**Problem:** Handler attempts `window.dispatchEvent()` — always false on server. Does nothing.

**Pros:**
- Either remove handler (reduces webhook volume) or implement real work (bust settings cache, sync shop data)
- Implementing a real handler enables cache invalidation for shop locale/currency changes

**Cons:**
- If removed, `SHOP_UPDATE` webhook topic should also be removed from TOML files
- If kept and implemented, adds code to maintain

**Validation:** CONFIRMED.

---

### INF-4: Proxy routes need in-process caching for shop/session data

**Files:** `web/app/api/proxy/products/route.ts:71,154`, `web/app/api/proxy/analytics/route.ts:24`

**Problem:** Every storefront widget load hits 2-3 sequential uncached DB calls for shop metadata that changes at most once per settings save.

**Pros:**
- In-process `Map` with 5-min TTL for `{accessToken, bundlePriorityType, enableAnalytics}` per shop
- Eliminates 2-3 DB round-trips on every widget page load

**Cons:**
- In-process cache diverges across PM2 workers (with `instances: 1` this is fine)
- Must invalidate on settings save and shop update — need a cache-bust mechanism
- Stale data risk: if settings change, widget may serve old config for up to 5 minutes

**Validation:** CONFIRMED — but only safe for the proxy route (not for auth tokens per rejected recommendation).

---

### INF-5: Remove `PRODUCTS_CREATE` webhook or add early-return guard

**Files:** `web/features/webhooks/handlers/products-create.handler.ts`

**Problem:** Fires `invalidateProductCache` on every new product — but new products can't be in any bundle yet. On bulk imports this causes many unnecessary cache busts.

**Pros:**
- Removing the handler reduces webhook volume
- If kept: add check `SELECT COUNT(*) FROM bundle_products WHERE productId = ?` before busting

**Cons:**
- Edge case: if automation immediately adds a new product to a bundle, the cache won't reflect it
- The DB check on every product create adds its own cost — may negate the savings

**Validation:** CONFIRMED.

---

## Cross-Cutting Themes

| Pattern | Where | Fix |
|---|---|---|
| "Fetch same row twice" | Settings service, webhook service, proxy routes, auth | Single queries or in-process caching |
| "Subscribe to everything" | Zustand stores (20+ locations), RHF `watch()` | Selectors, `useWatch`, `useShallow` |
| "Over-fetch from Shopify" | `collections(first:100)`, `variants(first:100)`, `media(first:20)` | Split fragments, minimize responses |
| "Cache bypass" | `sessionToken` string vs `{shop, accessToken}` object | Pass object form to enable `unstable_cache` |
| "Monolithic storefront assets" | 91KB JS + 79KB CSS for all layouts | Code-split by layout type |

---

## Implementation Priority

Grouped by effort-to-impact ratio. Each group can be done independently.

### Group A — Quick Wins (1-2 hours total, high impact)

| # | Fix | Effort |
|---|---|---|
| GQL-4 | Pass `{shop, accessToken}` to `syncActiveBundlesToMetafield` | 30 min |
| GQL-5 | Minimize `ProductUpdate` mutation response | 15 min |
| BE-7 | Use `findBundleStatusById` for status checks | 10 min |
| BE-9 | Targeted select in `deleteBundleAction` | 10 min |
| BE-10 | `Promise.all` for `getBundleActivity` counts | 5 min |
| FE-6 | Add `placeholderData` to bundle detail query | 5 min |
| INF-2 | PM2 `listen_timeout` + `kill_timeout` | 5 min |

### Group B — Medium Effort (half day, high impact)

| # | Fix | Effort |
|---|---|---|
| GQL-1 | Remove duplicate `collections(first:100)` + audit callers | 1 hour |
| GQL-2 | Switch `GetProducts` to `ProductCardFields` + audit callers | 2 hours |
| GQL-3 | Replace filter products query with `productTypes` API | 1 hour |
| FE-1 | Add Zustand selectors to 20+ locations | 2 hours |
| FE-4 | Unify metrics query keys | 30 min |
| BE-3 | Merge redundant Shop queries in settings service | 1 hour |
| BE-4 | Fix double `getShopSetupStatus` call | 15 min |

### Group C — Larger Effort (1-2 days, high impact)

| # | Fix | Effort |
|---|---|---|
| FE-2 | `useWatch` refactor + `mode: "onTouched"` | 4 hours (component restructuring) |
| SW-1 | Eliminate N+1 price fetch in widget | 4 hours (verify price data availability) |
| SW-2 | Code-split widget JS by layout | 1 day (Vite config + dynamic imports) |
| SW-3 | Non-render-blocking CSS | 4 hours (test FOUC mitigation) |
| INF-1 | `output: standalone` + deploy pipeline update | 4 hours |

### Group D — Deferred (lower priority or needs more analysis)

| # | Fix | Notes |
|---|---|---|
| BE-1 | Delete dead security check path | Verify no callers first |
| BE-2 | Static imports in security service | Check for circular deps |
| BE-5 | `updateMany` for bulk delete | Name rename complicates this |
| BE-6 | `DELETED` filter in analytics | May want "include deleted" toggle |
| BE-8 | Parallelize uninstall deletes | Transaction may limit benefit |
| INF-3 | Fix/remove `SHOP_UPDATE` handler | Decide: remove or implement |
| INF-5 | Guard `PRODUCTS_CREATE` webhook | Edge case vs savings trade-off |

---

## Rejected Recommendations

These were proposed by audit agents but rejected after validation against official docs:

| Recommendation | Why Rejected |
|---|---|
| Module-level `Map` cache for Shopify sessions | Tokens can be revoked; no TTL mechanism; diverges across PM2 workers |
| Hoist `unstable_cache` to module level | Per-shop dynamic keys require inline construction; project's pattern is correct |
| Add `serverExternalPackages` for Prisma/pg | Both are auto-opted-out in Next.js already |
| Remove `cacheComponents: true` from next.config.js | This is load-bearing — enables `"use cache"`, `cacheTag()`, `updateTag()`, PPR |
| `revalidateTag(tag, "max")` is invalid | It's the required Next.js 16 form; single-arg is deprecated |
