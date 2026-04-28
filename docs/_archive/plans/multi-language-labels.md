# Multi-Language Storefront Labels — Implementation Plan

## Problem

The current Settings → Labels stores a **single set of label values** in `AppSettings.labels` (a flat JSON column). These values are written to the `global_settings` metafield and consumed by the Liquid template as `global.labels`. On multi-language stores, the widget always shows labels in one language regardless of the customer's selected locale.

## Goal

Support **both** single-language and multi-language stores from the app's Settings → Labels page:

- **Single-language stores** — labels work as-is; merchant enters one set of labels
- **Multi-language stores** — merchant provides labels per locale via a language switcher in Settings

No additional Liquid file KB used. No schema changes to the app block.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Settings → Labels Page                     │
│                                                              │
│  [English ▾]  [French ▾]  [German ▾]   ← store's languages │
│                                                              │
│  Bundle heading:    [Offres groupées     ]                   │
│  Add to cart:       [Ajouter au panier   ]                   │
│  Regular price:     [Prix normal :       ]                   │
│  Bundle price:      [Prix du pack :      ]                   │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │   AppSettings.labels     │
            │     (Prisma JSON)        │
            │                          │
            │  {                       │
            │    "en": {               │
            │      "headingLabel": "…", │
            │      "addToCartText":"…"  │
            │    },                    │
            │    "fr": {               │
            │      "headingLabel": "…", │
            │      "addToCartText":"…"  │
            │    }                     │
            │  }                       │
            └──────────┬───────────────┘
                       │
                       ▼
         ┌──────────────────────────────┐
         │  Metafield Sync (existing)    │
         │  writes to global_settings    │
         │  metafield — now with         │
         │  per-locale labels            │
         └──────────┬───────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────┐
    │          app-embed.liquid                  │
    │                                           │
    │  {% assign locale = request.locale        │
    │       .iso_code | downcase %}             │
    │                                           │
    │  Reads global.labels[locale]              │
    │  Falls back to global.labels["en"]        │
    │  Falls back to locale file (| t)          │
    └───────────────────────────────────────────┘
