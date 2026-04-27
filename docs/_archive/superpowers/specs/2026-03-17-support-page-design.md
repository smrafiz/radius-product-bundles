# Support Page Design Spec

**Date:** 2026-03-17
**Status:** Approved

---

## Overview

A dedicated `/support` route inside the Shopify embedded app that gives merchants self-service resources and direct contact options. No backend required — all content is static.

---

## Goals

- Help merchants resolve common issues without emailing support
- Surface docs, video tutorials, and email contact in one place
- Match the visual language of the existing dashboard exactly (same `s-*` component patterns)

---

## Route & File Structure

```
web/app/(dashboard)/support/
  page.tsx                          # Server component: generateMetadata + renders <SupportPage />
  loading.tsx                       # Minimal skeleton (matches other (dashboard) routes)

web/features/support/
  index.ts                          # Barrel: export * from "./components"; export * from "./constants"
  components/
    index.ts                        # Re-exports all sub-components (barrel chain)
    support-page/
      support-page.tsx              # "use client" — root page component
    support-quick-actions/
      support-quick-actions.tsx     # "use client" — 3-card resource row
    support-faq/
      support-faq.tsx               # "use client" — FAQ list section
    support-side-panel/
      support-side-panel.tsx        # "use client" — hours + quick links + pro tip
  constants/
    support.constants.ts            # URLs and structural data only (no raw copy strings)
```

`"use client"` is required on every component file under `features/support/components/` because they use `useTranslations()`. The page wrapper (`app/(dashboard)/support/page.tsx`) must NOT have `"use client"` — it uses `generateMetadata` which is server-only.

---

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│ TitleBar: "Support"   [✉ Email]  [📖 View Docs]     │
└─────────────────────────────────────────────────────┘
<s-page>
  <s-stack gap="large">
    ┌─────────────────────────────────────────────────┐
    │ Get Help  (s-section)                           │
    │  s-grid repeat(3,1fr) gap="base"                │
    │  ┌────────────┐ ┌────────────┐ ┌─────────────┐ │
    │  │ 📖 Docs    │ │ ▶️ Videos  │ │ ✉️ Email    │ │
    │  │ s-clickable│ │ s-clickable│ │ s-clickable │ │
    │  └────────────┘ └────────────┘ └─────────────┘ │
    └─────────────────────────────────────────────────┘
    ┌───────────────────────────┐ ┌───────────────────┐
    │ FAQ  (s-section)          │ │ Side Panel        │
    │ s-grid "1fr 280px"        │ │ (s-stack gap=base)│
    │                           │ │  Support Hours    │
    │  5 rows, each:            │ │  Quick Links      │
    │   s-text bold question    │ │  Pro Tip banner   │
    │   s-text subdued answer   │ │                   │
    │   › chevron               │ │                   │
    └───────────────────────────┘ └───────────────────┘
  </s-stack>
</s-page>
```

---

## Components

### `SupportPage` (`support-page.tsx`)

Root component — `"use client"`. Returns:

```tsx
<s-page heading={t("title")}>
    <TitleBar title={t("title")}>
        <button
            variant="secondary"
            onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`)}
        >
            {t("email")}
        </button>
        <button onClick={() => window.open(DOCS_URL, "_blank")}>
            {t("docs")}
        </button>
    </TitleBar>
    <s-stack gap="large">
        <SupportQuickActions />
        <s-grid gridTemplateColumns="1fr 280px" gap="base" alignItems="start">
            <s-grid-item>
                <SupportFaq />
            </s-grid-item>
            <s-grid-item>
                <SupportSidePanel />
            </s-grid-item>
        </s-grid>
    </s-stack>
</s-page>
```

`TitleBar` uses native `<button>` elements (not `<s-button>`) with `window.open()` for external URLs — the same pattern used in other static pages. `goTo()` from `useAppNavigation` is for internal routes only and must not be used here.

### `SupportQuickActions` (`support-quick-actions.tsx`)

Three `<s-clickable>` cards inside `<s-grid gridTemplateColumns="repeat(3,1fr)" gap="base">`. Each card mirrors `DashboardQuickActions` layout: `<s-grid gridTemplateColumns="auto 1fr" gap="base">` with a coloured icon box and text block.

External URLs are opened via `window.open(url, "_blank")` — not `goTo()`.

Cards (inline config using URL constants from `support.constants.ts`, labels from `t()`):

- **Documentation** — `DOCS_URL`, purple gradient icon
- **Video Tutorials** — `VIDEOS_URL`, pink gradient icon
- **Email Support** — `mailto:${SUPPORT_EMAIL}`, green gradient icon

