# Freemium Plan Gating System

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Tier-agnostic config-driven | Add/remove/reprice plans without code changes |
| Billing integration | None (Phase A) | Ship free-only first, add Shopify billing later |
| Config storage | Config file + DB override | `plans.ts` defaults, `AppSettings` per-shop overrides |
| Schema changes | None | Existing `Shop.plan`, `trialEndsAt`, `AppSettings.maxBundlesPerShop/maxBundleProducts` |
| Pro feature visibility | Hidden now, lock-overlay ready | Flip `gateMode` in config when ready to upsell |
| Enforcement | Server + client | Server actions enforce (security), client gates (UX only) |

## Plan Config (Single Source of Truth)

File: `web/shared/constants/plans.ts`

### Types

```typescript
type PlanId = 'FREE' | string

type GateMode = 'enabled' | 'lock-overlay' | 'hidden'

type FeatureId =
  | 'analytics_full'
  | 'ab_testing'
  | 'automation'
  | 'ai_insights'
  | 'custom_css'
  | 'responsive_overrides'
  | 'templates'
  | 'export_data'
  | 'remove_branding'

interface PlanFeatureConfig {
  feature: FeatureId
  gateMode: GateMode
}

interface PlanLimits {
  maxBundles: number              // -1 = unlimited
  maxProductsPerBundle: number
  allowedBundleTypes: BundleType[]
}

interface PlanConfig {
  id: PlanId
  name: string
  limits: PlanLimits
  features: PlanFeatureConfig[]
}
```

### FREE Plan (launch config)

```typescript
{
  id: 'FREE',
  name: 'Free',
  limits: {
    maxBundles: 5,
    maxProductsPerBundle: 10,
    allowedBundleTypes: ['FIXED_BUNDLE'],
  },
  features: [
    { feature: 'analytics_full', gateMode: 'hidden' },
    { feature: 'ab_testing', gateMode: 'hidden' },
    { feature: 'automation', gateMode: 'hidden' },
    { feature: 'ai_insights', gateMode: 'hidden' },
    { feature: 'custom_css', gateMode: 'hidden' },
    { feature: 'responsive_overrides', gateMode: 'hidden' },
    { feature: 'templates', gateMode: 'hidden' },
    { feature: 'export_data', gateMode: 'hidden' },
    { feature: 'remove_branding', gateMode: 'hidden' },
  ],
}
```

All pro features `hidden` for launch. Flip to `lock-overlay` when ready to show upgrade prompts. Flip to `enabled` when billing is live.

### Per-Shop Override

`Shop.plan` (String?) selects the `PlanConfig`. Defaults to `'FREE'` when null.

`AppSettings.maxBundlesPerShop` and `AppSettings.maxBundleProducts` override `PlanConfig.limits` if set to a non-default value. This allows per-shop exceptions without changing plan config.

## Plan Resolution Service

File: `web/shared/services/plan.service.ts`

### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getShopPlan` | `(domain: string) => Promise<PlanId>` | Reads `Shop.plan`, defaults `'FREE'` if null |
| `getPlanConfig` | `(planId: PlanId) => PlanConfig` | Lookup from constants, throws if unknown |
| `getEffectiveLimits` | `(domain: string) => Promise<PlanLimits>` | Merges plan defaults with AppSettings overrides |
| `hasFeature` | `(domain: string, feature: FeatureId) => Promise<boolean>` | True if feature's gateMode is `'enabled'` |
| `getFeatureGateMode` | `(planId: PlanId, feature: FeatureId) => GateMode` | Returns gate mode for a feature on a plan |
| `checkQuota` | `(domain: string, resource: 'bundles' \| 'products') => Promise<QuotaResult>` | `{ allowed, current, limit }` |

### QuotaResult

```typescript
interface QuotaResult {
  allowed: boolean
  current: number
  limit: number    // -1 = unlimited
}
```

## Server-Side Gating

### Extend `bundle-security.service.ts`

Add to existing preflight/security checks:

```typescript
// New functions
checkPlanFeature(domain: string, feature: FeatureId): Promise<PlanGateResult>
checkBundleTypeAllowed(domain: string, bundleType: BundleType): Promise<PlanGateResult>

interface PlanGateResult {
  allowed: boolean
  gated: boolean
  feature: FeatureId | BundleType
  gateMode: GateMode
  message: string
}
```

### Integration points

| Server action | Gate check |
|--------------|------------|
| `createBundle` | `checkBundleTypeAllowed` + `checkQuota('bundles')` |
| `updateBundle` | `checkBundleTypeAllowed` (if type changed) |
| Analytics endpoints | `checkPlanFeature('analytics_full')` |
| Settings (custom CSS) | `checkPlanFeature('custom_css')` |
| Template access | `checkPlanFeature('templates')` |
| Export actions | `checkPlanFeature('export_data')` |

Existing `canCreateBundle()` already checks `maxBundlesPerShop` — wire it to use `getEffectiveLimits()` instead of raw AppSettings query.

## Client-Side Gating

### File Structure

