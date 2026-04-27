# Performance Analysis Report: Radius Bundles

**Generated**: April 9, 2026  
**Project**: Next.js 16 + Prisma + Shopify App  
**Hosting**: AWS EC2 (self-hosted)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Layer Analysis](#1-database-layer-analysis)
3. [API & Network Layer Analysis](#2-api--network-layer-analysis)
4. [Frontend Client Analysis](#3-frontend-client-analysis)
5. [Next.js Configuration Analysis](#4-nextjs-configuration-analysis)
6. [Shopify API Optimization](#5-shopify-api-optimization-opportunities)
7. [Infrastructure & Environment](#6-infrastructure--environment)
8. [Recommended Actions](#7-recommended-actions)
9. [Quick Wins Checklist](#8-quick-wins-checklist)
10. [Appendix: File References](#9-appendix-file-references)
11. [Performance Testing](#10-performance-testing-recommendations)
12. [Zustand Store Analysis](#11-zustand-store-analysis)
13. [Additional React Optimization](#12-additional-react-optimization-opportunities)
14. [Build & Bundle Analysis](#13-build--bundle-analysis)
15. [Webhook & Background Processing](#14-webhook--background-processing)
16. [Memory & Resource Leaks](#15-memory--resource-leaks)
17. [Security & Performance](#16-security--performance-tradeoffs)
18. [Monitoring & Observability](#17-monitoring--observability)
19. [EC2-Specific Optimizations](#18-ec2-specific-optimizations)
20. [Diagnostic Commands](#19-quick-diagnostic-commands)
21. [Action Items Summary](#20-action-items-summary)

---

## Executive Summary

This document provides a comprehensive analysis of performance bottlenecks in the Radius Bundles application. The analysis covers database queries, API patterns, React client-side performance, Next.js configuration, and Shopify API interactions.

### Key Findings Summary

| Category                 | Severity    | Impact                                   |
| ------------------------ | ----------- | ---------------------------------------- |
| Double Network Calls     | 🔴 CRITICAL | Shopify API called for every bundle list |
| Missing DB Indexes       | 🔴 HIGH     | Slow filtered queries on Bundle table    |
| No Server Action Caching | 🟠 MEDIUM   | Every request hits DB + Shopify          |
| Next.js Config Gaps      | 🟠 MEDIUM   | Missing compression, security headers    |
| Shopify Rate Limits      | 🟡 LOW      | Potential throttling under load          |
| React Query Patterns     | 🟡 LOW      | Minor optimization opportunities         |

---

## 1. Database Layer Analysis

### 1.1 Current Schema Indexes

**Location**: `web/prisma/schema.prisma:107-113`

```prisma
@@unique([shop, name])
@@index([shop, status, type])
@@index([shop, createdAt])
@@index([mainProductId])
@@index([status, startDate])
@@index([status, endDate])
```

### 1.2 Missing Indexes

| Missing Index               | Query Pattern Affected                                   | Severity |
| --------------------------- | -------------------------------------------------------- | -------- |
| `deletedAt`                 | Soft delete filtering (status != DELETED on every query) | HIGH     |
| `(shop, deletedAt)`         | Combined filter for active bundles                       | HIGH     |
| `name` (GIN index)          | Text search with `contains` mode                         | MEDIUM   |
| `(shop, status, deletedAt)` | Most common dashboard query                              | HIGH     |

### 1.3 N+1 Query Pattern Detected

**Location**: `web/features/bundles/services/bundle-read.service.ts:51-98`

```typescript
// First query - fetch bundles
const bundles = await findBundlesByShop(shop, {
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
    ...
});

// Second query - count bundles (DUPLICATE WORK)
const totalCount = await countBundlesByShop(shop, {
    search: filters?.search,
    status: filters?.status,
    type: filters?.type,
});

// Third query - Shopify API for EVERY bundle
const { productMap, variantMap } = await fetchProductsFromShopify(
    sessionToken,
    allProductIds,
);
```

**Issue**: The count query rebuilds the same WHERE clause as findMany - this is redundant work.

### 1.4 Prisma Include Overfetching

**Location**: `web/features/bundles/repositories/bundle.fragments.ts`

```typescript
// INCLUDE_BUNDLE_DASHBOARD includes multiple relations
const INCLUDE_BUNDLE_DASHBOARD = {
    bundleProducts: { include: { group: true } },
    settings: true,
    productGroups: { include: { products: true } },
};
```

**Issue**: When listing bundles, we're loading all relations even when not needed.

---

## 2. API & Network Layer Analysis

### 2.1 Shopify API Call Pattern

**Location**: `web/lib/graphql/operations/products.operations.ts:26-30`

```typescript
const result = await executeGraphQLQuery<GetBundleProductsQuery>({
    query: GetBundleProductsDocument,
    variables: { ids: allProductIds },
    ...authFields,
});
```

**Problem**: Every bundle list request triggers a Shopify Admin API call.

- **Scenario**: 50 bundles per page = 50+ product lookups per page load
- **Rate Limit Risk**: Shopify GraphQL has calculated query costs
- **Latency**: Each API round-trip adds 200-500ms

### 2.2 Missing Server Action Caching

**Location**: `web/features/bundles/actions/bundle-queries.action.ts:21-55`

```typescript
export async function getBundlesAction(...) {
    // NO caching headers
    const result = await getBundlesListService({...});
    return { status: "success", data: { ...result } };
}
```

**Missing**:

- No `revalidateTag()` for on-demand invalidation
- No `revalidatePath()` for route-based caching
- No `cache()` configuration for static data
- No `dynamic = 'force-dynamic'` or `'force-static'`

### 2.3 Shopify Rate Limit Awareness

Per Shopify documentation, the GraphQL Admin API uses:

- **Cost-based rate limiting** (not request-based)
- **Throttle status** in response shows `maximumAvailable`, `currentlyAvailable`, `restoreRate`

**Current Usage**: Each product lookup query costs points - high volume = throttle risk

---

## 3. Frontend Client Analysis

### 3.1 React Query Configuration

**Location**: `web/features/bundles/api/bundles.queries.ts`

```typescript
list: {
    queryKey: bundlesQueryKeys.list(page, itemsPerPage, filters),
    queryFn: async () => {
        const token = await app.idToken();
        const result = await getBundlesAction(token, page, itemsPerPage, filters);
        ...
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes - reasonable
    gcTime: 10 * 60 * 1000,    // 10 minutes - reasonable
    refetchOnWindowFocus: false,
},
```

**Assessment**: React Query config is actually well-optimized:

- ✅ Good staleTime (5 min)
- ✅ No window focus refetch
- ✅ Placeholder data for instant navigation

### 3.2 Query Key Referential Equality

**Potential Issue**: If `filters` object is recreated on every render, it causes unnecessary refetches.

```typescript
// In use-bundles-data.ts
const { list, metrics } = bundlesQueries(
    app,
    pagination.currentPage,
    pagination.itemsPerPage,
    {
        search: filters.search, // Object reference changes?
        status: effectiveStatusFilter, // Array reference changes?
        sortBy: validSortBy,
        sortDirection: validDirection,
    },
);
```

**Fix**: Memoize filter object or use stable primitives in query key.

### 3.3 Multiple useEffect Hooks

**Location**: `web/features/bundles/hooks/data/use-bundles-data.ts:111-144`

```typescript
// Effect 1: Update store when data changes
useEffect(() => {
    if (bundlesResponse?.bundles && bundlesResponse?.pagination) {
        setBundles(bundlesResponse.bundles);
        setPaginationMetadata({...});
    }
}, [bundlesResponse, bundlesFetching, setBundles, setPaginationMetadata]);

// Effect 2: Handle loading states
useEffect(() => {
    setLoading(bundlesLoading || metricsLoading || bundlesFetching);
}, [bundlesLoading, metricsLoading, bundlesFetching, setLoading]);

// Effect 3: Handle errors
useEffect(() => {
    const error = bundlesError || metricsError;
    if (error) { ... }
}, [bundlesError, metricsError, setError, showToast, setBundles]);
```

**Assessment**: Multiple effects are chained - consider consolidating or using useReducer.

---

## 4. Next.js Configuration Analysis

### 4.1 Current Configuration

**Location**: `web/next.config.js`

```javascript
const nextConfig = {
    allowedDevOrigins: ["*.trycloudflare.com"],
    reactStrictMode: true,
    devIndicators: false,
    images: { remotePatterns: [...] },
    cacheComponents: true,
    cacheLife: { ... },
    experimental: { turbopackFileSystemCacheForDev: true },
    async headers() { ... }
};
```

### 4.2 Missing Optimizations

| Missing Config           | Purpose                                      | Priority |
| ------------------------ | -------------------------------------------- | -------- |
| `compress: true`         | Enable Gzip/Brotli compression               | HIGH     |
| `poweredByHeader: false` | Remove X-Powered-By header (security + size) | MEDIUM   |
| `generateEtags: false`   | Disable etag generation (reduces headers)    | LOW      |
| `modularizeImports`      | Tree-shake UI library imports                | MEDIUM   |

### 4.3 Headers Configuration

Current headers are good (HSTS, X-Content-Type-Options, Referrer-Policy, DNS-Prefetch), but missing:

- `X-Frame-Options: DENY` (clickjacking protection)
- `X-XSS-Protection` (legacy but still recommended)

### 4.4 Cache Components (Already Enabled)

```javascript
cacheComponents: true,
cacheLife: {
    dashboard: { stale: 300, revalidate: 300, expire: 3600 },
    "dashboard-long": { stale: 600, revalidate: 600, expire: 3600 },
},
```

**Note**: This is good but only applies to React Server Components, not to Server Actions used in this app.

---

## 5. Shopify API Optimization Opportunities

### 5.1 Current Product Fetching Strategy

Every bundle display requires:

1. Prisma query to get bundle + product IDs
2. Shopify API call to fetch product details (images, variants, prices)

### 5.2 Recommended Solutions

#### Option A: Product Caching (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  Sync Strategy                                              │
├─────────────────────────────────────────────────────────────┤
│  1. On product/create/update webhook → cache to DB          │
│  2. On bundle list → read from DB (fast)                    │
│  3. Periodic sync job for data freshness                     │
└─────────────────────────────────────────────────────────────┘
```

#### Option B: Response Caching

```typescript
// In server action
export async function getBundlesAction(...) {
    // Add caching
    setHeaders({
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    });
    ...
}
```

### 5.3 Shopify GraphQL Query Optimization

Current query (`GetBundleProductsDocument`) - verify it only fetches needed fields:

```graphql
# Check what fields are actually used
query GetBundleProducts($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      handle
      tags
      featuredMedia { ... }
      variants { ... }
      collections { ... }
    }
  }
}
```

**Concern**: Variants collection could be large - consider pagination or limiting fields.

---

## 6. Infrastructure & Environment

### 6.1 Current Setup

- **Host**: AWS EC2 (self-managed)
- **Database**: PostgreSQL (local to EC2)
- **Runtime**: Node.js with Bun for scripts

### 6.2 Potential Issues

| Factor        | Assessment                                                          |
| ------------- | ------------------------------------------------------------------- |
| DB Connection | No connection pooling config visible (Prisma handles automatically) |
| Memory        | Need to check Node.js heap usage                                    |
| CPU           | Need to profile request handling                                    |
| Network       | EC2 → Shopify API latency depends on region                         |

### 6.3 Recommended Diagnostics

```bash
# 1. Enable Prisma query logging
DATABASE_URL="..."?log=query npx prisma studio

# 2. Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-app/api/bundles

# 3. Monitor Shopify API calls
# Check for 429 (rate limit) responses in logs
```

---

## 7. Recommended Actions

### Priority 1: Critical Fixes

#### 7.1 Add Missing Database Indexes

```prisma
// Add to Bundle model in schema.prisma
@@index([shop, status, deletedAt])  // Filter without DELETED
@@index([deletedAt])                 // Soft delete queries
@@index([shop, deletedAt, status])  // Common combo query
```

#### 7.2 Implement Server Action Caching

```typescript
// In bundle-queries.action.ts
import { revalidateTag } from 'next/cache';

export async function getBundlesAction(...) {
    // Add revalidate tag for selective invalidation
    revalidateTag(`bundles-${shop}`);
    // OR use force-cache for static data
    // cache: 'force-cache',
    // next: { revalidate: 60 },
}
```

### Priority 2: High Priority

#### 7.3 Enable Next.js Compression

```javascript
// In next.config.js
compress: true,
poweredByHeader: false,
```

#### 7.4 Optimize Bundle Count Query

Instead of two queries, use single query with pagination metadata:

```typescript
// Use findMany with _count in Prisma
const [bundles, totalCount] = await prisma.$transaction([
    prisma.bundle.findMany({ ... }),
    prisma.bundle.count({ where }),
]);
```

### Priority 3: Medium Priority

#### 7.5 Memoize Query Filters

Ensure filter objects don't cause unnecessary refetches:

```typescript
// Use useMemo for stable references
const stableFilters = useMemo(
    () => ({
        search: filters.search,
        status: effectiveStatusFilter,
        sortBy: validSortBy,
        sortDirection: validDirection,
    }),
    [filters.search, effectiveStatusFilter, validSortBy, validDirection],
);
```

#### 7.6 Consider Product Caching Strategy

Evaluate implementing a product caching layer to avoid Shopify API calls on every bundle view.

---

## 8. Quick Wins Checklist

- [ ] Add missing indexes to Prisma schema
- [ ] Add `revalidateTag` to server actions
- [ ] Enable compression in next.config.js
- [ ] Remove powered-by header
- [ ] Optimize count query (single transaction)
- [ ] Memoize filter objects in React Query

---

## 9. Appendix: File References

| Issue           | File                       | Lines   |
| --------------- | -------------------------- | ------- |
| Double API call | `bundle-read.service.ts`   | 51-98   |
| Missing cache   | `bundle-queries.action.ts` | 21-55   |
| Shopify fetch   | `products.operations.ts`   | 10-73   |
| React effects   | `use-bundles-data.ts`      | 111-144 |
| Prisma includes | `bundle.fragments.ts`      | 40-80   |
| Missing indexes | `schema.prisma`            | 107-113 |
| Next.js config  | `next.config.js`           | 1-60    |

---

## 10. Performance Testing Recommendations

### Browser Metrics to Track

| Metric                         | Target            | Tool             |
| ------------------------------ | ----------------- | ---------------- |
| LCP (Largest Contentful Paint) | < 2.5s            | Lighthouse       |
| FID (First Input Delay)        | < 100ms           | Lighthouse       |
| TTFB (Time to First Byte)      | < 600ms           | Chrome DevTools  |
| Bundle size                    | < 500KB (initial) | Webpack analyzer |

### Load Testing

```bash
# Use k6 or Artillery for load testing
# Test scenarios:
# 1. Bundle list with 50 items
# 2. Dashboard with analytics
# 3. Bundle detail with 10 products
```

---

## 11. Zustand Store Analysis

### 11.1 Store Configuration

**Found Stores**:

| Store                     | Location                   | Purpose            |
| ------------------------- | -------------------------- | ------------------ |
| session.store.ts          | shared/stores/             | Session management |
| shop.store.ts             | shared/stores/             | Shop data          |
| bundle-selection.store.ts | features/bundles/stores/   | Bundle selection   |
| widget-status.store.ts    | features/dashboard/stores/ | Widget visibility  |
| customizer.store.ts       | features/settings/stores/  | Style customizer   |

### 11.2 Store Implementation Quality

**Good Patterns Found**:

```typescript
// Using Immer middleware (recommended)
export const useBundleListingStore = create<BundleListingState>()(
    devtools(
        persist(
            immer((set) => ({
                // Store implementation
            })),
            { name: "bundle-listing" },
        ),
        { name: "BundleListingStore" },
    ),
);
```

**Concerns**:

- Large store objects could cause unnecessary re-renders
- Multiple selectors on same store = multiple subscriptions

---

## 12. Additional React Optimization Opportunities

### 12.1 Component Re-render Analysis

**Potential Issues**:

1. **Unstable Callback References**

```typescript
// Problem: New function reference every render
<Component onAction={() => doSomething()} />

// Solution: useCallback
const handleAction = useCallback(() => doSomething(), [deps]);
<Component onAction={handleAction} />
```

2. **Inline Object Creation**

```typescript
// Problem: New object every render
<Component options={{ mode: 'fast', debug: false }} />

// Solution: Move outside component or use useMemo
const OPTIONS = { mode: 'fast', debug: false };
<Component options={OPTIONS} />
```

### 12.2 Heavy Computations

**Location**: Multiple hooks use `useMemo` - need to verify:

```typescript
// Check if dependencies are stable
const transformedMetrics = useMemo(() => {
    if (!analyticsMetrics) return null;
    return {
        activeBundles: analyticsMetrics.totals?.activeBundles ?? 0,
        // ...
    };
}, [analyticsMetrics]); // Should NOT depend on unstable refs
```

---

## 13. Build & Bundle Analysis

### 13.1 Bundle Analyzer Recommendation

Add bundle analyzer to identify large dependencies:

```javascript
// next.config.js - for analysis only
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});
```

### 13.2 Expected Bundle Structure

Based on dependencies:

- **Next.js**: Core (~150KB)
- **Polaris Web Components**: ~100-200KB
- **React Query**: ~40KB
- **Zustand**: ~10KB
- **React Hook Form + Zod**: ~30KB

### 13.3 Code Splitting Opportunities

```typescript
// Dynamic imports for heavy features
const AnalyticsDashboard = dynamic(
    () => import('@/features/analytics/components/Dashboard'),
    { loading: () => <Skeleton /> }
);
```

---

## 14. Webhook & Background Processing

### 14.1 Webhook Handler Performance

**Location**: `web/lib/shopify/webhooks/`

Current webhook handlers should be checked for:

- Async processing efficiency
- Database transaction batching
- Shopify API calls in handlers (potential slowness)

### 14.2 Background Jobs

If using cron jobs or scheduled tasks:

- Verify they're not blocking main requests
- Check for memory leaks in long-running processes

---

## 15. Memory & Resource Leaks

### 15.1 Potential Leak Sources

| Source                  | Detection              | Severity |
| ----------------------- | ---------------------- | -------- |
| Unclosed DB connections | Prisma connection pool | LOW      |
| Event listeners         | Chrome DevTools        | MEDIUM   |
| Large state objects     | Store inspection       | MEDIUM   |
| Console.log statements  | Production cleanup     | LOW      |

### 15.2 Cleanup Recommendations

```typescript
// Use useEffect cleanup for subscriptions
useEffect(() => {
    const subscription = subscribeToData();
    return () => subscription.unsubscribe(); // Cleanup!
}, []);
```

---

## 16. Security & Performance Tradeoffs

### 16.1 HMAC Verification Overhead

**Location**: `web/lib/shopify/auth/verify.ts`

Every API request goes through HMAC verification - verify it's optimized:

- Cache verification results where possible
- Use efficient crypto operations

### 16.2 Session Validation

**Location**: `web/lib/shopify/auth/verify.ts`

Check if session validation is doing unnecessary DB lookups on every request.

---

## 17. Monitoring & Observability

### 17.1 Recommended Metrics

| Category     | Metrics                                     |
| ------------ | ------------------------------------------- |
| **Server**   | CPU%, Memory%, Response time, Request count |
| **Database** | Query time, Connection count, Slow queries  |
| **API**      | Shopify API latency, Rate limit status      |
| **Client**   | LCP, FCP, TTI, Error rate                   |

### 17.2 Logging Recommendations

```typescript
// Use structured logging
console.log(
    JSON.stringify({
        level: "info",
        message: "Bundle fetched",
        duration: performance.now() - start,
        shop,
    }),
);
```

---

## 18. EC2-Specific Optimizations

### 18.1 Node.js Configuration

```bash
# Set appropriate heap size
NODE_OPTIONS="--max-old-space-size=2048"

# Enable experimental features if beneficial
NODE_OPTIONS="--experimental-produce-return-values"
```

### 18.2 PM2 or Similar Process Manager

If using PM2:

- Set `instances: 'max'` for clustering
- Configure `max_memory_restart` to prevent leaks

### 18.3 PostgreSQL on EC2

Check these settings:

- `shared_buffers` = 25% of RAM
- `work_mem` = RAM / connections
- `effective_cache_size` = RAM \* 0.75
- Enable slow query logging

---

## 19. Quick Diagnostic Commands

### 19.1 Database

```sql
-- Check slow queries (requires pg_stat_statements)
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### 19.2 Network

```bash
# Shopify API latency
curl -w "%{time_total}s\n" -o /dev/null \
  -H "X-Shopify-Access-Token: $TOKEN" \
  "https://$SHOP.myshopify.com/admin/api/2026-01/products.json?limit=1"
```

### 19.3 Node.js Profiling

```bash
# CPU profile
node --prof app.js

# Heap snapshot
node --inspect app.js  # Then use Chrome DevTools
```

---

## 20. Action Items Summary

| Priority | Action                        | Effort | Impact   |
| -------- | ----------------------------- | ------ | -------- |
| 🔴 P1    | Add missing DB indexes        | Low    | High     |
| 🔴 P1    | Add server action caching     | Medium | High     |
| 🔴 P1    | Fix auth middleware DB writes | Medium | CRITICAL |
| 🟠 P2    | Enable compression            | Low    | Medium   |
| 🟠 P2    | Fix count query duplication   | Low    | Medium   |
| 🟠 P2    | PM2 cluster mode              | Medium | High     |
| 🟡 P3    | Memoize React Query keys      | Medium | Low      |
| 🟡 P3    | Add bundle analyzer           | Low    | Low      |
| 🟡 P3    | Optimize Zustand selectors    | Medium | Low      |

---

## 21. Implementation Status

### ✅ Completed Fixes

| #   | Fix                   | File                                                    | Status  |
| --- | --------------------- | ------------------------------------------------------- | ------- |
| 1   | Auth fast-path check  | `web/lib/shopify/auth/verify.ts`                        | ✅ DONE |
| 2   | PM2 cluster mode      | `web/ecosystem.config.cjs`                              | ✅ DONE |
| 3   | DB indexes            | `web/prisma/schema.prisma`                              | ✅ DONE |
| 4   | Query transaction     | `web/features/bundles/services/bundle-read.service.ts`  | ✅ DONE |
| 5   | Server action caching | `web/features/bundles/actions/bundle-queries.action.ts` | ✅ DONE |
| 6   | Compression           | `web/next.config.js`                                    | ✅ DONE |

### Files Modified Summary

```
web/
├── lib/shopify/auth/verify.ts          # Auth fast-path (2 SELECT → early return)
├── ecosystem.config.cjs                # Cluster mode (max instances)
├── prisma/schema.prisma                # Added @@index([shop, status, deletedAt]), @@index([deletedAt])
├── features/bundles/services/bundle-read.service.ts  # $transaction for findMany + count
├── features/bundles/actions/bundle-queries.action.ts # revalidateTag caching
└── next.config.js                      # compress: true, poweredByHeader: false
```

### Deployment Steps

```bash
# 1. Database migration for new indexes
cd /var/www/shopify/web
npx prisma migrate dev --name add_soft_delete_indexes

# 2. Upload all modified files
scp web/ecosystem.config.cjs user@ec2:/var/www/shopify/web/
scp web/next.config.js user@ec2:/var/www/shopify/web/

# 3. Rebuild and restart PM2
pm2 delete shopify
pm2 start /var/www/shopify/web/ecosystem.config.cjs

# 4. Verify
pm2 status  # Should show multiple instances (1 per CPU core)
```

---

**End of Report**

Generated for Radius Bundles Performance Optimization Initiative