### `SupportFaq`

`<s-section>` with:

- Header row: `<s-grid gridTemplateColumns="1fr auto">` — title/subtitle left, article count badge right
- List of 5 FAQ rows, each: `<s-grid gridTemplateColumns="1fr auto">` with question + answer stack and `›` chevron

FAQ copy comes entirely from `useTranslations("Support")` — keys `faq1Q`/`faq1A` through `faq5Q`/`faq5A`. The constants file holds structural config only (e.g., count = 5), not copy strings.

### `SupportSidePanel`

`<s-stack gap="base">` containing three `<s-section>` blocks:

1. **Support Hours** — schedule and response time badge
2. **Quick Links** — list of 4 external links, each opened via `window.open(url, "_blank")`; link labels from `t()`, URLs from `QUICK_LINKS` constant
3. **Pro Tip** — `<s-banner tone="warning">` with tip copy from `t("proTip")`

---

## Constants (`support.constants.ts`)

Holds URLs and structural data only. All visible copy strings come from `useTranslations()`.

```ts
export const SUPPORT_EMAIL = "support@radiusbundles.com";
export const DOCS_URL = "https://docs.radiusbundles.com";
export const VIDEOS_URL = "https://youtube.com/@radiusbundles";
export const APP_STORE_URL = "https://apps.shopify.com/radius-product-bundles";
export const COMMUNITY_URL = "https://community.radiusbundles.com";
export const FAQ_COUNT = 5; // number of FAQ items rendered

export const QUICK_LINKS = [
    { key: "linkDocs", url: DOCS_URL, external: true },
    { key: "linkVideos", url: VIDEOS_URL, external: true },
    { key: "linkAppStore", url: APP_STORE_URL, external: true },
    { key: "linkCommunity", url: COMMUNITY_URL, external: true },
];
```

`QUICK_LINKS[].key` maps to translation keys in `Support.*` — no raw label strings in constants.

---

## Navigation

Add `support` entry to `Navigation` component (`/web/shared/components/navigation/navigation.tsx`) and add key `Common.Navigation.support` to `en.json` / `fr.json`.

---

## i18n Keys

Add to `en.json` and `fr.json`:

```json
"Meta": {
  "pages": {
    "support": {
      "title": "Support - Help & Resources",
      "description": "Browse docs, watch tutorials, or contact the Radius Bundles support team."
    }
  }
},
"Support": {
  "title": "Support",
  "getHelp": "Get Help",
  "docs": "Documentation",
  "docsDescription": "Setup guides, feature references & integration docs",
  "videos": "Video Tutorials",
  "videosDescription": "Step-by-step walkthroughs for every bundle type",
  "email": "Email Support",
  "emailDescription": "We reply within 24 hours on business days",
  "faqTitle": "Frequently Asked Questions",
  "faqSubtitle": "Quick answers to common questions",
  "faqCount": "{count} articles",
  "supportHours": "Support Hours",
  "schedule": "Mon – Fri, 9 AM – 6 PM EST",
  "responseTime": "Response time",
  "responseTimeValue": "Within 24h",
  "quickLinks": "Quick Links",
  "linkDocs": "Full Documentation",
  "linkVideos": "YouTube Tutorials",
  "linkAppStore": "Rate on App Store",
  "linkCommunity": "Community Forum",
  "proTipTitle": "Pro Tip",
  "proTip": "Include your store URL and a screenshot when emailing — it helps us resolve issues 2× faster.",
  "faq1Q": "How do I create my first bundle?",
  "faq1A": "Go to Bundles → Create Bundle, choose a type, add products, set a discount, and publish.",
  "faq2Q": "Why isn't the widget showing on my storefront?",
  "faq2A": "Enable the app embed: Online Store → Themes → Customize → App Embeds → toggle Radius Bundles on.",
  "faq3Q": "Can bundles combine with discount codes?",
  "faq3A": "Yes — enable Allow discount stacking in Settings → General.",
  "faq4Q": "How do I translate bundle labels?",
  "faq4A": "Settings → Labels → switch to a non-primary language tab → click Auto Translate.",
  "faq5Q": "Does the app slow down my store?",
  "faq5A": "No — discounts run server-side via a Shopify Function. Zero storefront performance impact."
}
```

`Common.Navigation.support` → `"Support"` (en) / `"Assistance"` (fr).

---

## Data Flow

All content is static. No server actions, no React Query, no database calls. Constants hold URLs; all copy comes from `useTranslations()`. `SupportPage` is a pure client component with no async data fetching.

---

## Out of Scope

- Contact form
- Live chat widget
- Server-side ticket creation
- Search within FAQ
