# MASTER AUDIT REPORT — Radius Bundles
**Date:** 2026-03-29
**Audited by:** Multi-agent comprehensive audit (Security + UX + A11y + Perf + Arch + Shopify + Deps)
**Previous score:** 96/100 (security-only)
**This audit scope:** ALL dimensions

---

## EXECUTIVE SUMMARY

| Dimension | Score | Δ Previous | Status |
|-----------|-------|-----------|--------|
| Security | 68/100 | ↓28 | 2 NEW CRITICAL found |
| Accessibility | 42/100 | — | Never audited deeply |
| UX/UI | 72/100 | — | Several gaps |
| Performance | 74/100 | — | Moderate debt |
| Architecture | 76/100 | — | Solid but god components |
| Shopify Compliance | 91/100 | — | 1 blocker remains |
| Dependencies | 98/100 | — | All current, no CVEs |
| Next.js/React | 90/100 | — | Minor pattern gaps |

**Combined weighted score: 76/100**

> ⚠️ The security score dropped because 2 new CRITICAL vulnerabilities (IDOR + timing attack) were discovered that were not caught in the previous audit. These must be fixed before production.

---

## BLOCKERS (Must Fix Before Launch)

### B-1 🔴 IDOR — Cross-Tenant Bundle Access [CRITICAL SECURITY]
**File:** `web/features/bundles/repositories/bundle.queries.ts`
**Severity:** CRITICAL — data breach risk

`findBundleById(id)` has no shop filter. Any authenticated Shopify merchant who knows a bundle ID from another shop can read, and potentially modify/delete it.

```ts
// VULNERABLE — no shop isolation
return client.bundle.findUnique({ where: { id } });

// FIX — always enforce shop
return client.bundle.findFirst({ where: { id, shop } });
```

**Affected functions:** `findBundleById`, `findBundleByIdWithAllRelations`, any mutation services that accept an ID without re-verifying shop ownership.

**Action:** Audit every bundle repo function. Add `shop` as required parameter to all `findBundleById*` variants. Validate in `bundle-mutations.action.ts` that the result's `shop` matches the session shop.

---

### B-2 🔴 Timing Attack on HMAC & Secret Comparison [CRITICAL SECURITY]
**Files:** `web/lib/shopify/proxy/verify-proxy.ts:84`, `web/app/api/cron/bundle-scheduler/route.ts:23`

```ts
// VULNERABLE — string comparison leaks timing info
return computed === signature;
if (authHeader !== `Bearer ${cronSecret}`)

// FIX
import { timingSafeEqual } from "crypto";
return timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
```

---

### B-3 🔴 REST API → GraphQL Migration Required [Shopify Blocker]
**File:** `web/features/dashboard/actions/widget-block-status.action.ts`

3 REST API calls to Shopify Theme Asset API must be migrated to GraphQL (`themes` + `theme { files }` queries) before app store submission.

---

### B-4 🔴 PII in Console Logs [Privacy / Submission Blocker]
**File:** `extension/extensions/product-bundle-widget/assets/app-embed.liquid:290`

```
console.log("[RadiusBundles] Customer ID: ...")
```

Customer IDs in browser console = PII exposure. Remove immediately.

---

### B-5 🔴 205 `console.log` Calls in Client Code [Security / Submission]
**Files:** `radius-bundles.ts`, `cart.ts`, `use-bundle-submit.ts` (+43 other files)

Production builds should have zero console.log. Data visible to any user with DevTools open.

---

## CRITICAL FINDINGS

### SEC-CRIT-1: Session Null Expiry = Immortal Sessions
**File:** `web/shared/utils/shopify/shopify-helpers.ts` (isSessionExpired function)

```ts
// BUG — null expiry = never expires
if (!expires) return false;
// FIX
if (!expires) return true; // treat no expiry as expired
```

---

### SEC-CRIT-2: Product ID Validation Missing in Proxy
**File:** `web/app/api/proxy/products/route.ts`

