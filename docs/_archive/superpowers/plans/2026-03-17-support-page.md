# Support Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static `/support` page inside the Shopify embedded app with three resource cards (Docs, Videos, Email), an FAQ list, and a side panel with support hours and quick links.

**Architecture:** Feature-based module under `features/support/` with four focused client components, a constants file for URLs, and a thin server-side page wrapper. No backend — all content is static and i18n-driven.

**Tech Stack:** Next.js 16 App Router, React 19, Shopify Polaris web components (`s-*`), `useTranslations()` i18n hook, TypeScript.

---

## File Map

| File                                                                              | Action | Responsibility                                                |
| --------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `web/app/(dashboard)/support/page.tsx`                                            | Create | Server wrapper: `generateMetadata` + render `<SupportPage />` |
| `web/app/(dashboard)/support/loading.tsx`                                         | Create | Skeleton while page hydrates                                  |
| `web/features/support/index.ts`                                                   | Create | Barrel: re-exports components + constants                     |
| `web/features/support/components/index.ts`                                        | Create | Barrel: re-exports all 4 components                           |
| `web/features/support/components/support-page/support-page.tsx`                   | Create | Root page shell: `<s-page>` + `<TitleBar>` + layout           |
| `web/features/support/components/support-quick-actions/support-quick-actions.tsx` | Create | 3-card resource row (Docs, Videos, Email)                     |
| `web/features/support/components/support-faq/support-faq.tsx`                     | Create | FAQ list with 5 items                                         |
| `web/features/support/components/support-side-panel/support-side-panel.tsx`       | Create | Support hours, quick links, pro tip                           |
| `web/features/support/constants/support.constants.ts`                             | Create | All URLs and structural data                                  |
| `web/messages/en.json`                                                            | Modify | Add `Meta.pages.support` and `Support.*` keys                 |
| `web/messages/fr.json`                                                            | Modify | Add same keys in French                                       |
| `web/shared/components/navigation/navigation.tsx`                                 | Modify | Add `/support` nav link                                       |

---

## Task 1: i18n Keys

**Files:**

- Modify: `web/messages/en.json`
- Modify: `web/messages/fr.json`

- [ ] **Step 1.1: Add keys to `en.json`**

Open `web/messages/en.json`. Add `Meta.pages.support` inside the existing `"Meta" > "pages"` object alongside the other page entries. Add `Support` as a new top-level key. Add `Common.Navigation.support` inside `Common.Navigation`:

```json
// Inside "Meta" > "pages":
"support": {
  "title": "Support - Help & Resources",
  "description": "Browse docs, watch tutorials, or contact the Radius Bundles support team."
}

// New top-level key "Support":
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

// Inside "Common" > "Navigation":
"support": "Support"
```

- [ ] **Step 1.2: Add keys to `fr.json`**

Add the same structure to `web/messages/fr.json` with French translations:

```json
// Inside "Meta" > "pages":
"support": {
  "title": "Assistance - Aide & Ressources",
  "description": "Consultez la documentation, regardez des tutoriels ou contactez l'équipe Radius Bundles."
}

// New top-level key "Support":
"Support": {
  "title": "Assistance",
  "getHelp": "Obtenir de l'aide",
  "docs": "Documentation",
  "docsDescription": "Guides d'installation, références des fonctionnalités & docs d'intégration",
  "videos": "Tutoriels vidéo",
  "videosDescription": "Guides pas à pas pour chaque type de bundle",
  "email": "Support par e-mail",
  "emailDescription": "Nous répondons sous 24 heures les jours ouvrables",
  "faqTitle": "Questions fréquentes",
  "faqSubtitle": "Réponses rapides aux questions courantes",
  "faqCount": "{count} articles",
  "supportHours": "Horaires du support",
  "schedule": "Lun – Ven, 9h – 18h EST",
  "responseTime": "Délai de réponse",
  "responseTimeValue": "Sous 24h",
  "quickLinks": "Liens rapides",
  "linkDocs": "Documentation complète",
  "linkVideos": "Tutoriels YouTube",
  "linkAppStore": "Noter sur l'App Store",
  "linkCommunity": "Forum communautaire",
  "proTipTitle": "Conseil",
  "proTip": "Incluez l'URL de votre boutique et une capture d'écran lors de vos e-mails — cela nous aide à résoudre les problèmes 2× plus vite.",
  "faq1Q": "Comment créer mon premier bundle ?",
  "faq1A": "Allez dans Bundles → Créer un bundle, choisissez un type, ajoutez des produits, définissez une remise et publiez.",
  "faq2Q": "Pourquoi le widget ne s'affiche pas sur ma boutique ?",
  "faq2A": "Activez l'intégration de l'application : Boutique en ligne → Thèmes → Personnaliser → Intégrations d'applications → activez Radius Bundles.",
  "faq3Q": "Les bundles peuvent-ils se combiner avec des codes de réduction ?",
  "faq3A": "Oui — activez Autoriser le cumul des remises dans Paramètres → Général.",
  "faq4Q": "Comment traduire les libellés des bundles ?",
  "faq4A": "Paramètres → Libellés → basculez vers un onglet de langue non principale → cliquez sur Traduction automatique.",
  "faq5Q": "L'application ralentit-elle ma boutique ?",
  "faq5A": "Non — les remises s'exécutent côté serveur via une Shopify Function. Aucun impact sur les performances."
}

// Inside "Common" > "Navigation":
"support": "Assistance"
```

