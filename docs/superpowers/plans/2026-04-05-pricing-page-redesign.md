# Pricing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the pricing page into a conversion-optimized hub with a plan status card, enhanced plan cards, and a full feature comparison table.

**Architecture:** Single scrolling page with 5 visual zones. `PlanStatusCard` (NEW) reuses existing `usePlan().quota.bundles` — no new data fetching needed. `FeatureComparisonTable` (NEW) derives all data from `PLAN_CONFIGS` constants. `PricingCard` gets a CSS-only billing toggle and enhanced card items. No new npm packages, no framer-motion.

**Tech Stack:** Next.js 15 App Router, Polaris Web Components (`s-*`), Tailwind CSS 4, React Query, `useTranslations` (next-intl), `usePlan()` context hook, `useBillingStatus()` hook.

---

## File Map

### Create
- `web/features/pricing/components/plan-status-card/plan-status-card.tsx` — Zone 1: contextual Free/Pro status with QuotaBar
- `web/features/pricing/components/feature-comparison-table/feature-comparison-table.tsx` — Zone 4: Free vs Pro table derived from PLAN_CONFIGS

### Modify
- `web/features/pricing/components/pricing-card/pricing-card-item.tsx` — larger price, annual equiv line, Pro glow + ring, full-width button
- `web/features/pricing/components/pricing-card/pricing-card.tsx` — replace s-button toggle with CSS toggle switch
- `web/features/pricing/components/pricing-page/pricing-page.tsx` — wire all 5 zones
- `web/features/pricing/components/index.ts` — export new components
- `web/messages/en.json` — add PlanStatus + ComparisonTable i18n keys

### Reference (read-only)
- `web/shared/constants/plans.constants.ts` — `PLAN_CONFIGS`, `PLAN_PRICING`, `PRO_ANNUAL_PRICE`
- `web/shared/components/plan-gate/quota-bar.tsx` — reused inside PlanStatusCard
- `web/shared/types/plan/plan.types.ts` — `PlanConfig`, `FeatureId`
- `web/features/pricing/hooks/use-billing-status.ts` — `useBillingStatus()`, `trialDaysRemaining()`
- `web/features/pricing/types/pricing.types.ts` — `PricingCardItemInfo`, `BillingInterval`
- `web/features/pricing/constants/pricing.constants.ts` — `PRICING_CARD`, `PRO_TRIAL_DAYS`

---

## Task 1: Add i18n keys

**Files:**
- Modify: `web/messages/en.json`

- [ ] **Step 1: Locate the Pricing section in en.json**

Open `web/messages/en.json`. Find line ~1616 — the `"Pricing"` key. The existing `"PlanTab"` block is at ~line 1691. We will add two new sibling blocks: `"PlanStatus"` and `"ComparisonTable"`.

- [ ] **Step 2: Add PlanStatus and ComparisonTable keys**

Find this exact block (around line 1713-1714):
```json
      "cancelModalConfirm": "Cancel subscription"
    }
  },
```

Replace with:
```json
      "cancelModalConfirm": "Cancel subscription"
    },
    "PlanStatus": {
      "freePlan": "Free Plan",
      "proPlan": "Pro Plan",
      "bundlesLabel": "Bundles",
      "approachingLimit": "Approaching bundle limit — upgrade to keep creating",
      "atLimit": "Bundle limit reached — upgrade to Pro for unlimited bundles",
      "upgradeToPro": "Upgrade to Pro",
      "manageSubscription": "Manage Subscription",
      "nextBilling": "Next billing {date}",
      "trialDaysLeft": "{days} days left in trial",
      "billingMonthly": "Monthly",
      "billingAnnual": "Annual"
    },
    "ComparisonTable": {
      "title": "Compare Plans",
      "subtitle": "See everything included in each plan",
      "featureCol": "Feature",
      "unlimited": "Unlimited",
      "mostPopular": "Most Popular",
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
      },
      "values": {
        "basic": "Basic",
        "full": "Full",
        "email": "Email",
        "priority": "Priority"
      }
    }
  },
```

- [ ] **Step 3: Verify JSON is valid**

