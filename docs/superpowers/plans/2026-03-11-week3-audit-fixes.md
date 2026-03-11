# Week 3 Audit Fixes — Performance & Operational

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 8 remaining Week 3 audit items (P-3, P-4, P-9, W-5, A-6, P-6, W-8, D-6) to raise overall score from 75→80+/100.

**Architecture:** Storefront widget fixes (P-3, P-9) are in vanilla TS compiled by Vite. App-side fixes (A-6, P-6, W-5, W-8, D-6) are in Next.js server/client code. P-4 is a bundle-size optimization via dynamic imports.

**Tech Stack:** TypeScript, Next.js 16, React Query v5, Prisma, Vite (widget build)

---

## Chunk 1: Quick Wins (A-6, W-8)

### Task 1: A-6 — Replace deprecated `cacheTime` with `gcTime`

**Files:**
- Modify: `web/features/bundles/api/bundles.queries.ts:42,60,77`

**Context:** React Query v5 renamed `cacheTime` → `gcTime`. The current `cacheTime` settings have no effect.

- [ ] **Step 1: Replace all 3 occurrences in bundles.queries.ts**

```typescript
// Line 42: change cacheTime → gcTime
gcTime: 10 * 60 * 1000,

// Line 60: change cacheTime → gcTime
gcTime: 10 * 60 * 1000,

// Line 77: change cacheTime → gcTime
gcTime: 15 * 60 * 1000,
```

- [ ] **Step 2: Verify no other `cacheTime` usage in codebase**

Run: `grep -r "cacheTime" web/features/ web/shared/`
Expected: No results

