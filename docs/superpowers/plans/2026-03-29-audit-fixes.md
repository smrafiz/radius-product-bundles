# Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all verified audit findings in priority order — security blockers first, then accessibility, then UX/performance/architecture.

**Architecture:** Surgical, file-by-file fixes. No refactors unless the task explicitly calls for one. Each task is independently committable. User confirms before each task begins.

**Tech Stack:** Next.js 16, React 19, Prisma 7, Zustand, Shopify Polaris (s-* web components), TypeScript strict mode, Rust (extension), Liquid (widget).

---

## VERIFIED ISSUES vs AUDIT REPORT CORRECTIONS

| Reported | Actual Status |
|----------|--------------|
| B-3 REST→GraphQL migration | ✅ Already fixed — widget-block-status uses GraphQL |
| B-4 PII console.log in widget | ✅ Already fixed — no customer ID log found |
| console.log count: 205 | ❌ Actual count: **4,863** occurrences |

---

## PHASE 1 — Security (Blockers)

### Task 1: Fix `isSessionExpired(null)` — Immortal Sessions

**Severity:** CRITICAL
**Effort:** XS (1 line)
**Files:**
- Modify: `web/shared/utils/shopify/shopify-helpers.ts:168`

**Problem:** When a session has no `expires` field (null/undefined), the function returns `false` — meaning "not expired". This treats sessions with no expiry as permanently valid.

```ts
// CURRENT (line 168) — BUG
export function isSessionExpired(expires: Date | null | undefined): boolean {
    if (!expires) return false;
    return new Date() > new Date(expires);
}
```

- [ ] **Step 1: Fix the null check**

```ts
// FIXED — no expiry = treat as expired (force re-auth)
export function isSessionExpired(expires: Date | null | undefined): boolean {
    if (!expires) return true;
    return new Date() > new Date(expires);
}
```

- [ ] **Step 2: Verify no tests break**

```bash
cd web && bun run test 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add web/shared/utils/shopify/shopify-helpers.ts
git commit -m "fix: treat null session expiry as expired to prevent immortal sessions"
```

---

### Task 2: Fix Timing Attack — HMAC & Cron Secret Comparison

**Severity:** HIGH (timing attack enables HMAC forgery and cron auth bypass)
**Effort:** S (2 files, 2-3 lines each)
**Files:**
- Modify: `web/lib/shopify/proxy/verify-proxy.ts:82-84`
- Modify: `web/app/api/cron/bundle-scheduler/route.ts:23`
- Modify: `web/app/api/cron/keep-alive/route.ts:20`

**Problem:** String equality (`===`, `!==`) on secrets leaks timing information. An attacker can measure response times to determine how many bytes of a secret they've guessed correctly.

**Fix 1 — verify-proxy.ts**

```ts
// CURRENT (line 82-84)
const computed = createHmac("sha256", secret).update(message).digest("hex");
return computed === signature;

// FIXED — add timingSafeEqual import and use it
import { createHmac, timingSafeEqual } from "crypto";
// ...
const computed = createHmac("sha256", secret).update(message).digest("hex");
if (computed.length !== signature.length) return false;
return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(signature, "hex"));
```

**Fix 2 — cron routes (both)**

```ts
// CURRENT (both cron files)
if (authHeader !== `Bearer ${cronSecret}`) {

// FIXED — extract token and compare safely
import { timingSafeEqual } from "crypto";
// ...
const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
if (
    token.length === 0 ||
    token.length !== cronSecret.length ||
    !timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret))
) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 1: Update verify-proxy.ts import and comparison**

Edit `web/lib/shopify/proxy/verify-proxy.ts`:
- Line 1: Change `import { createHmac } from "crypto"` → `import { createHmac, timingSafeEqual } from "crypto"`
- Lines 82-84: Replace as shown above.

- [ ] **Step 2: Update bundle-scheduler cron route**

Edit `web/app/api/cron/bundle-scheduler/route.ts`:
- Add `import { timingSafeEqual } from "crypto"` at top
- Replace lines 22-25 with safe comparison block above.

- [ ] **Step 3: Update keep-alive cron route**

Edit `web/app/api/cron/keep-alive/route.ts`:
- Add `import { timingSafeEqual } from "crypto"` at top
- Replace lines 19-22 with safe comparison block above.

- [ ] **Step 4: Verify build**

```bash
cd web && npx tsc --noEmit 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
git add web/lib/shopify/proxy/verify-proxy.ts \
        web/app/api/cron/bundle-scheduler/route.ts \
        web/app/api/cron/keep-alive/route.ts
