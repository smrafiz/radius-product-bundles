# BOGO Classic Card Layout — Implementation Plan

## Context

BOGO bundles currently bypass the layout system — the storefront widget renders a fixed two-section layout (`renderBxgyProducts`) regardless of what layout value is stored. The creation form shows GRID/LIST/COMPACT for BOGO but they have no effect on the actual BOGO rendering.

**Goal**: Introduce 3 BOGO-specific layouts (Classic Card, Compact Grid, Minimalist) that replace the generic layouts for BOGO bundles. Implement Classic Card fully; the other 2 are selectable placeholders that fall back to Classic Card rendering.

**Classic Card design** (from screenshot): Two side-by-side cards — trigger (pink dashed border, "You Buy" badge) and reward (green dashed border, "You Get FREE" badge, "FREE" tag). Pricing summary bar below. Full-width CTA button at bottom.

---

## Phase 1: Type System & Schema

### 1.1 Widen layout type (`bundle.types.ts:309`)
```ts
// Add new types
export type FixedBundleLayout = "GRID" | "CAROUSEL" | "LIST" | "COMPACT";
export type BogoLayout = "CLASSIC_CARD" | "COMPACT_GRID" | "MINIMALIST";
export type WidgetLayout = FixedBundleLayout | BogoLayout;

// Update DisplaySettings
layout: WidgetLayout;  // was: "GRID" | "CAROUSEL" | "LIST" | "COMPACT"
```

### 1.2 Relax Zod schema (`zod.schema.ts:~49`)
```ts
// Before: z.enum(["GRID", "CAROUSEL", "LIST", "COMPACT"]).default("GRID")
// After:
layout: z.string().default("GRID"),
```

### 1.3 Add `role` to `PreviewProduct` (`shared/types/components/components.types.ts:64`)
```ts
role?: "TRIGGER" | "REWARD" | "INCLUDED" | "OPTIONAL" | "GROUP_OPTION";
```
Needed for Classic Card to split products by role in admin preview.

### 1.4 Add `pricing` + `cartButtonText` to `WidgetLayoutProps` (`components.types.ts:104`)
```ts
pricing?: WidgetPricing;
cartButtonText?: string;
```
Classic Card renders its own pricing bar + CTA internally.

---

## Phase 2: Constants & Defaults

### 2.1 Add BOGO layout definitions (`bundle-details.constants.ts`)

Keep existing `WIDGET_LAYOUTS` unchanged. Add:

```ts
export const BOGO_LAYOUTS = [
    { label: "Classic Card", value: "CLASSIC_CARD" as const, widgetLayout: "/assets/widget-classic-card-layout.png" },
    { label: "Compact Grid", value: "COMPACT_GRID" as const, widgetLayout: "/assets/widget-compact-grid-layout.png" },
    { label: "Minimalist", value: "MINIMALIST" as const, widgetLayout: "/assets/widget-minimalist-layout.png" },
];

export const LAYOUTS_BY_BUNDLE_TYPE: Record<string, typeof WIDGET_LAYOUTS | typeof BOGO_LAYOUTS> = {
    FIXED_BUNDLE: WIDGET_LAYOUTS,
    BOGO: BOGO_LAYOUTS,
    BUY_X_GET_Y: BOGO_LAYOUTS,
    // others default to WIDGET_LAYOUTS
};

export const BOGO_LAYOUT_VALUES = ["CLASSIC_CARD", "COMPACT_GRID", "MINIMALIST"];
```

### 2.2 Default layout helper (`bundle-getters.ts`)

Add `getDefaultLayout(bundleType)` → returns `"CLASSIC_CARD"` for BOGO/BUY_X_GET_Y, `"GRID"` otherwise.

### 2.3 Placeholder thumbnail images

Create 3 placeholder images in `/web/public/assets/`:
- `widget-classic-card-layout.png`
- `widget-compact-grid-layout.png`
- `widget-minimalist-layout.png`

---

## Phase 3: Creation Form Layout Selector

### 3.1 Update `widget-layout.tsx`

Replace the current BXGY filtering logic:
```ts
// Before: filters out CAROUSEL for BOGO
// After: uses LAYOUTS_BY_BUNDLE_TYPE to pick the right layout set
const layouts = useMemo(() => {
    return LAYOUTS_BY_BUNDLE_TYPE[bundleData.type] ?? WIDGET_LAYOUTS;
}, [bundleData.type]);
```

### 3.2 Auto-set default layout for BOGO

