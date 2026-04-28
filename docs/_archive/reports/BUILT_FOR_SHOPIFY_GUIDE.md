# Built for Shopify Badge Guide

**Generated:** 2026-03-25
**App:** Radius Bundles
**Category:** Product Merchandising > Bundles
**Reference:** [Official BFS Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)

---

## What is Built for Shopify?

Built for Shopify (BFS) is the **highest level of recognition** an app can achieve in the Shopify ecosystem. It signals to merchants that your app meets Shopify's strictest quality standards for performance, design, and integration.

### Benefits

- **Badge on app listing** (search results, category pages, app card)
- **Higher search ranking** in the Shopify App Store
- **Priority review** for additional app submissions
- **Sidekick recommendations** directly in the admin
- **Exclusive ad targeting** by merchant plan across desktop and mobile
- **Annual review** ensures continued quality

### Application Process

1. Meet all prerequisite criteria (automatically evaluated)
2. Apply from Partner Dashboard: **Apps > Your App > Distribution > Apply now**
3. Shopify reviews your app against all BFS criteria
4. Fix issues as raised (3 consecutive failures on the same criterion = 3-month suspension)
5. Badge granted upon passing all criteria

---

## Prerequisites (Must Meet Before Applying)

| Prerequisite | Requirement | Your Status | Action |
|-------------|-------------|-------------|--------|
| App Store listing | Published in Shopify App Store | NOT YET | Submit app for review first |
| Good Partner standing | No active infractions | VERIFY | Check Partner Dashboard |
| Minimum installs | 50+ net installs (paid plan shops) | NOT YET | Grow user base post-launch |
| Minimum reviews | 5+ reviews | NOT YET | Encourage reviews post-launch |
| Minimum rating | Meet recent rating threshold | NOT YET | Deliver quality to earn ratings |

**You cannot apply for BFS until all prerequisites are met.** Focus on getting listed first, then growing to 50 installs and 5 reviews.

---

## Requirement 1: Performance

### 1.1 Admin Performance (Web Vitals)

Shopify measures these at the **75th percentile** over the last 28 days (minimum 100 calls each):

| Metric | Target | Your Likely Status | Notes |
|--------|--------|--------------------|-------|
| LCP (Largest Contentful Paint) | <= 2.5s | LIKELY PASS | Next.js 16 with caching, skeleton loaders |
| CLS (Cumulative Layout Shift) | <= 0.1 | VERIFY | Using skeleton components for loading states |
| INP (Interaction to Next Paint) | <= 200ms | VERIFY | React Query caching, minimal re-renders |

**Action Items:**
- [ ] After launch, monitor Web Vitals in Partner Dashboard
- [ ] Optimize any pages with LCP > 2.5s (consider dynamic imports, prefetching)
- [ ] Ensure loading skeletons match final layout dimensions (CLS)
- [ ] Profile bundle list/edit pages for INP (heavy form interactions)

### 1.2 Storefront Performance

| Metric | Target | Your Likely Status | Notes |
|--------|--------|--------------------|-------|
| Lighthouse score drop | < 10 points | LIKELY PASS | Lightweight theme extension (Liquid + small JS widget) |

**Action Items:**
- [ ] Run Lighthouse on test store before/after enabling the app
- [ ] Document results (required for submission form)
- [ ] Widget JS is ~65KB (gzipped ~15KB) - monitor bundle size

### 1.3 Checkout Performance

| Metric | Target | Your Status | Notes |
|--------|--------|--------------------|-------|
| Carrier rate p95 < 500ms | N/A | NOT APPLICABLE | App does not provide carrier rates |
| Discount function speed | N/A | PASS | Rust WASM discount function is fast by design |

---

## Requirement 2: Integration

