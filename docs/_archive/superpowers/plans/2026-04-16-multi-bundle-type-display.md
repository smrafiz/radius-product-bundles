# Multi-Bundle Type Display (Pro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Bundle type filter" dropdown to the app block schema so Pro merchants can place multiple app blocks on a product page, each showing only one bundle type.

**Architecture:** Add `isPro` to the `global_settings` shop metafield (already read by Liquid as `global`). The Liquid winner-selection loop gets a `filter_type` variable derived from the block setting — only applied when `global.isPro == true`. When no winner is found inside an existing `bundle_ids` list, a `radius-bundle-placeholder` is emitted in `design_mode` so the existing JS hydration path shows a contextual message. No changes needed to JS widget rendering — it already handles multiple `.radius-bundle[data-bundle-id]` elements.

**Tech Stack:** Liquid (theme extension), TypeScript (Next.js/Prisma), Prisma (shop plan read), Shopify metafields (JSON type)

---

## File Map

| File | Change |
|---|---|
| `web/lib/graphql/operations/settings-metafield.operations.ts` | Add `isPro` to `MetafieldGlobalSettings` interface + `buildGlobalSettingsMetafieldValue` param |
| `web/lib/graphql/operations/metafield.operations.ts` | Read `plan`+`status` from shop record; compute + pass `isPro` |
| `web/shared/types/plan/plan.types.ts` | Add `"multi_bundle_display"` to `FeatureId` union |
| `web/shared/constants/plans.constants.ts` | Add `multi_bundle_display` to FREE_PLAN features |
| `extension/schema/product-bundle-widget/00_bundle-filter.json` | **New file** — schema setting for bundle_type select (compiled into liquid by `build:schema`) |
| `extension/extensions/product-bundle-widget/blocks/app-block.liquid` | Filter logic + inner design_mode placeholder (schema compiled separately) |
| `web/widgets/src/bundle-widget.ts` | Read `data-filter-type` in `initPlaceholders` for contextual message |

---

### Task 1: Add `isPro` to `MetafieldGlobalSettings` and `buildGlobalSettingsMetafieldValue`

**Files:**
- Modify: `web/lib/graphql/operations/settings-metafield.operations.ts:15-43` (interface)
- Modify: `web/lib/graphql/operations/settings-metafield.operations.ts:203-251` (function)

- [ ] **Step 1: Update `MetafieldGlobalSettings` interface**

In `settings-metafield.operations.ts`, add `isPro` field to the interface after the `custom` block:

```typescript
interface MetafieldGlobalSettings {
    // Required for Liquid rendering
    styles: CustomizerStyles;
    labels: Record<string, Record<string, string>>;
    primaryLocale: string;

    // Required for JS cart behavior
    cart: {
        redirectAfterCart: string;
        hidePaymentButtons: boolean;
        enableStockValidation: boolean;
        maxBundlesPerOrder: number;
        showSavingsBanner: boolean;
        allowDiscountStacking: boolean;
        lazyLoadImages: boolean;
        bundlePriorityType: string;
    };

    // Privacy settings
    privacy: {
        enableAnalytics: boolean;
    };

    // Required for custom styling
    custom: {
        cssClass: string;
        css: string;
    };

    // Plan gate — read by Liquid to enable Pro features
    isPro: boolean;
}
```

- [ ] **Step 2: Update `buildGlobalSettingsMetafieldValue` signature and body**