git commit -m "fix: use timingSafeEqual for HMAC and cron secret comparisons"
```

---

### Task 3: Fix IDOR — Add Shop Filter to `findBundleById` & `findBundleStatusById`

**Severity:** CRITICAL (cross-tenant data access)
**Effort:** M (2 repo functions + callers to update)
**Files:**
- Modify: `web/features/bundles/repositories/bundle.queries.ts:29-48`
- Modify: `web/features/bundles/services/bundle-read.service.ts:32-39`
- Modify: `web/features/bundles/repositories/bundle.queries.ts:219-235` (`findMainProductIdsByBundleIds`)

**Problem:**
1. `findBundleById(id)` — no shop filter → any merchant can read another shop's bundle
2. `findBundleStatusById(id)` — no shop filter → called by `checkBundleExists(bundleId)` with no shop
3. `findMainProductIdsByBundleIds(bundleIds)` — no shop filter (lower risk: called internally only)

**Fix for `findBundleById`:**

```ts
// BEFORE
export async function findBundleById(
    id: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.bundle.findUnique({
        where: { id },
        include: INCLUDE_BUNDLE_DETAILS,
    });
}

// AFTER — require shop
export async function findBundleById(
    id: string,
    shop: string,
    tx?: Prisma.TransactionClient,
) {
    const client = tx || prisma;
    return client.bundle.findFirst({
        where: { id, shop },
        include: INCLUDE_BUNDLE_DETAILS,
    });
}
```

**Fix for `findBundleStatusById`:**

```ts
// BEFORE
export async function findBundleStatusById(id: string) {
    return prisma.bundle.findUnique({
        where: { id },
        select: { id: true, status: true },
    });
}

// AFTER — require shop
export async function findBundleStatusById(id: string, shop: string) {
    return prisma.bundle.findFirst({
        where: { id, shop },
        select: { id: true, status: true },
    });
}
```

**Fix for `checkBundleExists` caller in bundle-read.service.ts:**

```ts
// BEFORE
export async function checkBundleExists(bundleId: string) {
    const bundle = await findBundleStatusById(bundleId);
    return {
        exists: !!bundle,
        isDeleted: bundle?.status === "DELETED",
    };
}

// AFTER — require shop at service layer too
export async function checkBundleExists(bundleId: string, shop: string) {
    const bundle = await findBundleStatusById(bundleId, shop);
    return {
        exists: !!bundle,
        isDeleted: bundle?.status === "DELETED",
    };
}
```

**Fix for `findMainProductIdsByBundleIds`** (internal, but should be defended):

```ts
// BEFORE
export async function findMainProductIdsByBundleIds(
    bundleIds: string[],
    tx?: Prisma.TransactionClient,
): Promise<string[]> {
    if (!bundleIds.length) return [];
    const client = tx || prisma;
    const bundles = await client.bundle.findMany({
        where: { id: { in: bundleIds } },
        select: { mainProductId: true },
    });
    ...
}

// AFTER — add shop filter
export async function findMainProductIdsByBundleIds(
    bundleIds: string[],
    shop: string,
    tx?: Prisma.TransactionClient,
): Promise<string[]> {
    if (!bundleIds.length) return [];
    const client = tx || prisma;
    const bundles = await client.bundle.findMany({
        where: { id: { in: bundleIds }, shop },
        select: { mainProductId: true },
    });
    ...
}
```

- [ ] **Step 1: Search all callers of `findBundleById` and `checkBundleExists`**

```bash
grep -rn "findBundleById\|checkBundleExists" web --include="*.ts" --include="*.tsx"
```

Review each caller to confirm which ones already have `shop` available.

- [ ] **Step 2: Fix `findBundleStatusById` in bundle.queries.ts**

Apply the fix shown above (line 29-34).

- [ ] **Step 3: Fix `findBundleById` in bundle.queries.ts**

Apply the fix shown above (line 39-48). Change `findUnique` → `findFirst`, add `shop` param and filter.

- [ ] **Step 4: Fix `findMainProductIdsByBundleIds` in bundle.queries.ts**

Apply shop filter fix shown above.

- [ ] **Step 5: Fix `checkBundleExists` in bundle-read.service.ts**

Add `shop: string` parameter, pass through to `findBundleStatusById`.

- [ ] **Step 6: Fix all callers of `checkBundleExists` and `findBundleById`**

Update each call site identified in Step 1 to pass `shop`.

- [ ] **Step 7: Fix callers of `findMainProductIdsByBundleIds` in bundle.mutations.ts**

Find the call at `bundle.mutations.ts:463` and add `shop` argument.

- [ ] **Step 8: Type check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -E "error TS" | head -30
```

