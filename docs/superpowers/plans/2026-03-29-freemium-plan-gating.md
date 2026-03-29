# Freemium Plan Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tier-agnostic plan gating system that hides/locks features based on the shop's plan, with no billing integration (free-only launch).

**Architecture:** Single config file (`plans.ts`) defines plan tiers with feature flags and quota limits. A plan resolution service reads `Shop.plan` from DB (defaults to `'FREE'`), merges with `AppSettings` overrides. Server actions enforce gates (security boundary), React context + `<PlanGate>` component handles UI gating (UX only). Three gate modes: `enabled`, `lock-overlay`, `hidden`.

**Tech Stack:** React 19, Next.js 16 (App Router), TypeScript, Prisma 7, Shopify Polaris Web Components, Zustand, React Query

**Spec:** `docs/superpowers/specs/2026-03-29-freemium-plan-gating-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `web/shared/types/plan/plan.types.ts` | All plan-related type definitions |
| `web/shared/types/plan/index.ts` | Barrel export for plan types |
| `web/shared/constants/plans.constants.ts` | Plan configs (single source of truth) |
| `web/shared/services/plan.service.ts` | Plan resolution, feature checks, quota checks |
| `web/shared/actions/plan.actions.ts` | Server action to fetch plan data for client |
| `web/shared/hooks/plan/use-plan.ts` | `usePlan()` hook consuming PlanProvider context |
| `web/shared/hooks/plan/index.ts` | Barrel export for plan hooks |
| `web/shared/components/plan-gate/plan-provider.tsx` | React context provider |
| `web/shared/components/plan-gate/plan-gate.tsx` | `<PlanGate>` wrapper component |
| `web/shared/components/plan-gate/lock-overlay.tsx` | Lock overlay UI component |
| `web/shared/components/plan-gate/quota-bar.tsx` | Quota usage indicator |
| `web/shared/components/plan-gate/index.ts` | Barrel export for plan-gate components |

### Modified Files

| File | Change |
|------|--------|
| `web/shared/types/index.ts` | Add plan types re-export |
| `web/shared/constants/index.ts` | Add plans constants re-export |
| `web/shared/hooks/index.ts` | Add plan hooks re-export |
| `web/shared/actions/index.ts` | Add plan actions re-export |
| `web/shared/components/index.ts` | Add plan-gate re-export |
| `web/shared/components/providers/providers.tsx` | Wrap with `PlanProvider` |
| `web/shared/repositories/shop.queries.ts` | Add `getShopPlan()` query |
| `web/features/bundles/services/bundle-security.service.ts` | Wire `canCreateBundle()` to plan-aware limits |
| `web/shared/components/navigation/navigation.tsx` | Gate nav items by plan feature |

---

## Task 1: Plan Type Definitions

**Files:**
- Create: `web/shared/types/plan/plan.types.ts`
- Create: `web/shared/types/plan/index.ts`
- Modify: `web/shared/types/index.ts` (if it exists as a root barrel)

- [ ] **Step 1: Create plan type definitions**

Create `web/shared/types/plan/plan.types.ts`:

```typescript
import type { BundleType } from "@/features/bundles";

export type PlanId = "FREE" | (string & {});

export type GateMode = "enabled" | "lock-overlay" | "hidden";

export type FeatureId =
    | "analytics_full"
    | "ab_testing"
    | "automation"
    | "ai_insights"
    | "custom_css"
    | "responsive_overrides"
    | "templates"
    | "export_data"
    | "remove_branding";

export interface PlanFeatureConfig {
    feature: FeatureId;
    gateMode: GateMode;
}

export interface PlanLimits {
    maxBundles: number;
    maxProductsPerBundle: number;
    allowedBundleTypes: BundleType[];
}

export interface PlanConfig {
    id: PlanId;
    name: string;
    limits: PlanLimits;
    features: PlanFeatureConfig[];
}

export interface QuotaResult {
    allowed: boolean;
    current: number;
    limit: number;
}

export interface PlanGateResult {
    allowed: boolean;
    gated: boolean;
    feature: FeatureId | string;
    gateMode: GateMode;
    message: string;
}

export interface PlanContextValue {
    plan: PlanConfig;
    canUse: (feature: FeatureId) => boolean;
    getGateMode: (feature: FeatureId) => GateMode;
    isWithinQuota: (resource: "bundles" | "products") => boolean;
    quota: {
        bundles: QuotaResult;
        products: QuotaResult;
    };
}

