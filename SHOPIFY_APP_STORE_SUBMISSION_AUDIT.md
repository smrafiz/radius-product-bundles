# Shopify App Store Submission Audit

## Verdict: NOT READY — 7 blockers, 12 high-priority, 10 medium-priority issues

---

## BLOCKERS (Must fix or Shopify will reject)

### 1. GDPR Webhooks Not Registered
**`web/lib/shopify/webhooks/register.ts`** — Only registers `APP_UNINSTALLED`, `SHOP_UPDATE`, `ORDERS_CREATE`. The mandatory GDPR handlers (`CUSTOMERS_DATA_REQUEST`, `CUSTOMERS_REDACT`) are defined in `web/lib/shopify/webhooks/gdpr.ts` but **never registered**.

### 2. GDPR `customers/data_request` Is a Stub
**`web/lib/shopify/webhooks/gdpr.ts:45-48`** — Contains only comments explaining what *should* be done. No actual data extraction or delivery. Shopify requires you to compile and deliver customer data within 30 days.

### 3. GDPR `customers/redact` Is Incomplete
**`web/lib/shopify/webhooks/gdpr.ts:91-100`** — Attempts to delete analytics but doesn't filter by `customerId`. Doesn't touch `BundleView` customer/session tracking data.

### 4. No HMAC Verification on App Proxy Routes
**`web/app/api/proxy/analytics/route.ts`** and **`web/app/api/proxy/products/route.ts`** — Accept `shop` parameter from query string with zero signature verification. Any attacker can POST fake analytics or read bundle data by guessing a shop name. Shopify requires HMAC validation on all proxy requests.

### 5. Missing Privacy Policy & Terms of Service
No `/privacy` or `/terms` pages exist. No `privacy_policy_url` or `support_url` in `shopify.app.toml`. Shopify requires these for listing.

### 6. No File Upload Size/Type Validation
**`web/app/api/upload/route.ts:14-28`** — Accepts any file of any size with no validation. Combined with `Access-Control-Allow-Origin: *`, any website can upload arbitrarily large files to your server.

### 7. Deprecated Access Scopes
**`shopify.app.toml:27`** — `read_price_rules`, `write_price_rules`, `write_script_tags` are deprecated. Shopify flags these during review. Remove them since you already use `write_discounts`.

---

## HIGH PRIORITY (Fix before submission)

### 8. No Webhook Idempotency
**`web/app/api/webhooks/route.ts:22-25`** — No deduplication via `X-Shopify-Webhook-Id`. Shopify retries webhooks, causing duplicate order processing, double analytics tracking.

### 9. OAuth State Parameter Not Validated
**`web/app/api/auth/callback/route.ts:15-17`** — Receives `state` but never validates it against the original. Falls back to `crypto.randomUUID()` if missing. No CSRF protection.

### 10. Open CORS on Upload Endpoint
**`web/app/api/upload/route.ts:8`** and **`web/next.config.js:31`** — `Access-Control-Allow-Origin: *` on upload endpoint. Should be restricted to your app domain.

### 11. N+1 GraphQL in Products Proxy
**`web/app/api/proxy/products/route.ts:146-268`** — Makes separate GraphQL call per bundle. 10 bundles = 10 API calls. Should collect all product IDs first, then make one batched request.

### 12. Missing Variant Fields in GetBundleProducts Query
**`web/lib/graphql/schema/queries/products.graphql:84-93`** — Fetches only `id`, `title`, `price`, `compareAtPrice`. Code in `products.operations.ts:56-64` accesses `availableForSale`, `inventoryQuantity`, `selectedOptions`, `inventoryItem`, `sku` — all silently `undefined`.

### 13. Duplicate GraphQL Query Definition
`CheckBundleDiscountExists` defined in both `schema/queries/metafields.graphql:39` and `schema/queries/discounts.graphql:1`. Will cause codegen conflicts.

### 14. Widget Event Listener Memory Leaks
**`web/widgets/src/radius-bundles.ts:426-763`** — Multiple `addEventListener` calls with no `removeEventListener` cleanup. Listeners accumulate on SPA navigation.

### 15. Prisma Singleton Only in Dev
**`web/shared/repositories/prisma-connect.ts:57-59`** — `globalForPrisma.prisma = prisma` only set when `NODE_ENV !== "production"`. In production, each import may create a new Prisma instance, exhausting the connection pool.

### 16. Unbounded Analytics Query
**`web/features/analytics/repositories/bundle-analytics.repository.ts:266-280`** — Fetches ALL bundles then paginates in memory. A shop with 1000+ bundles loads everything into memory.

### 17. `dangerouslySetInnerHTML` Without Sanitization
**`web/shared/components/feedback/banner/global-banner.tsx`** — Uses `dangerouslySetInnerHTML={{ __html: message.content }}`. While `isomorphic-dompurify` is in dependencies, no evidence it's applied before rendering.

### 18. `priceRangeV2` Deprecated
**`web/lib/graphql/schema/fragments/product.graphql:47`** — Deprecated in favor of `priceRange`. Still works as alias but will be removed.

### 19. No Rate Limiting on Public Endpoints
No rate limiting on `/api/proxy/analytics`, `/api/proxy/products`, `/api/upload`, `/api/session/validate`. Only bundle creation has rate limiting (10/hour/shop).