- [ ] **Step 3: Type check**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add web/features/bundles/api/bundles.queries.ts
git commit -m "fix(A-6): replace deprecated cacheTime with gcTime in React Query v5"
```

---

### Task 2: W-8 — Throw on missing critical env vars

**Files:**
- Modify: `web/lib/shopify/config/initialize-context.ts:5-19`

**Context:** Currently all env vars fallback to `""`. If `SHOPIFY_API_KEY` or `SHOPIFY_API_SECRET` is missing, the app silently creates a broken Shopify client. Should throw early at module load.

- [ ] **Step 1: Add env validation before shopifyApi() call**

Add this block before `const shopify = shopifyApi({`:

```typescript
const REQUIRED_ENV = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET"] as const;

for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
```

Keep `HOST` and `SCOPES` with fallbacks (they have reasonable defaults).

- [ ] **Step 2: Remove `|| ""` fallback from validated vars**

```typescript
const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    // HOST and SCOPES keep their fallbacks
    scopes: process.env.SCOPES?.split(",") || ["write_products"],
    hostName: process.env.HOST?.replace(/https?:\/\//, "") || "",
    ...
});
```

- [ ] **Step 3: Type check**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add web/lib/shopify/config/initialize-context.ts
git commit -m "fix(W-8): throw on missing critical Shopify env vars at startup"
```

---

## Chunk 2: Widget Performance (P-3, P-9)

### Task 3: P-3 — Reduce widget polling; use cart events

**Files:**
- Modify: `web/widgets/src/radius-bundles.ts`
  - `SavingsBanner.startPolling()` (lines 700-716)
  - `SavingsBanner.init()` (lines 464-480)

**Context:** Currently polls `/cart.js` every 1.5s on cart page — 40+ req/min per customer. Should use Shopify's `cart:updated` events as primary mechanism and fall back to polling at 10s for themes that don't fire events.

- [ ] **Step 1: Increase polling interval from 1500ms to 10000ms**

In `startPolling()` (line 715):
```typescript
// Change from:
}, 1500);
// To:
}, 10000);
```

- [ ] **Step 2: Add cart event listeners in SavingsBanner.init()**

The `init()` method already has `document.addEventListener("cart:updated", ...)` at line 474. Also add Shopify Section Rendering API events. After line 477, add:

```typescript
document.addEventListener("cart:change", () => this.update());
```

This ensures both Shopify AJAX API events and the existing custom events trigger updates, reducing reliance on polling.

- [ ] **Step 3: Build widgets to verify no syntax errors**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles && bun run build:widgets`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add web/widgets/src/radius-bundles.ts
git commit -m "perf(P-3): reduce cart polling to 10s, rely on cart events for updates"
```

---

### Task 4: P-9 — Fix widget memory leaks

**Files:**
- Modify: `web/widgets/src/radius-bundles.ts`
  - `CartCleanup.interceptFetch()` (lines 414-441)
  - `CartCleanup.attachEventListeners()` (lines 443-446)
  - `CartCleanup` class — add `destroy()` method
  - `SavingsBanner` class — add event listener cleanup to `destroy()`
  - `RadiusBundlesManager` class — add `destroy()` method

**Context:** Three memory leaks: (1) `window.fetch` overwritten without storing original — can't restore. (2) Event listeners added without removal tracking. (3) SavingsBanner event listeners not cleaned up in `destroy()`.

- [ ] **Step 1: Store original fetch and add restore capability**

In `CartCleanup` class, add a private field:

```typescript
private originalFetch: typeof window.fetch | null = null;
```

In `interceptFetch()` (line 414), store the original:

```typescript
private interceptFetch(): void {
    this.originalFetch = window.fetch;
    const originalFetch = this.originalFetch;
    // ... rest stays the same
}
```

- [ ] **Step 2: Add bound handler references for CartCleanup event listeners**

Add private fields to `CartCleanup` class:

```typescript
private boundTrigger: (() => void) | null = null;
```

In `attachEventListeners()` (line 443):

```typescript
private attachEventListeners(): void {
    this.boundTrigger = () => this.trigger();
    document.addEventListener("cart:refresh", this.boundTrigger);
    document.addEventListener("cart:updated", this.boundTrigger);
}
```

- [ ] **Step 3: Add destroy() to CartCleanup**

```typescript
public destroy(): void {
    if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
    }
    if (this.originalFetch) {
        window.fetch = this.originalFetch;
        this.originalFetch = null;
    }
    if (this.boundTrigger) {
        document.removeEventListener("cart:refresh", this.boundTrigger);
        document.removeEventListener("cart:updated", this.boundTrigger);
        this.boundTrigger = null;
    }
}
```

- [ ] **Step 4: Add bound handler references for SavingsBanner event listeners**

Add private fields to `SavingsBanner` class:

```typescript
private boundUpdate: (() => void) | null = null;
private boundCartChange: (() => void) | null = null;
```

In `init()`, use bound references:

```typescript
public init(): void {
    if (this.config.pageType !== "cart" || !this.config.showSavingsBanner) {
        return;
    }

    this.boundUpdate = () => this.update();
    this.boundCartChange = () => this.update();

    setTimeout(() => this.update(), 100);

    document.addEventListener("cart:updated", this.boundUpdate);
    document.addEventListener("radiusBundles:cleanup", this.boundUpdate);
    document.addEventListener("cart:change", this.boundCartChange);

    this.startPolling();
}
```

- [ ] **Step 5: Expand SavingsBanner.destroy() to clean up event listeners**

```typescript
public destroy(): void {
    if (this.pollInterval !== null) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
    }
    if (this.boundUpdate) {
        document.removeEventListener("cart:updated", this.boundUpdate);
        document.removeEventListener("radiusBundles:cleanup", this.boundUpdate);
        this.boundUpdate = null;
    }
    if (this.boundCartChange) {
        document.removeEventListener("cart:change", this.boundCartChange);
        this.boundCartChange = null;
    }
}
```

- [ ] **Step 6: Add destroy() to RadiusBundlesManager**

```typescript
public destroy(): void {
    this.cartCleanup.destroy();
    this.savingsBanner.destroy();
}
```

- [ ] **Step 7: Build widgets**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles && bun run build:widgets`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
git add web/widgets/src/radius-bundles.ts
git commit -m "fix(P-9): fix widget memory leaks — restore fetch, remove listeners, clear intervals"
```

---

## Chunk 3: GraphQL & Cache Fixes (W-5, P-6)

### Task 5: W-5 — Add GraphQL retry with exponential backoff

**Files:**
- Modify: `web/lib/graphql/client/server-action.ts:100-137`
- Modify: `web/shared/types/api/graphql.types.ts:12` (add `_retryCount` field)

**Context:** Currently only retries on 401 (stale token). Need retry for transient errors (429, 502, 503) with exponential backoff. The `_retried` flag already prevents infinite recursion for 401 — extend this pattern with a `_retryCount`.

- [ ] **Step 1: Add `_retryCount` to GraphQLRequest type**

In `web/shared/types/api/graphql.types.ts`, add after `_retried`:

```typescript
/** Internal: tracks retry count for transient errors */
_retryCount?: number;
```

- [ ] **Step 2: Add retry helper function in server-action.ts**

Add before the `executeGraphQLQuery` function:

```typescript
const RETRYABLE_STATUS_CODES = [429, 502, 503, 504];
const MAX_RETRIES = 3;
const BACKOFF_MS = [0, 1000, 3000];

function getRetryDelay(retryCount: number): number {
    return BACKOFF_MS[retryCount] ?? 3000;
}

function isRetryableError(error: unknown): number | null {
    if (error && typeof error === "object" && "response" in error) {
        const status = (error as any).response?.status;
        if (RETRYABLE_STATUS_CODES.includes(status)) return status;
    }
    return null;
}
```

- [ ] **Step 3: Add transient error retry logic in catch block**

In the catch block of `executeGraphQLQuery`, after the existing 401 retry block (after line 137), add:

```typescript
const retryableStatus = isRetryableError(error);
const retryCount = request._retryCount ?? 0;

if (retryableStatus && retryCount < MAX_RETRIES) {
    const delay = getRetryDelay(retryCount);
    if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
    }
    console.warn(
        `[GraphQL] ${retryableStatus} — retry ${retryCount + 1}/${MAX_RETRIES}`,
    );
    return executeGraphQLQuery<T>({
        ...request,
        _retryCount: retryCount + 1,
    });
}
```

- [ ] **Step 4: Type check**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add web/lib/graphql/client/server-action.ts web/shared/types/api/graphql.types.ts
git commit -m "fix(W-5): add GraphQL retry with exponential backoff for 429/5xx errors"
```

---

### Task 6: P-6 — Improve cache invalidation after mutations

**Files:**
- Modify: `web/features/bundles/utils/bundle-cache.ts:13-31`

**Context:** `invalidateBundleCache` uses `refetchType: "active"` which only refetches currently-mounted queries. Inactive queries stay stale until their `gcTime` expires (10-15 min). After bundle mutations, all cached data should be invalidated.

- [ ] **Step 1: Change refetchType from "active" to "all"**

```typescript
export const invalidateBundleCache = async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({
        queryKey: bundlesQueryKeys.all,
    });

    await queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.all,
    });

    broadcastInvalidation("INVALIDATE_BUNDLES");
    broadcastInvalidation("INVALIDATE_ANALYTICS");
};
```

Remove `refetchType: "active"` — the default in v5 is `"active"`, but removing it means when a user navigates to a page with these queries, they'll always get fresh data because `invalidateQueries` marks them as stale regardless of `refetchType`.

Actually, the correct fix: keep `refetchType: "active"` for active queries (to refetch immediately) but also **remove stale cache entries** so inactive queries don't serve stale data:

```typescript
export const invalidateBundleCache = async (queryClient: QueryClient) => {
    queryClient.removeQueries({
        queryKey: bundlesQueryKeys.all,
        type: "inactive",
    });

    await queryClient.invalidateQueries({
        queryKey: bundlesQueryKeys.all,
        refetchType: "active",
    });

    queryClient.removeQueries({
        queryKey: analyticsQueryKeys.all,
        type: "inactive",
    });

    await queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.all,
        refetchType: "active",
    });

    broadcastInvalidation("INVALIDATE_BUNDLES");
    broadcastInvalidation("INVALIDATE_ANALYTICS");
};
```

This approach: active queries refetch immediately, inactive queries are removed from cache (so next mount fetches fresh).

- [ ] **Step 2: Type check**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add web/features/bundles/utils/bundle-cache.ts
git commit -m "perf(P-6): remove inactive query cache on mutation, refetch active queries"
```