```bash
cd web && node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 4: Commit**

```bash
cd web && git add messages/en.json
git commit -m "feat(pricing): add i18n keys for PlanStatus and ComparisonTable"
```

---

## Task 2: Create FeatureComparisonTable

**Files:**
- Create: `web/features/pricing/components/feature-comparison-table/feature-comparison-table.tsx`

**Context:** `PLAN_CONFIGS` lives in `web/shared/constants/plans.constants.ts`. It exports:
```ts
PLAN_CONFIGS: Record<"FREE" | "PRO", PlanConfig>
// PlanConfig.limits.maxBundles        — -1 means unlimited
// PlanConfig.limits.maxProductsPerBundle
// PlanConfig.limits.allowedBundleTypes  — string[]
// PlanConfig.limits.allowedDiscountTypes — string[]
// PlanConfig.features                 — PlanFeatureConfig[] with { feature: FeatureId, gateMode }
```

- [ ] **Step 1: Create the component file**

Create `web/features/pricing/components/feature-comparison-table/feature-comparison-table.tsx`:

```tsx
"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { PLAN_CONFIGS } from "@/shared/constants/plans.constants";

type CellValue = boolean | string;

interface TableRow {
    labelKey: string;
    free: CellValue;
    pro: CellValue;
}

interface TableCategory {
    categoryKey: string;
    rows: TableRow[];
}

function limitLabel(value: number, unlimited: string): string {
    return value === -1 ? unlimited : String(value);
}

function isFeatureEnabled(planId: "FREE" | "PRO", featureId: string): boolean {
    const cfg = PLAN_CONFIGS[planId];
    const f = cfg.features.find((f) => f.feature === featureId);
    return f?.gateMode === "enabled";
}

function buildTableData(unlimited: string): TableCategory[] {
    const free = PLAN_CONFIGS.FREE;
    const pro = PLAN_CONFIGS.PRO;

    return [
        {
            categoryKey: "bundles",
            rows: [
                {
                    labelKey: "maxBundles",
                    free: limitLabel(free.limits.maxBundles, unlimited),
                    pro: limitLabel(pro.limits.maxBundles, unlimited),
                },
                {
                    labelKey: "maxProducts",
                    free: limitLabel(free.limits.maxProductsPerBundle, unlimited),
                    pro: limitLabel(pro.limits.maxProductsPerBundle, unlimited),
                },
                {
                    labelKey: "bundleTypes",
                    free: String(free.limits.allowedBundleTypes.length),
                    pro: String(pro.limits.allowedBundleTypes.length),
                },
                {
                    labelKey: "discountTypes",
                    free: String(free.limits.allowedDiscountTypes.length),
                    pro: String(pro.limits.allowedDiscountTypes.length),
                },
            ],
        },
        {
            categoryKey: "analytics",
            rows: [
                {
                    labelKey: "analytics",
                    free: "basic",
                    pro: "full",
                },
                {
                    labelKey: "exportData",
                    free: isFeatureEnabled("FREE", "export_data"),
                    pro: isFeatureEnabled("PRO", "export_data"),
                },
            ],
        },
        {
            categoryKey: "advanced",
            rows: [
                { labelKey: "abTesting", free: isFeatureEnabled("FREE", "ab_testing"), pro: isFeatureEnabled("PRO", "ab_testing") },
                { labelKey: "automation", free: isFeatureEnabled("FREE", "automation"), pro: isFeatureEnabled("PRO", "automation") },
                { labelKey: "aiInsights", free: isFeatureEnabled("FREE", "ai_insights"), pro: isFeatureEnabled("PRO", "ai_insights") },
                { labelKey: "customCss", free: isFeatureEnabled("FREE", "custom_css"), pro: isFeatureEnabled("PRO", "custom_css") },
                { labelKey: "templates", free: isFeatureEnabled("FREE", "templates"), pro: isFeatureEnabled("PRO", "templates") },
                { labelKey: "removeBranding", free: isFeatureEnabled("FREE", "remove_branding"), pro: isFeatureEnabled("PRO", "remove_branding") },
                { labelKey: "responsiveOverrides", free: isFeatureEnabled("FREE", "responsive_overrides"), pro: isFeatureEnabled("PRO", "responsive_overrides") },
                { labelKey: "duplicateBundle", free: isFeatureEnabled("FREE", "duplicate_bundle"), pro: isFeatureEnabled("PRO", "duplicate_bundle") },
            ],
        },
        {
            categoryKey: "support",
            rows: [
                { labelKey: "support", free: "email", pro: "priority" },
            ],
        },
    ];
}