---

## MEDIUM PRIORITY (Should fix)

### 20. Debug `console.log` in Production Liquid
**`extension/extensions/product-bundle-widget/blocks/app-embed.liquid:16-17`** — Dumps all style settings to browser console on every page load.

### 21. API Version Mismatch
App webhooks: `2025-10`, Theme extension: `2025-07`, Discount function: `2025-04`. Should align.

### 22. CSP Allows `unsafe-eval`
**`web/security/csp.ts:12`** — `script-src 'self' 'unsafe-inline' 'unsafe-eval'` provides minimal XSS protection.

### 23. Env Vars Not Validated
**`web/app/api/auth/route.ts:22-26`** — Uses `process.env.SHOPIFY_API_KEY!` with non-null assertions. No startup validation; app crashes silently if env vars are missing.

### 24. No Billing Integration
No Shopify Billing API usage detected. App Store requires clear billing disclosure (free or paid).

### 25. Offline Tokens Stored in Plaintext
**`web/shared/repositories/session-storage.ts:10-32`** — Access tokens stored in PostgreSQL without encryption at rest.

### 26. Missing `<Image>` Component Usage
Multiple locations use `<img>` instead of Next.js `<Image>` — no automatic optimization, lazy loading, or responsive serving.

### 27. Experimental Flag in Config
**`web/next.config.js:22-24`** — `turbopackFileSystemCacheForDev: true` experimental flag shouldn't be in production builds.

### 28. BroadcastChannel Never Closed
**`web/shared/utils/sync/cross-tab-sync.ts:90-96`** — `closeCrossTabSync()` exists but is never called.

### 29. Real Credentials in `.env.example`
**`web/.env.example:1-5`** — Contains what appears to be actual Neon database credentials, not placeholder values.

---

## What You're Doing Right

| Area | Status |
|------|--------|
| Metafield-as-source-of-truth for Rust function | Correct pattern |
| Metafield definitions via `metafieldDefinitionCreate` | Proper setup |
| Cold-start webhook recovery | Smart serverless pattern |
| Metafield batching (25 per mutation) | Respects Shopify limits |
| GraphQL codegen from `.graphql` files | Recommended approach |
| App Bridge + Polaris Web Components | Valid modern approach |
| SaveBar on form pages | Proper UX |
| NavMenu navigation | Compliant |
| Zod + DOMPurify input validation | Good foundation |
| `shop/redact` GDPR handler | Well implemented |
| Skeleton loading states | Good UX on most pages |
| Feature-based module structure | Clean architecture |
| Rust discount function security model | Correct trusted/untrusted split |

---

## Submission Readiness by Category

| Category | Status | Blockers |
|----------|--------|----------|
| GDPR Compliance | FAIL | Handlers unregistered, data_request stub, redact incomplete |
| Security | FAIL | No HMAC on proxy, open CORS, no OAuth state validation |
| Legal | FAIL | No privacy policy or terms |
| Performance | WARN | N+1 queries, memory leaks, unbounded queries |
| UI/UX | PASS | Good patterns, minor gaps in loading/empty states |
| Billing | WARN | No declaration (free vs paid) |
| Webhooks | WARN | No idempotency |
| Accessibility | WARN | Relying on Polaris built-ins, no custom verification |

---

## Fix Priority Order

1. **Register GDPR webhooks** + implement `data_request` and `redact` properly
2. **Add HMAC verification** to all `/api/proxy/*` routes
3. **Create privacy policy + terms pages**, add URLs to `shopify.app.toml`
4. **Add file upload validation** (size limit, MIME type check, restrict CORS)
5. **Remove deprecated scopes** from `shopify.app.toml`
6. **Add webhook idempotency** (track `X-Shopify-Webhook-Id`)
7. **Fix missing variant fields** in `GetBundleProducts` query
8. **Fix Prisma singleton** for production
9. **Batch GraphQL calls** in products proxy route
10. **Remove debug console.log** from Liquid

---

## Work In Progress

Some blockers have been partially addressed:

### Blocker #1 - GDPR Webhooks Registration - FIXED
GDPR webhooks ARE registered via `setupGDPRWebHooks` call in `register.ts`. The handlers in `gdpr.ts` have been improved:
- `CUSTOMERS_DATA_REQUEST`: Now queries `BundleView` records and compiles structured data summary
- `CUSTOMERS_REDACT`: Now deletes only matching `BundleView` records and `Shop` records with proper customer ID filtering
- `SHOP_REDACT`: Enhanced to delete `Shop` records and includes cascade behavior documentation

### Blocker #4 - HMAC Verification on Proxy Routes - FIXED
New verification utility created at `web/lib/shopify/proxy/verify-proxy.ts`:
- `verifyAppProxySignature()`: Implements HMAC-SHA256 verification of App Proxy requests
- `verifyProxyRequest()`: Convenience wrapper to verify + extract shop parameter
- Applied to both `/api/proxy/products` and `/api/proxy/analytics` routes

### Remaining Blockers
- **#2** GDPR data_request handler - FIXED (now functional)
- **#3** GDPR redact handler - FIXED (now properly filters by customer)
- **#5** Missing Privacy Policy & Terms - PENDING
- **#6** No File Upload Validation - PENDING
- **#7** Deprecated Access Scopes - PENDING