### 2.1 Embedded App

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 3.1.1 Embedded in Shopify admin | PASS | `embedded = true` in `shopify.app.toml`; App Bridge loaded |
| 3.1.2 Primary workflows inside Shopify | PASS | Bundle CRUD, settings, analytics all embedded |
| 3.1.3 Seamless sign-up (no extra login) | PASS | OAuth via Shopify SDK, no additional signup required |
| 3.1.4 Simplified monitoring/reporting | PASS | Dashboard shows analytics, bundle performance, setup status |
| 3.1.5 Third-party settings within Shopify | N/A | No third-party integrations |

### 2.2 Installation & Asset Management

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 3.2.1 Clean uninstallation | PASS | Theme app extension blocks auto-removed; `shop/redact` webhook cleans DB |
| 3.2.2 No Asset API misuse | PASS | No ScriptTag or Asset API usage; pure theme extension |

### 2.3 Category-Specific: Product Bundles (Section 5.10)

This is the **most critical BFS requirement** for your app category.

| Requirement | Details | Your Status | Notes |
|-------------|---------|-------------|-------|
| 5.10.1 Use bundles primitives | Must use GraphQL Admin API for static bundles OR `cartTransform` for customized bundles | **REVIEW NEEDED** | See detailed analysis below |

#### Bundles Primitives Analysis

**Official Requirement (Section 5.10.1):**
> Your app must either use the GraphQL Admin API to create [static bundles](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-fixed-bundle) or use a `cartTransform` function to create [customized bundles](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-customized-bundle).

**Exception Clause:**
> If your app supports a bundles use case that is not yet supported through these APIs -- such as selling bundles on unsupported sales channels, selling bundles as a part of a subscription, or editing orders to add or remove bundles after purchase -- you may use other methods.

**Your Current Implementation:**
- Custom Prisma database for bundle definitions
- Rust WASM Discount Function for price calculation
- Metafields for storefront data
- Liquid theme extension for widget rendering
- Optional Shopify Product creation (bundle-as-product feature)

**Assessment:** Your app does NOT currently use Shopify's native bundle primitives (`ProductBundleCreate`, `BundleComponentsInput`, or `cartTransform`). This is a **potential BFS blocker**.

**Recommendation:** You have two paths:

**Path A: Adopt Bundle Primitives (Recommended for BFS)**
1. For FIXED_BUNDLE type: Use [static bundle API](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-fixed-bundle) via `productBundleCreate` mutation
2. For customizable types (MIX_AND_MATCH, etc.): Implement `cartTransform` function
3. Keep your discount function for price calculation
4. This is the safest path to BFS approval

**Path B: Claim Exception**
- Argue that your BOGO/BUY_X_GET_Y types are discount-based mechanics not supported by native bundle primitives
- This is risky -- Shopify may or may not accept this argument
- Document your reasoning in the BFS application

---

## Requirement 3: Design

### 3.1 Familiar (Looks Like Shopify Admin)

| Requirement | Status | Notes |
|-------------|--------|-------|
| 4.1.1 Follow UX best practices | PASS | Polaris web components, card-based layout, consistent spacing |
| 4.1.2 Mobile-friendly | PASS | Responsive grid (`md:col-span-7`), no horizontal scroll |
| 4.1.3 Concise app name | PASS | "Radius Bundles" fits without truncation |
| 4.1.4 Use the nav menu (`s-app-nav`) | **ACTION NEEDED** | Must verify `s-app-nav` or `NavMenu` integration |
| 4.1.5 Use contextual save bar | PASS | `SaveBar` from App Bridge in `GlobalForm` |
| 4.1.6 Use modals appropriately | PASS | `s-modal` with proper `heading`, `primary-action`, `secondary-actions` slots |

**Action Items:**
- [ ] Verify `s-app-nav` / `NavMenu` component is configured for primary navigation
- [ ] If using TitleBar breadcrumbs only, add proper app nav

### 3.2 Helpful (Works Well, Easy to Use)