export interface ClientPlanData {
    planId: PlanId;
    planName: string;
    limits: PlanLimits;
    features: PlanFeatureConfig[];
    quota: {
        bundles: QuotaResult;
        products: QuotaResult;
    };
}
```

- [ ] **Step 2: Create barrel export**

Create `web/shared/types/plan/index.ts`:

```typescript
export * from "./plan.types";
```

- [ ] **Step 3: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No errors from plan type files. (Other pre-existing errors are fine.)

- [ ] **Step 4: Commit**

```bash
git add web/shared/types/plan/
git commit -m "feat: add plan gating type definitions"
```

---

## Task 2: Plan Constants Config

**Files:**
- Create: `web/shared/constants/plans.constants.ts`
- Modify: `web/shared/constants/index.ts`

- [ ] **Step 1: Create plan constants**

Create `web/shared/constants/plans.constants.ts`:

```typescript
import type { PlanConfig, PlanId } from "@/shared/types/plan";

export const DEFAULT_PLAN_ID: PlanId = "FREE";

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
    FREE: {
        id: "FREE",
        name: "Free",
        limits: {
            maxBundles: 5,
            maxProductsPerBundle: 10,
            allowedBundleTypes: ["FIXED_BUNDLE"],
        },
        features: [
            { feature: "analytics_full", gateMode: "hidden" },
            { feature: "ab_testing", gateMode: "hidden" },
            { feature: "automation", gateMode: "hidden" },
            { feature: "ai_insights", gateMode: "hidden" },
            { feature: "custom_css", gateMode: "hidden" },
            { feature: "responsive_overrides", gateMode: "hidden" },
            { feature: "templates", gateMode: "hidden" },
            { feature: "export_data", gateMode: "hidden" },
            { feature: "remove_branding", gateMode: "hidden" },
        ],
    },
};
```

Note: Additional plans (STARTER, PREMIUM, etc.) can be added to this record later. The system is tier-agnostic — any string key works as a PlanId.

- [ ] **Step 2: Add to barrel export**

In `web/shared/constants/index.ts`, add at the end:

```typescript
export * from "./plans.constants";
```

- [ ] **Step 3: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add web/shared/constants/plans.constants.ts web/shared/constants/index.ts
git commit -m "feat: add tier-agnostic plan config constants"
```

---

## Task 3: Shop Plan Query

**Files:**
- Modify: `web/shared/repositories/shop.queries.ts`

- [ ] **Step 1: Add `getShopPlan()` function**

Add at the end of `web/shared/repositories/shop.queries.ts` (after line 105):

```typescript
export async function getShopPlan(domain: string) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { plan: true },
    });
    return shop?.plan ?? null;
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add web/shared/repositories/shop.queries.ts
git commit -m "feat: add getShopPlan repository query"
```

---

## Task 4: Plan Resolution Service

**Files:**
- Create: `web/shared/services/plan.service.ts`

This is the core service that resolves a shop's plan, checks features, and calculates quotas.

- [ ] **Step 1: Create the plan service**

Create `web/shared/services/plan.service.ts`:

```typescript
import { DEFAULT_PLAN_ID, PLAN_CONFIGS } from "@/shared/constants";
import type {
    FeatureId,
    GateMode,
    PlanConfig,
    PlanGateResult,
    PlanId,
    PlanLimits,
    QuotaResult,
} from "@/shared/types/plan";
import { getShopPlan } from "@/shared/repositories";
import { getShop } from "@/shared/repositories";
import { countBundlesByShop } from "@/features/bundles/repositories";

export function getPlanConfig(planId: PlanId): PlanConfig {
    const config = PLAN_CONFIGS[planId];
    if (!config) {
        console.warn(`[Plan] Unknown plan "${planId}", falling back to FREE`);
        return PLAN_CONFIGS[DEFAULT_PLAN_ID];
    }
    return config;
}

export async function resolveShopPlan(domain: string): Promise<PlanConfig> {
    const planId = (await getShopPlan(domain)) ?? DEFAULT_PLAN_ID;
    return getPlanConfig(planId);
}

export async function getEffectiveLimits(
    domain: string,
): Promise<PlanLimits> {
    const plan = await resolveShopPlan(domain);
    const shop = await getShop(domain);
    const appSettings = shop?.appSettings;

    return {
        maxBundles:
            appSettings?.maxBundlesPerShop ?? plan.limits.maxBundles,
        maxProductsPerBundle:
            appSettings?.maxBundleProducts ?? plan.limits.maxProductsPerBundle,
        allowedBundleTypes: plan.limits.allowedBundleTypes,
    };
}

export function getFeatureGateMode(
    planConfig: PlanConfig,
    feature: FeatureId,
): GateMode {
    const featureConfig = planConfig.features.find(
        (f) => f.feature === feature,
    );
    return featureConfig?.gateMode ?? "hidden";
}

export function hasFeature(planConfig: PlanConfig, feature: FeatureId): boolean {
    return getFeatureGateMode(planConfig, feature) === "enabled";
}

export async function checkPlanFeature(
    domain: string,
    feature: FeatureId,
): Promise<PlanGateResult> {
    const plan = await resolveShopPlan(domain);
    const gateMode = getFeatureGateMode(plan, feature);

    return {
        allowed: gateMode === "enabled",
        gated: gateMode !== "enabled",
        feature,
        gateMode,
        message:
            gateMode === "enabled"
                ? "Feature available"
                : `This feature requires a paid plan`,
    };
}

export async function checkBundleTypeAllowed(
    domain: string,
    bundleType: string,
): Promise<PlanGateResult> {
    const limits = await getEffectiveLimits(domain);
    const allowed = limits.allowedBundleTypes.includes(bundleType as any);

    return {
        allowed,
        gated: !allowed,
        feature: bundleType,
        gateMode: allowed ? "enabled" : "lock-overlay",
        message: allowed
            ? "Bundle type available"
            : `${bundleType} requires a paid plan`,
    };
}

export async function checkBundleQuota(
    domain: string,
): Promise<QuotaResult> {
    const limits = await getEffectiveLimits(domain);
    const current = await countBundlesByShop(domain);

    if (limits.maxBundles === -1) {
        return { allowed: true, current, limit: -1 };
    }

    return {
        allowed: current < limits.maxBundles,
        current,
        limit: limits.maxBundles,
    };
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors. If `countBundlesByShop` import path differs, adjust to match the actual export location.

- [ ] **Step 3: Commit**

```bash
git add web/shared/services/plan.service.ts
git commit -m "feat: add plan resolution service with feature and quota checks"
```

---

## Task 5: Plan Server Action

**Files:**
- Create: `web/shared/actions/plan.actions.ts`
- Modify: `web/shared/actions/index.ts`

This server action fetches the full plan data for the client-side PlanProvider.

- [ ] **Step 1: Create the plan server action**

Create `web/shared/actions/plan.actions.ts`:

```typescript
"use server";

import type { ClientPlanData } from "@/shared/types/plan";
import {
    resolveShopPlan,
    getEffectiveLimits,
    checkBundleQuota,
} from "@/shared/services/plan.service";

export async function fetchPlanData(
    domain: string,
): Promise<ClientPlanData> {
    const plan = await resolveShopPlan(domain);
    const limits = await getEffectiveLimits(domain);
    const bundleQuota = await checkBundleQuota(domain);

    return {
        planId: plan.id,
        planName: plan.name,
        limits,
        features: plan.features,
        quota: {
            bundles: bundleQuota,
            products: {
                allowed: true,
                current: 0,
                limit: limits.maxProductsPerBundle,
            },
        },
    };
}
```

- [ ] **Step 2: Add to barrel export**

In `web/shared/actions/index.ts`, add at the end:

```typescript
export * from "./plan.actions";
```

- [ ] **Step 3: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add web/shared/actions/plan.actions.ts web/shared/actions/index.ts
git commit -m "feat: add fetchPlanData server action"
```

---

## Task 6: PlanProvider React Context

**Files:**
- Create: `web/shared/components/plan-gate/plan-provider.tsx`

- [ ] **Step 1: Create PlanProvider**

Create `web/shared/components/plan-gate/plan-provider.tsx`:

