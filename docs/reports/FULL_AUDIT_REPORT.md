# Radius Product Bundles — Full Application Audit Report

**Date**: 2026-03-09
**Auditor**: Claude Code (Opus 4.6)
**Branch**: `type-bogo` (commit `ff3ca02`)
**Scope**: Security, Data Integrity, Architecture, Performance, Rust Function, Webhooks & Lifecycle

---

## Executive Summary

| Domain                      | Critical | High   | Medium | Low    | Score      |
| --------------------------- | -------- | ------ | ------ | ------ | ---------- |
| Security & OWASP            | ~~3~~ 0  | 5      | 4      | 2      | ~~62~~ 75/100 |
| Data Integrity & Schema     | 2        | ~~4~~ 1 | 4      | 1      | ~~70~~ 78/100 |
| Architecture & Code Quality | 0        | 3      | 5      | 5      | 87/100     |
| Performance & Optimization  | 3        | 5      | 4      | 0      | 58/100     |
| Rust Discount Function      | ~~5~~ 0  | 8      | 4      | 0      | ~~45~~ 65/100 |
| Webhooks & App Lifecycle    | ~~2~~ 1  | ~~6~~ 4 | 4      | 4      | ~~55~~ 68/100 |
| **Total**                   | ~~15~~ **6** | ~~31~~ **26** | **25** | **12** | ~~63~~ **72/100** |

**Verdict**: Week 1 + Week 2 (partial) fixes complete — **9 critical and 5 high issues resolved**. All Rust criticals eliminated (0 remaining). All security criticals eliminated. Architecture remains solid (87/100). **6 critical issues remain** across Data Integrity (2), Performance (3), and Webhooks (1). 2 Week 2 items pending (P-1, S-4).

---

## Table of Contents