In store initialization / form provider, when bundle type is BOGO/BUY_X_GET_Y, set `displaySettings.layout` to `"CLASSIC_CARD"` instead of `"LIST"`.

### 3.3 Legacy edit migration

When loading a BOGO bundle for editing that has a non-BOGO layout (e.g., `"LIST"`), auto-switch to `"CLASSIC_CARD"` in the edit transform hook.

---

## Phase 4: Admin Preview — Classic Card Component

### 4.1 New file: `web/shared/components/bundle-widget/layouts/widget-classic-card.tsx`

React component that receives `WidgetLayoutProps` (with role + pricing) and renders:

```
┌─ You Buy (pink dashed) ─────┐  ┌─ You Get FREE (green dashed) ─┐
│ [product image]              │  │ [product image]        [FREE]  │
│ Product Title                │  │ Product Title                  │
│ ★ 4.6                       │  │ ★ 4.5                          │
│ $129.99                      │  │ ~~$29.99~~ FREE                │
└──────────────────────────────┘  └────────────────────────────────┘

┌─ You Pay Only: $129.99 ──────────── You Save: $29.99 ──────────┐
└─────────────────────────────────────────────────────────────────┘

              [ 🛒 Claim This Offer ]
```

- Splits `products` by `role === "TRIGGER"` vs `"REWARD"`
- Trigger card: pink `#ec4899` dashed border, orange `#f97316` "You Buy" badge
- Reward card: teal `#14b8a6` dashed border, green `#16a34a` "You Get FREE" badge, red `#ef4444` "FREE" tag
- Pricing bar: light green bg, "You Pay Only" left + "You Save" right
- CTA button: Uses `styles.buttonColor` / `cartButtonText`
- Responsive: Stacks to single column at narrow width

### 4.2 Export via barrel (`layouts/index.ts`)

### 4.3 Wire into `RenderLayout` switch (`bundle-preview.tsx:201`)

```ts
case "CLASSIC_CARD":
case "COMPACT_GRID":
case "MINIMALIST":
    return <WidgetClassicCard {...layoutProps} pricing={pricing} cartButtonText={cartButtonText} />;
```

### 4.4 Pass `role` in `usePreviewProducts` return

In the BXGY branch (~line 56-89), add `role: item.role` to the returned objects.

### 4.5 Handle pricing/CTA for Classic Card

Classic Card renders its own pricing bar + CTA, so the parent `BundleWidget` shell needs to suppress its footer when a BOGO layout is active. Add `hideFooter` prop to `BundleWidgetProps` and conditionally hide pricing/cart sections.

---

## Phase 5: Storefront Widget — Classic Card Rendering

### 5.1 Update `getLayout()` (`bundle-widget.ts:2306`)

Add detection for new CSS classes:
```ts
if (this.container.classList.contains("radius-bundle--classic_card")) return "classic_card";
if (this.container.classList.contains("radius-bundle--compact_grid")) return "compact_grid";
if (this.container.classList.contains("radius-bundle--minimalist")) return "minimalist";
```

### 5.2 Update `renderProducts()` (`bundle-widget.ts:1434`)

Route BOGO bundles through layout check:
```ts
if (this.isBxgyBundle()) {
    const layout = this.getLayout();
    if (layout === "classic_card" || layout === "compact_grid" || layout === "minimalist") {
        this.renderClassicCardProducts(bundle, productsContainer);
    } else {
        this.renderBxgyProducts(bundle, productsContainer); // legacy fallback
    }
    return;
}
```

### 5.3 New method: `renderClassicCardProducts()`

Generates HTML with:
- `.rb-classic__grid` (2-column CSS grid)
- `.rb-classic__section--trigger` + `.rb-classic__section--reward` (dashed border cards)
- `.rb-classic__badge--trigger` ("You Buy") + `.rb-classic__badge--reward` ("You Get FREE")
- `.rb-classic__free-tag` (red "FREE" corner badge on reward)
- Per-product cards with image, title, rating placeholder, price
- Reward pricing: Uses `calculateBxgyRewardPrice()` for discounted/free display
- `.rb-classic__pricing-bar` (You Pay Only / You Save)

### 5.4 Hide standard pricing section for Classic Card

In `updatePricingDisplay()` or via CSS: when layout is `classic_card`, the standard `.radius-bundle__pricing` section is hidden (Classic Card renders its own).

---

## Phase 6: Storefront SCSS

### 6.1 New file: `web/widgets/src/scss/layout/classic-card.scss`