```typescript
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type {
    ClientPlanData,
    FeatureId,
    GateMode,
    PlanConfig,
    PlanContextValue,
} from "@/shared/types/plan";
import { PLAN_CONFIGS, DEFAULT_PLAN_ID } from "@/shared/constants";
import { fetchPlanData } from "@/shared/actions/plan.actions";
import { useShopStore } from "@/shared";

const PlanContext = createContext<PlanContextValue | null>(null);

function buildContextValue(data: ClientPlanData): PlanContextValue {
    const planConfig = PLAN_CONFIGS[data.planId] ?? PLAN_CONFIGS[DEFAULT_PLAN_ID];

    return {
        plan: { ...planConfig, limits: data.limits },
        canUse: (feature: FeatureId) => {
            const f = data.features.find((fc) => fc.feature === feature);
            return f?.gateMode === "enabled";
        },
        getGateMode: (feature: FeatureId): GateMode => {
            const f = data.features.find((fc) => fc.feature === feature);
            return f?.gateMode ?? "hidden";
        },
        isWithinQuota: (resource: "bundles" | "products") => {
            const q = data.quota[resource];
            return q.limit === -1 || q.current < q.limit;
        },
        quota: data.quota,
    };
}

const DEFAULT_CONTEXT: PlanContextValue = buildContextValue({
    planId: DEFAULT_PLAN_ID,
    planName: "Free",
    limits: PLAN_CONFIGS[DEFAULT_PLAN_ID].limits,
    features: PLAN_CONFIGS[DEFAULT_PLAN_ID].features,
    quota: {
        bundles: { allowed: true, current: 0, limit: 5 },
        products: { allowed: true, current: 0, limit: 10 },
    },
});

export function PlanProvider({ children }: { children: ReactNode }) {
    const [planData, setPlanData] = useState<PlanContextValue>(DEFAULT_CONTEXT);
    const shopDomain = useShopStore((s) => s.shop?.domain);

    useEffect(() => {
        if (!shopDomain) return;

        fetchPlanData(shopDomain).then((data) => {
            setPlanData(buildContextValue(data));
        }).catch((err) => {
            console.warn("[PlanProvider] Failed to fetch plan data:", err);
        });
    }, [shopDomain]);

    return (
        <PlanContext.Provider value={planData}>{children}</PlanContext.Provider>
    );
}

export function usePlanContext(): PlanContextValue {
    const ctx = useContext(PlanContext);
    if (!ctx) {
        throw new Error("usePlanContext must be used within PlanProvider");
    }
    return ctx;
}
```

Note: `useShopStore` is the existing Zustand store that holds the shop domain. Verify the exact selector shape matches — the explore agent found it at `web/shared/types/state/shop-store.types.ts`. If the store uses a different accessor (e.g., `s.domain` instead of `s.shop?.domain`), adjust accordingly.

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors. If `useShopStore` import path or shape differs, fix before proceeding.

- [ ] **Step 3: Commit**

```bash
git add web/shared/components/plan-gate/plan-provider.tsx
git commit -m "feat: add PlanProvider React context"
```

---

## Task 7: usePlan Hook

**Files:**
- Create: `web/shared/hooks/plan/use-plan.ts`
- Create: `web/shared/hooks/plan/index.ts`
- Modify: `web/shared/hooks/index.ts`

- [ ] **Step 1: Create usePlan hook**

Create `web/shared/hooks/plan/use-plan.ts`:

```typescript
"use client";

import { usePlanContext } from "@/shared/components/plan-gate/plan-provider";
import type { PlanContextValue } from "@/shared/types/plan";

export function usePlan(): PlanContextValue {
    return usePlanContext();
}
```

- [ ] **Step 2: Create barrel export**

Create `web/shared/hooks/plan/index.ts`:

```typescript
export * from "./use-plan";
```

- [ ] **Step 3: Add to hooks barrel**

In `web/shared/hooks/index.ts`, add at the end:

```typescript
export * from "./plan";
```

- [ ] **Step 4: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add web/shared/hooks/plan/ web/shared/hooks/index.ts
git commit -m "feat: add usePlan hook"
```

---

## Task 8: PlanGate Component

**Files:**
- Create: `web/shared/components/plan-gate/plan-gate.tsx`

- [ ] **Step 1: Create PlanGate component**

Create `web/shared/components/plan-gate/plan-gate.tsx`:

```typescript
"use client";

import type { ReactNode } from "react";
import type { FeatureId, GateMode } from "@/shared/types/plan";
import { usePlan } from "@/shared/hooks/plan";
import { LockOverlay } from "./lock-overlay";