| Requirement | Status | Notes |
|-------------|--------|-------|
| 4.2.1 Spelling, grammar, phrasing | PASS | i18n with professional English + French translations |
| 4.2.2 Helpful onboarding | PASS | Dashboard setup guide with progress steps, dismissible |
| 4.2.3 Helpful homepage | PASS | Dashboard shows: analytics, setup status, widget/embed status, quick actions |
| 4.2.4 Helpful error messages | **NEEDS WORK** | Error banners may auto-dismiss; must be persistent, red, contextual |
| 4.2.5 Guide merchants to logical actions | PASS | Primary buttons for save, secondary for discard/cancel |
| 4.2.6 Visible previews | PASS | Bundle preview panel in right column during creation/edit |

**Action Items:**
- [ ] Set `autoHide: false` for ALL error banners/toasts (BFS rejects auto-dismissing errors)
- [ ] Verify all field-level validation errors appear red and contextual (below the field)
- [ ] Ensure error banners remain until manually dismissed

### 3.3 User-Friendly (No Dark Patterns)

| Requirement | Status | Notes |
|-------------|--------|-------|
| 4.3.1 No false claims | PASS | No revenue/conversion guarantees |
| 4.3.2 No pressure tactics | PASS | No countdown timers, no shame-based CTAs |
| 4.3.3 No distracting animations | PASS | No auto-popups, no wiggling buttons |
| 4.3.4 Not overwhelming | PASS | Step-by-step bundle creation, not one massive form |
| 4.3.5 Don't impersonate Shopify | VERIFY | Ensure app icon is distinct from Shopify first-party apps |
| 4.3.6 Dismissible ads | N/A | No advertisements in app |
| 4.3.7 Label/disable premium features | N/A | No paid tiers currently (add if monetizing) |

---

## Complete Action Plan

### Phase 1: App Store Listing (Do First)

These are required just to get listed in the App Store:

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Create and host privacy policy | BLOCKER | Low |
| 2 | Prepare app icon (1200x1200px) | BLOCKER | Low |
| 3 | Write app listing description | BLOCKER | Medium |
| 4 | Create 4-6 screenshots | BLOCKER | Medium |
| 5 | Record English screencast of setup + workflow | BLOCKER | Medium |
| 6 | Add emergency developer contact | BLOCKER | Trivial |
| 7 | Run Lighthouse before/after test | REQUIRED | Low |
| 8 | Run Shopify automated checks | REQUIRED | Low |
| 9 | Submit for review | REQUIRED | Trivial |

### Phase 2: Grow to BFS Prerequisites (Post-Launch)

| # | Action | Target |
|---|--------|--------|
| 10 | Acquire 50+ net installs from paid shops | Milestone |
| 11 | Earn 5+ reviews | Milestone |
| 12 | Maintain good rating | Ongoing |
| 13 | Monitor Web Vitals in Partner Dashboard | Ongoing |

### Phase 3: BFS Technical Compliance (Before Applying)

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 14 | Implement bundle primitives (Path A) OR document exception (Path B) | CRITICAL | High (Path A) / Low (Path B) |
| 15 | Verify `s-app-nav` navigation integration | HIGH | Low |
| 16 | Make error banners non-auto-dismissing | HIGH | Low |
| 17 | Verify WCAG 2.1 AA contrast ratios | MEDIUM | Medium |
| 18 | Test all flows on mobile devices | MEDIUM | Medium |
| 19 | Verify no sub-pages missing back buttons | LOW | Low |

### Phase 4: Apply for BFS

| # | Action |
|---|--------|
| 20 | Go to Partner Dashboard > Apps > Distribution |
| 21 | Review all auto-evaluated criteria |
| 22 | Click "Apply now" |
| 23 | Respond to reviewer feedback promptly |
| 24 | Fix any issues on first attempt (3 failures = 3-month suspension) |

---

## BFS Requirements Checklist Summary

### Legend: PASS / NEEDS WORK / ACTION NEEDED / VERIFY / N/A