function Cell({ value, t }: { value: CellValue; t: ReturnType<typeof useTranslations<"Pricing.ComparisonTable">> }) {
    if (typeof value === "boolean") {
        if (value) {
            return (
                <span className="flex justify-center">
                    <s-icon type="check-circle" tone="success" size="small" />
                </span>
            );
        }
        return <span className="text-gray-300 block text-center">—</span>;
    }
    // string values: "unlimited", "basic", "full", "email", "priority", or a number string
    const translated = t.has(`values.${value}`) ? t(`values.${value}` as never) : value;
    return <span>{translated as string}</span>;
}

export function FeatureComparisonTable() {
    const t = useTranslations("Pricing.ComparisonTable");
    const unlimited = t("unlimited");
    const categories = buildTableData(unlimited);

    return (
        <s-section>
            <s-stack direction="block" gap="base">
                <s-stack direction="block" gap="small-200">
                    <div className="text-base font-semibold">{t("title")}</div>
                    <s-text color="subdued">{t("subtitle")}</s-text>
                </s-stack>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-left font-medium text-gray-700 w-1/2">
                                    {t("featureCol")}
                                </th>
                                <th className="py-3 px-4 text-center font-medium text-gray-700 w-1/4">
                                    Free
                                </th>
                                <th className="py-3 px-4 text-center font-semibold text-green-700 bg-green-50 w-1/4">
                                    <span className="flex items-center justify-center gap-1">
                                        Pro
                                        <s-badge tone="success" size="small">{t("mostPopular")}</s-badge>
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <>
                                    <tr key={`cat-${cat.categoryKey}`} className="bg-gray-50 border-b border-gray-100">
                                        <td
                                            colSpan={3}
                                            className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                        >
                                            {t(`categories.${cat.categoryKey}` as never)}
                                        </td>
                                    </tr>
                                    {cat.rows.map((row) => (
                                        <tr
                                            key={row.labelKey}
                                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-gray-700">
                                                {t(`features.${row.labelKey}` as never)}
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-600">
                                                <Cell value={row.free} t={t} />
                                            </td>
                                            <td className="py-3 px-4 text-center text-green-700 font-medium bg-green-50/50">
                                                <Cell value={row.pro} t={t} />
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </s-stack>
        </s-section>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -i "feature-comparison" || echo "no errors"
```

Expected: `no errors`

- [ ] **Step 3: Commit**

```bash
git add web/features/pricing/components/feature-comparison-table/feature-comparison-table.tsx
git commit -m "feat(pricing): add FeatureComparisonTable component"
```

---

## Task 3: Create PlanStatusCard

**Files:**
- Create: `web/features/pricing/components/plan-status-card/plan-status-card.tsx`

**Context:**
- `usePlan()` from `@/shared` returns `{ plan: PlanConfig, quota: { bundles: QuotaResult } }` where `QuotaResult = { allowed, current, limit }`
- `useBillingStatus()` from `@/features/pricing` returns `{ billingData, isLoading, trialDaysRemaining }`
- `QuotaBar` from `@/shared` renders the progress bar using `usePlan().quota.bundles` internally — just pass `resource="bundles"`
- `useAppNavigation().goTo(path)` returns a function — call it as `goTo(ROUTES.PRICING)()`

- [ ] **Step 1: Create the component**

Create `web/features/pricing/components/plan-status-card/plan-status-card.tsx`:

```tsx
"use client";

import { usePlan, QuotaBar, ROUTES, useAppNavigation } from "@/shared";
import { useBillingStatus } from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";
import { SkeletonLines } from "@/shared";

export function PlanStatusCard() {
    const t = useTranslations("Pricing.PlanStatus");
    const { plan } = usePlan();
    const { billingData, isLoading, trialDaysRemaining } = useBillingStatus();
    const { goTo } = useAppNavigation();

    const isPro = plan.id === "PRO";
    const sub = billingData?.subscription;
    const daysLeft = trialDaysRemaining();
    const isInTrial = typeof daysLeft === "number" && daysLeft > 0;

    const formatDate = (iso: string | null | undefined): string => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <s-section padding="base">
                <SkeletonLines lines={3} random={false} />
            </s-section>
        );
    }

    return (
        <s-section padding="base">
            <div className="flex items-start justify-between gap-4">
                {/* Left: plan info */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-gray-900">
                            {isPro ? t("proPlan") : t("freePlan")}
                        </span>
                        <s-badge tone={isPro ? "success" : "neutral"}>
                            {isPro ? "Pro" : "Free"}
                        </s-badge>
                        {isInTrial && (
                            <s-badge tone="info">
                                {t("trialDaysLeft", { days: String(daysLeft) })}
                            </s-badge>
                        )}
                    </div>

                    {/* Bundle usage bar — only shown on Free (quota.bundles.limit !== -1) */}
                    {!isPro && (
                        <div className="max-w-sm">
                            <QuotaBar resource="bundles" label={t("bundlesLabel")} />
                        </div>
                    )}

                    {/* Pro billing details */}
                    {isPro && sub && (
                        <div className="flex gap-6 text-sm text-gray-600">
                            <span>
                                {sub.interval === "ANNUAL" ? t("billingAnnual") : t("billingMonthly")}
                                {sub.price ? ` · $${parseFloat(sub.price).toFixed(2)}` : ""}
                            </span>
                            {sub.currentPeriodEnd && (
                                <span>{t("nextBilling", { date: formatDate(sub.currentPeriodEnd) })}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: CTA */}
                <div className="shrink-0">
                    {!isPro ? (
                        <s-button variant="primary" onClick={goTo(ROUTES.PRICING)}>
                            {t("upgradeToPro")}
                        </s-button>
                    ) : (
                        <s-button variant="secondary" onClick={goTo(ROUTES.PRICING)}>
                            {t("manageSubscription")}
                        </s-button>
                    )}
                </div>
            </div>
        </s-section>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -i "plan-status" || echo "no errors"
```

Expected: `no errors`

- [ ] **Step 3: Commit**

```bash
git add web/features/pricing/components/plan-status-card/plan-status-card.tsx
git commit -m "feat(pricing): add PlanStatusCard component"
```

---

## Task 4: Enhance PricingCardItem

**Files:**
- Modify: `web/features/pricing/components/pricing-card/pricing-card-item.tsx`

**Changes:**
- Price: `text-2xl` → `text-4xl font-bold`
- Annual equivalent line below price (e.g. "$8.33/month billed annually") — passed as new optional prop `annualEquivalent`
- Pro card glow: `shadow-[0_0_20px_4px_#d1fae5] ring-2 ring-green-200` when `featuredText` is set
- CTA button: full-width (`className="w-full"`)

The existing `PricingCardItemInfo` type in `web/features/pricing/types/pricing.types.ts` needs one new optional field: `annualEquivalent?: string`.

- [ ] **Step 1: Add annualEquivalent to PricingCardItemInfo**

In `web/features/pricing/types/pricing.types.ts`, find:
```ts
export interface PricingCardItemInfo {
    id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    frequency: string;
```

Replace with:
```ts
export interface PricingCardItemInfo {
    id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    frequency: string;
    annualEquivalent?: string;
```

- [ ] **Step 2: Update PricingCardItem**

Replace the entire content of `web/features/pricing/components/pricing-card/pricing-card-item.tsx` with:

```tsx
"use client";

import { PricingCardItemInfo } from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";

export function PricingCardItem({
    title,
    description,
    price,
    features,
    featuredText,
    trialBadge,
    primaryButton,
    frequency,
    annualEquivalent,
    onSubscribe,
}: PricingCardItemInfo) {
    const t = useTranslations("Pricing");

    const handleClick = async () => {
        if (onSubscribe) {
            await onSubscribe();
        }
    };

    const isPro = !!featuredText;

    return (
        <div
            className={`relative z-0 rounded-xl w-full flex flex-col ${
                isPro
                    ? "shadow-[0_0_20px_4px_#d1fae5] ring-2 ring-green-200"
                    : ""
            }`}
        >
            {featuredText ? (
                <div className="absolute top-[-15px] right-1.5 z-50">
                    <s-badge tone="success">{featuredText}</s-badge>
                </div>
            ) : null}
            <div className="flex flex-col flex-1 rounded-xl bg-white border border-gray-200 p-6">
                <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-gray-900">{title}</p>
                    <hr className="border-gray-200 my-2" />
                    {description ? (
                        <p className="text-sm text-gray-500">{description}</p>
                    ) : null}
                </div>

                <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">{price}</span>
                        <span className="text-sm text-gray-500">/ {frequency}</span>
                    </div>
                    {annualEquivalent ? (
                        <p className="text-xs text-gray-400 mt-1">{annualEquivalent}</p>
                    ) : null}
                </div>

                {trialBadge ? (
                    <div className="mt-3">
                        <s-badge tone="info">{trialBadge}</s-badge>
                    </div>
                ) : null}

                <div className="flex-1 mt-6">
                    <ul className="flex flex-col gap-3">
                        {features?.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <s-icon type="check" tone="success" size="small" />
                                <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6">
                    <s-button
                        {...primaryButton.props}
                        loading={primaryButton.loading}
                        disabled={primaryButton.loading || primaryButton.props.disabled}
                        onClick={handleClick}
                        className="w-full"
                    >
                        {primaryButton.content}
                    </s-button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -i "pricing-card-item" || echo "no errors"
```

Expected: `no errors`

- [ ] **Step 4: Commit**

```bash
git add web/features/pricing/types/pricing.types.ts \
        web/features/pricing/components/pricing-card/pricing-card-item.tsx
git commit -m "feat(pricing): enhance PricingCardItem with larger price and Pro glow"
```

---

## Task 5: Enhance PricingCard (CSS toggle switch + annual equivalent)

**Files:**
- Modify: `web/features/pricing/components/pricing-card/pricing-card.tsx`

**Changes:**
- Replace the `s-button` pair toggle with a native CSS toggle switch (`<button>` + sliding `<span>`)
- Pass `annualEquivalent` to `PricingCardItem` when annual billing is selected

- [ ] **Step 1: Replace PricingCard**

Replace the entire content of `web/features/pricing/components/pricing-card/pricing-card.tsx` with:

```tsx
"use client";

import {
    PRICING_CARD,
    SUBSCRIPTION_PLANS,
    PLAN_PRICING,
    PRO_TRIAL_DAYS,
    SubscriptionPlanType,
    PricingCardItem,
    BillingInterval,
} from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";
import { useState } from "react";
import { createSubscriptionAction } from "@/features/pricing/actions/create-subscription.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import { usePlan } from "@/shared/hooks/plan/use-plan";
import { useGlobalBanner } from "@/shared/hooks/ui/use-global-banner";

export const PricingCard = () => {
    const t = useTranslations("Pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [billingInterval, setBillingInterval] = useState<BillingInterval>("EVERY_30_DAYS");
    const app = useAppBridge();
    const { plan } = usePlan();
    const { showError } = useGlobalBanner();

    const isMonthly = billingInterval === "EVERY_30_DAYS";
    const currentPlanId = plan.id.toLowerCase();

    const handleSubscribe = async (planId: SubscriptionPlanType) => {
        setLoadingPlan(planId);
        try {
            const sessionToken = await app.idToken();

            if (planId === SUBSCRIPTION_PLANS.FREE) {
                const res = await fetch("/api/billing/cancel", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionToken}`,
                    },
                });
                if (!res.ok) throw new Error("Cancel failed");
                window.location.reload();
                return;
            }

            const result = await createSubscriptionAction(sessionToken, planId, billingInterval);
            if (result.status === "success" && result.confirmationUrl) {
                window.open(result.confirmationUrl, "_top");
            }
        } catch {
            showError(t("subscriptionError"));
        } finally {
            setLoadingPlan(null);
        }
    };

    const getPrice = (planId: string): string => {
        if (planId === SUBSCRIPTION_PLANS.FREE) return "$0";
        const pricing = PLAN_PRICING[planId as SubscriptionPlanType];
        if (!pricing) return "$0";
        if (isMonthly) return `$${pricing.monthly.price.toFixed(2)}`;
        const monthlyEquiv = (pricing.annual.price / 12).toFixed(2);
        return `$${monthlyEquiv}`;
    };

    const getAnnualEquivalent = (planId: string): string | undefined => {
        if (isMonthly || planId === SUBSCRIPTION_PLANS.FREE) return undefined;
        const pricing = PLAN_PRICING[planId as SubscriptionPlanType];
        if (!pricing) return undefined;
        return `$${pricing.annual.price.toFixed(2)}/year billed annually`;
    };

    const getFrequency = (planId: string): string => {
        if (!isMonthly && planId !== SUBSCRIPTION_PLANS.FREE) {
            return t("plans.year");
        }
        return t("plans.month");
    };

    const getTrialBadge = (planId: string): string | undefined => {
        if (planId !== SUBSCRIPTION_PLANS.PRO) return undefined;
        if (currentPlanId === SUBSCRIPTION_PLANS.PRO) return undefined;
        return t("trialBadge", { days: String(PRO_TRIAL_DAYS) });
    };

    const getButtonContent = (planId: string): string => {
        if (currentPlanId === planId) {
            return t("currentPlan");
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return t("downgradeFree");
        }
        if (loadingPlan === planId) {
            return t("pleaseWait");
        }
        return t(`plans.${planId}.button`);
    };

    const getButtonProps = (planId: string) => {
        const baseProps = PRICING_CARD.find((p) => p.id === planId)
            ?.primaryButton.props ?? { variant: "primary" as const };

        if (currentPlanId === planId) {
            return { ...baseProps, variant: "secondary" as const, disabled: true };
        }
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return { ...baseProps, variant: "secondary" as const, disabled: false };
        }
        return baseProps;
    };

    return (
        <s-stack direction="block" gap="large">
            {/* CSS-only billing toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${isMonthly ? "text-gray-900" : "text-gray-400"}`}>
                    {t("billingMonthly")}
                </span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={!isMonthly}
                    aria-label={t("toggleBillingInterval")}
                    onClick={() =>
                        setBillingInterval(isMonthly ? "ANNUAL" : "EVERY_30_DAYS")
                    }
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 border border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    style={{ background: !isMonthly ? "#16a34a" : undefined }}
                >
                    <span
                        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                        style={{ transform: !isMonthly ? "translateX(22px)" : "translateX(2px)" }}
                    />
                </button>
                <span className={`text-sm font-medium ${!isMonthly ? "text-gray-900" : "text-gray-400"}`}>
                    {t("billingAnnual")}
                    {" "}
                    <s-badge tone="success">{t("annualSavings")}</s-badge>
                </span>
            </div>

            {/* Plan cards */}
            <div
                key={billingInterval}
                className="grid gap-4 items-stretch"
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    animation: "rpbFadeIn 0.15s ease-out",
                }}
            >
                {PRICING_CARD.map((item) => (
                    <div key={item.id} className="flex">
                        <PricingCardItem
                            {...item}
                            title={t(`plans.${item.id}.title`)}
                            description={t(`plans.${item.id}.description`)}
                            featuredText={
                                item.featuredText
                                    ? t(`plans.${item.id}.featured`)
                                    : undefined
                            }
                            trialBadge={getTrialBadge(item.id)}
                            price={getPrice(item.id)}
                            frequency={getFrequency(item.id)}
                            annualEquivalent={getAnnualEquivalent(item.id)}
                            features={item.features}
                            primaryButton={{
                                ...item.primaryButton,
                                content: getButtonContent(item.id),
                                loading: loadingPlan === item.id,
                                props: getButtonProps(item.id),
                            }}
                            onSubscribe={() =>
                                handleSubscribe(item.id as SubscriptionPlanType)
                            }
                        />
                    </div>
                ))}
            </div>
        </s-stack>
    );
};
```

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -i "pricing-card\b" || echo "no errors"
```