1. [Security & OWASP](#1-security--owasp)
2. [Data Integrity & Schema](#2-data-integrity--schema)
3. [Architecture & Code Quality](#3-architecture--code-quality)
4. [Performance & Optimization](#4-performance--optimization)
5. [Rust Discount Function](#5-rust-discount-function)
6. [Webhooks & App Lifecycle](#6-webhooks--app-lifecycle)
7. [Previously Reported (CODE_REVIEW_REPORT.md) — Revalidated](#7-previously-reported--revalidated)
8. [Prioritized Action Plan](#8-prioritized-action-plan)

---

## 1. Security & OWASP

### CRITICAL

#### S-1. XSS via `dangerouslySetInnerHTML`

- **File**: `web/shared/components/feedback/banner/global-banner.tsx:52-57`
- **Issue**: Banner renders HTML content without sanitization when `isHtml` is true
- **Risk**: Arbitrary JS execution if message source is tainted
- **Fix**: Use DOMPurify or remove HTML rendering entirely; use Polaris components

#### S-2. Overly Permissive CSP (`unsafe-eval` + `unsafe-inline`)

- **File**: `web/security/csp.ts:12`
- **Issue**: `script-src 'self' 'unsafe-inline' 'unsafe-eval'` defeats XSS protection
- **Risk**: Enables dynamic code execution, bypasses script sandboxing
- **Fix**: Remove both directives; use nonces or hashes for inline scripts

#### S-3. Open CORS (`Access-Control-Allow-Origin: *`) on Upload

- **File**: `web/app/api/upload/route.ts:7-8`
- **Issue**: Any domain can initiate file uploads via the user's browser
- **Risk**: CSRF, cross-origin file injection
- **Fix**: Restrict to `https://${shop}.myshopify.com`

### HIGH

#### S-4. Plaintext Token Bypass in Decryption

- **File**: `web/lib/crypto/token-encryption.ts:28-29`
- **Issue**: Tokens starting with `shpat_` skip decryption — stored in plaintext
- **Fix**: Always encrypt; add migration for unencrypted tokens

#### S-5. Weak Shop Domain Validation

- **File**: `web/shared/utils/shopify/shopify-helpers.ts:143-145`
- **Issue**: `normalizeShopDomain()` only strips protocol; doesn't validate format
- **Fix**: Call `isValidShopDomain()` after normalization; reject invalid domains

#### S-6. Incomplete Bearer Token Extraction

- **File**: `web/shared/utils/shopify/shopify-helpers.ts:165-170`
- **Issue**: `authHeader.replace("Bearer ", "")` doesn't handle edge cases
- **Fix**: Use regex: `/^Bearer\s+(.+)$/`

#### S-7. Upload Route — No JSON Schema Validation

- **File**: `web/app/api/upload/route.ts:51-56`
- **Issue**: `JSON.parse(paramsJson)` without try-catch or Zod validation
- **Fix**: Add try-catch + Zod schema for params array

#### S-8. `$queryRawUnsafe` Pattern

- **File**: `web/app/api/cron/keep-alive/route.ts:17`
- **Issue**: Uses `$queryRawUnsafe("SELECT 1")` — safe now but establishes dangerous pattern
- **Fix**: Use `$queryRaw\`SELECT 1\`` (tagged template)

### MEDIUM

#### S-9. Console Logging of Business Data

- **File**: `web/app/api/proxy/products/route.ts:27,69,251-310`
- **Issue**: Logs product IDs, pricing, bundle structure in production
- **Fix**: Gate behind `process.env.DEBUG` or remove

#### S-10. No Rate Limiting on Proxy Endpoints

- **Files**: `web/app/api/proxy/analytics/route.ts`, `web/app/api/proxy/products/route.ts`
- **Issue**: HMAC-verified but no per-shop rate limits
- **Fix**: Implement rate limiting (100 req/min per shop)

#### S-11. Verbose Error Responses Leak Infrastructure Details

- **File**: `web/app/api/upload/route.ts:75-89`
- **Issue**: Returns upstream error text to client
- **Fix**: Generic errors in production; detail only in `NODE_ENV=development`

#### S-12. Upload API Has No File Size Limit

- **File**: `web/app/api/upload/route.ts:28`
- **Issue**: `file.arrayBuffer()` with no size check — could exhaust memory
- **Fix**: Add `if (file.size > 50 * 1024 * 1024) return 413`

### Positive Controls Found

- Strong bundle ownership verification via `verifyBundleOwnership()`
- Shop domain filtering in all critical queries
- Session token validation in all server actions
- Proxy HMAC-SHA256 signature verification
- **No cross-shop access vulnerabilities detected**

---

## 2. Data Integrity & Schema

### CRITICAL

#### D-1. BundleAnalytics/BundleView Use `onDelete: Restrict`

- **File**: `web/prisma/schema.prisma:332,348`
- **Issue**: Bundle deletion fails if analytics/views exist; `deleteBundleWithRelations()` expects cascade
- **Fix**: Change to `onDelete: Cascade` or add explicit deletion before bundle delete

#### D-2. Unvalidated JSON Fields Stored Without Schema Validation

- **Files**: Multiple models — `volumeTiers`, `variantConfig`, `triggerConfig`, `conditions`, `actionData`
- **Issue**: Raw JSON stored without Zod validation before insert/update
- **Risk**: Invalid data causes runtime errors downstream
- **Fix**: Create Zod schemas for each JSON structure; validate before DB writes

### HIGH

#### D-3. Promise.allSettled Results Not Inspected (4 locations)

- **File**: `web/features/bundles/actions/bundle-mutations.action.ts:316-321,327-335,534-543,677`
- **Issue**: Metafield sync failures are silently swallowed
- **Risk**: Bundle saved in DB but storefront widget shows stale data
- **Fix**: Inspect results, log failures, surface to user

#### D-4. Missing `shopId` Indexes on 6 Models

- **File**: `web/prisma/schema.prisma` — ABTest, Automation, PricingRule, AIInsight, Notification, AlertRule
- **Issue**: No `@@index([shopId])` on models queried by shop
- **Fix**: Add `@@index([shopId])` to each

#### D-5. Session Storage Missing Transaction

- **File**: `web/shared/repositories/session-storage.ts`
- **Issue**: 3 sequential upserts (session, onlineAccessInfo, associatedUser) without `$transaction`
- **Risk**: Orphaned data on partial failure
- **Fix**: Wrap in `prisma.$transaction([])`

#### D-6. Client-Side Pagination in Analytics

- **File**: `web/features/analytics/repositories/bundle-analytics.repository.ts:212`
- **Issue**: Fetches ALL rows then `.slice()` in memory
- **Fix**: Use DB-level `take`/`skip`

### MEDIUM

#### D-7. BundleProduct Unique Constraint Allows NULL `variantId`

- **File**: `web/prisma/schema.prisma:138`
- **Issue**: `@@unique([bundleId, productId, variantId, role])` — NULL variantId allows duplicates
- **Fix**: Make variantId NOT NULL, or add filtered unique constraint

#### D-8. `hour` Field Has No Range Constraint

- **File**: `web/prisma/schema.prisma:323`
- **Issue**: `hour Int?` can be -1, 24, 100, etc.
- **Fix**: Add application-level validation (0-23) or DB CHECK constraint

#### D-9. Fire-and-Forget Metafield Operations

- **File**: `web/features/bundles/actions/bundle-mutations.action.ts:104,173,221,536,641,677`
- **Issue**: Failures logged but not thrown or retried
- **Fix**: Implement retry logic or surface errors to user

#### D-10. Unbounded `BundleView.count()` Query

- **File**: `web/features/dashboard/repositories/setup-guide.repository.ts:42`
- **Issue**: COUNT on potentially millions of rows
- **Fix**: Use `findFirst({ select: { id: true } })` instead

---

## 3. Architecture & Code Quality

**Overall Score: 87/100** — Well-organized feature modules, proper isolation

### HIGH

#### A-1. Empty Catch Blocks (7 instances)

- **Files**: `web/security/shop.ts:56,65`, `web/widgets/src/bundle-widget.ts` (2), `web/widgets/src/cart-attributes.ts`, `web/widgets/src/cart.ts`, `web/widgets/src/radius-bundles.ts`
- **Pattern**: `.catch(() => {})` silently swallows errors
- **Fix**: Add logging or user feedback

#### A-2. `as any` in Proxy Routes (5 instances)

- **File**: `web/app/api/proxy/products/route.ts:86,164,239`
- **Issue**: GraphQL responses typed as `any` instead of generated types
- **Fix**: Import and use generated GraphQL types

#### A-3. Promise.all Without Error Boundary in Proxy

- **File**: `web/app/api/proxy/products/route.ts:220`
- **Issue**: Single bundle transformation failure fails entire request
- **Fix**: Use `Promise.allSettled()` with per-bundle error handling

### MEDIUM

#### A-4. Debug Logs in Production (15+ instances)

- **Files**: `web/app/api/proxy/products/route.ts` (11), `web/app/api/upload/route.ts` (5)
- **Fix**: Gate behind `process.env.DEBUG` flag

#### A-5. Duplicated Error Message Extraction (15+ instances)

- **Pattern**: `error instanceof Error ? error.message : String(error)` repeated everywhere
- **Fix**: Extract to `shared/utils/error/extractErrorMessage.ts`

#### A-6. `cacheTime` Deprecated in React Query v5

- **File**: `web/features/bundles/api/bundles.queries.ts:42,60,77`
- **Issue**: `cacheTime` renamed to `gcTime` — setting has no effect
- **Fix**: Replace all `cacheTime` with `gcTime`

#### A-7. Deep Relative Imports (3-5 files)

- **Files**: `features/settings/components/style-customizer/bundle-preview/templates/`
- **Pattern**: 4+ levels of `../` — fragile
- **Fix**: Use `@/features/settings/...` path aliases

#### A-8. Commented-Out Export

- **File**: `web/shared/actions/index.ts` — `// export * from "./webhook.action";`
- **Fix**: Remove or add TODO with reason

### Architecture Strengths

- Feature modules properly isolated with barrel exports
- No circular dependencies detected
- Consistent `ApiResponse` pattern in server actions
- Proper use of Prisma fragments for query composition
- React Query configuration with appropriate stale/cache times
- 37 useEffect instances — all properly structured

---

## 4. Performance & Optimization

### CRITICAL

#### P-1. Multiple Sequential GraphQL Calls in Proxy Products Route

- **File**: `web/app/api/proxy/products/route.ts:158-235`
- **Issue**: With `discount_based` prioritization, fetches ALL products twice; each bundle triggers separate GraphQL call
- **Impact**: 1000+ ms storefront widget latency
- **Fix**: Batch all product IDs into one GraphQL call; build single product map; reuse across bundles

#### P-2. N+1 Analytics Queries on View Tracking

- **File**: `web/features/analytics/repositories/analytics.queries.ts:32-129`
- **Issue**: `findUnique()` check before `create()` — 2x DB calls per view; returning visitors always hit DB
- **Impact**: 2x DB load on high-traffic storefronts
- **Fix**: Use upsert directly; batch analytics writes via queue

#### P-3. Widget Polling Creates Request Storm

- **File**: `web/widgets/src/radius-bundles.ts:534-537,700-715`
- **Issue**: Fetches `/cart.js` every 1.5 seconds + `/cart/update.js` on change
- **Impact**: 40+ requests/minute per customer on storefront
- **Fix**: Debounce to 5+ seconds; use Shopify `cart:updated` events instead

### HIGH

#### P-4. Heavy Dependencies Not Code-Split

- **File**: `web/package.json:45,57`
- **Issue**: `framer-motion` (68KB) + `recharts` (150KB) loaded on every page
- **Impact**: +200KB bundle, +200-400ms LCP
- **Fix**: Dynamic import Recharts on analytics page only; replace Framer with CSS transitions

#### P-5. Over-Fetching Bundle Relations on Dashboard

- **File**: `web/features/bundles/repositories/bundle.fragments.ts:74-77`
- **Issue**: Dashboard list includes `bundleProducts` — only needs count
- **Fix**: Use `_count` without full product include for list views

#### P-6. No Cache Invalidation After Mutations

- **Files**: Multiple action files
- **Issue**: After bundle create/update, React Query cache stays stale for 5 min
- **Fix**: Call `queryClient.invalidateQueries()` after mutations

#### P-7. Barrel File Inefficiency

- **Files**: `web/features/*/index.ts`
- **Issue**: `export *` re-exports everything — limits tree-shaking
- **Fix**: Use explicit named exports

#### P-8. Missing Database Indexes

- **File**: `web/prisma/schema.prisma`
- **Missing**: `(shop, status)`, `(shop, type)`, `(date, bundleId)` on BundleAnalytics
- **Fix**: Add compound indexes for query patterns

### MEDIUM

#### P-9. Memory Leaks in Widget

- **File**: `web/widgets/src/radius-bundles.ts:414-441,443-446`
- **Issues**:
    - `window.fetch` overwritten without storing original — can't restore
    - Event listeners added without `removeEventListener()` in `destroy()`
    - Multiple intervals can accumulate on SPA navigation
- **Fix**: Store original fetch; track listeners; clear all intervals on destroy

#### P-10. CSS Selector Re-querying in Widget

- **File**: `web/widgets/src/radius-bundles.ts:689-693`
- **Issue**: `.querySelector("form#cart")` runs on every banner update — no caching
- **Fix**: Cache form element reference; query once

#### P-11. Metrics Query Runs Every Page Load

- **File**: `web/features/bundles/hooks/data/use-bundles-data.ts:100-108`
- **Issue**: Aggregated SQL query hits full analytics table on every dashboard load
- **Fix**: Cache aggressively (30 min); combine with list query if small

#### P-12. HTTP Cache TTL Too Low

- **File**: `web/app/api/proxy/products/route.ts:59-63`
- **Issue**: Default 300s (5 min) for product data that changes infrequently
- **Fix**: Increase to 3600s; add `stale-while-revalidate=3600`

---

## 5. Rust Discount Function

### CRITICAL

#### R-1. Division by Zero in BXGY Deal Count

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:196-197,230-231`
- **Issue**: `quantity / items_per_deal` — if `buy_qty + get_qty = 0`, function panics
- **Fix**: Guard `if items_per_deal <= 0 { return None; }`

#### R-2. Negative Discount Values Enable Price Increases

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:245-294,605-645`
- **Issue**: No validation that `discount_value >= 0`; negative values create surcharges
- **Risk**: Compromised merchant account or DB injection could charge customers more
- **Fix**: `if bundle_settings.discount_value < 0.0 { return None; }`

#### R-3. Integer Overflow on Large Quantities

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:143-184,546,590`
- **Issue**: `complete_sets * expected_qty` can overflow i32 (2.1B max)
- **Impact**: Debug = panic; Release = wraparound to wrong value
- **Fix**: Use `checked_mul()` and cap to reasonable maximum

#### R-4. Custom Price Uses Only First Reward Product

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:267-279`
- **Issue**: `.first()` on reward_lines — multi-product bundles get wrong discount
- **Example**: Products A($50) + B($30), custom price $35 → only A's price used
- **Fix**: Use average/lowest price, or reject CUSTOM_PRICE for multi-product BXGY

#### R-5. Silent JSON Parse Errors — No Audit Trail

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:344-347,364-368`
- **Issue**: `Err(_) => return Ok(no_discount)` — no logging on parse failure
- **Impact**: Discounts silently fail; merchant has zero visibility
- **Fix**: Add `log!("Failed to parse: {}", e)` before returning

### HIGH

#### R-6. Zero/Negative Expected Quantities Silently Skipped

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:154-184`
- **Issue**: `unwrap_or(&1)` hides missing quantities; 0 values silently reduce deal count
- **Fix**: Validate all product_quantities > 0 before processing

#### R-7. BXGY Uses Unit Price; Non-BXGY Uses Subtotal (Inconsistent)

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:212-213`
- **Issue**: Different pricing basis between bundle types
- **Fix**: Use consistent approach; document if intentional

#### R-8. Quantity Multiplication Overflow (i32)

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:546,590,205`
- **Fix**: Use `checked_mul()` with `i32::try_from()` fallback

#### R-9. No Bundle ID Format Validation from Cart Attributes

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:408-409`
- **Issue**: Untrusted cart attribute used as HashMap key without length/format checks
- **Fix**: Reject empty or >100 char bundle IDs

#### R-10. Free Shipping Always 100% — No Cap

- **File**: `extension/.../cart_delivery_options_discounts_generate_run.rs:226-228`
- **Issue**: Unconditional 100% shipping discount
- **Fix**: Add `max_shipping_discount` configuration

#### R-11. Same-Product Mode Detection Ambiguous

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:117-135`
- **Issue**: `same_product_mode` and `is_same_product` overlap; can double-count deals
- **Fix**: Refactor to explicit enum

#### R-12. Max Discount Cap Switches Type (Percentage → FixedAmount)

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:648-659`
- **Issue**: When max_discount is hit, type silently changes from % to fixed
- **Fix**: Document behavior or implement capped percentage

#### R-13. Missing Null Coalescing in GraphQL Response

- **File**: `extension/.../cart_lines_discounts_generate_run.graphql:24-26`
- **Issue**: If product.id returns null, generated code may panic
- **Fix**: Verify generated schema handles null

### MEDIUM

#### R-14. Zero Expected Quantity Products Silently Skipped (Non-BXGY)

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:469-471`
- **Fix**: Validate at bundle creation time

#### R-15. `main_product_id` Exclusion Is Defensive Only

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:522-529`
- **Fix**: Validate at bundle creation that main_product_id is in product list

#### R-16. Empty `reward_lines` Check Redundant

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:269-275`
- **Status**: Safe — redundant but correct

#### R-17. `cart_total` Variable Name Misleading

- **File**: `extension/.../cart_lines_discounts_generate_run.rs:374-379`
- **Fix**: Add clarifying comment

### Edge Cases Verified Safe

- Empty cart → `Ok(no_discount)` ✓
- Only trigger products, no rewards → `return None` ✓
- Products with zero price → `.max(0.0)` prevents negative discount ✓
- Multiple bundles on same product → `SelectionStrategy::All` handled by Shopify ✓
- Discount exceeds product price → Shopify checkout validates ✓

---

## 6. Webhooks & App Lifecycle

### CRITICAL

#### W-1. App Uninstall Handler Fails Silently (GDPR Risk)

- **File**: `web/features/webhooks/handlers/app-uninstalled.handler.ts:4-17`
- **Issue**: Catch logs error but returns 200 to Shopify — data not deleted
- **Risk**: GDPR violation; customer data retained after uninstall
- **Fix**: Re-throw error so Shopify retries; or queue for manual cleanup

#### W-2. Missing Webhook HMAC Signature Validation

- **File**: `web/app/api/webhooks/route.ts:5-35`
- **Issue**: No explicit HMAC validation (may be handled by Shopify SDK internally — verify)
- **Fix**: Confirm `shopify.webhooks.process()` validates HMAC; if not, add explicit check

### HIGH

#### W-3. No Webhook Idempotency

- **File**: `web/features/webhooks/handlers/orders-create.handler.ts:13-131`
- **Issue**: Duplicate webhook delivery doubles revenue metrics
- **Fix**: Store `x-shopify-webhook-id` in DB; check before processing

#### W-4. Setup Lock Race Condition

- **File**: `web/lib/shopify/auth/verify.ts:102-132`
- **Issue**: Lock claimed before setup completes; if `runAppSetup()` fails, lock remains — next login skips setup
- **Fix**: Claim lock AFTER successful setup, not before

#### W-5. GraphQL Retry Has No Backoff

- **File**: `web/lib/graphql/client/server-action.ts:101-137`
- **Issue**: Single retry on 401; no retry on 5xx; no exponential backoff
- **Fix**: Add 3 retries with backoff [0, 1s, 3s]

#### W-6. Cold-Start Handler Re-registration Race

- **File**: `web/app/api/webhooks/route.ts:12-19`
- **Issue**: Concurrent requests both see missing handlers → double registration
- **Fix**: Use atomic DB flag or distributed lock

#### W-7. Weak CRON_SECRET Validation

- **Files**: `web/app/api/cron/bundle-scheduler/route.ts:15`, `web/app/api/cron/keep-alive/route.ts:12`
- **Issue**: If `CRON_SECRET` is unset, comparison becomes `Bearer undefined`
- **Fix**: Validate CRON_SECRET at startup; reject if missing or looks like shell command

#### W-8. Missing Env Var Validation (Silent Failure)

- **File**: `web/lib/shopify/config/initialize-context.ts:6-9`
- **Issue**: `apiKey: process.env.SHOPIFY_API_KEY || ""` — empty string creates broken client
- **Fix**: Throw on missing critical env vars

### MEDIUM

#### W-9. Cron Job Timeout Risk

- **File**: `web/app/api/cron/bundle-scheduler/route.ts`
- **Issue**: No timeout budget — could exceed Vercel function limits with many shops
- **Fix**: Add time-budget check with checkpoint/resume

#### W-10. No Graceful Degradation for Shopify API Downtime

- **File**: `web/lib/graphql/client/server-action.ts`
- **Issue**: Shopify 5xx → immediate failure; no cached fallback
- **Fix**: Return stale cached data on 5xx; log warning

#### W-11. Keep-Alive Cron May Not Be Configured

- **File**: `web/app/api/cron/keep-alive/route.ts`
- **Issue**: Not listed in vercel.json crons — Neon could suspend on inactivity
- **Fix**: Add to vercel.json cron configuration

#### W-12. Webhook Handler Errors Not Re-thrown

- **Files**: `web/features/webhooks/handlers/*.ts`
- **Issue**: Some handlers catch errors and log without re-throwing — Shopify won't retry
- **Fix**: Re-throw or queue for manual retry

---

## 7. Previously Reported — Revalidated

From the original `CODE_REVIEW_REPORT.md`, these findings were re-checked:

| #   | Original Finding                 | Current Status   | Notes                                               |
| --- | -------------------------------- | ---------------- | --------------------------------------------------- |
| 1   | XSS in GlobalBanner              | **Still exists** | Covered as S-1 above                                |
| 2   | CSP `unsafe-eval`                | **Still exists** | Covered as S-2 above                                |
| 3   | OAuth state not validated        | **INACCURATE**   | App uses Shopify embedded auth, not custom OAuth    |
| 4   | Weak OAuth state generation      | **INACCURATE**   | `generateOAuthState()` doesn't exist in codebase    |
| 5   | Rust unlimited discounts         | **INACCURATE**   | `complete_sets = 1` correctly limits legacy bundles |
| 6   | Rust silent skip on custom price | **Intentional**  | Skipping `discount_needed <= 0` is correct          |
| 7   | `any` types (247)                | **Exists**       | Actual count ~134, not 247                          |
| 8   | Inconsistent error handling      | **Exists**       | Services throw, actions return ApiResponse          |
| 9   | Console statements (247)         | **Exists**       | Actual count higher (~463)                          |
| 10  | CORS wildcard on upload          | **Exists**       | Covered as S-3 above                                |
| 11  | Cron bearer-token only           | **Exists**       | Covered as W-7 above                                |
| 12  | Promise.allSettled unhandled     | **Exists**       | Found in 4 locations (not 1) — covered as D-3       |
| 13  | Session storage no transaction   | **Exists**       | Covered as D-5 above                                |
| 14  | JSON parse crash                 | **Fixed**        | Proper try-catch with fallback                      |
| 15  | CUSTOM_PRICE not handled         | **Fixed**        | Case now handled                                    |
| 16  | HTML escaping missing            | **Exists**       | Field names interpolated without escaping           |
| 17  | Complex useEffect deps           | **Exists**       | 11 dependencies, potential re-render loops          |
| 18  | Excessive logging                | **Minor**        | Reduced to error-only in most places                |
| 19  | Add-to-cart race condition       | **Unclear**      | Can't verify in minified output                     |
| 20  | Empty product_gids bypass        | **Protected**    | `.any()` on empty vec returns false — safe          |

**3 findings removed** (inaccurate), **2 confirmed fixed**, **1 intentional**.

---

## 8. Prioritized Action Plan

### Week 1 — Critical Security & Data Integrity

| Priority | ID  | Action                                            | Effort | Status |
| -------- | --- | ------------------------------------------------- | ------ | ------ |
| 1        | S-1 | Remove `dangerouslySetInnerHTML` or add DOMPurify | 30 min | ✅ Done |
| 2        | S-2 | Remove `unsafe-eval` from CSP script-src          | 15 min | ✅ Done |
| 3        | S-3 | Restrict CORS to Shopify origins                  | 20 min | ✅ Done |
| 4        | W-1 | Fix app-uninstall to re-throw on failure          | 15 min | ✅ Done |
| 5        | R-2 | Add `discount_value >= 0` validation in Rust      | 10 min | ✅ Done |
| 6        | R-1 | Add `items_per_deal > 0` guard in Rust            | 10 min | ✅ Done |
| 7        | R-5 | Add error logging to JSON parse failures in Rust  | 15 min | ✅ Done |
| 8        | D-5 | Wrap session storage in `$transaction`            | 20 min | ✅ Done |

### Week 2 — High Priority Fixes

| Priority | ID  | Action                                           | Effort | Status |
| -------- | --- | ------------------------------------------------ | ------ | ------ |
| 9        | R-3 | Add `checked_mul()` for quantity arithmetic      | 30 min | ✅ Done |
| 10       | R-4 | Fix CUSTOM_PRICE for multi-reward BXGY           | 45 min | ✅ Done |
| 11       | W-3 | Add webhook idempotency via delivery ID          | 2 hr   | ✅ Done |
| 12       | W-4 | Fix setup lock ordering (claim after success)    | 30 min | ✅ Done |
| 13       | D-3 | Inspect Promise.allSettled results (4 locations) | 45 min | ✅ Done |
| 14       | D-4 | Add `@@index([shopId])` to 6 models              | 20 min | ✅ Done |
| 15       | P-1 | Batch GraphQL calls in proxy products route      | 3 hr   | ⬜     |
| 16       | S-4 | Always encrypt tokens; migrate plaintext         | 1 hr   | ⬜     |

### Week 3 — Performance & Operational

| Priority | ID  | Action                                                 | Effort |
| -------- | --- | ------------------------------------------------------ | ------ |
| 17       | P-3 | Reduce widget polling to 5s; use `cart:updated` events | 2 hr   |
| 18       | P-4 | Dynamic import Recharts; replace Framer Motion         | 1 hr   |
| 19       | P-9 | Fix widget memory leaks (fetch, listeners, intervals)  | 2 hr   |
| 20       | W-5 | Add GraphQL retry with exponential backoff             | 1 hr   |
| 21       | A-6 | Replace `cacheTime` → `gcTime` across codebase         | 15 min |
| 22       | P-6 | Add cache invalidation after mutations                 | 1 hr   |
| 23       | W-8 | Throw on missing critical env vars                     | 30 min |
| 24       | D-6 | Fix client-side pagination to DB-level take/skip       | 1 hr   |

### Week 4 — Polish & Hardening

| Priority | ID     | Action                                          | Effort |
| -------- | ------ | ----------------------------------------------- | ------ |
| 25       | R-6-13 | Remaining Rust hardening (validation, docs)     | 3 hr   |
| 26       | A-1    | Replace empty catch blocks with logging         | 30 min |
| 27       | P-5    | Split dashboard list query (no product include) | 1 hr   |
| 28       | D-2    | Add Zod schemas for all JSON fields             | 3 hr   |
| 29       | S-10   | Add rate limiting to proxy routes               | 2 hr   |
| 30       | W-9    | Add cron time-budget with checkpoint            | 1 hr   |

**Total estimated effort**: ~30 hours across 4 weeks

---

_Report generated by Claude Code (Opus 4.6) on 2026-03-09_
_6 parallel audit agents, 699 files analyzed, 83 findings documented_