Fix any type errors surfaced.

- [ ] **Step 9: Commit**

```bash
git add web/features/bundles/repositories/bundle.queries.ts \
        web/features/bundles/services/bundle-read.service.ts \
        web/features/bundles/repositories/bundle.mutations.ts
git commit -m "fix: add shop filter to findBundleById/findBundleStatusById to prevent IDOR"
```

---

### Task 4: Remove console.log from Production Code

**Severity:** HIGH (data exposure in DevTools, submission blocker)
**Effort:** L (4,863 occurrences across codebase)
**Strategy:** Use ESLint `no-console` rule to enforce it going forward. Then strip existing logs via automated script. Keep `console.error` and `console.warn` (server-side only).

**Files:**
- Modify: `web/.eslintrc.json` (or `eslint.config.mjs` — check which exists)
- Run: automated removal script across `web/` and `extension/`

- [ ] **Step 1: Check ESLint config location**

```bash
ls web/.eslintrc* web/eslint.config* 2>/dev/null
```

- [ ] **Step 2: Add `no-console` rule to ESLint config**

In the ESLint config, add:
```json
"rules": {
  "no-console": ["warn", { "allow": ["error", "warn"] }]
}
```

This keeps `console.error` and `console.warn` (server-side logging), removes `console.log`.

- [ ] **Step 3: Run automated removal of console.log (not error/warn)**

```bash
# Preview what will be removed (dry run)
grep -rn "console\.log" web/features web/shared web/app web/lib \
  --include="*.ts" --include="*.tsx" | wc -l
```

Then use the `find + sed` approach or `eslint --fix`:
```bash
cd web && npx eslint . --fix --rule '{"no-console": ["error", {"allow": ["error","warn"]}]}' \
  --ext .ts,.tsx 2>&1 | tail -20
```

- [ ] **Step 4: Review diff — restore any intentional server-side console.warn/error logs**

```bash
git diff --stat
```

Check for any `console.log` that should have been `console.warn` (e.g., important deprecation notices).

- [ ] **Step 5: Check widget file separately**

```bash
grep -n "console\.log" extension/extensions/product-bundle-widget/assets/*.ts \
  extension/extensions/product-bundle-widget/assets/*.js 2>/dev/null | wc -l
```

Manually remove from widget files (not covered by ESLint).

- [ ] **Step 6: Type check + verify**

```bash
cd web && npx tsc --noEmit 2>&1 | tail -10
grep -rn "console\.log" web --include="*.ts" --include="*.tsx" | wc -l
```

Target: 0 `console.log` remaining.

- [ ] **Step 7: Commit**

```bash
git add -p  # review each change
git commit -m "fix: remove console.log from production code (submission requirement)"
```

---

## PHASE 2 — Shopify Compliance

### Task 5: Make Error Banners Non-Auto-Dismissing (BFS Requirement)

**Severity:** HIGH (Built for Shopify requirement)
**Effort:** S
**Files:**
- Read first: `web/shared/components/feedback/banner/global-banner.tsx`
- Read first: `web/shared/stores/banner/banner.store.ts`

The global banner store likely has a timeout that auto-dismisses banners. BFS requires error banners to persist until manually dismissed by the user.

- [ ] **Step 1: Read the banner store**

```bash
cat web/shared/stores/banner/banner.store.ts
cat web/shared/components/feedback/banner/global-banner.tsx
```

- [ ] **Step 2: Identify auto-dismiss logic**

Find the `setTimeout` or `duration` config that auto-dismisses error/critical banners.

- [ ] **Step 3: Make tone=critical/error banners non-dismissing**

In the banner store, conditionally skip auto-dismiss for `tone === "critical"` or `tone === "warning"`:

```ts
// Only auto-dismiss success/info banners, not errors
if (banner.tone !== "critical" && banner.tone !== "warning" && banner.duration) {
    setTimeout(() => dismissBanner(banner.id), banner.duration);
}
```

- [ ] **Step 4: Commit**

```bash
git add web/shared/stores/banner/banner.store.ts
git commit -m "fix: persist error/critical banners (BFS non-dismissing requirement)"
```

---

### Task 6: Create `not-found.tsx` and Fix `error.tsx`