Key styles:
- `.rb-classic__grid` — 2-column grid, responsive → 1-column at `≤480px`
- `.rb-classic__section--trigger` — `border: 2px dashed #ec4899`
- `.rb-classic__section--reward` — `border: 2px dashed #14b8a6`
- `.rb-classic__badge` — positioned badge labels
- `.rb-classic__free-tag` — absolute top-right red badge
- `.rb-classic__pricing-bar` — flex row, subtle green bg
- `.radius-bundle--classic_card .radius-bundle__pricing` — `display: none` (hide standard pricing)

### 6.2 Import in `index.scss`
```scss
@use "layout/classic-card";
```

---

## Phase 7: Liquid Template

### 7.1 Add layout case (`app-block.liquid:886`)

```liquid
{% when 'classic_card' or 'compact_grid' or 'minimalist' %}
    {% render 'radius-bundle-layout-classic-card', ... %}
```

### 7.2 New snippet: `radius-bundle-layout-classic-card.liquid`

Renders skeleton shell: header + two placeholder cards side by side + pricing + add-to-cart button. JS hydrates actual content on load.

### 7.3 Update layout schema options

Add `classic_card`, `compact_grid`, `minimalist` to the `{% schema %}` layout select.

---

## Files Summary

| File | Action |
|------|--------|
| `web/features/bundles/types/bundle.types.ts` | Add `WidgetLayout`, `FixedBundleLayout`, `BogoLayout` types |
| `web/features/bundles/schema/zod.schema.ts` | `z.enum(...)` → `z.string().default("GRID")` |
| `web/shared/types/components/components.types.ts` | Add `role` to `PreviewProduct`, `pricing`+`cartButtonText` to `WidgetLayoutProps` |
| `web/features/bundles/constants/bundle-details.constants.ts` | Add `BOGO_LAYOUTS`, `LAYOUTS_BY_BUNDLE_TYPE` |
| `web/features/bundles/utils/helpers/bundle-getters.ts` | Add `getDefaultLayout()` helper |
| `web/features/bundles/components/bundle-creation/steps/appearance/widget-layout.tsx` | Use `LAYOUTS_BY_BUNDLE_TYPE` |
| `web/shared/components/bundle-widget/layouts/widget-classic-card.tsx` | **NEW** — React Classic Card component |
| `web/shared/components/bundle-widget/layouts/index.ts` | Export new component |
| `web/features/bundles/components/bundle-preview/bundle-preview.tsx` | Wire Classic Card into `RenderLayout`, pass `role`, `hideFooter` |
| `web/shared/components/bundle-widget/bundle-widget.tsx` | Add `hideFooter` prop |
| `web/widgets/src/bundle-widget.ts` | Update `getLayout()`, `renderProducts()`, add `renderClassicCardProducts()` |
| `web/widgets/src/scss/layout/classic-card.scss` | **NEW** — Classic Card styles |
| `web/widgets/src/scss/index.scss` | Import new SCSS |
| `extension/.../blocks/app-block.liquid` | Add `classic_card` case + schema options |
| `extension/.../snippets/radius-bundle-layout-classic-card.liquid` | **NEW** — Liquid skeleton |
| `web/public/assets/widget-classic-card-layout.png` | **NEW** — Thumbnail placeholder |
| `web/public/assets/widget-compact-grid-layout.png` | **NEW** — Thumbnail placeholder |
| `web/public/assets/widget-minimalist-layout.png` | **NEW** — Thumbnail placeholder |

---

## Backwards Compatibility

- **Existing BOGO bundles** with `layout: "LIST"` → storefront falls back to existing `renderBxgyProducts()` (no breakage)
- **Editing old BOGO** → auto-migrates layout to `CLASSIC_CARD` in edit transform hook
- **FIXED_BUNDLE** → completely unaffected, same 4 layouts

## Verification

1. `npx tsc --noEmit` — no type errors
2. Create new BOGO bundle → layout selector shows Classic Card / Compact Grid / Minimalist
3. Classic Card selected by default → admin preview shows two-panel card design
4. Submit → `settings.layout` saved as `"CLASSIC_CARD"` in DB
5. Storefront → widget renders Classic Card with trigger/reward cards, pricing bar, CTA
6. Responsive: Single column stacking on mobile
7. Existing FIXED_BUNDLE creation → unchanged, still shows GRID/LIST/CAROUSEL/COMPACT
8. Edit existing BOGO with old layout → auto-migrates to CLASSIC_CARD