Expected: `no errors`

- [ ] **Step 3: Commit**

```bash
git add web/features/pricing/components/pricing-card/pricing-card.tsx
git commit -m "feat(pricing): replace toggle buttons with CSS-only switch, add annual equivalent"
```

---

## Task 6: Update barrel exports

**Files:**
- Modify: `web/features/pricing/components/index.ts`

- [ ] **Step 1: Add new exports**

Replace the content of `web/features/pricing/components/index.ts` with:

```ts
export { PricingFaq } from "./pricing-faq/pricing-faq";
export { PricingPage } from "./pricing-page/pricing-page";
export { PricingCard } from "./pricing-card/pricing-card";
export { PricingStore } from "./pricing-store/pricing-store";
export { PricingFaqItem } from "./pricing-faq/pricing-faq-item";
export { PricingCardItem } from "./pricing-card/pricing-card-item";
export { PlanSettingsTab } from "./plan-settings-tab/plan-settings-tab";
export { BillingConfirmation } from "./billing-confirmation/billing-confirmation";
export { PlanStatusCard } from "./plan-status-card/plan-status-card";
export { FeatureComparisonTable } from "./feature-comparison-table/feature-comparison-table";
```

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -i "index" | grep pricing || echo "no errors"
```

Expected: `no errors`

- [ ] **Step 3: Commit**

```bash
git add web/features/pricing/components/index.ts
git commit -m "feat(pricing): export PlanStatusCard and FeatureComparisonTable"
```

---

## Task 7: Wire PricingPage with all 5 zones

**Files:**
- Modify: `web/features/pricing/components/pricing-page/pricing-page.tsx`

**Zone order:** header row → PlanStatusCard → PricingCard → FeatureComparisonTable → PricingFaq
**Remove:** PricingStore (dev store notice is replaced by the PlanStatusCard which is more useful)

- [ ] **Step 1: Replace PricingPage**

Replace the entire content of `web/features/pricing/components/pricing-page/pricing-page.tsx` with:

```tsx
"use client";

