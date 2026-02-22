# App Translation & Internationalization Report — Radius Product Bundles

> Generated: 2026-02-22 | Sources: Shopify Dev MCP (Localize Your App, App Home Config API, AppProvider i18n, Extension Localization), Codebase Analysis

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [How Shopify i18n Works for Embedded Apps](#3-how-shopify-i18n-works-for-embedded-apps)
4. [Implementation Guide: Admin App (Polaris Web Components + Next.js)](#4-implementation-guide-admin-app)
5. [Implementation Guide: Storefront Widget (Liquid + JS)](#5-implementation-guide-storefront-widget)
6. [Implementation Guide: Shopify Function (Rust)](#6-implementation-guide-shopify-function)
7. [File-by-File Changes Required](#7-file-by-file-changes-required)
8. [Recommended i18n Library](#8-recommended-i18n-library)
9. [Priority Languages](#9-priority-languages)
10. [Action Items](#10-action-items)

---

## 1. Executive Summary

The Radius Product Bundles app currently has **no internationalization infrastructure**. All admin UI strings are hardcoded in English, the storefront widget uses English-only label defaults, and there is no mechanism to detect the merchant's locale.

Shopify provides the merchant's locale to embedded apps via two mechanisms:

1. **`locale` query parameter** — sent with the initial GET request when Shopify loads your app
2. **`shopify.config.locale`** — available client-side via the App Bridge global variable (default: `'en-US'`)

The app currently uses neither.

### Key Finding: Polaris Web Components Auto-Translate

When using **Polaris web components** (loaded via CDN `polaris.js`), **Shopify handles the translation of Polaris component internals automatically**. Unlike the React `@shopify/polaris` library (which requires you to pass `i18n` translations via `AppProvider`), the CDN-loaded web components are pre-translated by the Shopify admin based on the merchant's language setting.

**What this means**: You do NOT need to translate Polaris component labels (like "Save", "Cancel", "Previous", "Next" in pagination, etc.). Shopify does that. You only need to translate **your own custom strings** — page titles, descriptions, labels, error messages, tooltips, etc.

---

## 2. Current State Analysis

### What Exists

| Item                           | File                                         | Status                                               |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------------- |
| Theme extension locale file    | `extension/.../locales/en.default.json`      | Only English, 2 translation keys                     |
| Currency formatter with locale | `web/shared/utils/formatters/currency.ts:31` | Uses `Intl.NumberFormat(locale, ...)`                |
| Currency locale constants      | `web/shared/constants/currency.constants.ts` | 18 locale mappings (en-US, fr-FR, de-DE, etc.)       |
| Number formatter with locale   | `web/shared/utils/formatters/number.ts:38`   | Uses `toLocaleString(locale)`                        |
| Storefront locale path helper  | `web/widgets/src/radius-bundles.ts:14`       | Reads `window.Shopify.routes.root` for `/fr/` prefix |

### What's Missing

| Item                                                                           | Impact                                              | Priority |
| ------------------------------------------------------------------------------ | --------------------------------------------------- | -------- |
| **i18n library** (next-intl / i18next)                                         | No string externalization possible                  | High     |
| **Admin translation files** (`locales/en.json`, etc.)                          | All strings hardcoded                               | High     |
| **Merchant locale detection** from `shopify.config.locale` or `?locale=` param | Always renders English                              | High     |
| **`<html lang="en">` is hardcoded** in `web/app/layout.tsx:27`                 | Screen readers, SEO                                 | High     |
| **Date formatting** uses hardcoded `"en-US"`                                   | `web/features/analytics/utils/date-range.ts:44,231` | Medium   |
| **Extension locale files** for other languages                                 | Theme extension shows English only                  | Medium   |
| **Database column** for merchant locale preference                             | Can't persist locale server-side                    | Medium   |
| **Polaris React AppProvider** not used                                         | N/A — using CDN web components (correct)            | None     |

---

## 3. How Shopify i18n Works for Embedded Apps

### 3.1 Locale Detection

Shopify provides the merchant's locale to your embedded app in two ways:

#### Server-Side: `locale` Query Parameter

When Shopify loads your app in an iframe, the initial request URL includes:

```
https://your-app.com/?shop=store.myshopify.com&host=xxx&locale=fr
```

The `locale` parameter contains the merchant's chosen language in IETF BCP 47 format (e.g., `en`, `fr`, `de`, `ja`, `pt-BR`).

#### Client-Side: `shopify.config.locale`

After App Bridge loads, you can access the locale synchronously:

```javascript
// Available immediately after app-bridge.js loads
const merchantLocale = shopify.config.locale;
// => 'fr' or 'en-US' or 'de' etc.
```

### 3.2 Two Layers of Translation

| Layer                            | What Gets Translated                                                                 | Who Translates                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Polaris web components** (CDN) | Built-in component strings ("Save", "Cancel", pagination labels, date pickers, etc.) | **Shopify automatically** — based on the admin's language setting |
| **Your app's custom strings**    | Page titles, form labels, error messages, descriptions, button text, etc.            | **You** — using an i18n library + translation files               |

### 3.3 Polaris React vs Polaris Web Components (CDN)

| Approach                           | How to Set Locale                                                            | Current App           |
| ---------------------------------- | ---------------------------------------------------------------------------- | --------------------- |
| **React `@shopify/polaris`** (npm) | Pass `i18n={require('@shopify/polaris/locales/fr.json')}` to `<AppProvider>` | NOT used              |
| **Polaris Web Components** (CDN)   | **Automatic** — Shopify admin handles it. No config needed.                  | ✅ **Currently used** |

Since this app loads Polaris via CDN (`<script src="https://cdn.shopify.com/shopifycloud/polaris.js">`), Polaris component translations are handled automatically by Shopify. You only need to handle your own strings.

### 3.4 Shopify's Recommended i18n Process

From [Shopify's official guide](https://shopify.dev/docs/apps/build/localize-your-app):

1. **Externalize strings** — Move all hardcoded text to JSON translation files
2. **Detect locale** — Read `locale` query param (server) or `shopify.config.locale` (client)
3. **Format dynamically** — Use `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.ListFormat` for locale-aware formatting
4. **Translate** — Provide translation files per language
5. **Test** — Use pseudolocalization to catch text expansion issues (text is ~50% longer in most languages vs English)

---

## 4. Implementation Guide: Admin App

### 4.1 Choose an i18n Library

For a Next.js 16 App Router app, the recommended library is **`next-intl`**:

```bash
cd web && bun add next-intl
```

**Why `next-intl`**:

- First-class Next.js App Router support
- Server Components + Client Components support
- Type-safe translation keys
- Built-in ICU message format (pluralization, interpolation)
- Small bundle (~2KB gzipped)

### 4.2 Create Translation Files

```
web/
  messages/
    en.json          # English (default)
    fr.json          # French
    de.json          # German
    es.json          # Spanish
    ja.json          # Japanese
    pt-BR.json       # Portuguese (Brazil)
    it.json          # Italian
    nl.json          # Dutch
    ko.json          # Korean
    zh-CN.json       # Chinese Simplified
```

#### Example `en.json` structure:

```json
{
    "common": {
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "create": "Create",
        "back": "Back",
        "loading": "Loading...",
        "error": "Something went wrong",
        "retry": "Try again",
        "noResults": "No results found",
        "search": "Search"
    },
    "navigation": {
        "dashboard": "Dashboard",
        "bundles": "Bundles",
        "analytics": "Analytics",
        "settings": "Settings",
        "abTesting": "A/B Testing",
        "automation": "Automation",
        "pricing": "Pricing",
        "templates": "Templates",
        "integrations": "Integrations"
    },
    "dashboard": {
        "title": "Dashboard",
        "welcomeTitle": "Welcome to Radius Bundles",
        "totalBundles": "Total Bundles",
        "totalRevenue": "Total Revenue",
        "conversionRate": "Conversion Rate",
        "activeBundles": "Active Bundles"
    },
    "bundles": {
        "title": "Bundles",
        "createBundle": "Create Bundle",
        "editBundle": "Edit Bundle",
        "bundleName": "Bundle name",
        "bundleNamePlaceholder": "e.g., Summer Essentials Pack",
        "status": {
            "active": "Active",
            "draft": "Draft",
            "paused": "Paused",
            "archived": "Archived",
            "scheduled": "Scheduled"
        },
        "type": {
            "fixedBundle": "Fixed Bundle",
            "buyXGetY": "Buy X Get Y",
            "bogo": "BOGO",
            "volumeDiscount": "Volume Discount",
            "mixAndMatch": "Mix & Match",
            "frequentlyBoughtTogether": "Frequently Bought Together"
        },
        "emptyState": {
            "title": "Create your first bundle",
            "description": "Bundles help increase your average order value by grouping products together."
        }
    },
    "settings": {
        "title": "Settings",
        "general": "General",
        "labels": "Labels",
        "appearance": "Appearance",
        "advanced": "Advanced",
        "savedSuccessfully": "Settings saved successfully"
    },
    "analytics": {
        "title": "Analytics",
        "views": "Views",
        "addedToCart": "Added to Cart",
        "purchases": "Purchases",
        "revenue": "Revenue",
        "period": {
            "today": "Today",
            "last7Days": "Last 7 days",
            "last30Days": "Last 30 days",
            "last90Days": "Last 90 days"
        }
    }
}
```

### 4.3 Detect Merchant Locale

#### Server-Side (Layout / Server Actions)

The `locale` query parameter is sent by Shopify when loading the app. In Next.js, extract it in your root layout or middleware:

```typescript
// web/lib/i18n/get-locale.ts
import { headers } from "next/headers";

const SUPPORTED_LOCALES = [
    "en",
    "fr",
    "de",
    "es",
    "ja",
    "pt-BR",
    "it",
    "nl",
    "ko",
    "zh-CN",
] as const;
const DEFAULT_LOCALE = "en";

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function getLocaleFromRequest(request?: Request): SupportedLocale {
    // 1. Check URL search params (Shopify sends ?locale=fr)
    if (request) {
        const url = new URL(request.url);
        const locale = url.searchParams.get("locale");
        if (locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
            return locale as SupportedLocale;
        }
    }

    // 2. Fallback: check Accept-Language header
    const headersList = headers();
    const acceptLang = headersList.get("accept-language");
    if (acceptLang) {
        for (const supported of SUPPORTED_LOCALES) {
            if (acceptLang.startsWith(supported)) return supported;
        }
    }

    return DEFAULT_LOCALE;
}
```

#### Client-Side (App Bridge Global)

```typescript
// web/shared/hooks/use-locale.ts
import { useMemo } from "react";

export function useLocale(): string {
    return useMemo(() => {
        if (typeof window !== "undefined" && window.shopify?.config?.locale) {
            return window.shopify.config.locale;
        }
        return "en";
    }, []);
}
```

### 4.4 Wire into Next.js App Router

#### Option A: `next-intl` Setup

```typescript
// web/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { getLocaleFromRequest } from "@/lib/i18n/get-locale";

export default getRequestConfig(async () => {
    const locale = getLocaleFromRequest();

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
```

```typescript
// web/app/layout.tsx (updated)
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>  {/* Dynamic, not hardcoded "en" */}
      <head>
        <meta name="shopify-api-key" content={...} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4.5 Using Translations in Components

```tsx
// Before (hardcoded)
<Page title="Bundles">
    <Button onClick={handleCreate}>Create Bundle</Button>
</Page>;

// After (translated)
import { useTranslations } from "next-intl";

function BundlesPage() {
    const t = useTranslations("bundles");

    return (
        <Page title={t("title")}>
            <Button onClick={handleCreate}>{t("createBundle")}</Button>
        </Page>
    );
}
```

### 4.6 Format Numbers, Dates, Prices

Use `Intl` APIs with the detected locale (not hardcoded `"en-US"`):

```typescript
// Before (hardcoded locale)
new Intl.DateTimeFormat("en-US", { ... })

// After (dynamic locale)
const locale = shopify.config.locale || 'en-US';
new Intl.DateTimeFormat(locale, { ... })
```

The app already has `Intl.NumberFormat` usage in `currency.ts` and `number.ts` that accepts a `locale` parameter — these just need to receive the actual merchant locale instead of defaulting to `"en-US"`.

---

## 5. Implementation Guide: Storefront Widget

### 5.1 Theme Extension Locale Files

Storefront locale files go in the extension's `locales/` directory:

```
extension/extensions/product-bundle-widget/
  locales/
    en.default.json   # English (default) — expand this
    fr.json           # French
    de.json           # German
    es.json           # Spanish
    ja.json           # Japanese
    pt-BR.json        # Portuguese (Brazil)
```

#### Expanded `en.default.json`:

```json
{
    "ratings": {
        "stars": { "label": "Ratings" },
        "home": { "recommendationText": "Recommended Product!" }
    },
    "bundle": {
        "heading": "Bundle & Save",
        "addToCart": "Add Bundle to Cart",
        "adding": "Adding...",
        "added": "Added!",
        "outOfStock": "Out of Stock",
        "selectOption": "Select an option",
        "showMore": "Show {count} more",
        "showLess": "Show less",
        "quantityLabel": "Quantity",
        "originalPrice": "Original price",
        "bundlePrice": "Bundle price",
        "youSave": "You save {amount}",
        "savingsPercent": "Save {percent}%",
        "maxBundlesReached": "Maximum bundles reached",
        "freeShipping": "Free Shipping"
    },
    "savingsBanner": {
        "savingText": "You're saving {discount} with {name}",
        "customPriceText": "Special price: {price} for {name}",
        "freeShippingQualify": "Add {amount} more to qualify for free shipping",
        "freeShippingText": "You've qualified for free shipping!"
    }
}
```

#### Example `fr.json`:

```json
{
    "bundle": {
        "heading": "Lot & Économisez",
        "addToCart": "Ajouter le lot au panier",
        "adding": "Ajout en cours...",
        "added": "Ajouté !",
        "outOfStock": "Rupture de stock",
        "selectOption": "Sélectionner une option",
        "showMore": "Afficher {count} de plus",
        "showLess": "Afficher moins",
        "quantityLabel": "Quantité",
        "originalPrice": "Prix d'origine",
        "bundlePrice": "Prix du lot",
        "youSave": "Vous économisez {amount}",
        "savingsPercent": "Économisez {percent} %",
        "maxBundlesReached": "Nombre maximum de lots atteint",
        "freeShipping": "Livraison gratuite"
    },
    "savingsBanner": {
        "savingText": "Vous économisez {discount} avec {name}",
        "customPriceText": "Prix spécial : {price} pour {name}",
        "freeShippingQualify": "Ajoutez {amount} de plus pour bénéficier de la livraison gratuite",
        "freeShippingText": "Vous bénéficiez de la livraison gratuite !"
    }
}
```

### 5.2 Using Translations in Liquid

In Liquid theme extensions, use the `t` filter (Shopify's built-in translation filter):

```liquid
{%- comment -%} Before: hardcoded English {%- endcomment -%}
{% assign bundle_heading = bundle.title | default: 'Bundle & Save' %}

{%- comment -%} After: translated {%- endcomment -%}
{% assign bundle_heading = bundle.title | default: 'bundle.heading' | t %}
```

**Important**: The `| t` filter in theme extensions looks up keys from your `locales/*.json` files and automatically resolves to the buyer's language based on the storefront locale.

### 5.3 Passing Translated Labels to JS Widget

Currently, labels are passed from Liquid → JS via the `bundle_structure_json` or config object. Continue this pattern but source from translation files:

```liquid
{%- comment -%} In app-block.liquid {%- endcomment -%}
{% assign add_to_cart_text = 'bundle.addToCart' | t %}
{% assign adding_text = 'bundle.adding' | t %}
{% assign out_of_stock_text = 'bundle.outOfStock' | t %}
```

---

## 6. Implementation Guide: Shopify Function (Rust)

### 6.1 Localizing Function Name & Description

In `shopify.extension.toml`, replace hardcoded strings with translation keys:

```toml
# Before
name = "Radius Discount Function"
description = "Applies bundle discounts"

# After
name = "t:name"
description = "t:description"
```

Create locale files in the function extension:

```
extension/extensions/radius-discount-function/
  locales/
    en.default.json
    fr.json
```

```json
// en.default.json
{
  "name": "Radius Discount Function",
  "description": "Applies bundle discounts to cart line items"
}

// fr.json
{
  "name": "Fonction de remise Radius",
  "description": "Applique les remises de lots aux articles du panier"
}
```

### 6.2 Translated Discount Messages

The Shopify Function input query can include `localization { language { isoCode } }` to get the current customer's language. Use this to return translated discount titles:

```rust
// In the Rust discount function
let locale = input.localization.language.iso_code;
let discount_message = match locale.as_str() {
    "fr" => "Remise de lot",
    "de" => "Paketrabatt",
    "es" => "Descuento de paquete",
    _ => "Bundle Discount",
};
```

---

## 7. File-by-File Changes Required

### Phase 1: Infrastructure (Must Do First)

| #   | File                         | Change                                                       | Effort  |
| --- | ---------------------------- | ------------------------------------------------------------ | ------- |
| 1   | `web/package.json`           | Add `next-intl` dependency                                   | 1 min   |
| 2   | `web/messages/en.json`       | Create default English translation file                      | 2-4 hrs |
| 3   | `web/i18n/request.ts`        | Create next-intl request config                              | 15 min  |
| 4   | `web/app/layout.tsx`         | Dynamic `lang` attribute, wrap with `NextIntlClientProvider` | 30 min  |
| 5   | `web/lib/i18n/get-locale.ts` | Create locale detection utility                              | 30 min  |
| 6   | `web/next.config.js`         | Add `next-intl` plugin config                                | 15 min  |

### Phase 2: Externalize Strings

| #   | Area                    | ~String Count | Files Affected                       |
| --- | ----------------------- | ------------- | ------------------------------------ |
| 7   | Navigation labels       | ~9            | `navigation.tsx`                     |
| 8   | Dashboard page          | ~25           | `dashboard/components/*.tsx`         |
| 9   | Bundles list & creation | ~60           | `bundles/components/*.tsx`           |
| 10  | Analytics page          | ~30           | `analytics/components/*.tsx`         |
| 11  | Settings page           | ~40           | `settings/components/*.tsx`, configs |
| 12  | Common components       | ~20           | `shared/components/*.tsx`            |
| 13  | Error/empty states      | ~15           | Various                              |
| 14  | Toast messages          | ~20           | Various server actions               |

**Estimated total**: ~220 unique translatable strings

### Phase 3: Storefront Widget

| #   | File                                    | Change                             |
| --- | --------------------------------------- | ---------------------------------- | --------- |
| 15  | `extension/.../locales/en.default.json` | Expand to cover all widget strings |
| 16  | `extension/.../locales/fr.json`         | French translations                |
| 17  | `extension/.../locales/de.json`         | German translations                |
| 18  | `extension/.../blocks/app-block.liquid` | Replace hardcoded defaults with `  | t` filter |
| 19  | `extension/.../blocks/app-embed.liquid` | Replace hardcoded defaults with `  | t` filter |

### Phase 4: Locale-Aware Formatting

| #   | File                                         | Line(s) | Change                                          |
| --- | -------------------------------------------- | ------- | ----------------------------------------------- |
| 20  | `web/features/analytics/utils/date-range.ts` | 44, 231 | Replace hardcoded `"en-US"` with dynamic locale |
| 21  | `web/shared/utils/formatters/currency.ts`    | 31      | Pass merchant locale as default                 |
| 22  | `web/shared/utils/formatters/number.ts`      | 38      | Pass merchant locale as default                 |

### Phase 5: Shopify Function

| #   | File                                                             | Change                         |
| --- | ---------------------------------------------------------------- | ------------------------------ |
| 23  | `extension/.../radius-discount-function/shopify.extension.toml`  | Use `t:name` / `t:description` |
| 24  | `extension/.../radius-discount-function/locales/en.default.json` | Create                         |
| 25  | `extension/.../radius-discount-function/locales/fr.json`         | Create                         |

---

## 8. Recommended i18n Library

### For Admin App: `next-intl`

| Criteria           | next-intl    | i18next + react-i18next |
| ------------------ | ------------ | ----------------------- |
| App Router support | ✅ Native    | ⚠️ Requires adapter     |
| Server Components  | ✅ Built-in  | ⚠️ Limited              |
| Bundle size        | ~2KB         | ~15KB                   |
| Type safety        | ✅ Full      | ⚠️ Plugin needed        |
| ICU message format | ✅           | ✅                      |
| Pluralization      | ✅           | ✅                      |
| SSR hydration      | ✅ Automatic | ⚠️ Manual setup         |
| Learning curve     | Low          | Medium                  |

**Recommendation**: **`next-intl`** — it's purpose-built for Next.js App Router and keeps the bundle small.

### For Storefront Widget: Shopify's Built-in `| t` Filter

No library needed. Shopify's Liquid `| t` translation filter reads from the extension's `locales/` folder automatically based on the buyer's language context.

---

## 9. Priority Languages

Based on Shopify's guidance (European markets growing 3x faster than US, 5-7% of apps localized):

### Tier 1 (Highest ROI)

| Language | Code | Rationale                                             |
| -------- | ---- | ----------------------------------------------------- |
| English  | `en` | Default                                               |
| French   | `fr` | France, Canada, Belgium — strong Shopify market       |
| German   | `de` | Germany, Austria, Switzerland — high purchasing power |
| Spanish  | `es` | Spain, Latin America — large addressable market       |

### Tier 2 (High Impact)

| Language            | Code    | Rationale                             |
| ------------------- | ------- | ------------------------------------- |
| Japanese            | `ja`    | Japan is a priority Shopify market    |
| Portuguese (Brazil) | `pt-BR` | Brazil is a growing e-commerce market |
| Italian             | `it`    | Italy is a priority European market   |

### Tier 3 (Expanded Reach)

| Language           | Code    |
| ------------------ | ------- |
| Dutch              | `nl`    |
| Korean             | `ko`    |
| Chinese Simplified | `zh-CN` |
| Swedish            | `sv`    |
| Danish             | `da`    |
| Polish             | `pl`    |
| Turkish            | `tr`    |

### Shopify Admin Supported Languages

The Shopify admin itself supports these languages, so merchants can set their admin to any of them:
Czech, Danish, Dutch, English, Finnish, French, German, Hindi, Italian, Japanese, Korean, Malay, Norwegian Bokmål, Polish, Portuguese (Brazil), Portuguese (Portugal), Spanish, Swedish, Thai, Turkish, Chinese (Simplified), Chinese (Traditional)

---

## 10. Action Items

### Blockers (Before App Store Launch)

| #   | Item                                                                       | Effort | Impact                             |
| --- | -------------------------------------------------------------------------- | ------ | ---------------------------------- |
| 1   | **Install `next-intl`** and set up infrastructure                          | 2 hrs  | Enables all translation work       |
| 2   | **Create `en.json`** with all ~220 externalized strings                    | 4 hrs  | Foundation for all languages       |
| 3   | **Detect merchant locale** from `shopify.config.locale` / `?locale=` param | 1 hr   | App renders in correct language    |
| 4   | **Make `<html lang>` dynamic** in `layout.tsx`                             | 15 min | Accessibility, SEO                 |
| 5   | **Replace hardcoded `"en-US"` in date/number formatters**                  | 30 min | Correct formatting for all locales |

### High Priority (First Languages)

| #   | Item                                                            | Effort | Impact                           |
| --- | --------------------------------------------------------------- | ------ | -------------------------------- |
| 6   | **Externalize strings** in all admin components (~50 files)     | 8 hrs  | Prerequisite for any translation |
| 7   | **Create `fr.json`** — French translation                       | 3 hrs  | #1 non-English Shopify market    |
| 8   | **Create `de.json`** — German translation                       | 3 hrs  | #2 non-English Shopify market    |
| 9   | **Create `es.json`** — Spanish translation                      | 3 hrs  | Large addressable market         |
| 10  | **Expand storefront `en.default.json`** with all widget strings | 1 hr   | Foundation for storefront i18n   |
| 11  | **Create storefront `fr.json`, `de.json`, `es.json`**           | 2 hrs  | Buyer-facing translations        |

### Medium Priority

| #   | Item                                             | Effort |
| --- | ------------------------------------------------ | ------ |
| 12  | Localize Shopify Function name/description       | 1 hr   |
| 13  | Add Tier 2 languages (ja, pt-BR, it)             | 9 hrs  |
| 14  | Use pseudolocalization to test UI text expansion | 2 hrs  |
| 15  | Translate App Store listing (6 languages)        | 6 hrs  |

### Recommended (Post-Launch)

| #   | Item                                                               |
| --- | ------------------------------------------------------------------ |
| 16  | Add Tier 3 languages                                               |
| 17  | Machine translation pipeline with human review                     |
| 18  | Store merchant locale preference in DB for server-side rendering   |
| 19  | Crowdin or similar TMS (Translation Management System) integration |
| 20  | Pseudolocalization CI check for untranslated strings               |

---

## References

- [Shopify: Localize Your App](https://shopify.dev/docs/apps/build/localize-your-app) — Complete i18n guide
- [App Bridge Config API](https://shopify.dev/docs/api/app-home/apis/config) — `shopify.config.locale` docs
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/using-polaris-components) — Auto-translated via CDN
- [AppProvider i18n (Remix)](https://shopify.dev/docs/api/shopify-app-remix/latest/entrypoints/appprovider) — React Polaris i18n prop (for reference)
- [Checkout Extension Localization](https://shopify.dev/docs/apps/build/checkout/localized-checkout-ui-extensions) — Locale files + pluralization
- [Functions Localization](https://shopify.dev/docs/apps/build/functions/localization-practices-shopify-functions) — `t:name` pattern
- [Shopify Pseudolocalization Tool](https://github.com/Shopify/pseudolocalization) — Test text expansion
- [next-intl](https://next-intl-docs.vercel.app/) — Recommended i18n library for Next.js
- [Shopify Supported Languages](https://help.shopify.com/en/manual/your-account/languages) — Admin language list