- [ ] **Step 1.3: Commit**

```bash
git add web/messages/en.json web/messages/fr.json
git commit -m "feat(support): add i18n keys for support page"
```

---

## Task 2: Constants

**Files:**

- Create: `web/features/support/constants/support.constants.ts`

- [ ] **Step 2.1: Create the constants file**

```typescript
export const SUPPORT_EMAIL = "support@radiusbundles.com";
export const DOCS_URL = "https://docs.radiusbundles.com";
export const VIDEOS_URL = "https://youtube.com/@radiusbundles";
export const APP_STORE_URL = "https://apps.shopify.com/radius-product-bundles";
export const COMMUNITY_URL = "https://community.radiusbundles.com";
export const FAQ_COUNT = 5;

export const QUICK_LINKS = [
    { key: "linkDocs", url: DOCS_URL, external: true },
    { key: "linkVideos", url: VIDEOS_URL, external: true },
    { key: "linkAppStore", url: APP_STORE_URL, external: true },
    { key: "linkCommunity", url: COMMUNITY_URL, external: true },
] as const;
```

- [ ] **Step 2.2: Commit**

```bash
git add web/features/support/constants/support.constants.ts
git commit -m "feat(support): add support constants (URLs, FAQ count, quick links)"
```

---

## Task 3: `SupportSidePanel`

**Files:**

- Create: `web/features/support/components/support-side-panel/support-side-panel.tsx`

- [ ] **Step 3.1: Create the component**

```typescript
"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { QUICK_LINKS } from "@/features/support/constants/support.constants";

export function SupportSidePanel() {
    const t = useTranslations("Support");

    return (
        <s-stack gap="base">
            {/* Support Hours */}
            <s-section padding="base">
                <s-stack gap="small-300">
                    <s-heading>{t("supportHours")}</s-heading>
                    <s-stack gap="small-200">
                        <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                            <s-text color="subdued">{t("schedule")}</s-text>
                        </s-grid>
                        <s-divider />
                        <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                            <s-text color="subdued">{t("responseTime")}</s-text>
                            <s-badge tone="success">{t("responseTimeValue")}</s-badge>
                        </s-grid>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Quick Links */}
            <s-section padding="base">
                <s-stack gap="small-300">
                    <s-heading>{t("quickLinks")}</s-heading>
                    <s-stack gap="small-200">
                        {QUICK_LINKS.map(({ key, url }) => (
                            <s-link
                                key={key}
                                onClick={() => window.open(url, "_blank")}
                            >
                                {t(key as Parameters<typeof t>[0])}
                            </s-link>
                        ))}
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Pro Tip */}
            <s-banner tone="warning">
                <s-stack gap="small-200">
                    <s-heading>{t("proTipTitle")}</s-heading>
                    <s-text>{t("proTip")}</s-text>
                </s-stack>
            </s-banner>
        </s-stack>
    );
}
```

- [ ] **Step 3.2: Commit**

```bash
git add web/features/support/components/support-side-panel/support-side-panel.tsx
git commit -m "feat(support): add SupportSidePanel component"
```

---

## Task 4: `SupportFaq`

**Files:**

- Create: `web/features/support/components/support-faq/support-faq.tsx`

- [ ] **Step 4.1: Create the component**