```

---

## Detailed Changes

### 1. Database — `AppSettings.labels` JSON Structure

**Current** (flat):

```json
{
    "headingLabel": "Bundle Offers",
    "addToCartText": "Add bundle to cart",
    "regularPriceLabel": "Regular price:",
    "bundlePriceLabel": "Bundle price:",
    "youSaveLabel": "You save:",
    "freeShippingLabel": "Free shipping",
    "quantityLabel": "Qty:",
    "savingsBadgeText": "Save {percent}%",
    "addingText": "Adding...",
    "addedText": "Added!",
    "outOfStockText": "Out of Stock",
    "maxBundlesReachedText": "Maximum {count} bundle(s) per order allowed",
    "bannerSavingText": "You're saving {discount} with {name}",
    "bannerCustomPriceText": "Special price: {price} for {name}",
    "bannerFreeShippingQualifyText": "{name} qualifies for free shipping!",
    "bannerFreeShippingText": "Free shipping included!"
}
```

**New** (locale-keyed):

```json
{
  "en": {
    "headingLabel": "Bundle Offers",
    "addToCartText": "Add bundle to cart",
    "regularPriceLabel": "Regular price:",
    ...
  },
  "fr": {
    "headingLabel": "Offres groupées",
    "addToCartText": "Ajouter le pack au panier",
    "regularPriceLabel": "Prix normal :",
    ...
  }
}
```

**Migration strategy**: No Prisma schema change needed — `labels` is already a `Json?` column. A data migration script will wrap existing flat labels under the store's primary locale key (detected via Admin API `shopLocales` query). If the API call fails during migration, default to `"en"` with a log warning.

**Backward compatibility**: The label validation in `settings-metafield.operations.ts` must detect both flat (legacy) and locale-keyed (new) structures and handle accordingly during the transition period.

---

### 2. Admin API — Fetch Store Languages

Use the Shopify Admin API `shopLocales` query to get the store's published languages:

```graphql
query {
    shopLocales {
        locale
        name
        primary
        published
    }
}
```

This returns all available locales. Only show **published** locales in the Settings UI language picker.

Cache the result in the `Shop` model or in-memory to avoid repeated API calls.

---

### 3. Settings → Labels UI

#### Components to modify

| File                           | Change                                                      |
| ------------------------------ | ----------------------------------------------------------- |
| Settings labels form/component | Add locale picker (tabs or dropdown) at the top             |
| Settings API route             | Accept `locale` parameter; save labels under the locale key |
| Settings hook                  | Manage active locale state; load/save per locale            |

#### UX Flow

1. Page loads → fetch published locales from cached `shopLocales`
2. Show language tabs: `[English (Primary)] [French] [German]`
3. On tab switch → load the labels for that locale from the JSON
4. On save → merge into the locale-keyed JSON structure
5. Empty fields → fall back to locale file translations on the storefront

#### Fallback logic (in UI)

When switching to a non-primary locale, show **placeholder text** from the primary locale's labels so the merchant knows what to translate. Fields left empty will use locale file translations.

---

### 4. Metafield Sync

The existing metafield sync that writes `global_settings` to the store's `$app` metafield needs to include the full locale-keyed labels structure. Changes:

1. **`labels` shape** changes from flat to locale-keyed (nested)
2. **Add `primaryLocale`** field to `global_settings` metafield so Liquid knows the fallback locale without hardcoding `'en'`
3. **Save must merge** — saving labels for locale B must preserve locale A's labels (read-modify-write, not replace)

#### Important: Empty string handling

When a merchant clears a label field, the save logic must **strip empty strings** (remove the key or set to `null`) rather than saving `""`. In Liquid, `== blank` catches both `""` and `nil`, but saving empty strings bloats the metafield and creates ambiguity between "explicitly cleared" and "never set".

---

### 5. Liquid Template — Locale-Aware Label Resolution

#### `app-embed.liquid`

Add locale detection at the top (alongside existing assigns):

```liquid
{% assign customer_locale = request.locale.iso_code | downcase | split: '-' | first %}
```

Then update banner label assignments:

```liquid
{% assign locale_labels = global.labels[customer_locale] %}
{% unless locale_labels %}
  {% comment %} Fall back to store's primary locale, not hardcoded 'en' {% endcomment %}
  {% assign locale_labels = global.labels[global.primaryLocale] %}
{% endunless %}
{% unless locale_labels %}
  {% comment %} Final fallback: try 'en' if primaryLocale is missing {% endcomment %}
  {% assign locale_labels = global.labels['en'] %}
{% endunless %}

{% assign banner_saving_text = locale_labels.bannerSavingText %}
{% assign banner_custom_price_text = locale_labels.bannerCustomPriceText %}
{% assign banner_free_shipping_qualify_text = locale_labels.bannerFreeShippingQualifyText %}
{% assign banner_free_shipping_text = locale_labels.bannerFreeShippingText %}