```
web/shared/
  constants/plans.ts                # Plan configs
  services/plan.service.ts          # Plan resolution
  types/plan.types.ts               # Shared types
  hooks/use-plan.ts                 # usePlan() hook
  components/plan-gate/
    plan-provider.tsx               # React context
    plan-gate.tsx                   # <PlanGate> wrapper
    lock-overlay.tsx                # Lock overlay UI
    quota-bar.tsx                   # Usage quota indicator
    index.ts                        # Barrel export
```

### PlanProvider

Wraps app layout. Fetches plan data from server once (via server action or initial page load). Provides context to all children.

```typescript
interface PlanContextValue {
  plan: PlanConfig
  canUse: (feature: FeatureId) => boolean
  getGateMode: (feature: FeatureId) => GateMode
  isWithinQuota: (resource: 'bundles' | 'products', current?: number) => boolean
  quota: {
    bundles: QuotaResult
    products: QuotaResult
  }
}
```

### usePlan() Hook

`web/shared/hooks/use-plan.ts`

Consumes PlanProvider context. Returns typed `PlanContextValue`.

### PlanGate Component

`web/shared/components/plan-gate/plan-gate.tsx`

```typescript
interface PlanGateProps {
  feature: FeatureId
  children: React.ReactNode
  fallbackMode?: GateMode  // override config's gateMode if needed
}
```

Behavior:
- Reads `gateMode` from plan config (or `fallbackMode` override)
- `'enabled'` → renders children
- `'lock-overlay'` → renders children dimmed + `<LockOverlay>` on top
- `'hidden'` → renders nothing (`null`)

### LockOverlay Component

`web/shared/components/plan-gate/lock-overlay.tsx`

- Polaris `Card` with semi-transparent overlay (`position: relative` wrapper)
- `LockIcon` + feature name + "Pro Feature" text
- "Upgrade" button (no-op for now, wired to billing route later)
- Blurred/dimmed children visible underneath (creates desire)

### QuotaBar Component

`web/shared/components/plan-gate/quota-bar.tsx`

- Shows: "3/5 bundles used" with Polaris `ProgressBar`
- At limit: warning banner + "Upgrade for more" CTA
- Near limit (80%+): subtle warning color

## Integration Points

### Navigation Gating

Add optional `feature` field to route config:

```typescript
interface RouteConfig {
  path: string
  label: string
  feature?: FeatureId  // if set, route visibility follows gateMode
}
```

- `'enabled'` → normal nav item
- `'lock-overlay'` → nav item with lock icon badge, page shows overlay
- `'hidden'` → nav item removed

### Bundle Type Selector

In bundle creation flow, gate bundle types not in `allowedBundleTypes`:
- FREE plan: only FIXED_BUNDLE selectable
- Other types show lock icon + "Pro" badge (when gateMode flipped to lock-overlay)
- Currently hidden since all non-FIXED types are `comingSoon` anyway

### Widget Branding

FREE plan: "Powered by Radius Bundles" in storefront widget.
- Controlled by `remove_branding` feature flag
- Enforced in Liquid theme extension (reads plan from app proxy response or metafield)
- When `remove_branding` is `'enabled'`, watermark is hidden

## Downgrade Behavior (Future)

When billing is added and a merchant downgrades:
- Existing bundles are NOT deleted
- Bundles over the new limit become read-only (view/edit, no create new)
- Locked bundle types become read-only
- Banner: "You have X bundles over your plan limit"

## Phase Summary

| Phase | Scope | When |
|-------|-------|------|
| **1 (this spec)** | Plan config + resolution service + server gating + client gating + PlanGate UI | Now |
| **2 (future)** | Shopify billing (`appSubscriptionCreate`), pricing page, webhook handler | When ready for paid plans |
| **3 (future)** | Trial management, downgrade logic, plan migration | After billing |

## Files to Create/Modify

### New files (~10)

| File | Purpose |
|------|---------|
| `web/shared/constants/plans.ts` | Plan configs |
| `web/shared/types/plan.types.ts` | Type definitions |
| `web/shared/services/plan.service.ts` | Plan resolution |
| `web/shared/hooks/use-plan.ts` | usePlan() hook |
| `web/shared/components/plan-gate/plan-provider.tsx` | React context |
| `web/shared/components/plan-gate/plan-gate.tsx` | Gate wrapper |
| `web/shared/components/plan-gate/lock-overlay.tsx` | Lock overlay UI |
| `web/shared/components/plan-gate/quota-bar.tsx` | Quota indicator |
| `web/shared/components/plan-gate/index.ts` | Barrel export |
| `web/shared/actions/plan.actions.ts` | Server action to fetch plan data |

### Modified files (~5-7)

| File | Change |
|------|--------|
| `web/features/bundles/services/bundle-security.service.ts` | Add plan checks |
| `web/shared/repositories/shop.queries.ts` | Default plan to 'FREE' |
| App layout (root) | Wrap with `PlanProvider` |
| Navigation config | Add `feature` field to routes |
| Bundle type selector component | Gate locked types |
| `web/shared/components/index.ts` | Export plan-gate components |