```typescript
"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { FAQ_COUNT } from "@/features/support/constants/support.constants";

export function SupportFaq() {
    const t = useTranslations("Support");

    const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
        question: t(`faq${i + 1}Q` as Parameters<typeof t>[0]),
        answer:   t(`faq${i + 1}A` as Parameters<typeof t>[0]),
    }));

    return (
        <s-section padding="none">
            {/* Header */}
            <s-box padding="base" paddingBlockEnd="small">
                <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                    <s-stack gap="small-100">
                        <s-heading>{t("faqTitle")}</s-heading>
                        <s-text color="subdued">{t("faqSubtitle")}</s-text>
                    </s-stack>
                    <s-badge tone="success">
                        {t("faqCount", { count: FAQ_COUNT })}
                    </s-badge>
                </s-grid>
            </s-box>

            {/* FAQ rows */}
            {faqs.map(({ question, answer }, index) => (
                <s-box
                    key={index}
                    padding="base"
                    borderBlockStart="base"
                >
                    <s-grid gridTemplateColumns="1fr auto" alignItems="start" gap="base">
                        <s-stack gap="small-100">
                            <s-text fontWeight="bold">{question}</s-text>
                            <s-text color="subdued">{answer}</s-text>
                        </s-stack>
                        <s-icon type="chevron-right" tone="subdued" />
                    </s-grid>
                </s-box>
            ))}
        </s-section>
    );
}
```

- [ ] **Step 4.2: Commit**

```bash
git add web/features/support/components/support-faq/support-faq.tsx
git commit -m "feat(support): add SupportFaq component"
```

---

## Task 5: `SupportQuickActions`

**Files:**

- Create: `web/features/support/components/support-quick-actions/support-quick-actions.tsx`

- [ ] **Step 5.1: Create the component**

```typescript
"use client";

import React from "react";
import { useTranslations } from "@/lib/i18n/provider";
import {
    DOCS_URL,
    VIDEOS_URL,
    SUPPORT_EMAIL,
} from "@/features/support/constants/support.constants";

const ICON_STYLES: Record<string, React.CSSProperties> = {
    docs:   { background: "linear-gradient(135deg,#ede9fe,#ddd6fe)" },
    videos: { background: "linear-gradient(135deg,#fce7f3,#fbcfe8)" },
    email:  { background: "linear-gradient(135deg,#d1fae5,#a7f3d0)" },
};

export function SupportQuickActions() {
    const t = useTranslations("Support");

    const cards = [
        {
            icon: "📖",
            iconStyle: ICON_STYLES.docs,
            title: t("docs"),
            description: t("docsDescription"),
            label: DOCS_URL.replace("https://", ""),
            onClick: () => window.open(DOCS_URL, "_blank"),
        },
        {
            icon: "▶",
            iconStyle: ICON_STYLES.videos,
            title: t("videos"),
            description: t("videosDescription"),
            label: VIDEOS_URL.replace("https://", ""),
            onClick: () => window.open(VIDEOS_URL, "_blank"),
        },
        {
            icon: "✉",
            iconStyle: ICON_STYLES.email,
            title: t("email"),
            description: t("emailDescription"),
            label: SUPPORT_EMAIL,
            onClick: () => window.open(`mailto:${SUPPORT_EMAIL}`),
        },
    ];

    return (
        <s-section padding="base">
            <s-stack gap="base">
                <s-heading>{t("getHelp")}</s-heading>
                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
                    gap="base"
                >
                    {cards.map((card) => (
                        <s-grid-item key={card.title}>
                            <div className="transition-all hover:-translate-y-[3px]">
                                <s-clickable
                                    border="base"
                                    borderRadius="base"
                                    padding="base"
                                    inlineSize="100%"
                                    accessibilityLabel={card.title}
                                    onClick={card.onClick}
                                >
                                    <s-grid
                                        gridTemplateColumns="auto 1fr"
                                        gap="base"
                                        alignItems="start"
                                    >
                                        <s-box>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 8,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 20,
                                                    ...card.iconStyle,
                                                }}
                                            >
                                                {card.icon}
                                            </div>
                                        </s-box>
                                        <s-box>
                                            <s-heading>{card.title}</s-heading>
                                            <s-paragraph>{card.description}</s-paragraph>
                                            <s-text color="subdued">{card.label}</s-text>
                                        </s-box>
                                    </s-grid>
                                </s-clickable>
                            </div>
                        </s-grid-item>
                    ))}
                </s-grid>
            </s-stack>
        </s-section>
    );
}
```

- [ ] **Step 5.2: Commit**

```bash
git add web/features/support/components/support-quick-actions/support-quick-actions.tsx
git commit -m "feat(support): add SupportQuickActions component"
```

---

## Task 6: `SupportPage`

**Files:**

- Create: `web/features/support/components/support-page/support-page.tsx`

- [ ] **Step 6.1: Create the root page component**

```typescript
"use client";

import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { SupportQuickActions } from "../support-quick-actions/support-quick-actions";
import { SupportFaq } from "../support-faq/support-faq";
import { SupportSidePanel } from "../support-side-panel/support-side-panel";
import {
    DOCS_URL,
    SUPPORT_EMAIL,
} from "@/features/support/constants/support.constants";

export function SupportPage() {
    const t = useTranslations("Support");

    return (
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

                <s-grid
                    gridTemplateColumns="1fr 280px"
                    gap="base"
                    alignItems="start"
                >
                    <s-grid-item>
                        <SupportFaq />
                    </s-grid-item>
                    <s-grid-item>
                        <SupportSidePanel />
                    </s-grid-item>
                </s-grid>
            </s-stack>
        </s-page>
    );
}
```