{% comment %} Fallback to hardcoded defaults if still blank {% endcomment %}
{% if banner_saving_text == blank %}
  {% assign banner_saving_text = "You're saving {discount} with {name}" %}
{% endif %}
...
```

#### `app-block.liquid`

Same pattern — add locale detection and resolve `g_labels` from the locale-keyed object:

```liquid
{% assign customer_locale = request.locale.iso_code | downcase | split: '-' | first %}
{% assign locale_labels = global.labels[customer_locale] %}
{% unless locale_labels %}
  {% assign locale_labels = global.labels[global.primaryLocale] %}
{% endunless %}
{% unless locale_labels %}
  {% assign locale_labels = global.labels['en'] %}
{% endunless %}
{% assign g_labels = locale_labels %}
```

Then the existing if/else label resolution blocks work as-is — they already check `g_labels.xxx != blank` and fall back to `'bundle.xxx' | t`.

> **KB Impact**: ~3 lines added to each Liquid file. Negligible increase.

---

### 6. Per-Bundle Label Overrides

Currently, `BundleSettings.style` JSON can contain per-bundle label overrides (e.g., `headingLabel`, `quantityLabel`). These are single-language.

**Options:**

- **Option A (Simple)**: Keep per-bundle labels as single-language overrides. If set, they override the locale-resolved global label. Most merchants won't customize per-bundle labels per-language.
- **Option B (Full)**: Make per-bundle labels locale-keyed too. More complex, but fully consistent.

**Recommendation**: Start with **Option A**. Per-bundle labels are rare customizations — the global locale-aware labels cover 95% of use cases.

---

### 7. Locale File Fallback Chain

The full label resolution order (most specific → least specific):

```
1. Per-bundle label (BundleSettings.style.headingLabel)     ← single-language override
2. Global label for customer locale (global.labels["fr"])    ← per-locale from Settings
3. Global label for primary locale (global.labels["en"])     ← primary locale fallback
4. Locale file translation ('bundle.title' | t)              ← built-in translations
5. Raw key name as last resort                                ← safety net
```

---

## Implementation Phases

### Phase 1: Data Layer (Backend)

- [ ] Create migration script to convert flat `labels` JSON → locale-keyed structure
- [ ] Fetch and cache `shopLocales` from Admin API (add to shop sync flow)
- [ ] Update settings save/load API to handle per-locale labels
- [ ] Update metafield sync to write locale-keyed labels

### Phase 2: Settings UI (Admin)

- [ ] Add locale picker component (tabs or dropdown)
- [ ] Wire locale state management in settings form
- [ ] Show primary locale labels as placeholders in secondary locales
- [ ] Add "empty = use default translation" hint text

### Phase 3: Storefront (Liquid)

- [ ] Add `customer_locale` detection to `app-embed.liquid`
- [ ] Resolve `locale_labels` from `global.labels[customer_locale]` with fallback
- [ ] Add `customer_locale` detection to `app-block.liquid`
- [ ] Set `g_labels` from locale-resolved labels
- [ ] Test with Shopify language switcher

### Phase 4: Locale Files

- [ ] Keep `en.default.json` and `fr.json` as final fallbacks
- [ ] Add more locale files as needed (de, es, pt, etc.)
- [ ] Consider using Lara MCP for bulk translation of new locales

---

## File Impact Summary

| File                                | Change                                      |
| ----------------------------------- | ------------------------------------------- |
| `web/prisma/schema.prisma`          | No change (labels is already `Json?`)       |
| `web/app/api/.../settings/route.ts` | Accept locale param, save per-locale        |
| `web/features/settings/...`         | Add locale picker, manage active locale     |
| `web/features/settings/hooks/...`   | Load/save labels by locale                  |
| `extension/../app-embed.liquid`     | Add ~5 lines for locale detection           |
| `extension/../app-block.liquid`     | Add ~5 lines for locale-aware g_labels      |
| `extension/../locales/*.json`       | Keep as fallbacks                           |
| Migration script (new)              | Convert existing flat labels → locale-keyed |

---

## Risks & Mitigations

| Risk                                                | Mitigation                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Existing stores have flat labels in DB              | Migration script wraps under primary locale key                                |
| Metafield size limit (64KB)                         | Label objects are tiny (~1KB per locale); 10 locales = ~10KB, well under limit |
| Liquid `global.labels[variable]` dynamic key access | Shopify Liquid supports hash access with variable keys ✅                      |
| 100KB Liquid file cap                               | Only ~5 lines added per file; well within budget                               |
| Merchant confusion                                  | UI shows hint: "Leave empty to use default translation"                        |

---

## Testing Plan

1. **Single-language store**: Labels work as before — no regression
2. **Multi-language store**: Switch locale → correct labels appear
3. **Empty labels**: Falls back to locale file translations
4. **Per-bundle overrides**: Still work (single-language, highest priority)
5. **New store install**: Default empty labels → locale files handle everything
6. **Migration**: Existing flat labels correctly wrapped under primary locale
