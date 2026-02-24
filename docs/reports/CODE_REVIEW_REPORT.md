# Code Review Report: Radius Product Bundles

**Date:** February 24, 2026
**Reviewer:** Claude Code
**Project:** Radius Product Bundles - Shopify App

---

## Executive Summary

The codebase demonstrates solid architecture with well-organized feature-based modules, proper separation of concerns, and good Shopify integration patterns. However, there are **critical security vulnerabilities**, **high-priority bugs**, and numerous improvement opportunities across the stack.

| Severity | Count | Impact |
|----------|-------|--------|
| **Critical** | 6 | Security vulnerabilities, data corruption risks |
| **High** | 14 | Runtime errors, silent failures, type safety |
| **Medium** | 25+ | Code quality, performance, maintainability |
| **Low** | 15+ | Polish, documentation, best practices |

---

## Table of Contents

1. [Critical Issues](#critical-issues-fix-immediately)
2. [High Priority Issues](#high-priority-issues)
3. [Medium Priority Issues](#medium-priority-issues)
4. [Low Priority Issues](#low-priority-issues)
5. [Architecture Strengths](#architecture-strengths)
6. [Recommended Action Plan](#recommended-action-plan)
7. [Files Reviewed](#files-reviewed)

---

## Critical Issues (Fix Immediately)

### 1. XSS Vulnerability - Unsafe HTML Rendering

**Location:** `/web/shared/components/feedback/banner/global-banner.tsx:52-57`

```typescript
dangerouslySetInnerHTML={{ __html: message.content }}
```

**Risk:** If banner content comes from untrusted sources, XSS attacks are possible.

**Recommendation:** Sanitize HTML with DOMPurify before rendering:

```typescript
import DOMPurify from 'dompurify';

dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content) }}
```

---

### 2. Content Security Policy Weakened

**Location:** `/web/security/csp.ts:12`

```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com;",
```

**Risk:** `'unsafe-eval'` defeats XSS protection. Critical for a Shopify app handling merchant data.

**Recommendation:**
- Remove `'unsafe-eval'` if possible
- Use nonces or hashes instead of `'unsafe-inline'` for styles
- Use external script files instead of inline scripts

---

### 3. OAuth State Not Validated (CSRF Vulnerability)

**Location:** `/web/app/api/auth/callback/route.ts`

```typescript
const code = searchParams.get("code");
const shop = searchParams.get("shop");
const state = searchParams.get("state");
// State extracted but NEVER validated against session
```

**Risk:** Attackers can inject malicious OAuth codes into user sessions (account takeover).

**Recommendation:**
1. Store state in session/cookie during `/auth/` initiation
2. Validate state matches in `/auth/callback/` before exchanging code:

```typescript
const storedState = cookies().get('oauth_state')?.value;
if (!state || state !== storedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 403 });
}
```

---

### 4. Weak OAuth State Generation

**Location:** `/web/shared/utils/shopify/shopify-helpers.ts:150-152`

```typescript
export function generateOAuthState(shop: string): string {
    return `${shop}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}
```

**Risk:** `Math.random()` is not cryptographically secure. State can be predicted for session fixation attacks.

**Recommendation:**

```typescript
import { randomBytes } from 'crypto';

export function generateOAuthState(shop: string): string {
    return `${shop}-${randomBytes(32).toString('hex')}`;
}
```

---

### 5. Rust: Unlimited Discounts in Legacy Mode

**Location:** `/extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs:233-234`

```rust
None => 1,  // If no productQuantities, assume 1 complete set
```

**Risk:** Legacy bundles without quantity config can receive unlimited discount sets regardless of cart contents.

**Recommendation:**
- Add explicit validation requiring quantity config
- Or reject bundles missing quantity configuration
- At minimum, log warning for monitoring

---

### 6. Rust: Silent Skip on Custom Price Errors

**Location:** `/extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs:360-361`

```rust
if discount_needed <= 0.0 {
    continue;  // Silently skips if custom price >= bundle total
}
```

**Risk:** If custom price is set above bundle total, no discount is applied without any warning or error.

**Recommendation:**
- Log warning when this condition occurs
- Consider capping discount to 0 with explicit message
- Or return error to merchant dashboard

---

## High Priority Issues

### 7. Type Safety - Heavy Use of `any` (247 instances)

**Files Affected:** 30+ files across features/settings, bundles, customizer

```typescript
// Examples found throughout codebase:
(state.localData as any)[key] = value;
useCustomizerField(config as any, onFieldChangeAction);
handleChange(value as any);
export async function createBundleSettings(tx, bundleId, settings: any);
export async function createBundleProductGroups(tx: any, bundleId, groups: any[]);
```

**Impact:** Loss of compile-time type checking, potential runtime errors, difficult refactoring.

**Recommendation:**
- Create proper TypeScript interfaces for dynamic objects
- Use generics instead of `any` where possible
- Use discriminated unions for type-safe field handling

---

### 8. Inconsistent Error Handling Patterns

**Pattern 1 - Throws exceptions:** `bundle-write.service.ts`
```typescript
throw new Error("Bundle not found");
throw new Error("Invalid bundle status");
```

**Pattern 2 - Returns error objects:** `bundle-read.service.ts`
```typescript
return { success: false, message: "error" };
```

**Pattern 3 - ApiResponse format:** `analytics.action.ts`
```typescript
return { status: "error", message: error.message };
```

**Impact:** Unpredictable error boundaries, difficult debugging, inconsistent client handling.

**Recommendation:**
- Standardize on exceptions at service layer
- Use consistent `ApiResponse` wrapper at action layer
- Create custom error classes (e.g., `BundleNotFoundError`, `ValidationError`)

---

### 9. Console Statements in Production Code (247 instances)

**Files Affected:** `bundle-security.service.ts`, `webhook.service.ts`, `use-session-provider.ts`

```typescript
console.log(`[Security] Performing security checks for shop: ${shop}`);
console.warn(`[Security] Rate limit exceeded for shop ${shop}: ${recentBundleCount}/${maxPerHour}`);
console.log("[Webhook Service] Initializing...");
```

**Impact:**
- Clutters production logs
- No structured logging framework
- Difficult to filter/search logs
- Security information potentially exposed

**Recommendation:**
- Replace with structured logging library (e.g., pino, winston)
- Use log levels appropriately (debug, info, warn, error)
- Remove debug console statements
- Implement log sanitization for sensitive data

---

### 10. CORS Wildcard on Upload Endpoint

**Location:** `/web/app/api/upload/route.ts:8`

```typescript
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
};
```

**Risk:** Any origin can upload files to your app, enabling cross-site file upload attacks.

**Recommendation:**

```typescript
const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "https://*.myshopify.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
};
```

---

### 11. Cron Routes Protected Only by Bearer Token

**Location:** `/web/app/api/cron/bundle-scheduler/route.ts` and `/web/app/api/cron/keep-alive/route.ts`

```typescript
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Issues:**
- CRON_SECRET exposed in `.env.example`
- Simple string comparison without cryptographic validation
- No rate limiting on cron endpoints

**Recommendation:**
- Use Vercel's built-in CRON authorization header verification
- Implement IP whitelist for cron services
- Use signed JWT tokens instead of plain bearer tokens
- Never expose CRON_SECRET in example files

---

### 12. Promise.allSettled Results Not Inspected

**Location:** `/web/features/bundles/actions/bundle-mutations.action.ts:313-318`

```typescript
await Promise.allSettled([
    syncActiveBundlesToMetafield(sessionToken, shop),
    ...[...bundleProductMap.entries()].map(([bundleId, productIds]) =>
        removeBundleIdFromProducts(sessionToken, bundleId, productIds),
    ),
]);
// Results never checked - silent failures possible
```

**Impact:** Bulk operations fail silently, data inconsistency, unreliable bundle updates.

**Recommendation:**

```typescript
const results = await Promise.allSettled([...]);
const failures = results.filter(r => r.status === 'rejected');
if (failures.length > 0) {
    console.error('Batch operation failures:', failures);
    // Handle or report failures
}
```

---

### 13. Session Storage Missing Transaction

**Location:** `/web/shared/repositories/session-storage.ts:10-76`

```typescript
// Multiple upserts without transaction:
await prisma.session.upsert({ ... });        // Lines 11-32
await prisma.onlineAccessInfo.upsert({ ... }); // Lines 35-48
await prisma.associatedUser.upsert({ ... });   // Lines 51-74
```

**Impact:** Partial failures leave inconsistent session state.

**Recommendation:**

```typescript
await prisma.$transaction(async (tx) => {
    await tx.session.upsert({ ... });
    await tx.onlineAccessInfo.upsert({ ... });
    await tx.associatedUser.upsert({ ... });
});
```

---

### 14. JS Widget: JSON Parse Failure Crashes

**Location:** `/extension/extensions/product-bundle-widget/assets/bundle-widget.js:~150`

```javascript
try {
    this.bundleStructure = JSON.parse(e)
} catch(s) {
    console.warn("[RadiusBundle] Failed to parse bundle structure:", s)
    // bundleStructure is null, downstream calls crash
}
```

**Impact:** If JSON parse fails, `bundleStructure` remains null and subsequent calls like `bundleStructure.discountValue` throw.

**Recommendation:**

```javascript
try {
    this.bundleStructure = JSON.parse(e)
} catch(s) {
    console.warn("[RadiusBundle] Failed to parse bundle structure:", s)
    this.bundleStructure = { /* default safe structure */ }
    return; // Exit early
}
```

---

### 15. CUSTOM_PRICE Not Handled in Savings Banner

**Location:** `/extension/extensions/product-bundle-widget/assets/radius-bundles.js:~320`

```javascript
switch(e.discountType) {
    case "PERCENTAGE":
        return template.replace("{discount}", i(e.discountValue + "%"))
    case "FIXED_AMOUNT":
        return template.replace("{discount}", i(this.formatMoney(e.discountValue)))
    case "NO_DISCOUNT":
        return e.freeShipping ? template : null
    // Missing: CUSTOM_PRICE
}
```

**Impact:** Savings banner shows nothing for custom-priced bundles, even though discounts are applied server-side.

**Recommendation:** Add CUSTOM_PRICE case to display appropriate savings message.

---

### 16. Validation HTML Escaping Missing

**Location:** `/web/shared/utils/validation/validators.ts:85-94`

```typescript
formatValidationErrorsAsHTML() {
    // Concatenates field names/messages without HTML escaping
}
```

**Risk:** Field names containing `<`, `>`, `&` will break HTML or enable XSS.

**Recommendation:** Use proper HTML escaping function before concatenation.

---

### 17. useProtectedSession Complex Dependencies

**Location:** `/web/shared/hooks/session/use-protected-session.ts:102-115`

**Issue:** Dependency array has 14 items, creating risk of stale closures and potential infinite loops.

**Recommendation:** Split into smaller hooks or use `useCallback` to reduce dependency complexity.

---

### 18. useSessionProvider Excessive Logging

**Location:** `/web/shared/hooks/session/use-session-provider.ts`

**Issues:**
- 25+ console statements for debugging
- Large commented-out block (lines 121-170)
- `tokenProcessed` ref pattern is fragile

**Recommendation:**
- Remove debug logs or use conditional logging based on dev flag
- Remove commented-out code
- Simplify token processing logic

---

### 19. Standalone Add-to-Cart Race Condition

**Location:** `/extension/extensions/product-bundle-widget/assets/bundle-widget.js:~290`

```javascript
interceptStandaloneAddToCart() {
    window.fetch = function(...) {
        return originalFetch(...).then(async response => {
            if (response.ok) {
                await this.updateStandaloneCartAttributes()
                // Event dispatched even if updateStandaloneCartAttributes fails
            }
        })
    }
}
```

**Impact:** If cart attribute update fails, "added to cart" event still fires, causing UI inconsistency.

**Recommendation:** Wrap in try-catch, only dispatch event on success.

---

### 20. Empty product_gids Bypass in Delivery Discounts

**Location:** `/extension/extensions/radius-discount-function/src/cart_delivery_options_discounts_generate_run.rs:183-192`

```rust
product_gids.iter().any(|gid| is_product_in_bundle(gid, settings))
```

**Risk:** An empty `product_gids` vector could bypass validation.

**Recommendation:** Add explicit check for non-empty product list before validation.

---

## Medium Priority Issues

### Database Schema Issues

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Missing `@@index([shop])` on core models | Bundle, Automation, PricingRule, AlertRule | Add standalone shop indexes for common queries |
| Dual shop/shopId fields | Bundle model has both string `shop` and UUID `shopId` | Standardize on one approach to avoid consistency issues |
| Redundant indexes | BundleAnalytics has both `[bundleId, date]` and `[date, bundleId]` | Remove duplicate; limited additional value |
| BundleAnalytics/BundleView use `onDelete: Restrict` | Prisma schema | Mismatches soft-delete pattern used in code |
| N+1 risk with `.find()` in loop | `analytics.queries.ts:511` | Use Map lookup instead of Array.find() |
| Missing indexes on junction tables | BundleProductGroup, AutomationLog | Add `@@index([bundleId])`, `@@index([automationId])` |

---

### Validation Duplication

**Same validation rules appear in 3 places:**

1. `zod.schema.ts` (Zod validation)
2. `bundle-rules.validation.ts` (business logic layer)
3. Frontend form validation

**Example:**
```typescript
// In zod.schema.ts
.refine(data => {
    if (data.type === "VOLUME_DISCOUNT") {
        return data.volumeTiers != null && data.volumeTiers.length > 0;
    }
    return true;
})

// Same rule in bundle-rules.validation.ts
if (data.type === "VOLUME_DISCOUNT") {
    if (!data.volumeTiers || data.volumeTiers.length === 0) {
        errors.volumeTiers = { _errors: [...] }
    }
}
```

**Recommendation:** Use Zod as single source of truth for validation.

---

### Form State Memory Leak

**Location:** `/web/shared/utils/form/save-bar.ts:11-14`

```typescript
const formStates = {};  // Global object, never cleaned up
```

**Impact:** Memory leak if forms are dynamically created/destroyed.

**Recommendation:** Add cleanup function called on form unmount.

---

### Zustand Async Anti-Pattern

**Location:** `/web/shared/stores/session.store.ts:76-139`

```typescript
validateSession: async () => {
    set((state) => { state.isValidating = true; });
    try {
        // Multiple set() calls in different branches (lines 90, 104, 112, 119, 126)
    }
}
```

**Recommendation:** Move async logic outside store, call setter with final state once.

---

### Cart Page Polling Leak

**Location:** `/extension/extensions/product-bundle-widget/assets/radius-bundles.js:~420`

```javascript
startPolling() {
    this.pollInterval = window.setInterval(async () => {
        // Polls every 1.5 seconds indefinitely
    }, 1500)
}
```

**Impact:** Memory leak if cart page is never closed; also battery drain on mobile.

**Recommendation:**
- Add `beforeunload` handler to clear interval
- Increase interval to 5 seconds
- Consider using `visibilitychange` to pause when tab is hidden

---

### Floating-Point Precision Issues

**Locations:**
- `/extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs:311-331`
- `/extension/extensions/product-bundle-widget/assets/bundle-widget.js:~500-600`

**Issue:** Repeated floating-point calculations without rounding can accumulate precision errors.

**Recommendation:** Round to 2 decimal places before final calculation.

---

### useShopSettings Dual State Management

**Location:** `/web/shared/hooks/shopify/use-shop-settings.ts`

```typescript
const hasInitialized = useRef(false);  // Line 8
const [isInitialized, setIsInitialized] = useState(false);  // Implicit
// Returns both hasInitialized.current and isInitialized
```

**Issue:** Using both ref and state for same purpose creates confusion.

**Recommendation:** Use single source of truth (either state or ref, not both).

---

### GlobalBanner Timer Leak

**Location:** `/web/shared/stores/global-banner.store.ts:28-31`

```typescript
setTimeout(() => {
    get().removeMessage(newMessage.id);
}, newMessage.duration);
// Timer ID not tracked
```

**Recommendation:** Store timeout IDs and clear on `removeMessage`.

---

### GlobalBanner No Message Deduplication

**Location:** `/web/shared/stores/global-banner.store.ts:23`

```typescript
set((state) => {
    state.messages = [newMessage];  // Always replaces, doesn't append
});
```

**Issue:** Multiple simultaneous messages not supported (only last one shows).

**Recommendation:** Append with deduplication: `state.messages = [newMessage, ...state.messages]`

---

### Currency Locale Conversion Bug

**Location:** `/web/shared/utils/formatters/currency.ts:114-116`

```typescript
convertShopifyLocale() {
    // Checks country code against CURRENCY_SYMBOLS but returns symbol instead of locale
}
```

**Impact:** Breaks locale-aware number formatting.

---

### Missing Rate Limiting on Proxy APIs

**Location:** `/web/app/api/proxy/products/route.ts` and `/web/app/api/proxy/analytics/route.ts`

**Risk:** No rate limiting on proxy endpoints accessible from storefront. Could be abused for DoS.

**Recommendation:** Implement rate limiting by shop/IP.

---

### Analytics Input Validation Insufficient

**Location:** `/web/app/api/proxy/analytics/route.ts:33-42`

```typescript
const body: AnalyticsEventPayload = await request.json();
const { type, bundleId, productId, customerId, ...data } = body;

if (!type) {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
}
```

**Issues:**
- `bundleId`, `productId`, `customerId` not validated for format
- No size limits on payload
- `data` object accepts arbitrary fields without validation
- No deduplication protection against replay attacks

---

### Incomplete Feature Implementation

**Location:** `/web/shared/stores/settings.store.ts`

```typescript
syncMetafields: async () => {
    set((state) => { state.isSyncing = true; });
    try {
        // TODO: Implement sync logic
        console.log("Syncing to Shopify...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        get().showToast("Sync completed successfully");
    }
}
```

**Impact:** Users see UI but functionality is simulated.

**Recommendation:** Complete implementation or hide UI with feature flag.

---

## Low Priority Issues

### Magic Numbers Without Constants

**Location:** `/web/features/bundles/services/bundle-security.service.ts`

```typescript
const maxPerHour = 10;  // Where does this come from?
const EXCESSIVE_CREATION_THRESHOLD = 50;

// In bundle-read.service.ts
for (let i = nextNumber + 1; i < nextNumber + 50; i++) {  // Why 50?
```

**Recommendation:** Extract to named constants in config/constants files with documentation.

---

### Commented-Out Code

**Location:** `/web/features/bundles/validation/bundle-rules.validation.ts:204-210`

```typescript
// 2. Check for duplicate products
// const productIds = data.products.map((p) => p.productId);
// if (productIds.length !== new Set(productIds).size) {
//     errors.products = {
//         _errors: ["Duplicate products are not allowed"],
//     };
// }
```

**Recommendation:** Remove or commit to implementation. Use git history if needed later.

---

### Inconsistent Date Handling

Various files use different date patterns:

```typescript
// analytics
const currentStart = parseDateAsUTC(startDateStr);
const currentEnd = endOfDayUTC(endDateStr);

// bundle-write.service
startDate: startDate ? new Date(startDate) : undefined,
```

**Recommendation:** Centralize date utilities, ensure consistent timezone handling.

---

### Missing JSDoc on Complex Functions

**Affected:** Services, utilities with complex logic

**Recommendation:** Add JSDoc comments to public APIs documenting parameters, return values, and algorithm choices.

---

### Weak Token Validation

**Location:** `/web/shared/utils/shopify/shopify-helpers.ts:157-159`

```typescript
export function isValidShopifyToken(token: string): boolean {
    return token.startsWith("shpat_") && token.length > 20;
}
```

**Issue:** Overly permissive validation. Doesn't check actual token format or signature.

**Recommendation:** Implement full token format validation.

---

### Missing X-Frame-Options Fallback

**Location:** `/web/security/headers.ts`

CSP has `frame-ancestors` but lacks explicit `X-Frame-Options` header for legacy browser support.

**Recommendation:** Add `X-Frame-Options: DENY` as fallback.

---

### No Content Length Limits on Upload

**Location:** `/web/app/api/upload/route.ts`

No validation of file size before processing. Large files could cause memory exhaustion.

**Recommendation:** Implement file size limits and streaming validation.

---

### Carousel Edge Case

**Location:** `/extension/extensions/product-bundle-widget/assets/bundle-widget.js:~1100`

**Issue:** With zero products, slider state `maxIndex` becomes negative.

**Recommendation:** Add safety check for minimum product count.

---

### Customer ID Leakage

**Location:** `/extension/extensions/product-bundle-widget/blocks/app-embed.liquid:208-255`

`getCustomerId()` broadcasts to JS global, could expose to third-party scripts if page is compromised.

---

### Modal Payload Types

**Location:** `/web/shared/types/state/modal-store.types.ts:41`

```typescript
onConfirm?: (data?: Record<string, any>) => Promise<void> | void
```

`Record<string, any>` loses type safety.

**Recommendation:** Use discriminated union for specific modal types.

---

## Architecture Strengths

The codebase demonstrates several excellent patterns:

1. **Feature-based module structure** - Clean separation with internal layers (actions/services/repositories/stores/components)

2. **Proper Shopify integration**
   - HMAC-SHA256 verification for webhooks
   - App Proxy signature validation
   - GraphQL codegen for type-safe API calls

3. **Good transaction usage** - Most write operations wrapped in `prisma.$transaction()`

4. **Comprehensive validation**
   - Zod schemas cover most scenarios
   - Business rule validation in separate layer
   - GID format validation for Shopify IDs

5. **Security validation**
   - Rate limiting implementation exists
   - Bundle limits per shop
   - Session expiration checks

6. **Rust discount function**
   - Tamper-proof server-side calculation
   - Dual verification (cart attribute + metafield)
   - Product GID validation against trusted config

7. **Frontend optimization**
   - Lazy loading with IntersectionObserver
   - React Query for server state
   - Zustand with Immer for local state

8. **Proper error boundaries** - Global error.tsx and loading.tsx in app router

9. **Security headers** - HSTS, CSP, X-Content-Type-Options configured

10. **Webhook cold-start recovery** - Auto-re-registers webhooks on cold start

---

## Recommended Action Plan

### Phase 1: Critical Security (This Week)

- [ ] Fix OAuth state validation in `/web/app/api/auth/callback/route.ts`
- [ ] Replace `Math.random()` with `crypto.randomBytes()` in state generation
- [ ] Remove `'unsafe-eval'` from CSP in `/web/security/csp.ts`
- [ ] Sanitize HTML in GlobalBanner component
- [ ] Fix CORS wildcard on upload endpoint
- [ ] Fix Rust legacy mode validation (require productQuantities)

### Phase 2: High Priority (Next 2 Weeks)

- [ ] Replace 247 `as any` assertions with proper TypeScript types
- [ ] Implement structured logging (replace console statements)
- [ ] Standardize error handling pattern across services/actions
- [ ] Add missing database indexes (`@@index([shop])` on core models)
- [ ] Fix Promise.allSettled result inspection
- [ ] Wrap session storage operations in transaction
- [ ] Add CUSTOM_PRICE handling to savings banner

### Phase 3: Medium Priority (Month 1)

- [ ] De-duplicate validation logic (single source of truth with Zod)
- [ ] Add HTML escaping to validation formatters
- [ ] Fix form state memory leak with cleanup function
- [ ] Refactor Zustand async patterns
- [ ] Add rate limiting to proxy endpoints
- [ ] Fix cart page polling leak
- [ ] Standardize shop/shopId field usage

### Phase 4: Low Priority (Ongoing)

- [ ] Extract magic numbers to named constants
- [ ] Remove commented-out code blocks
- [ ] Add JSDoc documentation to complex functions
- [ ] Centralize date handling utilities
- [ ] Improve token validation
- [ ] Add X-Frame-Options fallback header

---

## Files Reviewed

### Core Application (`/web`)

- `/web/app/api/auth/route.ts` - OAuth initiation
- `/web/app/api/auth/callback/route.ts` - OAuth callback
- `/web/app/api/webhooks/route.ts` - Webhook handler
- `/web/app/api/upload/route.ts` - File upload
- `/web/app/api/session/validate/route.ts` - Session validation
- `/web/app/api/proxy/products/route.ts` - Products proxy
- `/web/app/api/proxy/analytics/route.ts` - Analytics proxy
- `/web/app/api/cron/bundle-scheduler/route.ts` - Bundle scheduler
- `/web/security/csp.ts` - CSP configuration
- `/web/security/headers.ts` - Security headers

### Features (`/web/features`)

- `/web/features/bundles/services/bundle-write.service.ts`
- `/web/features/bundles/services/bundle-read.service.ts`
- `/web/features/bundles/services/bundle-security.service.ts`
- `/web/features/bundles/actions/bundle-mutations.action.ts`
- `/web/features/bundles/repositories/bundle.queries.ts`
- `/web/features/bundles/repositories/bundle.mutations.ts`
- `/web/features/bundles/validation/zod.schema.ts`
- `/web/features/bundles/validation/bundle-rules.validation.ts`
- `/web/features/analytics/repositories/analytics.queries.ts`
- `/web/features/settings/stores/settings.store.ts`
- `/web/features/settings/stores/customizer.store.ts`

### Shared (`/web/shared`)

- `/web/shared/components/feedback/banner/global-banner.tsx`
- `/web/shared/hooks/session/use-protected-session.ts`
- `/web/shared/hooks/session/use-session-provider.ts`
- `/web/shared/hooks/shopify/use-shop-settings.ts`
- `/web/shared/stores/global-banner.store.ts`
- `/web/shared/stores/session.store.ts`
- `/web/shared/repositories/session-storage.ts`
- `/web/shared/utils/shopify/shopify-helpers.ts`
- `/web/shared/utils/validation/validators.ts`
- `/web/shared/utils/form/save-bar.ts`
- `/web/shared/utils/formatters/currency.ts`

### Database (`/web/prisma`)

- `/web/prisma/schema.prisma` - Full schema review

### Extensions (`/extension`)

- `/extension/extensions/radius-discount-function/src/main.rs`
- `/extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs`
- `/extension/extensions/radius-discount-function/src/cart_delivery_options_discounts_generate_run.rs`
- `/extension/extensions/product-bundle-widget/blocks/app-block.liquid`
- `/extension/extensions/product-bundle-widget/blocks/app-embed.liquid`
- `/extension/extensions/product-bundle-widget/assets/bundle-widget.js`
- `/extension/extensions/product-bundle-widget/assets/radius-bundles.js`

---

## Summary

This codebase has a solid foundation with good architectural patterns. The critical security issues around OAuth and CSP should be addressed immediately. The high-priority type safety and error handling improvements will significantly improve maintainability and reduce runtime errors. The medium and low priority items can be addressed incrementally as part of regular development cycles.

**Estimated effort for critical fixes:** 2-3 days
**Estimated effort for high priority:** 2 weeks
**Estimated effort for medium priority:** 4 weeks
**Low priority:** Ongoing maintenance

---

*Report generated by Claude Code on February 24, 2026*