---

## Chunk 4: Data & Bundle Size (D-6, P-4)

### Task 7: D-6 — Fix client-side pagination to DB-level take/skip

**Files:**
- Modify: `web/features/analytics/repositories/bundle-analytics.repository.ts:185-228,257-324`

**Context:** `getPaginatedBundlesWithAnalytics()` calls `fetchBundlesWithAnalyticsCore()` which fetches ALL bundles, then `.slice()` in memory. Need to push `take`/`skip` to the Prisma query.

- [ ] **Step 1: Add page/perPage to CoreBundleFetchParams**

Find the `CoreBundleFetchParams` interface and add:

```typescript
page?: number;
perPage?: number;
```

- [ ] **Step 2: Add take/skip to the Prisma findMany in fetchBundlesWithAnalyticsCore**

In `fetchBundlesWithAnalyticsCore()` (line 277), add `take` and `skip` to `prisma.bundle.findMany`:

```typescript
prisma.bundle.findMany({
    where: bundleWhereClause,
    select: {
        id: true,
        name: true,
        status: true,
        type: true,
        discountType: true,
        discountValue: true,
        createdAt: true,
        publishedAt: true,
        isPublished: true,
    },
    ...(page && perPage ? { skip: (page - 1) * perPage, take: perPage } : {}),
}),
```