interface PlanGateProps {
    feature: FeatureId;
    children: ReactNode;
    fallbackMode?: GateMode;
}

export function PlanGate({ feature, children, fallbackMode }: PlanGateProps) {
    const { getGateMode } = usePlan();
    const gateMode = fallbackMode ?? getGateMode(feature);

    if (gateMode === "hidden") {
        return null;
    }

    if (gateMode === "lock-overlay") {
        return <LockOverlay feature={feature}>{children}</LockOverlay>;
    }

    return <>{children}</>;
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: May fail on missing `LockOverlay` — that's fine, we create it in Task 9.

- [ ] **Step 3: Commit**

```bash
git add web/shared/components/plan-gate/plan-gate.tsx
git commit -m "feat: add PlanGate wrapper component"
```

---

## Task 9: LockOverlay Component

**Files:**
- Create: `web/shared/components/plan-gate/lock-overlay.tsx`

- [ ] **Step 1: Create LockOverlay component**

Create `web/shared/components/plan-gate/lock-overlay.tsx`:

```typescript
"use client";

import type { ReactNode } from "react";
import type { FeatureId } from "@/shared/types/plan";

const FEATURE_LABELS: Record<FeatureId, string> = {
    analytics_full: "Advanced Analytics",
    ab_testing: "A/B Testing",
    automation: "Automation",
    ai_insights: "AI Insights",
    custom_css: "Custom CSS",
    responsive_overrides: "Responsive Overrides",
    templates: "Templates",
    export_data: "Data Export",
    remove_branding: "Remove Branding",
};

interface LockOverlayProps {
    feature: FeatureId;
    children: ReactNode;
}

export function LockOverlay({ feature, children }: LockOverlayProps) {
    const label = FEATURE_LABELS[feature] ?? feature;

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    filter: "blur(2px)",
                    opacity: 0.4,
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            >
                {children}
            </div>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    background: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "12px",
                    zIndex: 10,
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M14 8V6a4 4 0 0 0-8 0v2H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1Zm-5-2a1 1 0 1 1 2 0v2H9V6Z"
                        fill="#6B7280"
                    />
                </svg>
                <span
                    style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                    }}
                >
                    {label}
                </span>
                <span
                    style={{
                        fontSize: "12px",
                        color: "#6B7280",
                    }}
                >
                    Available on paid plans
                </span>
                <button
                    onClick={() => {
                        // No-op for now. Wire to billing/pricing route later.
                    }}
                    style={{
                        padding: "6px 16px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#fff",
                        background: "#2563EB",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Upgrade
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add web/shared/components/plan-gate/lock-overlay.tsx
git commit -m "feat: add LockOverlay component for gated features"
```

---

## Task 10: QuotaBar Component

**Files:**
- Create: `web/shared/components/plan-gate/quota-bar.tsx`

- [ ] **Step 1: Create QuotaBar component**

Create `web/shared/components/plan-gate/quota-bar.tsx`:

```typescript
"use client";

import { usePlan } from "@/shared/hooks/plan";

interface QuotaBarProps {
    resource: "bundles" | "products";
    label?: string;
}

export function QuotaBar({ resource, label }: QuotaBarProps) {
    const { quota } = usePlan();
    const q = quota[resource];

    if (q.limit === -1) return null;

    const percentage = Math.round((q.current / q.limit) * 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = q.current >= q.limit;

    const displayLabel =
        label ?? (resource === "bundles" ? "Bundles" : "Products");

    const barColor = isAtLimit
        ? "#DC2626"
        : isNearLimit
          ? "#F59E0B"
          : "#2563EB";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#374151",
                }}
            >
                <span style={{ fontWeight: 500 }}>{displayLabel}</span>
                <span>
                    {q.current}/{q.limit} used
                </span>
            </div>
            <div
                style={{
                    height: "6px",
                    background: "#E5E7EB",
                    borderRadius: "3px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: "100%",
                        background: barColor,
                        borderRadius: "3px",
                        transition: "width 0.3s ease",
                    }}
                />
            </div>
            {isAtLimit && (
                <div
                    style={{
                        fontSize: "12px",
                        color: "#DC2626",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        {displayLabel} limit reached
                    </span>
                    <button
                        onClick={() => {
                            // No-op for now. Wire to billing/pricing route later.
                        }}
                        style={{
                            fontSize: "12px",
                            color: "#2563EB",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                    >
                        Upgrade for more
                    </button>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add web/shared/components/plan-gate/quota-bar.tsx
git commit -m "feat: add QuotaBar component for plan limit display"
```

---

## Task 11: Plan-Gate Barrel Export & Wire Into App

**Files:**
- Create: `web/shared/components/plan-gate/index.ts`
- Modify: `web/shared/components/index.ts`
- Modify: `web/shared/components/providers/providers.tsx`

- [ ] **Step 1: Create plan-gate barrel export**

Create `web/shared/components/plan-gate/index.ts`:

```typescript
export { PlanProvider } from "./plan-provider";
export { PlanGate } from "./plan-gate";
export { LockOverlay } from "./lock-overlay";
export { QuotaBar } from "./quota-bar";
```

- [ ] **Step 2: Add to shared components barrel**

In `web/shared/components/index.ts`, add at the end:

```typescript
export * from "./plan-gate";
```

- [ ] **Step 3: Wrap app with PlanProvider**

In `web/shared/components/providers/providers.tsx`, add `PlanProvider` inside the provider tree. The current tree is:

```
TanstackProvider → Suspense → SessionProvider → AppSettingsProvider → ProtectedRoute → children
```

Add `PlanProvider` after `AppSettingsProvider` (it needs shop context from session):

Change line 39-40 from:

```typescript
                        <AppSettingsProvider>
                            <ProtectedRoute>{children}</ProtectedRoute>
```

To:

```typescript
                        <AppSettingsProvider>
                            <PlanProvider>
                                <ProtectedRoute>{children}</ProtectedRoute>
                            </PlanProvider>
```

Add the import at the top of the file:

```typescript
import { PlanProvider } from "@/shared/components/plan-gate/plan-provider";
```

- [ ] **Step 4: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add web/shared/components/plan-gate/index.ts web/shared/components/index.ts web/shared/components/providers/providers.tsx
git commit -m "feat: wire PlanProvider into app provider tree"
```

---

## Task 12: Wire Server-Side Plan Checks Into Bundle Security

**Files:**
- Modify: `web/features/bundles/services/bundle-security.service.ts`

- [ ] **Step 1: Update `canCreateBundle()` to use plan-aware limits**

In `web/features/bundles/services/bundle-security.service.ts`, replace the `canCreateBundle` function (lines 228-259) with:

```typescript
export async function canCreateBundle(shop: string): Promise<{
    allowed: boolean;
    reason?: string;
    current?: number;
    limit?: number;
}> {
    const { checkBundleQuota } = await import(
        "@/shared/services/plan.service"
    );
    const quota = await checkBundleQuota(shop);

    if (!quota.allowed) {
        return {
            allowed: false,
            reason: `Shop has reached maximum bundle limit (${quota.limit})`,
            current: quota.current,
            limit: quota.limit,
        };
    }

    return {
        allowed: true,
        current: quota.current,
        limit: quota.limit,
    };
}
```

Note: We use dynamic `import()` to avoid circular dependency issues between features and shared services. The return type signature is unchanged, so all existing callers continue to work.

- [ ] **Step 2: Update `validateShopPermissions()` to check plan features**

In the same file, replace `validateShopPermissions` (lines 268-279) with:

```typescript
export async function validateShopPermissions(
    shop: string,
    operation: "create" | "update" | "delete",
    bundleType?: string,
): Promise<SecurityCheckResult> {
    if (operation === "create" && bundleType) {
        const { checkBundleTypeAllowed } = await import(
            "@/shared/services/plan.service"
        );
        const result = await checkBundleTypeAllowed(shop, bundleType);
        if (!result.allowed) {
            return {
                passed: false,
                reason: result.message,
            };
        }
    }

    return { passed: true };
}
```

- [ ] **Step 3: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors. The `bundleType` parameter is optional so existing callers without it still compile.

- [ ] **Step 4: Commit**

```bash
git add web/features/bundles/services/bundle-security.service.ts
git commit -m "feat: wire plan-aware quota and type checks into bundle security"
```

---

## Task 13: Gate Navigation Items

**Files:**
- Modify: `web/shared/components/navigation/navigation.tsx`

- [ ] **Step 1: Add plan-aware navigation gating**

Replace the full content of `web/shared/components/navigation/navigation.tsx` with:

```typescript
"use client";

import Link from "next/link";
import { NavMenu } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { usePlan } from "@/shared/hooks/plan";
import type { FeatureId } from "@/shared/types/plan";

interface NavItem {
    href: string;
    labelKey: string;
    rel?: string;
    feature?: FeatureId;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/dashboard", labelKey: "dashboard", rel: "home" },
    { href: "/bundles", labelKey: "bundles" },
    { href: "/analytics", labelKey: "analytics", feature: "analytics_full" },
    { href: "/settings", labelKey: "settings" },
    { href: "/pricing", labelKey: "pricing" },
    { href: "/support", labelKey: "support" },
];

export function Navigation() {
    const t = useTranslations("Common.Navigation");
    const { getGateMode } = usePlan();

    return (
        <NavMenu>
            {NAV_ITEMS.filter((item) => {
                if (!item.feature) return true;
                return getGateMode(item.feature) !== "hidden";
            }).map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    rel={item.rel}
                    data-sprogress
                >
                    {t(item.labelKey)}
                </Link>
            ))}
        </NavMenu>
    );
}
```

This makes the analytics nav item hidden when `analytics_full` is `hidden` in the plan config. When you later flip it to `lock-overlay`, it will appear in the nav (the page itself should be wrapped with `<PlanGate>` to show the overlay).

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add web/shared/components/navigation/navigation.tsx
git commit -m "feat: gate navigation items by plan feature flags"
```