**Severity:** HIGH (submission blocker + UX)
**Effort:** S
**Files:**
- Create: `web/app/not-found.tsx`
- Create: `web/app/global-error.tsx`
- Modify: `web/app/error.tsx` (currently renders null)

- [ ] **Step 1: Read current error.tsx**

```bash
cat web/app/error.tsx
```

- [ ] **Step 2: Fix error.tsx to render actual UI instead of null**

```tsx
"use client";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred. Please try again.</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}
```

- [ ] **Step 3: Create not-found.tsx**

```tsx
export default function NotFound() {
    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Page not found</h2>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
}
```

- [ ] **Step 4: Create global-error.tsx**

```tsx
"use client";
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <h2>Something went wrong</h2>
                    <button onClick={() => reset()}>Try again</button>
                </div>
            </body>
        </html>
    );
}
```

- [ ] **Step 5: Commit**

```bash
git add web/app/error.tsx web/app/not-found.tsx web/app/global-error.tsx
git commit -m "fix: add not-found, global-error pages and fix error.tsx rendering null"
```

---

## PHASE 3 — Accessibility

### Task 7: Add `accessibilityLabel` to All Icon-Only Buttons

**Severity:** HIGH (WCAG 2.1 AA — SC 1.1.1 Non-text Content)
**Effort:** M (need to audit all icon buttons)
**Files:** Multiple component files — to be identified in Step 1.

- [ ] **Step 1: Find all icon-only buttons without accessibilityLabel**

```bash
grep -rn 'icon=' web/features web/shared --include="*.tsx" -A 1 | \
  grep -B 1 'accessibilityLabel' | grep -v 'accessibilityLabel' | \
  grep 'icon=' | head -40
```

```bash
# Also check s-button with icon= but no accessibilityLabel nearby
grep -rn '<s-button[^>]*icon=' web --include="*.tsx" | \
  grep -v 'accessibilityLabel' | head -40
```

- [ ] **Step 2: Add `accessibilityLabel` to each identified button**

Pattern for every icon-only `<s-button>`:
```tsx
<s-button icon="delete" accessibilityLabel="Delete bundle" />
<s-button icon="edit" accessibilityLabel="Edit bundle" />
<s-button icon="duplicate" accessibilityLabel="Duplicate bundle" />
```

- [ ] **Step 3: Commit**

```bash
git add -p
git commit -m "fix(a11y): add accessibilityLabel to all icon-only buttons (WCAG 1.1.1)"
```

---

### Task 8: Add `aria-live` to GlobalBanner