```typescript
export function buildGlobalSettingsMetafieldValue(
    appSettings: AppSettings | null,
    primaryLocale = "en",
    isPro = false,
): string {
    const mergedStyles: CustomizerStyles = {
        ...DEFAULT_CUSTOMIZER_STYLES,
        ...(appSettings?.globalStyles
            ? getValidCustomizerStyles(appSettings.globalStyles)
            : {}),
    };

    const bp = resolveBreakpoints(mergedStyles);
    mergedStyles.tabletBreakpoint = bp.tablet;
    mergedStyles.mobileBreakpoint = bp.mobile;

    const settings: MetafieldGlobalSettings = {
        styles: mergedStyles,
        labels: getValidLocaleKeyedLabels(appSettings?.labels, primaryLocale),
        primaryLocale,
        cart: {
            redirectAfterCart: appSettings?.redirectAfterCart || "default",
            hidePaymentButtons: appSettings?.hidePaymentButtons ?? false,
            enableStockValidation: appSettings?.enableStockValidation ?? true,
            maxBundlesPerOrder: appSettings?.maxBundlesPerOrder ?? 0,
            showSavingsBanner: appSettings?.showSavingsBanner ?? false,
            allowDiscountStacking: appSettings?.allowDiscountStacking ?? false,
            lazyLoadImages: appSettings?.lazyLoadImages ?? true,
            bundlePriorityType:
                appSettings?.bundlePriorityType ?? "index_based",
        },
        privacy: {
            enableAnalytics: appSettings?.enableAnalytics ?? true,
        },
        custom: {
            cssClass: appSettings?.customCssClass || "",
            css: appSettings?.customCss || "",
        },
        isPro,
    };

    return JSON.stringify(settings);
}
```

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep settings-metafield
```
Expected: no output (no errors).

- [ ] **Step 4: Commit**

```bash
git add web/lib/graphql/operations/settings-metafield.operations.ts
git commit -m "feat: add isPro field to global settings metafield"
```

---

### Task 2: Pass `isPro` from shop plan into `syncAllSettingsToMetafields`

**Files:**
- Modify: `web/lib/graphql/operations/metafield.operations.ts:868-899`

- [ ] **Step 1: Expand shop select and compute `isPro`**

In `syncAllSettingsToMetafields`, the `shopRecord` fetch currently selects only `{ primaryLocale: true }`. Change it to also select `plan` and `status`, then compute `isPro`:

Find this block (around line 873):
```typescript
shopRecord: true,
    where: { domain: shop },
    select: { primaryLocale: true },
```

Replace the entire `Promise.all` block:
```typescript
const [globalSettings, activeBundles, shopRecord] = await Promise.all([
    savedSettings
        ? Promise.resolve(transformFormDataToAppSettings(savedSettings))
        : findSettingsByShopDomain(shop),
    findActiveBundlesByShop(shop),
    prisma.shop.findUnique({
        where: { domain: shop },
        select: { primaryLocale: true, plan: true, status: true },
    }),
]);

const primaryLocale = shopRecord?.primaryLocale ?? "en";
const isPro =
    shopRecord?.status === "ACTIVE" && shopRecord?.plan === "PRO";
```

- [ ] **Step 2: Pass `isPro` to `buildGlobalSettingsMetafieldValue`**

Find (around line 896):
```typescript
const globalSettingsValue = buildGlobalSettingsMetafieldValue(
    globalSettings,
    primaryLocale,
);
```

Replace with:
```typescript
const globalSettingsValue = buildGlobalSettingsMetafieldValue(
    globalSettings,
    primaryLocale,
    isPro,
);
```

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep metafield.operations
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add web/lib/graphql/operations/metafield.operations.ts
git commit -m "feat: pass shop plan isPro flag into global settings metafield"
```

---

### Task 3: Add `multi_bundle_display` to plan system

**Files:**
- Modify: `web/shared/types/plan/plan.types.ts:9-24`
- Modify: `web/shared/constants/plans.constants.ts`

- [ ] **Step 1: Add to `FeatureId` union**

In `plan.types.ts`, find the `FeatureId` type and append `"multi_bundle_display"`:

```typescript
export type FeatureId =
    | "analytics_full"
    | "ab_testing"
    | "automation"
    | "ai_insights"
    | "custom_css"
    | "responsive_overrides"
    | "templates"
    | "export_data"
    | "remove_branding"
    | "duplicate_bundle"
    | "bundle_behavior"
    | "advanced_discount_controls"
    | "advanced_cart_controls"
    | "auto_translate"
    | "volume_discount"
    | "multi_bundle_display";
```

- [ ] **Step 2: Add to FREE_PLAN features in `plans.constants.ts`**