---

## Task 14: Verify Full Integration

- [ ] **Step 1: Run full type check**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty`

Expected: No new errors introduced by plan gating code.

- [ ] **Step 2: Verify dev server starts**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles && bun run dev:app`

Expected: Dev server starts without import errors or runtime crashes.

- [ ] **Step 3: Smoke test in browser**

1. Open the app in Shopify admin
2. Verify navigation renders (analytics should be hidden on FREE plan)
3. Verify bundle creation still works (FIXED_BUNDLE allowed)
4. Verify no console errors from PlanProvider

- [ ] **Step 4: Final commit**

If any fixes were needed during verification:

```bash
git add -p
git commit -m "fix: resolve integration issues from plan gating"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|------------|-----------|----------------|
| 1 | Plan type definitions | 2 | 0 |
| 2 | Plan constants config | 1 | 1 |
| 3 | Shop plan query | 0 | 1 |
| 4 | Plan resolution service | 1 | 0 |
| 5 | Plan server action | 1 | 1 |
| 6 | PlanProvider context | 1 | 0 |
| 7 | usePlan hook | 2 | 1 |
| 8 | PlanGate component | 1 | 0 |
| 9 | LockOverlay component | 1 | 0 |
| 10 | QuotaBar component | 1 | 0 |
| 11 | Barrel exports + wire provider | 1 | 2 |
| 12 | Server-side security wiring | 0 | 1 |
| 13 | Navigation gating | 0 | 1 |
| 14 | Full integration verification | 0 | 0 |
| **Total** | | **12** | **8** |

## Usage Examples (for reference when integrating later)

### Hiding a feature section

```typescript
import { PlanGate } from "@/shared";

<PlanGate feature="ab_testing">
    <ABTestingDashboard />
</PlanGate>
```

### Showing quota on bundle list page

```typescript
import { QuotaBar } from "@/shared";

<QuotaBar resource="bundles" />
```

### Checking plan in a server action

```typescript
import { checkPlanFeature } from "@/shared/services/plan.service";

const result = await checkPlanFeature(shop, "analytics_full");
if (result.gated) {
    return { error: result.message };
}
```

### Adding a new plan tier (future)

In `web/shared/constants/plans.constants.ts`, add to `PLAN_CONFIGS`:

```typescript
STARTER: {
    id: "STARTER",
    name: "Starter",
    limits: {
        maxBundles: 25,
        maxProductsPerBundle: 15,
        allowedBundleTypes: ["FIXED_BUNDLE", "BOGO", "BUY_X_GET_Y"],
    },
    features: [
        { feature: "analytics_full", gateMode: "enabled" },
        { feature: "ab_testing", gateMode: "lock-overlay" },
        // ...
    ],
},
```

Then set `Shop.plan = "STARTER"` in DB for that merchant.