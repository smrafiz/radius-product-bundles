# UX/UI Audit Report — Radius Bundles

> Generated: 2026-02-21 | Branch: `caching-test`
> Sources: Shopify Dev MCP (Design Guidelines, Built for Shopify, App Home API), Next.js MCP (Production Checklist, Accessibility), Codebase Analysis

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Admin — Navigation & Layout](#2-admin--navigation--layout)
3. [Admin — Forms & Data Entry](#3-admin--forms--data-entry)
4. [Admin — Loading & Error States](#4-admin--loading--error-states)
5. [Admin — Polaris & App Bridge Compliance](#5-admin--polaris--app-bridge-compliance)
6. [Admin — Accessibility (WCAG 2.1 AA)](#6-admin--accessibility-wcag-21-aa)
7. [Storefront — Widget Accessibility](#7-storefront--widget-accessibility)
8. [Storefront — Responsive Design](#8-storefront--responsive-design)
9. [Storefront — Loading & Error Handling](#9-storefront--loading--error-handling)
10. [Storefront — Animation & Performance](#10-storefront--animation--performance)
11. [Storefront — Internationalization](#11-storefront--internationalization)
12. [Storefront — Image Handling](#12-storefront--image-handling)
13. [Priority Action Items](#13-priority-action-items)

---

## 1. Executive Summary

### Admin App (Next.js + Polaris)

| Area           | Status     | Notes                                                               |
| -------------- | ---------- | ------------------------------------------------------------------- |
| Navigation     | ✅ Good    | NavMenu from App Bridge used correctly                              |
| Layout         | ✅ Good    | Full-width index pages, proper Polaris components                   |
| Forms          | ✅ Good    | React Hook Form + Zod, blur validation, SaveBar                     |
| Loading States | ✅ Good    | 245 Skeleton occurrences across 37 files                            |
| Empty States   | ✅ Good    | 74 empty state occurrences across 19 files                          |
| Error Handling | ⚠️ Gaps    | `error.tsx` renders null; no `not-found.tsx`; no `global-error.tsx` |
| Accessibility  | ❌ Poor    | Only 15 aria/role/keyboard attributes across 7 files                |
| ESLint a11y    | ❌ Missing | No `eslint-plugin-jsx-a11y` configured                              |

### Storefront Widget (Liquid + JS)

| Area                    | Status     | Notes                                                                  |
| ----------------------- | ---------- | ---------------------------------------------------------------------- |
| Progressive Enhancement | ✅ Good    | Skeleton-first, JS enhances                                            |
| Responsive Design       | ⚠️ Partial | Breakpoint system exists, no fluid sizing                              |
| Accessibility           | ❌ Poor    | Missing focus indicators, no aria-live, no screen reader announcements |
| Error Handling          | ❌ Poor    | Network errors fail silently, no user-facing messages                  |
| RTL / i18n              | ❌ Missing | No RTL support, hardcoded English defaults                             |
| Animation               | ⚠️ Partial | No `prefers-reduced-motion` support                                    |
| Performance             | ⚠️ Partial | Deferred loading good, no request batching                             |

### Scorecard

| Category           | Admin | Storefront |
| ------------------ | ----- | ---------- |
| Usability          | 8/10  | 6/10       |
| Accessibility      | 3/10  | 3/10       |
| Performance        | 7/10  | 5/10       |
| Error Resilience   | 5/10  | 2/10       |
| Shopify Compliance | 8/10  | 6/10       |

---

## 2. Admin — Navigation & Layout

### Navigation ✅

**File**: `web/shared/components/navigation/navigation.tsx`

The app correctly uses `NavMenu` from `@shopify/app-bridge-react` for primary navigation, which is a **Built for Shopify requirement**. Shopify mandates:

> Use `ui-nav-menu` or `NavMenu` for primary navigation. Tabs should only be used for secondary navigation within a page.

**Current navigation items** (9 total):

1. Dashboard (home)
2. Bundles
3. Analytics
4. Settings
5. A/B Testing
6. Automation
7. Pricing
8. Templates
9. Integrations

| Check                      | Status | Details                                                                     |
| -------------------------- | ------ | --------------------------------------------------------------------------- |
| Uses NavMenu component     | ✅     | `@shopify/app-bridge-react` NavMenu                                         |
| Home link has `rel="home"` | ✅     | Dashboard link correctly marked                                             |
| Uses `data-sprogress`      | ✅     | All links have progress indicator data attribute                            |
| No tabs for primary nav    | ✅     | Tabs only used within pages (e.g., Settings sections)                       |
| Reasonable item count      | ⚠️     | 9 items is high — consider grouping. Shopify recommends ≤7 for scannability |

**Recommendation**: Consider grouping "A/B Testing" + "Automation" under an "Optimization" parent, or moving "Integrations" and "Templates" into Settings sub-pages. Several of these are "coming soon" features with empty pages.

### Layout ✅

| Pattern                | Status | Details                                          |
| ---------------------- | ------ | ------------------------------------------------ |
| Full-width index pages | ✅     | Bundle list, analytics, dashboard use full width |
| Two-column for editors | ✅     | Settings customizer uses split layout            |
| TitleBar usage         | ✅     | Used in 9 files for page headers                 |
| SaveBar usage          | ✅     | Used in 17 files for unsaved changes             |

---

## 3. Admin — Forms & Data Entry

### Form Architecture ✅

The bundle creation form uses a robust pattern:

```
React Hook Form + Zod validation → Zustand store (per-feature) → Server Action → Service
```

| Feature                 | Status | Details                                      |
| ----------------------- | ------ | -------------------------------------------- |
| Schema validation       | ✅     | Zod schemas with @hookform/resolvers         |
| Blur validation         | ✅     | `touchedFields` tracking in Zustand store    |
| Field-level errors      | ✅     | `getFieldError` with nested dot-path support |
| Dirty tracking          | ✅     | SaveBar appears on changes                   |
| Unsaved changes warning | ✅     | SaveBar with discard/save actions            |
| Auto-save               | N/A    | Not implemented (not required)               |

### Form UX Issues

| #   | Issue                                                            | Severity | File                                                                                             |
| --- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| 1   | **Drag-and-drop product reordering has no keyboard alternative** | High     | Bundle creation form — product list uses drag handles with no `onKeyDown` handler for arrow keys |
| 2   | **No inline field descriptions** for complex fields              | Medium   | Bundle settings fields lack `helpText` prop on some Polaris inputs                               |
| 3   | **Form submission errors show in banner only**                   | Medium   | Error banner at top; user must scroll up to see validation failures on long forms                |

---

## 4. Admin — Loading & Error States

### Loading States ✅

Strong coverage across the app:

- **245 Skeleton component occurrences** across 37 files
- Every major route has a `loading.tsx` with appropriate skeleton layout
- Routes covered: bundles, bundles/create, bundles/[id]/edit, settings, analytics, pricing, dashboard, templates, integrations, automation, ab-testing

### Error States ⚠️

| Component          | Status     | Issue                                                                                                                                                                     |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error.tsx`        | ⚠️         | **Renders `null`** — only triggers a GlobalBanner message. No visual error UI in the component itself. If the banner store fails or is unmounted, user sees a blank page. |
| `not-found.tsx`    | ❌ Missing | No custom 404 page. Users hitting invalid routes see Next.js default.                                                                                                     |
| `global-error.tsx` | ❌ Missing | No root error boundary. If `layout.tsx` itself throws, app shows Next.js default error page (no Polaris styling, no retry).                                               |
| Empty states       | ✅         | 74 occurrences across 19 files — well covered                                                                                                                             |

### Recommended Fixes

**1. `web/app/error.tsx`** — Should render visual fallback UI, not just `null`:

```tsx
export default function Error({ error, reset }) {
    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <Banner
                        title="Something went wrong"
                        tone="critical"
                        action={{ content: "Try again", onAction: reset }}
                    >
                        <p>{error.message || "An unexpected error occurred"}</p>
                    </Banner>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
```

**2. `web/app/not-found.tsx`** — Create custom 404:

```tsx
import { Page, EmptyState } from "@shopify/polaris";

export default function NotFound() {
    return (
        <Page>
            <EmptyState
                heading="Page not found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>The page you're looking for doesn't exist.</p>
            </EmptyState>
        </Page>
    );
}
```

**3. `web/app/global-error.tsx`** — Create root error boundary:

```tsx
"use client";

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <h1>Something went wrong</h1>
                <button onClick={reset}>Try again</button>
            </body>
        </html>
    );
}
```

---

## 5. Admin — Polaris & App Bridge Compliance

### App Bridge Setup ✅

**File**: `web/app/layout.tsx`

| Check                          | Status | Details                                                                        |
| ------------------------------ | ------ | ------------------------------------------------------------------------------ |
| App Bridge CDN script          | ✅     | Loaded via `<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js">` |
| `shopify-api-key` meta tag     | ✅     | Set from `NEXT_PUBLIC_SHOPIFY_API_KEY`                                         |
| `shopify-app-origins` meta tag | ✅     | Set from `NEXT_PUBLIC_HOST`                                                    |
| Polaris CDN script             | ✅     | Loaded for web component support                                               |

### Polaris Web Components

| Component                   | Used | Count                   |
| --------------------------- | ---- | ----------------------- |
| `ui-save-bar` / `SaveBar`   | ✅   | 17 files                |
| `ui-title-bar` / `TitleBar` | ✅   | 9 files                 |
| `ui-nav-menu` / `NavMenu`   | ✅   | 1 file (navigation.tsx) |

### Built for Shopify Checklist

| Requirement                         | Status | Notes                                    |
| ----------------------------------- | ------ | ---------------------------------------- |
| Primary navigation via NavMenu      | ✅     | Correctly implemented                    |
| Secondary navigation via tabs only  | ✅     | Settings uses tabs within page           |
| Full-width on index pages           | ✅     | List pages use full width                |
| SaveBar for unsaved changes         | ✅     | Comprehensive coverage                   |
| No custom navigation patterns       | ✅     | No sidebar nav or custom menus           |
| Loading skeletons match content     | ✅     | Layout-specific skeletons                |
| Error states use Polaris Banner     | ⚠️     | error.tsx renders null instead of Banner |
| Empty states use Polaris EmptyState | ✅     | Good coverage                            |

---

## 6. Admin — Accessibility (WCAG 2.1 AA)

### Current State: ❌ Critical Gaps

**Only 15 `aria-*`/`role`/`tabIndex`/`onKeyDown` attributes found across 7 .tsx files.** For an app of this size (~50+ components), this is extremely low.

| Issue                                         | Severity | Details                                                                                                                |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| **No `eslint-plugin-jsx-a11y`**               | Blocker  | No automated accessibility linting. Violations are not caught at build time.                                           |
| **Drag-and-drop not keyboard accessible**     | High     | Product reordering in bundle form uses drag handles with no keyboard alternative (arrow keys, grab/drop announcements) |
| **No focus management on navigation**         | High     | Route changes don't announce new page or move focus to main content                                                    |
| **No skip-to-content link**                   | Medium   | No mechanism for keyboard users to skip NavMenu                                                                        |
| **No `prefers-reduced-motion`** in components | Medium   | Only 2 occurrences in `temp-polaris-styles.css`, none in component code                                                |
| **Color-only status indicators**              | Medium   | Bundle statuses (ACTIVE/DRAFT/PAUSED) may rely on color badges without text labels                                     |
| **Interactive elements missing labels**       | Medium   | Icon-only buttons (edit, delete, duplicate) likely lack `aria-label`                                                   |
| **No live region for toast/banner**           | Low      | GlobalBanner store dispatches messages but no `aria-live` region wrapping                                              |

### Recommended Fixes

**1. Install and configure `eslint-plugin-jsx-a11y`**:

```bash
bun add -D eslint-plugin-jsx-a11y
```

Add to ESLint config:

```json
{
    "extends": ["plugin:jsx-a11y/recommended"]
}
```

**2. Add keyboard support for drag-and-drop**:

- Implement `onKeyDown` handler for arrow keys on draggable items
- Add `aria-grabbed`, `aria-dropeffect` attributes
- Announce reorder with `aria-live` region: "Product moved to position 3 of 5"

**3. Focus management on route change**:

- Use Next.js `usePathname()` to detect route changes
- Move focus to `<main>` or page heading on navigation

**4. Accessible status badges**:

- Ensure Badge components include visible text, not just color
- Example: `<Badge tone="success">Active</Badge>` ✅ (Polaris already does this)

---

## 7. Storefront — Widget Accessibility

### Current State: ❌ Critical Gaps

**File References**:

- `extension/extensions/product-bundle-widget/blocks/app-block.liquid`
- `extension/extensions/product-bundle-widget/blocks/app-embed.liquid`
- `web/widgets/src/radius-bundles.ts`

| Issue                                        | Severity | Details                                                                                  |
| -------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| **No form labels for quantity input**        | Critical | `quantity_label` variable exists but no `<label for="id">` association                   |
| **Add-to-cart button lacks focus indicator** | Critical | Only hover/active states in CSS; keyboard users can't see focus                          |
| **No `aria-live` for loading/error states**  | Critical | "Adding..." text change not announced to screen readers                                  |
| **Carousel arrows hidden from keyboard**     | High     | Arrows only appear on hover (`:hover .slider-nav`); keyboard-only users can't reach them |
| **Heading hierarchy uncertain**              | High     | Bundle title uses `<h3>` without knowing parent heading context                          |
| **Show more/less not announced**             | Medium   | No `aria-expanded` attribute on expand/collapse toggle                                   |
| **Out-of-stock messages lack role**          | Medium   | Plain text, no `role="alert"` or `aria-live="polite"`                                    |
| **SVG icons lack titles**                    | Low      | Icons have `aria-hidden="true"` (correct for decorative) but no `<title>` fallback       |

### Recommended Fixes

```html
<!-- 1. Form labels -->
<label for="rb-qty-{{ product.id }}">{{ quantity_label }}</label>
<input id="rb-qty-{{ product.id }}" type="number" ... />

<!-- 2. Focus indicator CSS -->
<style>
    .radius-bundle__add-to-cart:focus-visible {
        outline: 2px solid var(--rb-primary-color);
        outline-offset: 2px;
    }
</style>

<!-- 3. Live region for status -->
<div aria-live="polite" role="status" class="radius-bundle__status sr-only">
    <!-- JS updates this: "Adding to cart...", "Added!", "Error: out of stock" -->
</div>

<!-- 4. Always-accessible carousel arrows -->
<style>
    .radius-bundle__slider-nav {
        opacity: 1; /* Always visible, not just on hover */
    }
</style>

<!-- 5. Expand/collapse -->
<button aria-expanded="false" data-more-toggle>
    Show {{ remaining_count }} more
</button>
```

---

## 8. Storefront — Responsive Design

### Current Implementation

The widget has a solid breakpoint system:

| Breakpoint | Width    | Source                |
| ---------- | -------- | --------------------- |
| Desktop    | > 1024px | `app-embed.liquid:12` |
| Tablet     | ≤ 1024px | `app-embed.liquid:12` |
| Mobile     | ≤ 768px  | `app-embed.liquid:13` |

Responsive CSS variables are set per breakpoint, and the admin customizer allows per-breakpoint style overrides (desktop/tablet/mobile).

### Issues

| #   | Issue                                | Severity | Details                                                                           |
| --- | ------------------------------------ | -------- | --------------------------------------------------------------------------------- |
| 1   | **Fixed image sizes**                | Medium   | `small: 60px`, `medium: 80px`, `large: 120px` — no `srcset` or responsive scaling |
| 2   | **No fluid max-width**               | Medium   | `--rb-bundle-max-width` defaults to `600px`; doesn't scale on small screens       |
| 3   | **Carousel slides-per-view fixed**   | Medium   | Set at config time, no dynamic recalculation on resize                            |
| 4   | **Savings banner fixed positioning** | Medium   | `position: fixed` on mobile can obscure content                                   |
| 5   | **Breakpoints not CSS-only**         | Low      | Breakpoints set in Liquid, must match CSS media queries manually                  |

### Recommended Fixes

```css
/* Fluid max-width */
--rb-bundle-max-width: clamp(320px, 100% - 40px, 600px);

/* Responsive image serving */
/* Use Shopify CDN image transforms: {url}&width=60 for mobile, &width=120 for desktop */

/* Mobile savings banner */
@media (max-width: 640px) {
    .radius-savings-banner {
        position: sticky;
        bottom: 0;
    }
}
```

---

## 9. Storefront — Loading & Error Handling

### Loading States ✅ (Good Foundation)

| Feature                 | Status | Details                                                                |
| ----------------------- | ------ | ---------------------------------------------------------------------- |
| Skeleton screens        | ✅     | Each layout (list, grid, carousel, compact) renders matching skeletons |
| Progressive enhancement | ✅     | Static skeleton shown immediately; JS enhances with real data          |
| Shimmer animation       | ✅     | CSS shimmer on skeleton cards                                          |
| Add-to-cart spinner     | ✅     | SVG spinner with `aria-hidden="true"`                                  |
| Button "Adding..." text | ✅     | Text feedback during cart operation                                    |

### Error Handling ❌ (Critical Gaps)

| #   | Issue                                     | Severity | Details                                                                                        |
| --- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| 1   | **Failed product fetch = silent failure** | Critical | `catch(error) { console.error(...) }` — skeleton stays visible forever, no user message        |
| 2   | **No loading timeout**                    | Critical | If API hangs, skeleton shown indefinitely with no timeout fallback                             |
| 3   | **Cart operation errors silent**          | Critical | Network failures during add-to-cart caught and suppressed                                      |
| 4   | **Analytics endpoint fails silently**     | Low      | Not user-facing, but no retry mechanism                                                        |
| 5   | **Invalid JSON parsing**                  | Medium   | `JSON.parse()` on cart attributes with basic catch, discards data silently                     |
| 6   | **Out-of-stock validation incomplete**    | High     | Toggle exists (`enable_stock_validation`) but no visible error message when stock insufficient |
| 7   | **Savings banner update errors hidden**   | Medium   | `fetchCart()` catches errors silently, stale banner shown                                      |

### Recommended Error UX

```html
<!-- Error container (hidden by default) -->
<div
    class="radius-bundle__error"
    role="alert"
    style="display: none;"
    data-bundle-error
>
    <p>This bundle is temporarily unavailable. Please try again later.</p>
</div>
```

```javascript
// Timeout for product fetch
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
    const response = await fetch(url, { signal: controller.signal });
    // ...
} catch (error) {
    if (error.name === "AbortError") {
        showError("Bundle took too long to load. Please refresh.");
    } else {
        showError("Unable to load bundle. Please check your connection.");
    }
} finally {
    clearTimeout(timeout);
}
```

---

## 10. Storefront — Animation & Performance

### Animation Issues

| #   | Issue                                   | Severity | Details                                                                                               |
| --- | --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| 1   | **No `prefers-reduced-motion` support** | High     | Skeleton shimmer, spinner rotation, button hover transforms all animate regardless of user preference |
| 2   | **Carousel drag not optimized**         | Low      | No `will-change: transform` hint on scrollable container                                              |
| 3   | **Banner innerHTML replacement**        | Low      | `contentEl.innerHTML = html` causes full reflow on every update                                       |

### Recommended Motion Fix

```css
@media (prefers-reduced-motion: reduce) {
    .radius-bundle__skeleton-image,
    .radius-bundle__spinner,
    .radius-bundle__add-to-cart {
        animation: none !important;
        transition: none !important;
    }
    .radius-bundle__add-to-cart:hover {
        transform: none !important;
    }
}
```

### Performance Issues

| #   | Issue                               | Severity | Details                                                                           |
| --- | ----------------------------------- | -------- | --------------------------------------------------------------------------------- |
| 1   | **Savings banner polls every 1.5s** | Medium   | `SavingsBanner` fetches cart on interval with no deduplication                    |
| 2   | **No request batching**             | Medium   | Analytics + cart fetch fire independently                                         |
| 3   | **Event listeners not cleaned up**  | Medium   | `SavingsBanner.init()` attaches listeners; `destroy()` exists but is never called |
| 4   | **Script loading**                  | ✅       | Uses `defer` attribute correctly                                                  |

### Shopify Performance Requirement

> Storefront widgets must not reduce Lighthouse performance score by more than 10 points. Target LCP < 2.5s.

**Recommendations**:

- Replace polling with cart event listeners (`cart:change` custom event)
- Add `content-visibility: auto` for below-fold products
- Call `destroy()` on SPA page transitions to prevent memory leaks
- Batch analytics events: queue and send every 5s instead of per-interaction

---

## 11. Storefront — Internationalization

### Current State: ❌ No RTL Support

| #   | Issue                              | Severity | Details                                                                                                           |
| --- | ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | **No RTL (Right-to-Left) support** | Critical | CSS uses `flex-direction: row`, `text-align: left` hardcoded. Arabic, Hebrew, Persian stores display incorrectly. |
| 2   | **No text direction detection**    | Critical | No check for `document.documentElement.dir` or shop locale                                                        |
| 3   | **English label defaults**         | Medium   | Banner label templates use English defaults; non-English stores see English if labels not customized              |
| 4   | **No plural forms**                | Medium   | `{count}` placeholder in `more_products_text` — no pluralization rules                                            |
| 5   | **Percentage formatting**          | Low      | `discountValue + "%"` hardcoded — should be locale-aware (`15,5%` in French)                                      |
| 6   | **Timestamp UTC only**             | Low      | Analytics timestamps use `toISOString()` — no timezone handling                                                   |

### Recommended RTL Fix

```css
/* Logical CSS properties for RTL */
.radius-bundle__product--list {
    /* Replace: flex-direction: row */
    /* With: */
    flex-direction: row; /* falls back for old browsers */
}

[dir="rtl"] .radius-bundle__product--list {
    flex-direction: row-reverse;
}

/* Or use logical properties (modern browsers): */
.radius-bundle__price {
    margin-inline-start: auto; /* instead of margin-left: auto */
    text-align: end; /* instead of text-align: right */
}
```

```javascript
// Detect RTL
const isRTL =
    document.documentElement.dir === "rtl" ||
    getComputedStyle(document.documentElement).direction === "rtl";
if (isRTL) {
    bundleContainer.setAttribute("dir", "rtl");
}
```

---

## 12. Storefront — Image Handling

| #   | Issue                         | Severity | Details                                                     |
| --- | ----------------------------- | -------- | ----------------------------------------------------------- |
| 1   | **No `loading="lazy"`**       | Medium   | Product images loaded via JS without lazy loading attribute |
| 2   | **No responsive images**      | Medium   | No `srcset` — same image size served regardless of viewport |
| 3   | **No image error fallback**   | Medium   | If product image 404s, broken image icon shown              |
| 4   | **Missing alt text strategy** | High     | Product images rendered by JS may lack `alt` attributes     |
| 5   | **Fixed pixel sizes**         | Low      | `60px / 80px / 120px` options — not fluid                   |

### Recommended Fix

```html
<!-- Responsive images with Shopify CDN -->
<img
    loading="lazy"
    alt="{{ product.title }}"
    src="{{ product.image | image_url: width: 120 }}"
    srcset="
        {{ product.image | image_url: width: 60 }} 60w,
        {{ product.image | image_url: width: 120 }} 120w,
        {{ product.image | image_url: width: 240 }} 240w
    "
    sizes="(max-width: 768px) 60px, 120px"
    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
/>
<div class="radius-bundle__product-placeholder" style="display: none;">
    <!-- Fallback icon -->
</div>
```

---

## 13. Priority Action Items

### Blockers (Must Fix Before App Store)

| #   | Item                                           | Area       | Files to Change                         |
| --- | ---------------------------------------------- | ---------- | --------------------------------------- |
| 1   | **Add `not-found.tsx`**                        | Admin      | `web/app/not-found.tsx` (create)        |
| 2   | **Add `global-error.tsx`**                     | Admin      | `web/app/global-error.tsx` (create)     |
| 3   | **Fix `error.tsx` to render visual UI**        | Admin      | `web/app/error.tsx`                     |
| 4   | **Add visible focus indicators to widget**     | Storefront | `bundle-widget.css`                     |
| 5   | **Add error states for failed product fetch**  | Storefront | `radius-bundles.ts`, `app-block.liquid` |
| 6   | **Add `aria-live` regions for status changes** | Storefront | `app-block.liquid`, `radius-bundles.ts` |

### High Priority

| #   | Item                                               | Area       | Files to Change                           |
| --- | -------------------------------------------------- | ---------- | ----------------------------------------- |
| 7   | **Install `eslint-plugin-jsx-a11y`**               | Admin      | `web/eslint.config.*`, `web/package.json` |
| 8   | **Add keyboard support for drag-and-drop**         | Admin      | Bundle creation form components           |
| 9   | **Add `prefers-reduced-motion` media query**       | Storefront | `bundle-widget.css`                       |
| 10  | **Add fetch timeout (5s) with user error message** | Storefront | `radius-bundles.ts`                       |
| 11  | **Fix out-of-stock validation error display**      | Storefront | `app-block.liquid`, `radius-bundles.ts`   |
| 12  | **Associate `<label>` with quantity inputs**       | Storefront | `app-block.liquid` or snippets            |

### Medium Priority

| #   | Item                                                 | Area       | Files to Change                         |
| --- | ---------------------------------------------------- | ---------- | --------------------------------------- |
| 13  | **Add `aria-expanded` to show more/less**            | Storefront | `app-block.liquid`                      |
| 14  | **Make carousel arrows always keyboard-accessible**  | Storefront | `bundle-widget.css`                     |
| 15  | **Add image lazy loading + srcset**                  | Storefront | `radius-bundles.ts`                     |
| 16  | **Replace banner polling with event-driven updates** | Storefront | `radius-bundles.ts`                     |
| 17  | **Add SavingsBanner destroy() calls**                | Storefront | `radius-bundles.ts`                     |
| 18  | **Reduce admin nav to ≤7 items**                     | Admin      | `navigation.tsx`                        |
| 19  | **Use fluid max-width with clamp()**                 | Storefront | `bundle-widget.css`, `app-block.liquid` |
| 20  | **Add focus management on admin route changes**      | Admin      | Shared hook or layout                   |

### Recommended (Post-Launch)

| #   | Item                                           | Area       | Files to Change                          |
| --- | ---------------------------------------------- | ---------- | ---------------------------------------- |
| 21  | **RTL language support**                       | Storefront | `bundle-widget.css`, `radius-bundles.ts` |
| 22  | **Locale-aware number/percentage formatting**  | Storefront | `radius-bundles.ts`                      |
| 23  | **Plural forms for count labels**              | Storefront | `radius-bundles.ts`                      |
| 24  | **Image error fallback placeholder**           | Storefront | `radius-bundles.ts`, CSS                 |
| 25  | **Analytics request batching**                 | Storefront | `radius-bundles.ts`                      |
| 26  | **Content-visibility for off-screen products** | Storefront | `bundle-widget.css`                      |

---

## References

- [Shopify App Design Guidelines](https://shopify.dev/docs/apps/build/app-design-guidelines) — Layout, navigation, forms
- [Built for Shopify Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify) — NavMenu, SaveBar, full-width patterns
- [Shopify Polaris Accessibility](https://polaris.shopify.com/foundations/accessibility) — WCAG 2.1 AA target
- [Next.js Accessibility](https://nextjs.org/docs/architecture/accessibility) — ESLint plugin, focus management
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling) — error.tsx, not-found.tsx, global-error.tsx
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — Perceivable, Operable, Understandable, Robust
