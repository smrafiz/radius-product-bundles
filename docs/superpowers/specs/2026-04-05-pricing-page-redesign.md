# Pricing Page Redesign — Design Spec

**Date:** 2026-04-05
**Status:** Approved
**Branch:** subscription

---

## Problem

The current pricing page (`/settings/plan`) is underdeveloped:
- Plan cards exist but lack visual hierarchy and upgrade urgency
- No feature comparison table (merchant cannot easily see what they're missing)
- No plan usage statistics (no bundle count progress, no quota awareness)
- No contextual plan status — the page looks the same whether you're Free or Pro

---

## Goal

Redesign the pricing page into a conversion-optimized hub that:
1. Shows the merchant's current plan status and live usage stats
2. Presents Free vs Pro plan cards with clear price hierarchy and trial badge
3. Provides a full feature comparison table derived from `PLAN_CONFIGS` (no hardcoding)
4. Retains the existing FAQ section (unchanged)

---

## Approach: Shopify-Native Hub

Single scrolling page, 5 visual zones using Polaris Web Components (`s-*`) and Tailwind CSS 4. No framer-motion (removed in audit P-4). No new dependencies.

---

## Page Layout

```
s-page
└── TitleBar
└── s-stack [block, gap=large]
    ├── Header row (back button + title + subtitle)
    ├── Zone 1: PlanStatusCard
    ├── Zone 2+3: PricingCard (billing toggle + plan cards)
    ├── Zone 4: FeatureComparisonTable
    └── Zone 5: PricingFaq (unchanged)
```

---

## Zone Specifications

### Zone 1 — PlanStatusCard (NEW)

**Component:** `web/features/pricing/components/plan-status-card/plan-status-card.tsx`

**Purpose:** Shows current plan state. Contextual — different content for Free vs Pro.

**Free variant:**
- `s-section` with `s-grid [cols: 1fr auto]`
- Left: `s-heading` "Free Plan" + `s-badge [neutral]` + bundle usage progress bar
- Right: `s-button [primary]` "Upgrade to Pro →" → navigates to pricing section
- Progress bar: native `<div>` with Tailwind width percentage (`w-[60%]`)
- Warning text below bar when `bundleCount >= maxBundles - 1` (approaching limit)
- Critical text when `bundleCount >= maxBundles` (at limit)

**Pro variant:**
- `s-section` with `s-grid [cols: 1fr auto]`
- Left: `s-heading` "Pro Plan" + `s-badge [success]` + optional trial days badge + billing interval + next billing date
- Right: `s-button [secondary]` "Manage Subscription" → scrolls to cards / links to cancel

**Data sources:**
- `usePlan()` → `plan.id` (FREE | PRO)
- `useBillingStatus()` → `billingData.subscription` (interval, currentPeriodEnd, price), `trialDaysRemaining()`
- `useBundleStats()` → `{ totalBundles, maxBundles }` (NEW hook — see Data section)

---

### Zone 2+3 — PricingCard (ENHANCED)

**Components:**
- `web/features/pricing/components/pricing-card/pricing-card.tsx` — enhanced
- `web/features/pricing/components/pricing-card/pricing-card-item.tsx` — enhanced

**Billing toggle changes:**
- Replace current `s-button` pair with a CSS-only toggle switch
- `<button>` element with `<span>` thumb that slides via `transition-transform`
- Annual badge shows "Save 17%" (`s-badge [success]`)
- No framer-motion

**PricingCardItem changes:**
- Larger price typography: `text-4xl font-bold` (up from `text-2xl`)
- Annual equivalent shown below (`$8.33/month billed annually`)
- Pro card: green glow `shadow-[0_0_20px_4px_#d1fae5]` + `ring-2 ring-green-200`
- Pro card: "Most Popular" badge positioned at top-center (existing pattern kept)
- Trial badge (`s-badge [info]`) shown below price on Pro card
- Feature list items use `s-icon [type=check, tone=success, size=small]`
- CTA button full-width (`className="w-full"`)

---

### Zone 4 — FeatureComparisonTable (NEW)

**Component:** `web/features/pricing/components/feature-comparison-table/feature-comparison-table.tsx`

**Purpose:** Side-by-side Free vs Pro feature breakdown. Derived entirely from `PLAN_CONFIGS` — no hardcoded values.

**Structure:**
```
s-section
└── s-heading "Compare Plans"
└── s-text subdued "See everything included in each plan"
└── <table> (native HTML + Tailwind)
    ├── thead: Feature | Free | Pro (with "✦ Popular" badge)
    └── tbody: rows grouped by category
```

**Categories and rows:**

| Category | Feature | Free | Pro |
|---|---|---|---|
| Bundles | Max bundles | 5 | Unlimited |
| Bundles | Products per bundle | 10 | Unlimited |
| Bundles | Bundle types | 3 (FIXED, BOGO, BXGY) | 6 (all) |
| Bundles | Discount types | 3 | 5 |
| Analytics | Analytics | Basic | Full |
| Analytics | Export data | — | ✓ |
| Advanced | A/B Testing | — | ✓ |
| Advanced | Automation | — | ✓ |
| Advanced | AI Insights | — | ✓ |
| Advanced | Custom CSS | — | ✓ |
| Advanced | Templates | — | ✓ |
| Advanced | Remove branding | — | ✓ |
| Advanced | Responsive overrides | — | ✓ |
| Advanced | Duplicate bundle | — | ✓ |
| Support | Support | Email | Priority |

**Data derivation:**
- `maxBundles`: `PLAN_CONFIGS[plan].limits.maxBundles` (-1 → "Unlimited")
- `maxProductsPerBundle`: `PLAN_CONFIGS[plan].limits.maxProductsPerBundle` (-1 → "Unlimited")
- `allowedBundleTypes.length`: count from limits
- Feature gates: iterate `PLAN_CONFIGS[plan].features`, check `gateMode === "enabled"`

**Cell rendering:**
- `true` (enabled) → `s-icon [type=check-circle, tone=success, size=small]`
- `false` (locked) → `<span class="text-gray-300">—</span>`
- string → text value, Pro column uses `font-semibold text-green-700` for "Unlimited"

**Pro column header:** light green background `bg-green-50` on `<th>` and `<td>` cells

---

### Zone 5 — PricingFaq (UNCHANGED)

Existing component. No modifications.

---

## New Data: Bundle Stats

### Action
**File:** `web/features/pricing/actions/get-bundle-stats.action.ts`
```ts
getBundleStatsAction(sessionToken) → { totalBundles: number, maxBundles: number }
```

### Repository
**File:** `web/features/pricing/repositories/shop-plan.repository.ts` (extend existing)
```ts
getBundleCount(shopDomain: string) → number  // prisma.bundle.count({ where: { shop: domain, status: { not: 'DELETED' } } })
```

### Hook
**File:** `web/features/pricing/hooks/use-bundle-stats.ts`
```ts
useBundleStats() → { totalBundles, maxBundles, isLoading, isAtLimit, isApproachingLimit }
```
- Uses React Query with key `["bundle-stats"]`
- `isAtLimit`: `totalBundles >= maxBundles && maxBundles !== -1`
- `isApproachingLimit`: `totalBundles >= maxBundles - 1 && !isAtLimit`

---

## i18n Additions (`web/messages/en.json`)

New keys under `Pricing`:
```json
{
  "PlanStatus": {
    "freePlan": "Free Plan",
    "proPlan": "Pro Plan",
    "bundlesUsed": "{used} / {max} bundles used",
    "bundlesUnlimited": "{used} bundles (unlimited)",
    "approachingLimit": "Approaching bundle limit — upgrade to keep creating",
    "atLimit": "Bundle limit reached — upgrade to Pro for unlimited bundles",
    "upgradeToPro": "Upgrade to Pro",
    "manageSubscription": "Manage Subscription",
    "nextBilling": "Next billing {date}",
    "trialDaysLeft": "{days} days left in trial"
  },
  "ComparisonTable": {
    "title": "Compare Plans",
    "subtitle": "See everything included in each plan",
    "featureCol": "Feature",
    "unlimited": "Unlimited",
    "categories": {
      "bundles": "Bundles",
      "analytics": "Analytics",
      "advanced": "Advanced Features",
      "support": "Support"
    },
    "features": {
      "maxBundles": "Max bundles",
      "maxProducts": "Products per bundle",
      "bundleTypes": "Bundle types",
      "discountTypes": "Discount types",
      "analytics": "Analytics",
      "exportData": "Export data",
      "abTesting": "A/B Testing",
      "automation": "Automation",
      "aiInsights": "AI Insights",
      "customCss": "Custom CSS",
      "templates": "Templates",
      "removeBranding": "Remove branding",
      "responsiveOverrides": "Responsive overrides",
      "duplicateBundle": "Duplicate bundle",
      "support": "Support type"
    }
  }
}
```

---

## Files to Create

| File | Type |
|---|---|
| `web/features/pricing/components/plan-status-card/plan-status-card.tsx` | New component |
| `web/features/pricing/components/feature-comparison-table/feature-comparison-table.tsx` | New component |
| `web/features/pricing/actions/get-bundle-stats.action.ts` | New action |
| `web/features/pricing/hooks/use-bundle-stats.ts` | New hook |

## Files to Modify

| File | Change |
|---|---|
| `web/features/pricing/components/pricing-card/pricing-card.tsx` | CSS toggle switch, billing frequency display |
| `web/features/pricing/components/pricing-card/pricing-card-item.tsx` | Larger price, annual equivalent, full-width button, Pro ring/glow |
| `web/features/pricing/components/pricing-page/pricing-page.tsx` | Add new zones, reorder sections |
| `web/features/pricing/components/index.ts` | Export new components |
| `web/features/pricing/repositories/shop-plan.repository.ts` | Add `getBundleCount` |
| `web/messages/en.json` | Add i18n keys |

---

## Constraints

- No framer-motion (removed in security audit P-4)
- No new npm packages
- Use `s-*` Polaris Web Components where available; native HTML + Tailwind for table and toggle
- Feature table data derived from `PLAN_CONFIGS` constants — not hardcoded
- All text via `useTranslations()` — no inline strings
- Bundle count query filters `status: { not: 'DELETED' }` (consistent with soft-delete plan)