- `ids` param is user-controlled and not validated for format or count
- No ownership check (can request any shop's product by guessing ID)
- No max-IDs-per-request limit (potential DoS via 10,000 IDs)

```ts
// Add validation:
const productIds = ids.split(",").slice(0, 50).map(id => {
  if (!/^\d+$/.test(id.trim())) throw new Error("Invalid product ID");
  return `gid://shopify/Product/${id.trim()}`;
});
```

---

### SEC-CRIT-3: Analytics Tracking — No bundleId Validation or Cross-Shop Check
**File:** `web/app/api/proxy/analytics/route.ts`

- `bundleId` not validated for format/length
- No check that the bundleId belongs to the requesting shop
- Unlimited event writes possible (DB spam)

---

## HIGH SEVERITY FINDINGS

### SEC-H-1: Rate Limiting Bypass — In-Memory Store
**File:** `web/lib/shopify/proxy/verify-proxy.ts:4-33`

Rate limits are in-memory per Node.js process. Under serverless/multi-instance deployment, each instance has its own counter. An attacker distributes requests across instances to bypass all limits entirely.

**Fix:** Migrate to Redis/Upstash or use Shopify's `storefront-access-token` rate limit headers.

---

### SEC-H-2: Upload Parameter Injection
**File:** `web/app/api/upload/route.ts:100-117`

Array structure validated but individual param `name` and `value` not sanitized. Attacker can inject reserved GCS parameters (`policy`, `signature`, `success_action_redirect`).

**Fix:** Whitelist allowed param names; validate lengths; reject reserved names.

---

### SEC-H-3: Error Info Leakage — Session Validate Route
**File:** `web/app/api/session/validate/route.ts:49-77`

`formatErrorResponse(error)` sends `error.message` and `error.name` to client on 500. Can expose JWT library versions, DB connection details, internal service names.

**Fix:** Return generic `"Internal server error"` to client; log full details server-side.

---

### SEC-H-4: Bundle Mutations — Shop Ownership Not Re-Validated
**Files:** `web/features/bundles/services/bundle-write.service.ts`, `bundle-operation.service.ts`

After the IDOR fix in B-1, verify that all update/delete/duplicate operations also check that `session.shop === bundle.shop` before proceeding, not just passing the ID.

---

### A11Y-H-1: Icon-Only Buttons Everywhere Missing `accessibilityLabel`
**Files:** `bundle-index-filters.tsx`, `bundle-creation-form.tsx`, `bundle-table-empty-states.tsx`

All icon-only buttons must have `accessibilityLabel`. Screen readers announce nothing otherwise.

```html
<!-- WRONG -->
<s-button icon="search" />

<!-- FIX -->
<s-button icon="search" accessibilityLabel="Search bundles" />
```

---

### A11Y-H-2: Modal Missing Focus Trap + Focus Restoration
**File:** `web/shared/components/overlays/modal/modal-host.tsx`

Modal opens without setting initial focus to primary button, and doesn't restore focus to trigger element on close. Keyboard users can tab outside the modal while it's open.

**Fix:** Add `autoFocus` to primary button; implement focus trap via `@radix-ui/react-focus-trap` or equivalent; restore focus on `onHide`.

---

### A11Y-H-3: GlobalBanner Missing `aria-live` Region
**File:** `web/shared/components/feedback/banner/global-banner.tsx:39`

Error/success messages appear but are not announced by screen readers.

```html
<!-- FIX: Add to the banner container -->
<s-stack role="region" aria-live="polite" aria-label="Notifications">
```

---

### A11Y-H-4: Form Validation Errors Not Announced
**File:** `web/shared/components/forms/global-form.tsx:99-115`

Validation errors routed to banner store but no `aria-live` announcement.

---

### A11Y-H-5: Setup Guide Items Not Keyboard Accessible
**File:** `web/features/dashboard/components/dashboard-setup-guide/dashboard-setup-item.tsx:72`

`<div onClick={setExpanded}>` — not keyboard accessible. Must be `<button>`.

```tsx
// FIX
<button
  onClick={() => setExpanded(!expanded)}
  onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
  aria-expanded={expanded}