In `FREE_PLAN.features` array, add after the last existing entry:
```typescript
{ feature: "multi_bundle_display", gateMode: "lock-overlay" },
```

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep plan
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add web/shared/types/plan/plan.types.ts web/shared/constants/plans.constants.ts
git commit -m "feat: add multi_bundle_display to plan feature registry"
```

---

### Task 4: Update Liquid — schema setting + filter logic + inner placeholder

**Files:**
- Modify: `extension/extensions/product-bundle-widget/blocks/app-block.liquid`

This task has four separate edits to the same file. Apply them in order.

#### Edit A — Add `filter_type` assignment after winner loop variables

After line 27 (`{% assign global_priority_type = global.cart.bundlePriorityType | default: 'index_based' %}`), add:

```liquid
{% assign filter_type = '' %}
{% if global.isPro == true and block.settings.bundle_type != blank %}
{% assign filter_type = block.settings.bundle_type %}
{% endif %}
```

#### Edit B — Add type filter inside winner loop

The existing winner loop body (lines 33-44) checks `{% if b and b.status == 'ACTIVE' %}`. Wrap the inner priority logic with a type guard:

Change from:
```liquid
{% if b and b.status == 'ACTIVE' %}
{% if global_priority_type == 'discount_based' %}
{% assign this_score = b.effectiveSavings | default: 0 | times: 1 %}
{% else %}
{% assign this_score = b.priority | default: 0 | times: 1 %}
{% endif %}
{% assign this_created = b.createdAtTs | default: 0 | times: 1 %}
{% if best_bundle_id == null or this_score > best_score or this_score == best_score and this_created > best_created %}
{% assign best_score = this_score %}
{% assign best_bundle_id = bid %}
{% assign best_created = this_created %}
{% endif %}
{% endif %}
```

Change to:
```liquid
{% if b and b.status == 'ACTIVE' %}
{% if filter_type == blank or b.bundleType == filter_type %}
{% if global_priority_type == 'discount_based' %}
{% assign this_score = b.effectiveSavings | default: 0 | times: 1 %}
{% else %}
{% assign this_score = b.priority | default: 0 | times: 1 %}
{% endif %}
{% assign this_created = b.createdAtTs | default: 0 | times: 1 %}
{% if best_bundle_id == null or this_score > best_score or this_score == best_score and this_created > best_created %}
{% assign best_score = this_score %}
{% assign best_bundle_id = bid %}
{% assign best_created = this_created %}
{% endif %}
{% endif %}
{% endif %}
```

#### Edit C — Wrap render block + add inner design_mode placeholder

After the winner loop ends (`{% endfor %}` at line 46), the existing code goes straight into RTL logic then CSS/widget render. Wrap lines 47–808 (the full RTL + CSS + widget div + JS block) and add a new inner `elsif` for the type-mismatch case.

Find the line immediately after `{% endfor %}` (end of winner loop):
```liquid
{% assign rtl_locales = 'ar,he,fa,ur' | split: ',' %}
```

Add `{% if best_bundle_id != null %}` **before** that line.

Then find the closing script tag (currently at the end of the `bundle_ids != blank` branch):
```liquid
<script src="{{ 'bundle-widget.js' | asset_url }}" defer></script>
{% elsif request.design_mode %}
```

Change to:
```liquid
<script src="{{ 'bundle-widget.js' | asset_url }}" defer></script>
{% elsif request.design_mode %}
{{ 'bundle-widget.css' | asset_url | stylesheet_tag }}
<div class="radius-bundle-placeholder" data-filter-type="{{ filter_type }}"></div>
<script src="{{ 'bundle-widget.js' | asset_url }}" defer></script>
{% endif %}
{% elsif request.design_mode %}
```

So the full outer structure becomes:
```liquid
{% if bundle_ids != blank and bundle_ids.size > 0 %}
  ... assigns + winner loop ...
  {% if best_bundle_id != null %}
    ... RTL + CSS + widget div + custom_css + JS ...
  {% elsif request.design_mode %}
    {{ 'bundle-widget.css' | asset_url | stylesheet_tag }}
    <div class="radius-bundle-placeholder" data-filter-type="{{ filter_type }}"></div>
    <script src="{{ 'bundle-widget.js' | asset_url }}" defer></script>
  {% endif %}
{% elsif request.design_mode %}
  {{ 'bundle-widget.css' | asset_url | stylesheet_tag }}
  <div class="radius-bundle-placeholder"></div>
  <script src="{{ 'bundle-widget.js' | asset_url }}" defer></script>
{% endif %}
```

#### Edit D — Create new schema file for `bundle_type` select

The schema is compiled from `extension/schema/product-bundle-widget/*.json` files (sorted alphabetically) by `bun run build:schema`. Files prefixed `00_` sort before `01_appearance.json`.

Create `extension/schema/product-bundle-widget/00_bundle-filter.json`:

```json
[
    {
        "type": "header",
        "content": "Bundle Filter"
    },
    {
        "type": "select",
        "id": "bundle_type",
        "label": "Bundle type filter",
        "info": "Pro plan only: show only bundles of this type. Free plans always show the default winner regardless of this setting.",
        "options": [
            { "value": "", "label": "Default (all types)" },
            { "value": "FIXED_BUNDLE", "label": "Fixed Bundle" },
            { "value": "BUY_X_GET_Y", "label": "Buy X Get Y" },
            { "value": "BOGO", "label": "BOGO" },
            { "value": "VOLUME_DISCOUNT", "label": "Volume Discount" }
        ],
        "default": ""
    }
]
```

Then run `bun run build:schema` to compile it into `app-block.liquid`.

- [ ] **Step 1: Apply Edit A** (filter_type assignment after line 27)
- [ ] **Step 2: Apply Edit B** (type filter in winner loop)
- [ ] **Step 3: Apply Edit C** (wrap render block + inner placeholder)
- [ ] **Step 4: Apply Edit D** (create `00_bundle-filter.json` + run `bun run build:schema`)
- [ ] **Step 5: Verify the outer structure is correct**

Check that the file still has exactly one `{% if bundle_ids != blank %}` at the top level and closes with `{% endif %}` before `{% schema %}`.

```bash
grep -n "{% if bundle_ids\|{% elsif\|{% endif %}" extension/extensions/product-bundle-widget/blocks/app-block.liquid | head -20
```

Expected pattern:
```
1(ish): {% if bundle_ids != blank and bundle_ids.size > 0 %}
...:    {% if best_bundle_id != null %}
...:    {% elsif request.design_mode %}
...:    {% endif %}
...:  {% elsif request.design_mode %}
...:  {% endif %}
...: {% schema %}
```

- [ ] **Step 6: Commit**

```bash
git add extension/schema/product-bundle-widget/00_bundle-filter.json extension/extensions/product-bundle-widget/blocks/app-block.liquid
git commit -m "feat: add bundle_type filter to app block — Pro only"
```

---

### Task 5: Update JS placeholder for contextual message

**Files:**
- Modify: `web/widgets/src/bundle-widget.ts:1445-1464`

Currently `initPlaceholders` at line 1445 always shows: *"This widget displays only on products that are part of a bundle. Preview a bundled product to see the widget in action."*

The new inner placeholder (from Task 4 Edit C) sets `data-filter-type` when a type filter was active. Update `initPlaceholders` to show a different message for this case.

- [ ] **Step 1: Update `initPlaceholders`**

Replace the existing function body:

```typescript
function initPlaceholders(): void {
    const placeholders = document.querySelectorAll<HTMLElement>(
        ".radius-bundle-placeholder",
    );

    placeholders.forEach((el) => {
        if (el.childElementCount > 0) return;

        const filterType = el.dataset.filterType ?? "";

        const title = document.createElement("div");
        title.className = "radius-bundle-placeholder__title";
        title.textContent = "Radius Bundles";

        const desc = document.createElement("div");
        desc.className = "radius-bundle-placeholder__desc";

        if (filterType) {
            const typeLabel: Record<string, string> = {
                FIXED_BUNDLE: "Fixed Bundle",
                BUY_X_GET_Y: "Buy X Get Y",
                BOGO: "BOGO",
                VOLUME_DISCOUNT: "Volume Discount",
            };
            const label = typeLabel[filterType] ?? filterType;
            desc.textContent = `No active ${label} bundle found for this product. Create one in the Radius app or change the type filter to "Default".`;
        } else {
            desc.textContent =
                "This widget displays only on products that are part of a bundle. Preview a bundled product to see the widget in action.";
        }

        el.append(title, desc);
    });
}
```

- [ ] **Step 2: Build widgets**

```bash
cd web && bun run build:widgets 2>&1 | tail -5
```
Expected: build completes with no errors.

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep bundle-widget
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add web/widgets/src/bundle-widget.ts
git commit -m "feat: contextual placeholder message for bundle type filter"
```

---

## Self-Review

### Spec coverage
- [x] Dropdown in app block schema for type selection — Task 4 Edit D
- [x] Default value = current winner behavior — `filter_type = ''` when blank, no filter applied
- [x] Type filter applied only for Pro — `global.isPro` gate in Task 4 Edit A
- [x] Free plan falls back to Default behavior — `filter_type` stays `''` when not Pro
- [x] Empty state when type has no match — Task 4 Edit C + Task 5
- [x] `isPro` propagated via metafield — Task 1 + Task 2
- [x] Plan registry updated — Task 3
- [x] Multiple blocks work independently — no changes needed (JS already supports it)

### Notes
- `isPro` in `global_settings` metafield updates only on `syncAllSettingsToMetafields` (settings save or bundle CRUD). Plan upgrade/downgrade reflects on next sync — acceptable.
- `syncActiveBundlesToMetafield` (line 702) does NOT call `buildGlobalSettingsMetafieldValue` — it only syncs bundles. No change needed there.
- `bundleType` is already present in `active_bundles` metafield (`b.bundleType` in Liquid) from `metafield.operations.ts:502` — no new metafield fields needed.