- [ ] **Step 6.2: Commit**

```bash
git add web/features/support/components/support-page/support-page.tsx
git commit -m "feat(support): add SupportPage root component"
```

---

## Task 7: Barrel Exports

**Files:**

- Create: `web/features/support/components/index.ts`
- Create: `web/features/support/index.ts`

- [ ] **Step 7.1: Create `components/index.ts`**

```typescript
export { SupportPage } from "./support-page/support-page";
export { SupportQuickActions } from "./support-quick-actions/support-quick-actions";
export { SupportFaq } from "./support-faq/support-faq";
export { SupportSidePanel } from "./support-side-panel/support-side-panel";
```

- [ ] **Step 7.2: Create feature `index.ts`**

```typescript
export * from "./components";
export * from "./constants/support.constants";
```

- [ ] **Step 7.3: Commit**

```bash
git add web/features/support/components/index.ts web/features/support/index.ts
git commit -m "feat(support): add barrel exports for support feature"
```

---

## Task 8: Page Route

**Files:**

- Create: `web/app/(dashboard)/support/page.tsx`
- Create: `web/app/(dashboard)/support/loading.tsx`

- [ ] **Step 8.1: Create `page.tsx`**

```typescript
import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { SupportPage } from "@/features/support";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.support");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <SupportPage />;
}
```

- [ ] **Step 8.2: Create `loading.tsx`**

```typescript
"use client";

import { PageSkeleton, PageHeaderSkeleton, SkeletonCard, SkeletonLines } from "@/shared";

export default function SupportPageSkeleton() {
    return (
        <PageSkeleton withPadding={true}>
            <PageHeaderSkeleton heading="Support" />
            <s-grid gridTemplateColumns="repeat(3, 1fr)" gap="base">
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
            </s-grid>
            <s-section padding="base">
                <SkeletonLines lines={8} random={true} />
            </s-section>
        </PageSkeleton>
    );
}
```

- [ ] **Step 8.3: Commit**

```bash
git add web/app/(dashboard)/support/page.tsx web/app/(dashboard)/support/loading.tsx
git commit -m "feat(support): add /support route with page and loading skeleton"
```

---

## Task 9: Navigation Link

**Files:**

- Modify: `web/shared/components/navigation/navigation.tsx`

- [ ] **Step 9.1: Add `/support` link**

In `navigation.tsx`, add a new `<Link>` after the `/pricing` link:

```typescript
<Link href="/support" data-sprogress>
    {t("support")}
</Link>
```

The `t` function already calls `useTranslations("Common.Navigation")` — `t("support")` will resolve to the key added in Task 1.

- [ ] **Step 9.2: Commit**

```bash
git add web/shared/components/navigation/navigation.tsx
git commit -m "feat(support): add Support link to navigation"
```

---

## Task 10: Type Check

- [ ] **Step 10.1: Run TypeScript**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -E "support|Support"
```

Expected: no errors in support files. Fix any type errors before proceeding.

- [ ] **Step 10.2: Fix any errors, commit fixes**

Common issues to watch for:

- `t(key)` with dynamic key strings — cast as `Parameters<typeof t>[0]` if TS complains
- `s-link` missing from JSX type definitions — replace with `<s-button variant="plain">` if so
- `s-badge` `tone` prop values — valid values are `"success"`, `"warning"`, `"critical"`, `"info"`, `"attention"`, `"new"`

```bash
git add -p
git commit -m "fix(support): resolve TypeScript errors in support page"
```

---

## Task 11: Visual Verification

- [ ] **Step 11.1: Start dev server**

```bash
cd /Users/radiustheme/Shopify/radius-product-bundles
bun run dev:app
```

- [ ] **Step 11.2: Navigate to `/support`**

Open the app in the Shopify Partners dashboard and navigate to the Support page. Verify:

- [ ] All three quick-action cards render with correct icons and links
- [ ] FAQ section shows 5 questions with answers
- [ ] Side panel shows support hours, quick links, and pro tip banner
- [ ] TitleBar shows "Email Support" and "View Docs" buttons
- [ ] Navigation menu contains "Support" link
- [ ] Page uses the same visual style as the dashboard

- [ ] **Step 11.3: Final commit if any visual fixes were needed**

```bash
git add -p
git commit -m "fix(support): visual polish after manual verification"
```
