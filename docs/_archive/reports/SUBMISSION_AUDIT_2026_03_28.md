# Shopify App Store Submission Audit

**Date:** March 28, 2026
**Auditor:** Claude Opus 4.6 (via Shopify Dev MCP, Sequential Thinking, Context7)
**Source:** [Shopify App Store Requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
**Previous Audit:** `docs/reports/SHOPIFY_APP_STORE_SUBMISSION_AUDIT.md` (pre-security-audit)
**Security Audit:** 5-week audit completed, score 96/100

---

## Verdict: NEAR READY — 1 blocker, 2 high-priority, 0 critical security issues

Compared to previous audit (7 blockers, 12 high, 10 medium), the 5-week security audit resolved most issues. Only REST→GraphQL migration remains as a true blocker.

---

## BLOCKER (Must fix — Shopify will reject)

### B-1. REST Theme API Usage (Requirement 2.2.4)

**File:** `web/features/dashboard/actions/widget-block-status.action.ts`

Since April 1, 2025, all new public apps must use GraphQL Admin API exclusively. This file makes 3 REST calls:

```
Line 29:  GET /admin/api/{version}/themes/{id}/assets.json?asset[key]=...
Line 63:  GET /admin/api/{version}/themes/{id}/assets.json?limit=250
Line 254: GET /admin/api/{version}/themes.json
```

**Purpose:** Detect whether merchant has added the app block/embed to their theme (setup guide step).

**GraphQL Equivalents Available:**
- `themes.json` → `themes` query (list themes by role)
- `assets.json` → `theme(id) { files(filenames: [...]) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } }`

**Fix:** Rewrite `widget-block-status.action.ts` to use GraphQL `themes` and `theme { files }` queries.

**Note:** Shopify's own docs recommend REST Asset API for detecting app blocks, but the requirement for new apps is clear: GraphQL only. The GraphQL `theme.files` query provides equivalent read access.

---

## HIGH PRIORITY (Fix before submission)

### H-1. console.log in Liquid Extension (PII Exposure)

**File:** `extension/extensions/product-bundle-widget/blocks/app-embed.liquid:290`

```liquid
console.log("[RadiusBundles] Customer ID:", window.RadiusBundles.config.customerId);
```

Logs customer ID to browser console on every storefront page load. This:
- Exposes PII to any browser extension or script
- Violates Shopify's data privacy expectations
- Was flagged in the previous audit (item #20) and not yet fixed

**Fix:** Delete this line.

### H-2. Excessive console.log in Production Code

**Stats:** 205 `console.log` occurrences across 46 files.

**Server-side (acceptable for structured logging):**
Most are in webhook handlers, services, and setup code — these are fine for server logs but should ideally use a structured logger.

**Client-side (should remove for production):**

| File | Count | Context |
|---|---|---|
| `features/bundles/hooks/form/use-bundle-submit.ts` | 17 | Form submission debugging |
| `widgets/src/radius-bundles.ts` | 11 | Widget lifecycle |
| `widgets/src/lib/cart.ts` | 8 | Cart operations |
| `features/bundles/hooks/form/use-media-upload.ts` | 5 | Upload progress |
| `shared/hooks/sync/use-cross-tab-sync.ts` | 3 | Tab sync |
| `features/settings/hooks/customizer/use-preview-products.ts` | 3 | Preview |

**Fix:** Remove or guard with `if (process.env.NODE_ENV === 'development')` for client-side logs. Widget logs (`radius-bundles.ts`, `cart.ts`) run on merchant storefronts — these should be completely removed.

---

## PREVIOUSLY BLOCKED — NOW FIXED

These were blockers in the previous audit, all resolved during the 5-week security audit:

| # | Previous Blocker | Fix | Memory Ref |
|---|---|---|---|
| ~~1~~ | GDPR webhooks not registered | Registered via `shopify.app.toml` compliance_topics + handlers in `gdpr.ts` | — |
| ~~2~~ | `customers/data_request` stub | Full implementation: queries BundleView by customerId, compiles data summary | — |
| ~~3~~ | `customers/redact` incomplete | Deletes BundleView by customerId + shop filter, skips aggregated analytics | — |
| ~~4~~ | No HMAC on proxy routes | `verify-proxy.ts`: HMAC-SHA256 verification + rate limiting (100 req/min/shop) | S-10 |
| ~~5~~ | Missing privacy policy/terms | User confirms URLs are ready for Partner Dashboard | — |
| ~~6~~ | Upload size/type validation | 20MB limit before `arrayBuffer()`, matches Shopify MediaImage limit | S-12 |
| ~~7~~ | Deprecated scopes | Removed `read_price_rules`, `write_price_rules`, `write_script_tags`, `read_reports` | — |

---

## REQUIREMENT-BY-REQUIREMENT AUDIT

### 1. Policy

| Req | Description | Status |
|---|---|---|
| 1.1.1 | Session tokens for embedded apps | **PASS** — App Bridge script in `layout.tsx`, `embedded=true` in TOML |
| 1.1.2 | Use Shopify checkout | **PASS** — App doesn't handle checkout |
| 1.2 | Billing API (if paid) | **N/A** — App is free |

### 2. Functionality

| Req | Description | Status |
|---|---|---|
| 2.1.1 | No critical UI errors | **PASS** — Skeleton loading states, error boundaries |
| 2.1.3 | Has merchant UI | **PASS** — Full dashboard, bundle CRUD, analytics, settings |
| 2.2.1 | Uses Shopify APIs | **PASS** — GraphQL Admin API throughout |
| 2.2.2 | Embedded experience | **PASS** — Polaris Web Components + App Bridge |
| 2.2.3 | Latest App Bridge | **PASS** — `cdn.shopify.com/shopifycloud/app-bridge.js` |
| 2.2.4 | GraphQL Admin API only | **FAIL** — REST Theme API in `widget-block-status.action.ts` |
| 2.3.1 | Install from Shopify surface | **PASS** — Standard OAuth flow |
| 2.3.2 | Immediate OAuth after install | **PASS** — Auth route redirects immediately |
| 2.3.3 | Redirect to UI after OAuth | **PASS** — Redirects to embedded app URL |

### 3. Security

| Req | Description | Status |
|---|---|---|
| 3.1.1 | Valid TLS/SSL | **CHECK** — Verify production domain cert is valid |
| 3.2 | Only necessary scopes | **PASS** — Scopes after cleanup: `read_locales`, `read_orders`, `read_products`, `read_themes`, `write_app_proxy`, `write_discounts`, `write_files`, `write_products`, `write_publications` |

**Scope Justification:**

| Scope | Used For |
|---|---|
| `read_locales` | Multi-language support in settings |
| `read_orders` | Order webhooks, future product recommendations |
| `read_products` | Bundle product selection, GraphQL product queries |
| `read_themes` | Widget detection in setup guide |
| `write_app_proxy` | Storefront widget data serving |
| `write_discounts` | Discount function for bundle pricing |
| `write_files` | Bundle image uploads |
| `write_products` | Metafield writes for bundle data on products |
| `write_publications` | Publishing bundles to sales channels |

### 4. App Store Listing

| Req | Description | Status |
|---|---|---|
| 4.1.1 | App name consistency | **CHECK** — Verify Partner Dashboard matches TOML |
| 4.1.2 | App icon uploaded | **CHECK** — Needs 1200x1200 JPEG/PNG |
| 4.2.1 | Accurate pricing info | **CHECK** — Ensure "Free" is clearly stated |
| 4.3 | Install eligibility | **CHECK** — Set in submission form |
| 4.5 | Review preparation | **TODO** — Provide screencast + test credentials |

---

## COMPLIANCE WEBHOOKS (Mandatory)

| Webhook | Subscribed | Handler | Working |
|---|---|---|---|
| `customers/data_request` | `shopify.app.toml` | `gdpr.ts` — Queries BundleView, compiles data | **YES** |
| `customers/redact` | `shopify.app.toml` | `gdpr.ts` — Deletes BundleView by customer+shop | **YES** |
| `shop/redact` | `shopify.app.toml` | `gdpr.ts` → `deleteShopData()` — Full shop cleanup | **YES** |

All compliance webhooks respond to POST with JSON body and verify HMAC via `shopify.webhooks.process()`.

---

## API VERSION ALIGNMENT

| Component | Version | Status |
|---|---|---|
| Webhooks (`shopify.app.toml`) | `2026-01` | **ALIGNED** |
| Theme extension | `2026-01` | **ALIGNED** |
| Discount function | `2026-01` | **ALIGNED** |
| App constants (`SHOPIFY_API_VERSION`) | `January26` | **ALIGNED** |

Previously mismatched (2025-10, 2025-07, 2025-04) — now all aligned on `2026-01`.

---

## SECURITY POSTURE (Post 5-Week Audit)

| Area | Score | Key Fixes |
|---|---|---|
| XSS Prevention | **Strong** | DOMPurify on all `dangerouslySetInnerHTML`, CSP without `unsafe-eval` |
| Injection | **Strong** | `$queryRaw` tagged templates, Zod validation on inputs |
| Authentication | **Strong** | Session tokens, encrypted token storage, HMAC on proxies |
| Data Privacy | **Strong** | GDPR handlers working, rate limiting, customer data redaction |
| Error Handling | **Good** | `logSettledFailures`, webhook retry, GraphQL retry with backoff |
| Performance | **Good** | DB indexes, pagination, batch GraphQL, dynamic imports |

**Remaining from security audit (deferred):**
- 11 MEDIUM items (DRY improvements, minor refactors)
- 12 LOW items (cosmetic, nice-to-have)

None of these are submission blockers.

---

## WHAT YOU'RE DOING RIGHT

- Session tokens via App Bridge (not cookies)
- Polaris Web Components for UI
- Feature-based module architecture
- Zod + DOMPurify input validation pipeline
- Encrypted token storage with auto-encrypt on read
- Webhook idempotency (WebhookDelivery table)
- Cold-start webhook recovery (module-level Promise lock)
- Metafield-as-source-of-truth for Rust discount function
- GraphQL codegen from `.graphql` files
- Skeleton loading states on all pages
- SaveBar on form pages
- NavMenu navigation
- Proxy signature HMAC verification + rate limiting

---

## ACTION ITEMS (Priority Order)

### Must Fix (Blocks Submission)

- [ ] **B-1:** Migrate `widget-block-status.action.ts` from REST Theme API to GraphQL `themes`/`theme { files }` queries

### Should Fix (High Priority)

- [ ] **H-1:** Remove `console.log` from `app-embed.liquid:290` (customer ID PII leak)
- [ ] **H-2:** Remove client-side `console.log` from widget files (`radius-bundles.ts`, `cart.ts`, `fixed-renderer.ts`) and hooks (`use-bundle-submit.ts`, `use-media-upload.ts`)

### Pre-Submission Checklist

- [ ] Verify production domain has valid TLS/SSL certificate
- [ ] Verify app name matches across Partner Dashboard and TOML files
- [ ] Upload app icon (1200x1200 JPEG/PNG)
- [ ] Set pricing to "Free" in Partner Dashboard
- [ ] Add privacy policy URL to listing
- [ ] Add support URL to listing
- [ ] Add emergency contact (email + phone) to Partner account
- [ ] Record screencast demonstrating full app flow
- [ ] Provide test store credentials for reviewers
- [ ] Run `shopify app deploy` to push latest extensions

---

## ESTIMATED EFFORT

| Item | Estimate |
|---|---|
| B-1: REST→GraphQL migration | Medium (rewrite 1 file) |
| H-1: Remove Liquid console.log | Trivial (delete 1 line) |
| H-2: Clean client console.logs | Small (6 files) |
| Partner Dashboard setup | Small (manual, no code) |
| Screencast recording | Medium (manual) |
| **Total code changes** | **~1 day** |

---

_Supersedes: `docs/reports/SHOPIFY_APP_STORE_SUBMISSION_AUDIT.md` (pre-security-audit, 7 blockers)_
_References: Memory entries for security audit weeks 1-5_