>
```

---

### A11Y-H-6: Range Slider No ARIA Labels
**File:** `web/shared/components/fields/range-slider/rtpb-range-slider.tsx`

Custom range component missing `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.

---

### A11Y-H-7: WYSIWYG Editor Label Not Associated
**File:** `web/shared/components/fields/editor/editor-wysiwyg.tsx`

`<s-text>Description</s-text>` not connected to the editor via `for`/`aria-labelledby`.

---

### A11Y-H-8: Skip Navigation Link Missing
**File:** `web/shared/components/layout/app-layout-wrapper.tsx`

No skip-to-content link. Keyboard users must tab through the entire navigation on every page load.

```html
<!-- Add as first child of layout -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

### PERF-H-1: God Components — Components >400 Lines
| File | Lines | Impact |
|------|-------|--------|
| `settings/components/settings-tabs/settings-tools.tsx` | 657 | Full re-render on any state change |
| `shared/components/bundle-widget/layouts/widget-compact-grid.tsx` | 634 | |
| `features/bundles/components/bundle-preview/bundle-preview.tsx` | 611 | |
| `features/settings/components/style-customizer/dynamic-customizer-field.tsx` | 595 | |

---

### PERF-H-2: Missing Memoization on Bundle Table
**File:** `web/features/bundles/components/bundle-table/bundle-table.tsx:80-89`

`toggleSelection` callback recreated every render → all `BundleTableRow` components re-render even when their data hasn't changed. With 50+ bundles = constant 10ms+ re-renders.

```ts
// FIX
const toggleSelection = useCallback((id: string) => { ... }, []);
const BundleTableRowMemo = React.memo(BundleTableRow);
```

---

### PERF-H-3: Zustand Over-Broad Subscriptions
Consumers subscribe to entire store object instead of using selectors:

```ts
// BAD — re-renders on any store change
const { bundles, pagination } = useBundleListingStore();