- [ ] **Step 3: Update getPaginatedBundlesWithAnalytics to pass page/perPage**

```typescript
const { bundles, totalCount } = await fetchBundlesWithAnalyticsCore({
    shop,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    search,
    page,
    perPage,
});

// Remove the client-side slice:
// const startIndex = (page - 1) * perPage;
// const paginatedBundles = bundles.slice(startIndex, startIndex + perPage);

const totalPages = Math.ceil(totalCount / perPage);

return {
    bundles, // Already paginated from DB
    pagination: {
        page,
        perPage,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    },
};
```

**Important caveat:** The sort happens in JS (line 318: `sortBundles()`) after analytics are joined. Since analytics are aggregated separately via `groupBy`, sorting by analytics columns (revenue, views) still requires fetching all bundles. For now, only apply `take`/`skip` when `sortBy` is a bundle field (name, status, createdAt). For analytics-based sorting, keep the current behavior.

- [ ] **Step 4: Add conditional DB pagination**

Adjust the logic: only use DB-level pagination when sorting by bundle fields:

```typescript
const DB_SORTABLE_FIELDS = ["name", "status", "createdAt", "type"];
const useDbPagination = page && perPage && DB_SORTABLE_FIELDS.includes(sortBy);
```

Pass `useDbPagination` to control whether `take`/`skip` is applied.

When DB pagination is used, also add `orderBy` to the Prisma query:

```typescript
...(useDbPagination ? {
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { [sortBy]: sortOrder || "desc" },
} : {}),
```

When NOT using DB pagination (analytics-sorted), keep current `.slice()` behavior.