**Severity:** HIGH (screen readers don't announce status changes)
**Effort:** XS
**Files:**
- Modify: `web/shared/components/feedback/banner/global-banner.tsx`

- [ ] **Step 1: Read global-banner.tsx**

```bash
cat web/shared/components/feedback/banner/global-banner.tsx
```

- [ ] **Step 2: Add role + aria-live to banner container**

```tsx
// Add to the outer container element:
role="region"
aria-live="polite"
aria-label="Notifications"
// For error banners, use aria-live="assertive"
```

- [ ] **Step 3: Commit**

```bash
git add web/shared/components/feedback/banner/global-banner.tsx
git commit -m "fix(a11y): add aria-live region to GlobalBanner for screen reader announcements"
```

---

### Task 9: Fix Setup Guide Items — div → button (Keyboard Access)

**Severity:** HIGH
**Effort:** S
**Files:**
- Modify: `web/features/dashboard/components/dashboard-setup-guide/dashboard-setup-item.tsx:72`

- [ ] **Step 1: Read the file**

```bash
cat web/features/dashboard/components/dashboard-setup-guide/dashboard-setup-item.tsx
```

- [ ] **Step 2: Replace clickable div with button**

```tsx
// BEFORE: <div onClick={...}>
// AFTER:
<button
    type="button"
    onClick={() => setExpanded(!expanded)}
    aria-expanded={expanded}
    style={{ all: "unset", width: "100%", cursor: "pointer" }}
>
```

- [ ] **Step 3: Commit**

```bash
git add web/features/dashboard/components/dashboard-setup-guide/dashboard-setup-item.tsx
git commit -m "fix(a11y): replace non-interactive div with button in setup guide (keyboard access)"
```

---

### Task 10: Add ARIA Labels to Range Slider + Associate WYSIWYG Label

**Severity:** HIGH
**Effort:** S
**Files:**
- Modify: `web/shared/components/fields/range-slider/rtpb-range-slider.tsx`
- Modify: `web/shared/components/fields/editor/editor-wysiwyg.tsx`

- [ ] **Step 1: Read both files**

```bash
cat web/shared/components/fields/range-slider/rtpb-range-slider.tsx
cat web/shared/components/fields/editor/editor-wysiwyg.tsx
```

- [ ] **Step 2: Add ARIA props to range slider**

Add `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` to the `<input type="range">` element.

- [ ] **Step 3: Associate WYSIWYG label via htmlFor/id**

Add `id` to the editor container and connect the label with `htmlFor` (or `aria-labelledby`).

- [ ] **Step 4: Commit**

```bash
git add web/shared/components/fields/range-slider/rtpb-range-slider.tsx \
        web/shared/components/fields/editor/editor-wysiwyg.tsx
git commit -m "fix(a11y): add ARIA labels to range slider and associate WYSIWYG label"
```

---

### Task 11: Add Skip Navigation Link

**Severity:** HIGH
**Effort:** XS
**Files:**
- Modify: `web/shared/components/layout/app-layout-wrapper.tsx`
- Modify: `web/app/globals.css` (add `.sr-only` utility if not present)

- [ ] **Step 1: Read app-layout-wrapper.tsx**

```bash
cat web/shared/components/layout/app-layout-wrapper.tsx
```

- [ ] **Step 2: Add skip link as first child**

```tsx
// Add at very top of rendered output:
<a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-2 focus:rounded"
>
    Skip to main content
</a>
```

- [ ] **Step 3: Add `id="main-content"` to main content wrapper**

```tsx
<main id="main-content">
```

- [ ] **Step 4: Ensure `sr-only` utility is in globals.css if not using Tailwind**

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/components/layout/app-layout-wrapper.tsx web/app/globals.css
git commit -m "fix(a11y): add skip navigation link for keyboard users (WCAG 2.4.1)"
```

---

### Task 12: Add `prefers-reduced-motion` CSS

**Severity:** MEDIUM
**Effort:** XS
**Files:**
- Modify: `web/app/globals.css`

- [ ] **Step 1: Add media query to globals.css**

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/globals.css
git commit -m "fix(a11y): respect prefers-reduced-motion system preference (WCAG 2.3.3)"
```

---

### Task 13: Add Focus Trap to Modal

**Severity:** HIGH
**Effort:** M
**Files:**
- Read first: `web/shared/components/overlays/modal/modal-host.tsx`

- [ ] **Step 1: Read modal-host.tsx**

```bash
cat web/shared/components/overlays/modal/modal-host.tsx
```

- [ ] **Step 2: Check if @shopify/polaris or the s-modal component handles focus trap natively**

Shopify's `<s-modal>` web component may already implement focus trap internally. Confirm by checking Shopify Dev docs.

- [ ] **Step 3: If native, verify `autoFocus` on primary action button**

```tsx
// Add autoFocus to the primary button inside modal
<s-button variant="primary" autoFocus>Confirm</s-button>
```

- [ ] **Step 4: If manual focus trap needed, install and implement**

```bash
cd web && bun add @radix-ui/react-focus-guards
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/components/overlays/modal/modal-host.tsx
git commit -m "fix(a11y): ensure focus trap and restoration in modal (WCAG 2.1.2)"
```

---

## PHASE 4 — Performance

### Task 14: Memoize `BundleTableRow` + `useCallback` for `toggleSelection`

**Severity:** HIGH
**Effort:** S
**Files:**
- Read first: `web/features/bundles/components/bundle-table/bundle-table.tsx`

- [ ] **Step 1: Read bundle-table.tsx**

```bash
cat web/features/bundles/components/bundle-table/bundle-table.tsx
```

- [ ] **Step 2: Wrap `toggleSelection` in `useCallback`**

```tsx
const toggleSelection = useCallback((id: string) => {
    // existing logic
}, [/* deps */]);
```

- [ ] **Step 3: Memoize BundleTableRow**

```tsx
const BundleTableRow = React.memo(function BundleTableRow({ ... }) {
    // existing component
});
```

- [ ] **Step 4: Commit**

```bash
git add web/features/bundles/components/bundle-table/bundle-table.tsx
git commit -m "perf: memoize BundleTableRow and useCallback for toggleSelection"
```

---

### Task 15: Zustand Selector Pattern — Stop Over-Broad Subscriptions

**Severity:** HIGH
**Effort:** M
**Files:**
- Multiple store consumers — to be identified in Step 1.

- [ ] **Step 1: Find over-broad subscriptions**

```bash
# Pattern: const { x, y } = useXStore() — destructuring entire store
grep -rn "const {" web/features web/shared --include="*.tsx" | \
  grep "= use.*Store()" | head -30
```

- [ ] **Step 2: Convert top 10 most-rendered components to selectors**

```tsx
// BEFORE
const { bundles, pagination, isLoading } = useBundleListingStore();

// AFTER
const bundles = useBundleListingStore((s) => s.bundles);
const pagination = useBundleListingStore((s) => s.pagination);
const isLoading = useBundleListingStore((s) => s.isLoading);
```

- [ ] **Step 3: Commit**

```bash
git add -p
git commit -m "perf: use Zustand selector pattern to reduce unnecessary re-renders"
```

---

### Task 16: Add Suspense Fallback + Per-Feature Error Boundaries

**Severity:** MEDIUM
**Effort:** S
**Files:**
- Modify: `web/app/layout.tsx:42`
- Create: `web/app/(dashboard)/bundles/error.tsx`
- Create: `web/app/(dashboard)/analytics/error.tsx`
- Create: `web/app/(dashboard)/settings/error.tsx`

- [ ] **Step 1: Fix Suspense fallback in layout.tsx**

```tsx
// BEFORE
<Suspense>
    <I18nLoader>...

// AFTER
<Suspense fallback={<div aria-label="Loading" role="status" />}>
    <I18nLoader>...
```

- [ ] **Step 2: Create per-feature error.tsx files** (same pattern as app/error.tsx from Task 6)

- [ ] **Step 3: Commit**

```bash
git add web/app/layout.tsx \
        web/app/\(dashboard\)/bundles/error.tsx \
        web/app/\(dashboard\)/analytics/error.tsx \
        web/app/\(dashboard\)/settings/error.tsx
git commit -m "fix: add Suspense fallback and per-feature error boundaries"
```

---

## PHASE 5 — Architecture

### Task 17: Fix TypeScript `any` in Analytics Repository

**Severity:** MEDIUM
**Effort:** XS
**Files:**
- Read first: `web/features/analytics/repositories/bundle-analytics.repository.ts`

- [ ] **Step 1: Find `any` usages**

```bash
grep -n ": any" web/features/analytics/repositories/bundle-analytics.repository.ts
```

- [ ] **Step 2: Replace with Prisma types**

```ts
// BEFORE
const bundleWhereClause: any = { shop };
// AFTER
const bundleWhereClause: Prisma.BundleWhereInput = { shop };
```

- [ ] **Step 3: Commit**

```bash
git add web/features/analytics/repositories/bundle-analytics.repository.ts
git commit -m "fix: replace any with Prisma.BundleWhereInput in analytics repository"
```

---

## PHASE 6 — Install A11y Linting

### Task 18: Install `eslint-plugin-jsx-a11y`

**Severity:** MEDIUM (prevents accessibility regressions going forward)
**Effort:** XS
**Files:**
- Modify: `web/package.json`
- Modify: ESLint config

- [ ] **Step 1: Install**

```bash
cd web && bun add -d eslint-plugin-jsx-a11y
```

- [ ] **Step 2: Add to ESLint config**

```json
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

- [ ] **Step 3: Run and fix auto-fixable issues**

```bash
cd web && npx eslint . --fix --ext .tsx 2>&1 | tail -30
```

- [ ] **Step 4: Commit**

```bash
git add web/package.json web/bun.lockb web/.eslintrc*
git commit -m "chore: add eslint-plugin-jsx-a11y to prevent accessibility regressions"
```

---

## Summary

| Phase | Tasks | Issues Fixed | Severity |
|-------|-------|-------------|----------|
| 1 — Security | 4 | Immortal sessions, timing attacks, IDOR, console.log spam | CRITICAL/HIGH |
| 2 — Shopify | 2 | Error banner persistence, missing error pages | HIGH |
| 3 — A11y | 7 | Icon labels, aria-live, keyboard nav, focus trap, skip link | HIGH/MEDIUM |
| 4 — Performance | 3 | Memoization, selector pattern, error boundaries | HIGH/MEDIUM |
| 5 — Architecture | 1 | TypeScript `any` | MEDIUM |
| 6 — Dev tooling | 1 | A11y linting | MEDIUM |
| **Total** | **18** | **~35 issues** | |

---

*Generated: 2026-03-29 | Based on verified codebase state (not audit report assumptions)*
