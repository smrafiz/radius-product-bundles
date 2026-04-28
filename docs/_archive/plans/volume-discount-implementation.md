# Volume Discount — Implementation Plan

**Date:** 2026-04-06
**Status:** Ready for engineering
**Type:** Pro-only feature
**Scope:** Bundle creation page (Phase 1)

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Pro Gating Strategy](#2-pro-gating-strategy)
3. [Wizard Step Breakdown](#3-wizard-step-breakdown)
4. [Data Shape](#4-data-shape)
5. [Zod Schema Changes](#5-zod-schema-changes)
6. [Store Changes](#6-store-changes)
7. [Constants Changes](#7-constants-changes)
8. [File Change List](#8-file-change-list)
9. [Task List](#9-task-list)
10. [Acceptance Criteria](#10-acceptance-criteria)
11. [Riskiest Changes & Mitigations](#11-riskiest-changes--mitigations)
12. [Phase 2 Backlog](#12-phase-2-backlog)

---

## 1. Feature Overview

### What
Add `VOLUME_DISCOUNT` as a fully functional bundle type. Merchants define quantity tiers — each tier has a minimum quantity and a discount. Customers get the discount that matches the quantity they add to cart.

### What Already Exists
- `VOLUME_DISCOUNT` in the `BundleType` Prisma enum (currently `hidden: true` in constants)
- `volumeTiers: Json?` field on the `Bundle` model (no migration needed)
- `QUANTITY_BREAKS` in the `DiscountType` enum
- `VolumeTiers` component at `/web/features/settings/components/style-customizer/bundle-layout/elements/volume-tiers.tsx` (used in customizer preview — reuse for bundle preview)
- `openEnded` is **not** yet on `ExtendedBundleFormData` — must be added

### What Doesn't Exist Yet
- `VolumeDiscountSettings` component (tier repeater)
- `VolumeReviewSection` component
- `VOLUME_TABLE/CARDS/LIST/COMPACT` layout constants
- Pro gating for this bundle type
- Full `volumeTierSchema` with per-tier validation

### Goals
- Merchants can create a volume discount bundle via the 4-step wizard
- Free plan users cannot access the wizard — redirected to `/pricing`
- Up to 10 tiers per bundle, 1 product minimum
- Tiers stored as JSON in `Bundle.volumeTiers`
- Preview updates live as tiers are edited

---

## 2. Pro Gating Strategy

Three independent layers. All three must be in place before shipping.

### Layer 1 — Bundle Type Card (UI)

**File:** `bundle-type-card.tsx`

Free users see the VOLUME_DISCOUNT card on the type selection page. It looks like a normal card with a `[Pro]` badge. Clicking "Select" does NOT navigate to the wizard — it calls `useAppNavigation().goTo(ROUTES.PRICING)()`.

```
Free plan card:
┌──────────────────────────────┐
│  [icon]               [Pro]  │
│                              │
│  Volume Discount             │
│  Reward customers who        │
│  buy more.                   │
│                              │
│  [ Select ]  ← redirects to /pricing
└──────────────────────────────┘

Pro plan card:
┌──────────────────────────────┐
│  [icon]                      │
│                              │
│  Volume Discount             │
│  Reward customers who        │
│  buy more.                   │
│                              │
│  [ Select ]  ← navigates to wizard
└──────────────────────────────┘
```

Logic:
```typescript
const { canUse } = usePlan();
const isLocked = bundleType.proRequired === true && !canUse("volume_discount");

const handleSelect = () => {
  if (isLocked) {
    goTo(ROUTES.PRICING)();
  } else {
    goTo(ROUTES.CREATE_BUNDLE(bundleType.id))();
  }
};
```

### Layer 2 — Create Route (Server-Side)

**File:** `/web/app/(dashboard)/bundles/create/[bundleType]/page.tsx`

Before rendering the wizard, check plan. If `bundleType === "volume-discount"` and plan is not PRO, redirect.

```typescript
// After session + shop resolution:
if (params.bundleType === "volume-discount" && shop.plan !== "PRO") {
  redirect(ROUTES.PRICING);
}
```

Use the same session pattern already used in this file. This prevents direct URL access.

### Layer 3 — Edit Route (Server-Side)

**File:** `/web/app/(dashboard)/bundles/[id]/edit/page.tsx`

After fetching the bundle, if `bundle.type === "VOLUME_DISCOUNT"` and plan is not PRO, redirect.

```typescript
if (bundle.type === "VOLUME_DISCOUNT" && shop.plan !== "PRO") {
  redirect(ROUTES.PRICING);
}
```

This handles merchants who downgraded from Pro to Free while having existing volume discount bundles.

---

## 3. Wizard Step Breakdown

### Step 1 — Products

**Changes from FIXED_BUNDLE:**
- Info banner always visible (not just when 0 products)
- Min products: 1 (not 2)
- No `sameProductMode` toggle
- No role badges on product items

```
┌───────────────────────────────────────────────────────────────┐
│  s-section — Bundle Details                                   │
│  [bundle name field — unchanged]                              │
│  [description field — unchanged]                              │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Select Products                                  │
│                                                               │
│  s-banner tone="info"                                         │
│  "Volume discounts apply to any quantity of the selected      │
│   products. Add at least 1 product."                          │
│                                                               │
│  [+ Add Products]                                             │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [img]  Product Title A               $30.00       [✕]  │  │
│  │  [img]  Product Title B               $18.00       [✕]  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  (no sameProductMode toggle)                                  │
│  (no role assignments)                                        │
└───────────────────────────────────────────────────────────────┘
```

**Key implementation note:** The existing `products.min(2)` Zod validation must become conditional. See [Section 5](#5-zod-schema-changes) for the exact change.

---

### Step 2 — Volume Discount Settings

This step **replaces** the normal `DiscountStep` entirely for `VOLUME_DISCOUNT`. No `DiscountSettings`, no `BxgyDiscountSettings`, no `BundleAsProduct`, no `BundleBehavior`.

```
┌───────────────────────────────────────────────────────────────┐
│  s-section — Discount Type                                    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐    │
│  │   [  Percentage %  ]   [  Fixed Amount $  ]           │    │
│  └───────────────────────────────────────────────────────┘    │
│  s-segmented-control (2 options only)                         │
│                                                               │
│  s-switch (default: ON)                                       │
│  "Apply last tier discount to all quantities above maximum"   │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  Tier 1                                               [✕ disabled]
│                                                               │
│  Min Quantity *              Discount *                       │
│  ┌─────────────┐             ┌─────────────┐                  │
│  │      1      │             │             │  % (or $)        │
│  └─────────────┘             └─────────────┘                  │
│  (int, min: 1)               (0–99.99 or 0–999999.99)         │
│                                                               │
│  Title                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Buy {quantity}, get {discount} off                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│  Variables: {quantity}  {discount}   max 50 chars             │
│                                                               │
│  ▶ Optional Settings                                          │
│  (collapsed; click to expand)                                 │
│                                                               │
│  ┌── Expanded ──────────────────────────────────────────────┐ │
│  │  Subtitle                                                │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │                                                 │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │  max 80 chars                                            │ │
│  │                                                          │ │
│  │  Badge Style               Badge Text                   │ │
│  │  ┌──────────────────┐      ┌───────────────────────┐    │ │
│  │  │  None          ▾ │      │  (hidden when None)   │    │ │
│  │  └──────────────────┘      └───────────────────────┘    │ │
│  │  Options: None / Popular / Best Value / Custom           │ │
│  │  Badge Text: max 30 chars; visible only when style ≠ None│ │
│  │                                                          │ │
│  │  ◉  Pre-select this tier for customers                  │ │
│  │     (radio — only one tier active at a time)            │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  Tier 2                                               [✕]     │
│  Min Quantity *              Discount *                       │
│  (auto-suggests prev minQty + 1)                              │
│  ...same structure...                                         │
└───────────────────────────────────────────────────────────────┘

                    [ + Add Tier ]
         (disabled at 10 tiers; banner shown at limit)

  s-banner tone="info" shown when tiers.length === 10:
  "Maximum of 10 tiers reached."
```

**Tier remove button rules:**
- `tiers.length === 1` → button disabled (grey, not hidden)
- `tiers.length >= 2` → button enabled

**"Add Tier" auto-suggestion:**
```typescript
const suggestedMinQty = tiers[tiers.length - 1].minQuantity + 1;
addTier({ minQuantity: suggestedMinQty, discount: undefined, title: DEFAULT_TITLE });
```

**Pre-select radio behavior:**
When a tier is toggled to `isDefault: true`, all other tiers must be set to `isDefault: false`. This is enforced in the store action, not in the component.

**Badge text visibility:**
```typescript
const showBadgeText = tier.badge?.style !== "none" && tier.badge?.style !== undefined;
```

---

### Step 3 — Appearance

No structural change to the step. Only the layout options differ for `VOLUME_DISCOUNT`.

```
┌───────────────────────────────────────────────────────────────┐
│  s-section — Layout                                           │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  TABLE   │  │  CARDS   │  │  LIST    │  │ COMPACT  │     │
│  │ [thumb]  │  │ [thumb]  │  │ [thumb]  │  │ [thumb]  │     │
│  │ Volume   │  │ Volume   │  │ Volume   │  │ Volume   │     │
│  │ Table    │  │ Cards    │  │ List     │  │ Compact  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Position                                         │
│  (unchanged — WidgetPosition component as-is)                 │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Display Settings                                 │
│  (unchanged — WidgetDisplaySettings component as-is)          │
└───────────────────────────────────────────────────────────────┘
```

**Asset images required (4 new files):**
- `/web/public/assets/widget-volume-table-layout.png`
- `/web/public/assets/widget-volume-cards-layout.png`
- `/web/public/assets/widget-volume-list-layout.png`
- `/web/public/assets/widget-volume-compact-layout.png`

These must be created before Step 3 is testable. Use placeholder images if needed for initial dev.

---

### Step 4 — Review (VolumeReviewSection)

Replaces `BundleSummary` for `VOLUME_DISCOUNT`. Mirrors the `BxgyReviewSection` pattern.

```
┌───────────────────────────────────────────────────────────────┐
│  s-section — Bundle Info                                      │
│  Name          [bundle name or "Not set"]                     │
│  Description   [description or "Not set"]                     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Volume Configuration                             │
│  Discount Type    Percentage (or Fixed Amount)                │
│  Open-Ended       Yes — applies last tier to higher qtys      │
│                   (or: No — exact quantities only)            │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Tiers                                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Min Qty  │  Discount  │  Title                         │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  1        │  10%       │  Buy 1, get 10% off            │  │
│  │  3        │  20%       │  Buy 3, get 20% off            │  │
│  │  5        │  30%       │  Buy 5, get 30% off            │  │
│  └─────────────────────────────────────────────────────────┘  │
│  (read-only s-box with HTML table inside)                     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Products  ▼ (collapsible, default open)          │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [img]  Product Title A               $30.00            │  │
│  │  [img]  Product Title B               $18.00            │  │
│  └─────────────────────────────────────────────────────────┘  │
│  (no role badges — volume bundles have no product roles)      │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  s-section — Status                                           │
│  [DRAFT badge]                                                │
└───────────────────────────────────────────────────────────────┘
```

---

### Right-Side Preview Panel

```
┌───────────────────────────────────────────────────────────────┐
│  Bundle Preview            [🖥 Desktop] [📱 Tablet] [📲 Mobile]│
│                                                               │
│  Empty state (no products selected):                          │
│  "Add products to see a preview"                              │
│                                                               │
│  With products + tiers:                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  radius-bundle-widget                                   │  │
│  │                                                         │  │
│  │  Product Name                         $30.00 each       │  │
│  │                                                         │  │
│  │  ── Quantity Tiers ─────────────────────────────────    │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Buy 1+   │   10% off   │   $27.00 each          │   │  │
│  │  │  Buy 3+   │   20% off   │   $24.00 each          │   │  │
│  │  │  Buy 5+   │   30% off   │   $21.00 each          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                         │  │
│  │  [Add to Cart]                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Preview price computation:**
```typescript
// In usePreviewVolumeTiers() hook inside bundle-preview.tsx:
const computeTierPrice = (unitPrice: number, tier: VolumeTier, discountType: "PERCENTAGE" | "FIXED_AMOUNT") => {
  if (discountType === "PERCENTAGE") {
    return Math.max(0, unitPrice * (1 - tier.discount / 100));
  }
  return Math.max(0, unitPrice - tier.discount);
};

// Map for VolumeTiers component:
const previewTiers = volumeTiers.map(tier => ({
  qty: tier.minQuantity,
  discount: tier.discount,
  price: computeTierPrice(firstProduct.price, tier, discountType),
}));
```

---

## 4. Data Shape

### New TypeScript Types (add to `bundle.types.ts`)

```typescript
export type VolumeBadgeStyle = "none" | "popular" | "best-value" | "custom";

export interface VolumeTierBadge {
  style: VolumeBadgeStyle;
  text?: string; // max 30 chars; required only when style === "custom"
}

export interface VolumeTier {
  minQuantity: number;    // int, min 1, strictly increasing across all tiers
  discount: number;       // 0–99.99 for PERCENTAGE; 0–999999.99 for FIXED_AMOUNT
  title: string;          // max 50 chars; default: "Buy {quantity}, get {discount} off"
  subtitle?: string;      // max 80 chars
  badge?: VolumeTierBadge;
  isDefault?: boolean;    // radio group — only one tier may have isDefault: true
}

export interface VolumeDiscountConfig {
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  openEnded: boolean;     // if true, last tier discount applies to all higher quantities
  tiers: VolumeTier[];    // 1–10 tiers
}

export type VolumeLayout =
  | "VOLUME_TABLE"
  | "VOLUME_CARDS"
  | "VOLUME_LIST"
  | "VOLUME_COMPACT";

// Add VolumeLayout to BundleLayoutType union:
// export type BundleLayoutType = FixedBundleLayout | BogoLayout | BxgyLayout | VolumeLayout;

// Add proRequired to BundleConfig:
// export interface BundleConfig {
//   ...existing fields...
//   proRequired?: boolean;
// }
```

### `ExtendedBundleFormData` additions

Add `openEnded` field:

```typescript
// In the existing ExtendedBundleFormData interface:
openEnded?: boolean; // new — for VOLUME_DISCOUNT only
```

### JSON storage

`Bundle.volumeTiers` (Prisma `Json?`) stores `VolumeTier[]`.
`Bundle.discountType` stores `"QUANTITY_BREAKS"` for volume discount bundles — this is the existing enum value that semantically fits.
`Bundle.openEnded` — this field does NOT exist on Bundle model. It must be stored inside `volumeTiers` JSON as a wrapper object, OR we store it as a separate field.

**Decision: Store `openEnded` in `Bundle.volumeTiers` as a wrapper:**

```typescript
// Stored in DB as Bundle.volumeTiers:
{
  discountType: "PERCENTAGE",
  openEnded: true,
  tiers: [
    { minQuantity: 1, discount: 10, title: "Buy {quantity}, get {discount} off" },
    { minQuantity: 3, discount: 20, title: "Buy {quantity}, get {discount} off" },
  ]
}
```

This avoids a schema migration. The `discountValue` field on Bundle is set to `0` (satisfies non-null constraint, unused for volume discounts). The `discountType` field on Bundle is set to `"QUANTITY_BREAKS"`.

---

## 5. Zod Schema Changes

**File:** `/web/features/bundles/schema/zod.schema.ts`

### 5.1 — Replace `volumeTierSchema`

Find and replace the existing minimal `volumeTierSchema`:

```typescript
// BEFORE (existing — minimal):
const volumeTierSchema = z.object({
  quantity: z.number().int().min(1),
  discount: z.number().min(0).max(100),
});

// AFTER (full):
const volumeTierBadgeSchema = z.object({
  style: z.enum(["none", "popular", "best-value", "custom"]),
  text: z.string().max(30).optional(),
});

const volumeTierSchema = z.object({
  minQuantity: z.number().int().min(1, "Minimum quantity must be at least 1"),
  discount: z.number()
    .min(0, "Discount cannot be negative")
    .max(999999.99, "Discount exceeds maximum"),
  title: z.string()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less"),
  subtitle: z.string().max(80, "Subtitle must be 80 characters or less").optional(),
  badge: volumeTierBadgeSchema.optional(),
  isDefault: z.boolean().optional(),
});
```

### 5.2 — Replace `volumeTiersSchema`

```typescript
// BEFORE (if exists — minimal array check):
const volumeTiersSchema = z.array(volumeTierSchema).optional();

// AFTER (full with wrapper + validation):
const volumeDiscountConfigSchema = z.object({
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  openEnded: z.boolean().default(true),
  tiers: z.array(volumeTierSchema)
    .min(1, "At least one tier is required")
    .max(10, "Maximum of 10 tiers allowed"),
}).superRefine((config, ctx) => {
  // Rule: minQuantity must be strictly increasing
  config.tiers.forEach((tier, idx) => {
    if (idx > 0) {
      const prev = config.tiers[idx - 1];
      if (tier.minQuantity <= prev.minQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tier ${idx + 1} minimum quantity must be greater than tier ${idx} (${prev.minQuantity})`,
          path: ["tiers", idx, "minQuantity"],
        });
      }
    }
  });

  // Rule: discount values must be present (not undefined)
  config.tiers.forEach((tier, idx) => {
    if (tier.discount === undefined || tier.discount === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount value is required",
        path: ["tiers", idx, "discount"],
      });
    }
  });

  // Rule: PERCENTAGE discount must be 0–99.99
  if (config.discountType === "PERCENTAGE") {
    config.tiers.forEach((tier, idx) => {
      if (tier.discount > 99.99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentage discount cannot exceed 99.99%",
          path: ["tiers", idx, "discount"],
        });
      }
    });
  }

  // Rule: only one tier may have isDefault: true
  const defaultTiers = config.tiers.filter(t => t.isDefault === true);
  if (defaultTiers.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Only one tier can be pre-selected",
      path: ["tiers"],
    });
  }
});
```

### 5.3 — Conditionalize `products.min()`

**CRITICAL CHANGE — high regression risk.**

```typescript
// BEFORE (in createBundleSchema or equivalent):
products: z.array(productSchema).min(2, "Select at least 2 products"),

// AFTER:
// Step 1: change the hard .min(2) to .min(1) as the array floor:
products: z.array(productSchema).min(1),

// Step 2: add a superRefine to the parent schema object:
.superRefine((data, ctx) => {
  // All existing superRefine logic remains...

  // NEW: conditional product minimum
  if (data.type !== "VOLUME_DISCOUNT" && data.products.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least 2 products",
      path: ["products"],
    });
  }

  // NEW: VOLUME_DISCOUNT requires volumeTiers config
  if (data.type === "VOLUME_DISCOUNT") {
    if (!data.volumeTiers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Volume tier configuration is required",
        path: ["volumeTiers"],
      });
    }
  }
})
```

### 5.4 — Add `openEnded` to form data schema

```typescript
// In the main bundle form schema object:
openEnded: z.boolean().default(true).optional(),
```

### 5.5 — Add `volumeTiers` (full config) to form data schema

```typescript
// Replace or extend the existing volumeTiers field:
volumeTiers: volumeDiscountConfigSchema.optional(),
```

---

## 6. Store Changes

**File:** `/web/features/bundles/stores/bundle.store.ts`
**File:** `/web/features/bundles/utils/helpers/bundle-getters.ts`

### 6.1 — `initialBundleData` (in `bundle-getters.ts`)

```typescript
// Add to initialBundleData:
openEnded: true,
// volumeTiers already exists as undefined — leave as-is
```

### 6.2 — `getDefaultLayout` (in `bundle-getters.ts`)

```typescript
export const getDefaultLayout = (bundleType: BundleType): BundleLayoutType => {
  switch (bundleType) {
    case "BOGO":
    case "BUY_X_GET_Y":
      return "CLASSIC_CARD";
    case "VOLUME_DISCOUNT":   // NEW
      return "VOLUME_TABLE";  // NEW
    default:
      return "CLASSIC_CARD";
  }
};
```

### 6.3 — `resetBundle` (in `bundle.store.ts`)

```typescript
// In the resetBundle action, add VOLUME_DISCOUNT case:
case "VOLUME_DISCOUNT":
  return {
    ...initialBundleData,
    type: "VOLUME_DISCOUNT",
    discountType: "QUANTITY_BREAKS",
    discountValue: 0,
    openEnded: true,
    volumeTiers: {
      discountType: "PERCENTAGE",
      openEnded: true,
      tiers: [
        {
          minQuantity: 1,
          discount: undefined,
          title: "Buy {quantity}, get {discount} off",
        },
      ],
    },
    displaySettings: {
      ...initialBundleData.displaySettings,
      layout: "VOLUME_TABLE",
    },
  };
```

### 6.4 — `setVolumeTierDefault` action (new helper in store)

When a tier's `isDefault` is toggled to `true`, all other tiers must be set to `false`. Add this action or handle it in `updateVolumeTier`:

```typescript
// In the store actions:
setVolumeTierDefault: (tierIndex: number) => {
  set((state) => {
    const config = state.bundleData.volumeTiers as VolumeDiscountConfig;
    if (!config) return state;
    const newTiers = config.tiers.map((t, i) => ({
      ...t,
      isDefault: i === tierIndex,
    }));
    return {
      bundleData: {
        ...state.bundleData,
        volumeTiers: { ...config, tiers: newTiers },
      },
    };
  });
},
```

---

## 7. Constants Changes

### 7.1 — `bundle-types.constants.ts`

```typescript
// VOLUME_DISCOUNT entry:
// BEFORE:
{
  id: "VOLUME_DISCOUNT",
  hidden: true,
  comingSoon: true,
  // ...
}

// AFTER:
{
  id: "VOLUME_DISCOUNT",
  hidden: false,           // make visible
  comingSoon: false,       // remove coming soon badge
  proRequired: true,       // NEW field — triggers Pro gate in card
  label: "Volume Discount",
  description: "Reward customers who buy more with quantity-based discounts.",
  icon: "...",
}
```

Also update `BundleConfig` type to include `proRequired?: boolean`.

### 7.2 — `bundle-details.constants.ts`

```typescript
// Add volume layouts:
export const VOLUME_LAYOUTS: BundleLayout[] = [
  {
    id: "VOLUME_TABLE",
    label: "Volume Table",
    image: "/assets/widget-volume-table-layout.png",
  },
  {
    id: "VOLUME_CARDS",
    label: "Volume Cards",
    image: "/assets/widget-volume-cards-layout.png",
  },
  {
    id: "VOLUME_LIST",
    label: "Volume List",
    image: "/assets/widget-volume-list-layout.png",
  },
  {
    id: "VOLUME_COMPACT",
    label: "Volume Compact",
    image: "/assets/widget-volume-compact-layout.png",
  },
];

// Add to LAYOUTS_BY_BUNDLE_TYPE:
VOLUME_DISCOUNT: VOLUME_LAYOUTS,

// Add to BUNDLE_STEP_FIELD_MAP (maps validation errors to steps):
volumeTiers: 2, // errors in volumeTiers go to Step 2
openEnded: 2,
```

### 7.3 — `plans.constants.ts`

```typescript
// In FREE_CONFIG:
// allowedBundleTypes already excludes VOLUME_DISCOUNT — confirm and leave.

// Add to FREE_CONFIG.limits.allowedLayouts (belt-and-suspenders):
VOLUME_DISCOUNT: [], // no layouts allowed on free plan

// If a "features" lock list exists, add:
{ feature: "volume_discount", gateMode: "redirect" }
// Note: gateMode is "redirect" (to /pricing), not "lock-overlay" (in-page)
// because the entire bundle type is blocked, not just a setting within it.
```

---

## 8. File Change List

### New Files (2)

#### `/web/features/bundles/components/bundle-creation/steps/discount/volume-discount-settings.tsx`

**Purpose:** The main tier repeater component. Renders global controls (discount type segmented control + openEnded switch) and the list of tier cards.

**Key responsibilities:**
- Reads `bundleData.volumeTiers` (as `VolumeDiscountConfig`) from `useBundleStore`
- Reads `bundleData.openEnded` from store
- Renders global discount type segmented control — writes to `volumeTiers.discountType`
- Renders openEnded switch — writes to `volumeTiers.openEnded`
- Renders a `VolumeTierCard` per tier (sub-component within same file or separate)
- "Add Tier" button: adds new tier with `minQuantity = lastTier.minQuantity + 1`
- Validates tiers live (shows inline errors on blur using existing `createBlurHandler` pattern)
- Does NOT render `BundleAsProduct` or `BundleBehavior`

**Sub-component: `VolumeTierCard`**
- Per-tier form: Min Quantity, Discount, Title (essential)
- Collapsible "Optional Settings": Subtitle, Badge Style, Badge Text, Pre-select toggle
- Remove button (disabled when only 1 tier)
- Badge text field hidden when `badge.style === "none"` or undefined

---

#### `/web/features/bundles/components/bundle-creation/steps/review/volume-review-section.tsx`

**Purpose:** Read-only review for VOLUME_DISCOUNT. Shown in Step 4.

**Key responsibilities:**
- Renders bundle name + description (same as other review sections)
- Renders discount type and openEnded as labeled rows
- Renders a read-only HTML table: Min Qty | Discount | Title
- Renders collapsible product list (no role badges) — reuse `renderProductCard` pattern from `bxgy-review-section.tsx`
- Renders status badge

---

### Modified Files (15)

#### 1. `discount-step.tsx`
`/web/features/bundles/components/bundle-creation/steps/discount/discount-step.tsx`

**Change:** Add `isVolume` branch. Suppress `BundleAsProduct` and `BundleBehavior` for volume.

```typescript
// BEFORE:
const isBxgy = BXGY_TYPES.includes(bundleType);
return isBxgy ? <BxgyDiscountSettings /> : <DiscountSettings />;

// AFTER:
const isBxgy = BXGY_TYPES.includes(bundleType);
const isVolume = bundleType === "VOLUME_DISCOUNT";

if (isVolume) {
  return (
    <s-stack gap="base">
      <VolumeDiscountSettings />
    </s-stack>
  );
}

return (
  <s-stack gap="base">
    {isBxgy ? <BxgyDiscountSettings /> : <DiscountSettings />}
    <BundleAsProduct />
    {!isBxgy && <BundleBehavior />}
  </s-stack>
);
```

---

#### 2. `products-step.tsx`
`/web/features/bundles/components/bundle-creation/steps/products/products-step.tsx`

**Changes:**
- Add `isVolume` flag
- Show info banner always (not gated on product count)
- Suppress `sameProductMode` toggle when `isVolume`
- Change `clearErrors` / "proceed" gate from `length >= 2` to `length >= 1` when `isVolume`

---

#### 3. `review-step.tsx`
`/web/features/bundles/components/bundle-creation/steps/review/review-step.tsx`

**Change:** Add `isVolume` branch parallel to `isBxgy`.

```typescript
// BEFORE:
return isBxgy ? <BxgyReviewSection /> : <BundleSummary />;

// AFTER:
const isVolume = bundleType === "VOLUME_DISCOUNT";
if (isVolume) return <VolumeReviewSection />;
if (isBxgy) return <BxgyReviewSection />;
return <BundleSummary />;
```

---

#### 4. `bundle-preview.tsx`
`/web/features/bundles/components/bundle-preview/bundle-preview.tsx`

**Changes:**
- Add `VOLUME_TABLE` (and other volume layouts) to `RenderLayout` switch
- Add `usePreviewVolumeTiers()` local hook that maps `bundleData.volumeTiers.tiers` to `{ qty, discount, price }` shape
- Compute `price` from first selected product's unit price
- Pass mapped tiers to existing `VolumeTiers` component

```typescript
// In RenderLayout:
case "VOLUME_TABLE":
case "VOLUME_CARDS":
case "VOLUME_LIST":
case "VOLUME_COMPACT":
  return <VolumeTiersPreview />;
```

The `VolumeTiersPreview` component (inline or named) renders the existing `VolumeTiers` component from the settings customizer with the mapped data.

---

#### 5. `bundle-type-card.tsx`
`/web/features/bundles/components/bundle-type-selection/bundle-type-card.tsx`

**Changes:**
- Read `bundleType.proRequired`
- Check `canUse("volume_discount")` from `usePlan()`
- When locked: show `[Pro]` badge on card, button redirects to `/pricing`
- When unlocked: normal navigation behavior

---

#### 6. `bundle-types.constants.ts`
`/web/features/bundles/constants/bundle-types.constants.ts`

**Changes:**
- `VOLUME_DISCOUNT.hidden: false`
- `VOLUME_DISCOUNT.comingSoon: false`
- `VOLUME_DISCOUNT.proRequired: true` (new field)
- Update `BundleConfig` type

---

#### 7. `bundle-details.constants.ts`
`/web/features/bundles/constants/bundle-details.constants.ts`

**Changes:**
- Add `VOLUME_LAYOUTS` array (4 entries)
- Add `VOLUME_DISCOUNT: VOLUME_LAYOUTS` to `LAYOUTS_BY_BUNDLE_TYPE`
- Add `volumeTiers: 2` and `openEnded: 2` to `BUNDLE_STEP_FIELD_MAP`

---

#### 8. `zod.schema.ts`
`/web/features/bundles/schema/zod.schema.ts`

**Changes:** See [Section 5](#5-zod-schema-changes) for full details.
- Replace `volumeTierSchema` with full version
- Add `volumeDiscountConfigSchema` with superRefine
- Conditionalize `products.min()` (CRITICAL — see mitigations)
- Add `openEnded` field to form schema

---

#### 9. `bundle.types.ts`
`/web/features/bundles/types/bundle.types.ts`

**Changes:**
- Add `VolumeBadgeStyle`, `VolumeTierBadge`, `VolumeTier`, `VolumeDiscountConfig`, `VolumeLayout` types
- Add `VolumeLayout` to `BundleLayoutType` union
- Add `proRequired?: boolean` to `BundleConfig`
- Add `openEnded?: boolean` to `ExtendedBundleFormData`

---

#### 10. `bundle-getters.ts`
`/web/features/bundles/utils/helpers/bundle-getters.ts`

**Changes:**
- `initialBundleData`: add `openEnded: true`
- `getDefaultLayout`: add `"VOLUME_DISCOUNT"` → `"VOLUME_TABLE"` case

---

#### 11. `bundle.store.ts`
`/web/features/bundles/stores/bundle.store.ts`

**Changes:**
- Add `"VOLUME_DISCOUNT"` case to `resetBundle`
- Optionally add `setVolumeTierDefault` action for radio-group behavior

---

#### 12. `plans.constants.ts`
`/web/shared/constants/plans.constants.ts`

**Changes:**
- Confirm `VOLUME_DISCOUNT` is absent from `FREE_CONFIG.allowedBundleTypes`
- Add `VOLUME_DISCOUNT: []` to `FREE_CONFIG.allowedLayouts`
- Add `volume_discount` to features lock list with `gateMode: "redirect"`

---

#### 13. `create/[bundleType]/page.tsx`
`/web/app/(dashboard)/bundles/create/[bundleType]/page.tsx`

**Change:** Add server-side plan check before rendering wizard.

```typescript
if (params.bundleType === "volume-discount" && shop.plan !== "PRO") {
  redirect(ROUTES.PRICING);
}
```

---

#### 14. `[id]/edit/page.tsx`
`/web/app/(dashboard)/bundles/[id]/edit/page.tsx`

**Change:** After bundle fetch, add plan check.

```typescript
if (bundle.type === "VOLUME_DISCOUNT" && shop.plan !== "PRO") {
  redirect(ROUTES.PRICING);
}
```

---

#### 15. `bundle.mutations.ts` (verify, may not need change)
`/web/features/bundles/repositories/bundle.mutations.ts`

**Verify:** Confirm `volumeTiers: data.volumeTiers ?? Prisma.JsonNull` is already present. If not, add it. The `discountType` mapping must include `"QUANTITY_BREAKS"`. No new fields needed — `openEnded` is stored inside the `volumeTiers` JSON wrapper.

---

## 9. Task List

Tasks are ordered by dependency. Complete each task before starting dependent ones.

### Phase A — Types & Schema Foundation

**Task 1 — Add TypeScript types**
- File: `bundle.types.ts`
- Add: `VolumeBadgeStyle`, `VolumeTierBadge`, `VolumeTier`, `VolumeDiscountConfig`, `VolumeLayout`
- Add `VolumeLayout` to `BundleLayoutType` union
- Add `proRequired?: boolean` to `BundleConfig`
- Add `openEnded?: boolean` to `ExtendedBundleFormData`
- No other files. No logic. Types only.
- Verify: `tsc --noEmit` passes

**Task 2 — Update Zod schema (volumeTierSchema + config)**
- File: `zod.schema.ts`
- Replace `volumeTierSchema` with full version (Section 5.1)
- Add `volumeDiscountConfigSchema` with superRefine (Section 5.2)
- Add `openEnded` field to form data schema (Section 5.4)
- Replace `volumeTiers` field in form schema with `volumeDiscountConfigSchema` (Section 5.5)
- Do NOT touch `products.min()` yet — that is Task 3
- Verify: `tsc --noEmit` passes; existing tests pass

**Task 3 — Conditionalize products.min() in Zod (CRITICAL)**
- File: `zod.schema.ts`
- Change `products.min(2)` → `products.min(1)` plus conditional `superRefine` (Section 5.3)
- Verify: write/run 2 new unit tests:
  - `VOLUME_DISCOUNT` + 1 product → valid
  - `FIXED_BUNDLE` + 1 product → invalid (error on `products`)
  - `FIXED_BUNDLE` + 2 products → valid
- Verify: `tsc --noEmit` passes; all existing bundle schema tests still pass

---

### Phase B — Constants & Store

**Task 4 — Update bundle type constants**
- File: `bundle-types.constants.ts`
- Set `VOLUME_DISCOUNT.hidden = false`
- Set `VOLUME_DISCOUNT.comingSoon = false`
- Add `VOLUME_DISCOUNT.proRequired = true`
- Verify: VOLUME_DISCOUNT card appears on bundle type selection page (visual check)

**Task 5 — Add volume layouts to bundle-details constants**
- File: `bundle-details.constants.ts`
- Add `VOLUME_LAYOUTS` array (4 entries with placeholder image paths)
- Add `VOLUME_DISCOUNT: VOLUME_LAYOUTS` to `LAYOUTS_BY_BUNDLE_TYPE`
- Add `volumeTiers: 2` and `openEnded: 2` to `BUNDLE_STEP_FIELD_MAP`
- Verify: `tsc --noEmit` passes

**Task 6 — Add placeholder layout images**
- Directory: `/web/public/assets/`
- Create 4 PNG placeholder images:
  - `widget-volume-table-layout.png`
  - `widget-volume-cards-layout.png`
  - `widget-volume-list-layout.png`
  - `widget-volume-compact-layout.png`
- These can be 200×150px placeholder images for initial dev
- Verify: image paths resolve (no 404 in browser)

**Task 7 — Update plans constants**
- File: `plans.constants.ts`
- Confirm/add gating config (Section 7.3)
- Verify: `tsc --noEmit` passes

**Task 8 — Update store (resetBundle + initialBundleData)**
- Files: `bundle.store.ts`, `bundle-getters.ts`
- Add `VOLUME_DISCOUNT` case to `resetBundle` (Section 6.3)
- Add `openEnded: true` to `initialBundleData` (Section 6.1)
- Update `getDefaultLayout` (Section 6.2)
- Optionally add `setVolumeTierDefault` action (Section 6.4)
- Verify: `tsc --noEmit` passes

---

### Phase C — Pro Gating

**Task 9 — Pro gate on bundle type card**
- File: `bundle-type-card.tsx`
- Add `proRequired` check + `[Pro]` badge + redirect to `/pricing` (Section 2, Layer 1)
- Verify: on free plan, VOLUME_DISCOUNT card shows `[Pro]` badge; clicking Select redirects to `/pricing`
- Verify: on Pro plan, clicking Select navigates to wizard

**Task 10 — Server-side gate on create route**
- File: `create/[bundleType]/page.tsx`
- Add plan check + redirect (Section 2, Layer 2)
- Verify: direct URL `/bundles/create/volume-discount` on free plan → redirects to `/pricing`

**Task 11 — Server-side gate on edit route**
- File: `[id]/edit/page.tsx`
- Add plan check + redirect after bundle fetch (Section 2, Layer 3)
- Verify: editing a VOLUME_DISCOUNT bundle on free plan → redirects to `/pricing`

---

### Phase D — Wizard Steps

**Task 12 — Update products-step.tsx**
- File: `products-step.tsx`
- Add `isVolume` flag
- Add info banner (always visible for VOLUME_DISCOUNT)
- Suppress `sameProductMode` toggle
- Update proceed gate to `length >= 1` when `isVolume`
- Verify: Step 1 renders correctly for VOLUME_DISCOUNT; existing types unaffected

**Task 13 — Create VolumeDiscountSettings component (core)**
- File: `volume-discount-settings.tsx` (NEW)
- Implement global controls (segmented control + openEnded switch)
- Implement tier card list with Add Tier button
- Implement per-tier essential fields (Min Qty, Discount, Title)
- Implement Remove button (disabled when 1 tier)
- Implement "Add Tier" auto-suggestion
- Connect to store via `useBundleStore`
- Verify: renders without errors; adding/removing tiers works; store updates correctly

**Task 14 — Add optional settings to tier cards**
- File: `volume-discount-settings.tsx`
- Add collapsible "Optional Settings" section per tier
- Add Subtitle, Badge Style, Badge Text, Pre-select toggle
- Implement badge text visibility logic (hidden when style = None)
- Implement pre-select radio group behavior via `setVolumeTierDefault`
- Verify: optional section expands/collapses; badge text hides correctly; only 1 tier can be pre-selected

**Task 15 — Add discount-step.tsx branch**
- File: `discount-step.tsx`
- Add `isVolume` check
- Render `<VolumeDiscountSettings />` for VOLUME_DISCOUNT
- Suppress `BundleAsProduct` and `BundleBehavior`
- Verify: Step 2 shows VolumeDiscountSettings for VOLUME_DISCOUNT; other types unchanged

**Task 16 — Create VolumeReviewSection**
- File: `volume-review-section.tsx` (NEW)
- Implement read-only tier table
- Implement discount config rows (type + openEnded)
- Implement collapsible product list (no role badges)
- Implement status badge
- Verify: Step 4 renders correctly for VOLUME_DISCOUNT

**Task 17 — Update review-step.tsx branch**
- File: `review-step.tsx`
- Add `isVolume` branch
- Render `<VolumeReviewSection />` for VOLUME_DISCOUNT
- Verify: Step 4 shows VolumeReviewSection; BXGY and other types unchanged

---

### Phase E — Preview Panel

**Task 18 — Add volume tier preview to bundle-preview.tsx**
- File: `bundle-preview.tsx`
- Add `usePreviewVolumeTiers()` hook (price computation)
- Add volume layout cases to `RenderLayout`
- Render existing `VolumeTiers` component with mapped data
- Verify: preview shows tier table after products + tiers are added; prices compute correctly; empty state shows before products

---

### Phase F — Verification

**Task 19 — Verify bundle.mutations.ts**
- File: `bundle.mutations.ts`
- Confirm `volumeTiers: data.volumeTiers ?? Prisma.JsonNull` is present
- Confirm `discountType: "QUANTITY_BREAKS"` is handled
- If missing, add. If present, no change.

**Task 20 — Full TypeScript check**
- Run `npx tsc --noEmit` from `/web`
- Fix all errors
- No new `any` types introduced

**Task 21 — Manual QA walkthrough**
- Pro plan: create VOLUME_DISCOUNT bundle end-to-end (all 4 steps → publish)
- Free plan: confirm redirect at card, create URL, and edit URL
- Verify store resets correctly when switching bundle types
- Verify removing all-but-one tier disables remove button
- Verify Add Tier disabled at 10 tiers

**Task 22 — Write schema unit tests**
- File: `zod.schema.test.ts` (new or existing)
- Test cases:
  - VOLUME_DISCOUNT + 1 product → valid
  - FIXED_BUNDLE + 1 product → invalid
  - FIXED_BUNDLE + 2 products → valid
  - VOLUME_DISCOUNT + non-increasing minQuantity → invalid
  - VOLUME_DISCOUNT + overlapping minQuantity → invalid
  - VOLUME_DISCOUNT + empty tiers → invalid
  - VOLUME_DISCOUNT + 11 tiers → invalid
  - PERCENTAGE + discount > 99.99 → invalid
  - 2 tiers with isDefault: true → invalid

---

## 10. Acceptance Criteria

- [ ] **AC-01** VOLUME_DISCOUNT card is visible on the bundle type selection page for all plans
- [ ] **AC-02** Free plan: clicking Select on VOLUME_DISCOUNT card redirects to `/pricing`, does not navigate to wizard
- [ ] **AC-03** Free plan: direct URL `/bundles/create/volume-discount` server-redirects to `/pricing`
- [ ] **AC-04** Free plan: editing a VOLUME_DISCOUNT bundle via direct URL server-redirects to `/pricing`
- [ ] **AC-05** Step 1: info banner is always visible for VOLUME_DISCOUNT (not just at 0 products)
- [ ] **AC-06** Step 1: minimum 1 product required to proceed (not 2)
- [ ] **AC-07** Step 1: no sameProductMode toggle visible for VOLUME_DISCOUNT
- [ ] **AC-08** Step 2: VolumeDiscountSettings renders; BundleAsProduct and BundleBehavior are absent
- [ ] **AC-09** Step 2: Discount type segmented control shows only Percentage and Fixed Amount
- [ ] **AC-10** Step 2: Adding a tier auto-suggests minQuantity = previous tier's minQuantity + 1
- [ ] **AC-11** Step 2: Remove button is disabled when only 1 tier exists; enabled at 2+
- [ ] **AC-12** Step 2: Add Tier button is disabled when 10 tiers exist; info banner shown at limit
- [ ] **AC-13** Step 2: Optional Settings section is collapsed by default; expands on click
- [ ] **AC-14** Step 2: Only one tier can have isDefault: true at a time (radio group)
- [ ] **AC-15** Step 2: Badge text field is hidden when badge style is "None"
- [ ] **AC-16** Step 2: openEnded switch defaults to ON
- [ ] **AC-17** Step 2: Validation fails if any tier is missing a discount value
- [ ] **AC-18** Step 2: Validation fails if minQuantity is not strictly increasing across tiers
- [ ] **AC-19** Step 2: Validation fails if volumeTiers is empty
- [ ] **AC-20** Step 3: Shows only VOLUME_TABLE, VOLUME_CARDS, VOLUME_LIST, VOLUME_COMPACT layouts
- [ ] **AC-21** Preview: empty state shown until at least 1 product is selected
- [ ] **AC-22** Preview: VolumeTiers component renders with computed per-tier prices after products + tiers filled
- [ ] **AC-23** Step 4: VolumeReviewSection shows read-only tier table (Min Qty, Discount, Title columns)
- [ ] **AC-24** Step 4: discount type and openEnded status shown as labeled rows
- [ ] **AC-25** Step 4: product list is collapsible, defaults open, no role badges shown
- [ ] **AC-26** `resetBundle("VOLUME_DISCOUNT")` initializes: 1 default tier, PERCENTAGE, openEnded true, layout VOLUME_TABLE
- [ ] **AC-27** Zod schema: VOLUME_DISCOUNT with 1 product passes validation
- [ ] **AC-28** Zod schema: VOLUME_DISCOUNT with 0 products fails validation
- [ ] **AC-29** Zod schema: FIXED_BUNDLE with 1 product still fails validation (regression check)
- [ ] **AC-30** Zod schema: non-strictly-increasing minQuantity fails validation
- [ ] **AC-31** `volumeTiers` JSON saved correctly in DB on publish (discountType + openEnded + tiers array)
- [ ] **AC-32** `npx tsc --noEmit` passes after all changes with zero errors

---

## 11. Riskiest Changes & Mitigations

### Risk 1 — Zod `products.min()` conditionalization (CRITICAL)

**Why it's risky:** Changing `products.min(2)` to `products.min(1)` with a `superRefine` is a surgical schema change. If the `superRefine` is missing, all bundle types would silently allow 1-product bundles. If it runs before type is resolved, it could fail for valid data.

**Mitigation:**
1. Change `.min(2)` → `.min(1)` at the array level (hard floor, no type dependency)
2. Add the min-2 check inside the EXISTING `superRefine` (the one that already validates BXGY quantities etc.) — do NOT create a new separate `.refine()` that may run in a different order
3. Write unit tests (Task 22) before merging — tests explicitly cover the FIXED_BUNDLE + 1 product regression case
4. Run the full test suite after this change

### Risk 2 — `volumeTiers` stored as `VolumeDiscountConfig` wrapper vs. raw `VolumeTier[]`

**Why it's risky:** The existing `volumeTiers` field is typed as `Json?` and may already have data stored as a flat `VolumeTier[]` array in some edge case (e.g. from earlier testing). Reading it back as `VolumeDiscountConfig` wrapper would fail.

**Mitigation:**
1. Add a migration helper function that normalizes on read:
```typescript
export const normalizeVolumeConfig = (raw: unknown): VolumeDiscountConfig => {
  if (Array.isArray(raw)) {
    // Legacy flat array format — wrap it
    return { discountType: "PERCENTAGE", openEnded: true, tiers: raw };
  }
  return raw as VolumeDiscountConfig;
};
```
2. Use this function wherever `bundle.volumeTiers` is read from DB

### Risk 3 — `getDefaultLayout` regression for BOGO/BXGY

**Why it's risky:** `getDefaultLayout` currently has BOGO → CLASSIC_CARD and BXGY → CLASSIC_CARD. Adding VOLUME_DISCOUNT must not affect these.

**Mitigation:** Use explicit `case` statements (no fallthrough). Verify with: `getDefaultLayout("BOGO") === "CLASSIC_CARD"` and `getDefaultLayout("VOLUME_DISCOUNT") === "VOLUME_TABLE"` after change.

### Risk 4 — `VolumeTiers` component interface mismatch

**Why it's risky:** The existing `VolumeTiers` component in the settings customizer expects a specific data shape `{ qty, discount, price }`. Our `VolumeTier` interface uses different field names (`minQuantity`, not `qty`).

**Mitigation:** Add a mapping step in `usePreviewVolumeTiers()` — do NOT modify the existing `VolumeTiers` component props.

---

## 12. Phase 2 Backlog

These features are explicitly out of scope for Phase 1. Do not implement them now.

| # | Feature | Notes |
|---|---------|-------|
| 1 | Per-tier discount type override | "3 for $29.99" pricing. Maps to `CUSTOM_PRICE` enum. |
| 2 | Tier image upload | Per-tier image in VOLUME_CARDS layout. Requires S3 upload. |
| 3 | Global "allow quantity edit" toggle | Let customers change qty before add-to-cart. |
| 4 | Drag-to-reorder tiers | Polaris Sortable or HTML drag API. |
| 5 | Rust discount function extension | Add QUANTITY_BREAKS handling in `cart_lines_discounts_generate_run.rs`. |
| 6 | Liquid widget rendering | `product-bundle-widget` Liquid extension needs VOLUME_DISCOUNT layout. |
| 7 | Edit flow testing | Shared components already work for edit; explicit QA pass needed. |

---

## Reference

### Existing files to read before implementing

- `/web/features/bundles/components/bundle-creation/steps/discount/bxgy-discount-settings.tsx` — pattern for complex discount step component
- `/web/features/bundles/components/bundle-creation/steps/review/bxgy-review-section.tsx` — pattern for review section
- `/web/features/bundles/components/bundle-preview/bundle-preview.tsx` — understand RenderLayout switch
- `/web/features/settings/components/style-customizer/bundle-layout/elements/volume-tiers.tsx` — existing VolumeTiers component (reuse in preview)
- `/web/features/settings/components/style-customizer/bundle-preview/templates/template-volume.tsx` — tier data shape `{ qty, discount, price }`
- `/web/features/bundles/stores/bundle.store.ts` — understand resetBundle pattern
- `/web/features/bundles/utils/helpers/bundle-getters.ts` — understand initialBundleData and getDefaultLayout
- `/web/shared/constants/plans.constants.ts` — understand existing plan gating structure