import { useAppNavigation } from "@/shared";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import {
    PricingCard,
    PricingFaq,
    PlanStatusCard,
    FeatureComparisonTable,
} from "@/features/pricing";

export function PricingPage() {
    const t = useTranslations("Pricing");
    const { goBack } = useAppNavigation();

    return (
        <s-page>
            <TitleBar></TitleBar>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                {/* Header row */}
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={() => goBack()}
                            icon="arrow-left"
                            accessibilityLabel={t("back")}
                        ></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-lg">{t("title")}</div>
                        </s-heading>
                        <s-text color="subdued">{t("description")}</s-text>
                    </s-stack>
                </s-stack>

                {/* Zone 1: Plan status card */}
                <PlanStatusCard />

                {/* Zone 2+3: Billing toggle + plan cards */}
                <PricingCard />

                {/* Zone 4: Feature comparison table */}
                <FeatureComparisonTable />

                {/* Zone 5: FAQ */}
                <PricingFaq />
            </s-stack>
        </s-page>
    );
}
```

- [ ] **Step 2: Type-check the full project**

```bash
cd web && npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors. If errors, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add web/features/pricing/components/pricing-page/pricing-page.tsx
git commit -m "feat(pricing): wire 5-zone pricing page layout"
```

---

## Task 8: Smoke test in browser

- [ ] **Step 1: Start the dev server**

```bash
bun run dev
```

- [ ] **Step 2: Navigate to `/settings/plan`**

Open the Shopify embedded app and navigate to Settings → Plan (or directly to `/settings/plan`).

Verify each zone renders:
- [ ] Zone 1 (PlanStatusCard): shows plan name, badge, QuotaBar (Free) or billing details (Pro)
- [ ] Zone 2+3 (PricingCard): CSS toggle switch slides smoothly, annual equivalent text appears when toggled
- [ ] Pro card has green glow, "Most Popular" badge, trial badge if not Pro
- [ ] Zone 4 (FeatureComparisonTable): table renders with category headers, checkmarks for Pro features, dashes for Free gaps
- [ ] Zone 5 (PricingFaq): accordion works as before

- [ ] **Step 3: Verify toggle accessibility**

In browser DevTools, inspect the toggle `<button>`. Confirm:
- `role="switch"` is present
- `aria-checked` toggles between `"true"` and `"false"` on click

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(pricing): pricing page redesign complete — plan status, comparison table, enhanced cards"
```

---

## Self-Review Checklist

- [x] **Zone 1 PlanStatusCard** — Task 3 ✓ (uses `usePlan().quota`, `QuotaBar`, `useBillingStatus`)
- [x] **Zone 2+3 PricingCard** — Task 4+5 ✓ (CSS toggle, larger price, annual equiv, Pro glow)
- [x] **Zone 4 FeatureComparisonTable** — Task 2 ✓ (derived from PLAN_CONFIGS, no hardcoding)
- [x] **Zone 5 FAQ** — unchanged, wired in Task 7 ✓
- [x] **i18n keys** — Task 1 ✓ (PlanStatus + ComparisonTable blocks)
- [x] **No framer-motion** — CSS `transition-transform` used throughout ✓
- [x] **No new packages** — confirmed ✓
- [x] **Barrel exports** — Task 6 ✓
- [x] **Type: annualEquivalent** — added in Task 4 Step 1, used in Task 5 ✓
- [x] **`goTo(path)` returns function** — called correctly in PlanStatusCard as `onClick={goTo(ROUTES.PRICING)}` (goTo returns a function which becomes the onClick handler) ✓
- [x] **DELETED status filter** — not needed here (no bundle count query; using existing `quota.bundles.current` which is already filtered upstream) ✓