// FIX — only re-render when bundles change
const bundles = useBundleListingStore((state) => state.bundles);
const pagination = useBundleListingStore((state) => state.pagination);
```

---

### ARCH-H-1: God Store — bundle.store.ts (755 lines)
**File:** `web/features/bundles/stores/bundle.store.ts`

Single store manages: form state, media management, product selection, display config, dirty tracking, bulk actions, step management. Violates Single Responsibility, makes testing impossible.

**Recommendation:** Split into:
- `useBundleFormStore` (form data + metadata)
- `useBundleMediaStore` (images + file management)
- `useBundleProductStore` (product picker state)
- `useBundleValidationStore` (validation + dirty tracking)

---

## MEDIUM SEVERITY FINDINGS

### SEC-M-1: Prisma Error Messages Leaked to Client
**File:** `web/shared/utils/error/error-handlers.ts`

`error.message` from Prisma (e.g., "Unique constraint failed on field: `Bundle_name_shop_key`") returned to API clients, leaking DB schema.

---

### SEC-M-2: Client-Provided Timestamps Trusted
**File:** `web/app/api/proxy/analytics/route.ts:62`

```ts
timestamp: data.timestamp || new Date().toISOString()
```

Client can backdate analytics events. Server should always generate the timestamp.

---

### SEC-M-3: Webhook Idempotency Race Condition
**File:** `web/app/api/webhooks/route.ts:56-62`

Two concurrent identical webhooks can both pass the idempotency check before either inserts the deduplication record. The silent `.catch(() => {})` hides failures.

**Fix:** Use DB `ON CONFLICT DO NOTHING` or distributed lock.

---

### A11Y-M-1: No `prefers-reduced-motion` Support
Widget and skeleton animations don't respect user's system motion preference.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

### A11Y-M-2: Modal Date Picker No `aria-label`
**File:** `web/shared/components/overlays/modal/modal-host.tsx:147`

`<s-date-picker type="range">` missing accessible label for screen readers.

---

### A11Y-M-3: Drag-and-Drop Not Keyboard Accessible
**File:** `web/features/bundles/components/bundle-creation/steps/products/product-list.tsx`

Drag handles via `useSortable()` without keyboard equivalents (no up/down arrow key support, no `aria-grabbed` state).

---

### A11Y-M-4: Color Contrast — Completed Step Text
**File:** `web/features/dashboard/components/dashboard-setup-guide/dashboard-setup-item.tsx`

`text-[#8a8a8a]` on light background may fail 4.5:1 WCAG AA contrast ratio.

---

### PERF-M-1: Suspense Boundaries — No Fallback UI
**File:** `web/app/layout.tsx:42`

```tsx
<Suspense> {/* No fallback! */}
```

If `I18nLoader` suspends, the screen is blank. Add a loading spinner fallback.

---

### PERF-M-2: React Query Config Inconsistent Across Features
- Bundles: `staleTime: 5 min`
- Analytics: `staleTime: 2 min`
- No `refetchOnWindowFocus: "stale"` — data goes stale but won't refresh when user returns to tab

---

### ARCH-M-1: Feature Coupling Violations
- `features/bundles/` imports from `features/analytics/` — should be in `shared/`
- `features/settings/` imports `BundleType` from `features/bundles/` — should be in `shared/types/`

---

### ARCH-M-2: Missing Per-Feature Error Boundaries
Only one global error boundary at `app/error.tsx`. A crash in Analytics takes down the entire dashboard.

**Fix:** Add `error.tsx` at each route segment:
- `app/(dashboard)/analytics/error.tsx`
- `app/(dashboard)/bundles/error.tsx`
- `app/(dashboard)/settings/error.tsx`

---

### ARCH-M-3: TypeScript `any` Usage
**File:** `web/features/analytics/repositories/bundle-analytics.repository.ts:298`

```ts
const bundleWhereClause: any = { shop };
// FIX
const bundleWhereClause: Prisma.BundleWhereInput = { shop };
```

---

### SHOPIFY-M-1: CORS on /api/upload Still `*`
**File:** `web/next.config.js`

The CORS header for `/api/upload` was noted as needing restriction to `admin.shopify.com` but may still be `*`. Verify and restrict.

---

### SHOPIFY-M-2: Error Banners Auto-Dismiss (BFS Requirement)
Built for Shopify requires error banners to be persistent (non-auto-dismissing). Current implementation auto-hides all banners including errors.

---

### UX-M-1: No `not-found.tsx` or `global-error.tsx`
- Missing custom 404 page (`app/not-found.tsx`)
- Missing root-level error page (`app/global-error.tsx`)
- Current `app/error.tsx` renders null (blank screen)

---

### UX-M-2: Form Success Feedback Missing
**File:** `web/shared/components/forms/global-form.tsx`

Form submissions show loading overlay but no explicit success message after save. Users don't know if action completed.

---

### UX-M-3: Bundle Type Selection Lacks Group Semantic
**File:** `web/features/bundles/components/bundle-type-selection/bundle-type-selection.tsx`

Bundle type cards presented as visual grid without `role="radiogroup"` structure. Not obvious to screen readers which option is selected.

---

## LOW SEVERITY FINDINGS

### SEC-L-1: Verbose Error Logging to Console (46 files)
Production code should not log internal error details to console (visible in DevTools). Use structured server-side logging instead.

---

### A11Y-L-1: Skeleton Loading Not Announced
Skeletons animate without `aria-busy="true"` or `aria-label="Loading"`. Screen readers experience silence.

---

### A11Y-L-2: Loading Spinners Missing `aria-label`
`<s-spinner>` used without `aria-label` or `accessibility-label`.

---

### PERF-L-1: `callTriggerSaveBar()` Not Debounced
**File:** `web/features/bundles/stores/bundle.store.ts`

Fires on every single store mutation. Rapid updates (e.g., typing in a field) dispatch dozens of custom events per second. Add 100ms debounce.

---

### PERF-L-2: No Bundle Size Analysis in CI
No `@next/bundle-analyzer` configured. Large dependencies could be added without detection.

---

### ARCH-L-1: Test Coverage Minimal
Only 4 test files in entire codebase. No integration tests. No E2E tests. No Lighthouse CI.

---

### SHOPIFY-L-1: API Version Check
- Configured: `2026-01` ✅
- Previous compliance report referenced `2025-10` — confirm all codegen outputs also use `2026-01`

---

### SHOPIFY-L-2: Shopify Native Bundle Primitives (BFS 5.10.1)
Built for Shopify certification requires apps in the "Product Bundles" category to use native Shopify bundle APIs (`productBundleCreate`). Current implementation uses custom Prisma + Rust function + metafields.

**Decision needed:** Adopt native APIs (high effort, BFS path) vs. document exception (risky, may be rejected).

---

## DEPENDENCIES SUMMARY

### All Current — No CVEs Found ✅

| Package | Version | Status |
|---------|---------|--------|
| next | 16.2.1 | ✅ |
| react | 19.2.4 | ✅ |
| @shopify/shopify-api | 13.0.0 | ✅ |
| @shopify/app-bridge-react | 4.2.10 | ✅ |
| prisma | 7.6.0 | ✅ |
| @tanstack/react-query | 5.95.2 | ✅ |
| zustand | 5.0.12 | ✅ |
| zod | 4.3.6 | ✅ |
| isomorphic-dompurify | 3.7.1 | ✅ |

**Rust:** `shopify_function 2.0.2` — current, no CVEs.

**To monitor:**
- Next.js 16 security updates (6-month cadence)
- @shopify/shopify-api 14.x when released

---

## PRIORITIZED REMEDIATION PLAN

### Sprint 1 — Ship Blockers (This Week)
| # | Issue | File | Effort |
|---|-------|------|--------|
| 1 | IDOR fix: add shop filter to all findBundle queries | bundle.queries.ts | M |
| 2 | Timing safe equal for HMAC + cron | verify-proxy.ts, cron/route.ts | S |
| 3 | REST→GraphQL migration (widget-block-status) | widget-block-status.action.ts | M |
| 4 | Remove customer PII console.log | app-embed.liquid:290 | S |
| 5 | Remove all 205 console.logs in production code | 46 files | M |
| 6 | Fix isSessionExpired null check | shopify-helpers.ts | S |

### Sprint 2 — Security Hardening (Next Week)
| # | Issue | File | Effort |
|---|-------|------|--------|
| 7 | Validate product IDs in proxy (format + count limit) | proxy/products/route.ts | S |
| 8 | Validate bundleId in analytics proxy + shop check | proxy/analytics/route.ts | S |
| 9 | Whitelist upload param names | upload/route.ts | S |
| 10 | Return generic errors from session validate | session/validate/route.ts | S |
| 11 | Map Prisma errors to generic messages | error-handlers.ts | S |
| 12 | Server-side timestamp in analytics | proxy/analytics/route.ts | S |
| 13 | Shop ownership check in all bundle mutations | bundle services | M |

### Sprint 3 — Accessibility Critical (Next 2 Weeks)
| # | Issue | File | Effort |
|---|-------|------|--------|
| 14 | Add accessibilityLabel to all icon-only buttons | bundle-table, creation-form | M |
| 15 | Focus trap + focus restoration in modal | modal-host.tsx | M |
| 16 | aria-live on GlobalBanner | global-banner.tsx | S |
| 17 | aria-live on form validation errors | global-form.tsx | S |
| 18 | Fix setup guide items to be keyboard accessible | dashboard-setup-item.tsx | S |
| 19 | ARIA labels on range slider | rtpb-range-slider.tsx | S |
| 20 | Associate WYSIWYG editor label | editor-wysiwyg.tsx | S |
| 21 | Add skip navigation link | app-layout-wrapper.tsx | S |

### Sprint 4 — UX + App Store Polish
| # | Issue | File | Effort |
|---|-------|------|--------|
| 22 | Create not-found.tsx | app/ | S |
| 23 | Create global-error.tsx | app/ | S |
| 24 | Fix error.tsx (render UI, not null) | app/error.tsx | S |
| 25 | Make error banners non-auto-dismissing | global-banner.tsx | S |
| 26 | Add form success feedback messages | global-form.tsx | S |
| 27 | Add prefers-reduced-motion CSS | globals.css | S |
| 28 | Install eslint-plugin-jsx-a11y | package.json | S |
| 29 | Verify CORS restriction on /api/upload | next.config.js | S |

### Sprint 5 — Performance Optimizations
| # | Issue | File | Effort |
|---|-------|------|--------|
| 30 | Memoize BundleTableRow + useCallback for toggleSelection | bundle-table.tsx | S |
| 31 | Zustand selector pattern on all stores | All store consumers | M |
| 32 | Debounce callTriggerSaveBar | bundle.store.ts | S |
| 33 | Add Suspense fallback to layout | app/layout.tsx | S |
| 34 | Standardize React Query staleTime across features | *.queries.ts | S |
| 35 | Add per-feature error boundaries | app/(dashboard)/*/error.tsx | M |

### Sprint 6 — Architecture Cleanup
| # | Issue | File | Effort |
|---|-------|------|--------|
| 36 | Break settings-tools.tsx into subcomponents | settings-tools.tsx | L |
| 37 | Split bundle.store.ts into 4 focused stores | bundle.store.ts | L |
| 38 | Move cross-feature types to shared/types | features/ → shared/ | M |
| 39 | Add Prisma types (remove `any`) | bundle-analytics.repository.ts | S |
| 40 | Add @next/bundle-analyzer to CI | package.json, CI config | S |

---

## COMPLIANCE STATUS

### Shopify App Store Requirements
| Requirement | Status |
|-------------|--------|
| OAuth 2.0 | ✅ |
| Webhook HMAC | ✅ |
| GDPR handlers | ✅ |
| App Bridge v4 | ✅ |
| No write_orders scope | ✅ |
| Privacy policy URL | ❌ Missing |
| REST→GraphQL migration | ❌ Blocker |
| No PII in console | ❌ Blocker |

### WCAG 2.1 AA (Estimated)
Current estimated compliance: **~55%** (based on critical failures in focus management, ARIA labels, live regions)

### Built for Shopify (BFS)
| Requirement | Status |
|-------------|--------|
| App Bridge v4 | ✅ |
| Non-dismissing error banners | ❌ |
| Native bundle primitives | ❓ Architecture decision |
| LCP ≤ 2.5s | ❓ Unverified |
| CLS ≤ 0.1 | ❓ Unverified |

---

## WHAT'S WORKING WELL ✅

1. **Database security** — Prisma ORM prevents SQL injection; AES-256-GCM token encryption
2. **Webhook security** — HMAC validation + idempotency table + retry handling
3. **XSS protection** — DOMPurify on all `dangerouslySetInnerHTML`
4. **GDPR** — All 3 required handlers implemented
5. **Dependency health** — All current, no known CVEs
6. **Database queries** — Excellent raw SQL aggregation in analytics (eliminates 5 round-trips)
7. **Feature architecture** — Clean feature-based module structure
8. **TypeScript** — Strict mode enabled throughout
9. **Caching** — Next.js 16 cache components properly configured
10. **Rust function** — Safe arithmetic, overflow protection, input validation

---

## REPORT METADATA

- **Audit tools used:** Sequential Thinking MCP, Shopify Dev MCP, Context7, codebase exploration
- **Files analyzed:** ~85 source files
- **Existing reports reviewed:** 5 (UX-UI, Shopify Compliance, Submission 2026-03-28, Security + Submission, Built for Shopify Guide)
- **New findings:** 2 CRITICAL, 15+ HIGH, 20+ MEDIUM not previously identified
- **Report location:** `.claudedocs/reports/MASTER-AUDIT-2026-03-29.md`