| # | Requirement | Category | Status |
|---|-------------|----------|--------|
| 1.1.1 | Meet App Store requirements | Prerequisites | NEEDS WORK (privacy policy) |
| 1.1.2 | Good Partner standing | Prerequisites | VERIFY |
| 1.2.1 | 50+ net installs | Prerequisites | NOT YET |
| 1.2.2 | 5+ reviews | Prerequisites | NOT YET |
| 1.2.3 | Minimum rating | Prerequisites | NOT YET |
| 2.1.1 | LCP <= 2.5s | Performance | VERIFY (post-launch) |
| 2.1.2 | CLS <= 0.1 | Performance | VERIFY (post-launch) |
| 2.1.3 | INP <= 200ms | Performance | VERIFY (post-launch) |
| 2.2.1 | Lighthouse drop < 10 | Performance | LIKELY PASS |
| 3.1.1 | Embedded in admin | Integration | PASS |
| 3.1.2 | Primary workflows in admin | Integration | PASS |
| 3.1.3 | Seamless sign-up | Integration | PASS |
| 3.1.4 | Simplified monitoring | Integration | PASS |
| 3.2.1 | Clean uninstall | Integration | PASS |
| 3.2.2 | No Asset API misuse | Integration | PASS |
| 4.1.1 | UX best practices | Design | PASS |
| 4.1.2 | Mobile-friendly | Design | PASS |
| 4.1.3 | Concise app name | Design | PASS |
| 4.1.4 | Nav menu (`s-app-nav`) | Design | ACTION NEEDED |
| 4.1.5 | Contextual save bar | Design | PASS |
| 4.1.6 | Modals | Design | PASS |
| 4.2.1 | Spelling/grammar | Design | PASS |
| 4.2.2 | Onboarding | Design | PASS |
| 4.2.3 | Helpful homepage | Design | PASS |
| 4.2.4 | Error messages | Design | NEEDS WORK |
| 4.2.5 | Logical actions | Design | PASS |
| 4.2.6 | Visible previews | Design | PASS |
| 4.3.1-7 | User-friendly (no dark patterns) | Design | PASS |
| 5.10.1 | Bundles primitives | Category | ACTION NEEDED |

**Score: 21 PASS / 2 NEEDS WORK / 2 ACTION NEEDED / 5 VERIFY / 3 NOT YET**

---

## Key Risks for BFS Rejection

| Risk | Severity | Mitigation |
|------|----------|------------|
| Not using bundle primitives (5.10.1) | HIGH | Adopt `productBundleCreate` for fixed bundles, or document exception |
| Error messages auto-dismiss (4.2.4) | MEDIUM | Set `autoHide: false` for error states |
| Missing nav menu (4.1.4) | MEDIUM | Implement `s-app-nav` or `NavMenu` component |
| Web Vitals not meeting targets | LOW | Monitor post-launch, optimize as needed |

---

## Timeline Suggestion

```
Month 1-2:    App Store submission (fix privacy policy, prepare listing)
Month 2-4:    Grow to 50 installs + 5 reviews
Month 3-4:    Implement BFS technical fixes (bundles primitives, nav, errors)
Month 4-5:    Monitor Web Vitals, verify all BFS criteria
Month 5:      Apply for Built for Shopify
```

---

## Resources

- [App Store Requirements Checklist](https://shopify.dev/docs/apps/launch/app-requirements-checklist)
- [Built for Shopify Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)
- [Built for Shopify Overview & Benefits](https://shopify.dev/docs/apps/launch/built-for-shopify)
- [Submit App for Review](https://shopify.dev/docs/apps/launch/app-store-review/submit-app-for-review)
- [Privacy Law Compliance](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance)
- [Session Token Authentication](https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens)
- [Product Bundles: Static Bundles](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-fixed-bundle)
- [Product Bundles: Customized Bundles](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-customized-bundle)
- [App Performance Optimization](https://shopify.dev/docs/apps/build/performance)
- [BFS Changelog](https://shopify.dev/changelog?filter=built_for_shopify)

---

*This guide is specific to Radius Bundles and should be updated as the app evolves and Shopify updates its requirements.*