- [ ] **Step 5: Type check**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add web/features/analytics/repositories/bundle-analytics.repository.ts
git commit -m "perf(D-6): push pagination to DB level for bundle-field sorting"
```

---

### Task 8: P-4 — Dynamic import Recharts; replace Framer Motion with CSS

**Files:**
- Modify: `web/features/analytics/components/analytics-charts/analytics-chart.tsx:31` — dynamic import
- Modify: `web/features/analytics/components/analytics-charts/comparison/funnel-performance-chart.tsx:32` — dynamic import
- Modify: `web/features/analytics/components/analytics-charts/comparison/conversion-rates-chart.tsx:33` — dynamic import
- Modify: `web/features/analytics/components/analytics-charts/comparison/revenue-aov-chart.tsx:33` — dynamic import
- Modify: `web/features/settings/components/settings-page/animated-tab-panel.tsx:4` — replace framer-motion
- Modify: `web/features/settings/components/settings-tabs/settings-tab.tsx:4` — replace framer-motion
- Modify: `web/features/bundles/components/bundle-creation/form/step-content.tsx:11` — replace framer-motion
- Modify: `web/features/analytics/components/analytics-page/analytics-tab.tsx:13` — replace framer-motion

**Context:** `recharts` (~150KB) and `framer-motion` (~68KB) loaded on every page. Recharts only used on analytics page. Framer Motion used for simple fade/slide animations that CSS can handle.

#### Part A: Dynamic import Recharts

- [ ] **Step 1: Create lazy chart wrapper**

For each chart component that imports from `recharts`, wrap the component with `next/dynamic`:

In each chart file, change from direct `recharts` imports to a dynamic wrapper pattern. The chart files are self-contained components, so the simplest approach is to lazy-load the entire chart component from its parent.

In `web/features/analytics/components/analytics-page/analytics-tab.tsx`, change chart component imports to dynamic:

```typescript
import dynamic from "next/dynamic";

const AnalyticsChart = dynamic(
    () => import("../analytics-charts/analytics-chart").then((m) => ({ default: m.AnalyticsChart })),
    { ssr: false },
);
```

Apply same pattern for the comparison charts if they're imported in a parent.

- [ ] **Step 2: Verify chart files export correctly for dynamic import**

Ensure each chart component has a named or default export that `dynamic()` can resolve.

- [ ] **Step 3: Build to verify**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add web/features/analytics/
git commit -m "perf(P-4): dynamic import recharts components on analytics page only"
```

#### Part B: Replace Framer Motion with CSS transitions

- [ ] **Step 5: Replace framer-motion in animated-tab-panel.tsx**

Replace `motion.div` with a regular `div` using CSS transitions. The animation is a simple fade + slide:

```typescript
// Remove: import { motion } from "framer-motion";
// Replace motion.div with:
<div
    className="animated-tab-panel"
    style={{
        animation: "fadeSlideIn 0.2s ease-out",
    }}
>
```

Add CSS (inline or in existing stylesheet):
```css
@keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 6: Replace framer-motion in settings-tab.tsx**

Replace `AnimatePresence` with conditional rendering. `AnimatePresence` just handles mount/unmount animations — for tab switching, a simple conditional render with CSS transition works.

- [ ] **Step 7: Replace framer-motion in step-content.tsx**

Replace `AnimatePresence` + `motion.div` with CSS transition for step animation in bundle creation wizard.

- [ ] **Step 8: Replace framer-motion in analytics-tab.tsx**

Replace `AnimatePresence` + `motion` + `useReducedMotion` with CSS transitions. Honor `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
    .animated-tab-panel { animation: none; }
}
```

- [ ] **Step 9: Remove framer-motion from dependencies**

Run: `cd web && bun remove framer-motion`

- [ ] **Step 10: Type check & build**

Run: `cd web && npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 11: Commit**

```bash
git add web/features/ web/package.json web/bun.lockb
git commit -m "perf(P-4): replace framer-motion with CSS transitions, remove 68KB dependency"
```

---

## Post-Implementation

- [ ] **Update audit report** — Mark all 8 items as Done in `docs/reports/FULL_AUDIT_REPORT.md`
- [ ] **Update MEMORY.md** — Record Week 3 completion
- [ ] **Run full type check** — `cd web && npx tsc --noEmit`
- [ ] **Build widgets** — `bun run build:widgets`

### Expected Score Impact

| Domain | Before | After |
|--------|--------|-------|
| Performance | 62/100 | ~72/100 (P-3, P-4, P-6, P-9 fixed) |
| Architecture | 87/100 | ~89/100 (A-6 fixed) |
| Webhooks | 68/100 | ~72/100 (W-5, W-8 fixed) |
| Data Integrity | 78/100 | ~80/100 (D-6 fixed) |
| **Overall** | **75/100** | **~80/100** |
