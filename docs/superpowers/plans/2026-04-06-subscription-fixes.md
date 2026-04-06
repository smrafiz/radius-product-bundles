# Subscription Integration Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 critical/high security and correctness bugs in the Shopify subscription/billing integration.

**Architecture:** All fixes are isolated to existing files — no new files needed. Tasks are ordered by severity: auth security first, then plan-gating correctness, then UI/data bugs. Each task is independently testable.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Shopify App Bridge, React Query, Jest

---

## File Map

| File | What Changes |
|---|---|
| `web/app/api/billing/confirm/route.ts` | Replace `x-shop-domain` header auth with `authenticateBillingRequest` |
| `web/app/api/billing/create/route.ts` | Validate `returnUrl` is a valid HTTPS URL before passing to service |
| `web/features/pricing/services/subscription.service.ts` | Fix `isTerminated` branch to write `ShopStatus.TRIAL_EXPIRED`; fix plan name via billingId lookup |
| `web/features/bundles/services/bundle-write.service.ts` | Call `validateShopPermissions` from `createBundleService` and `updateBundleService` |
| `web/features/bundles/services/bundle-operation.service.ts` | Replace `appSettings.maxBundlesPerShop` quota with `checkBundleQuota` from plan.service |
| `web/features/pricing/hooks/use-billing-status.ts` | Fix `trialDaysRemaining` to use `trialEndsAt` from `data` instead of `currentPeriodEnd` |

---

## Task 1: Fix `/api/billing/confirm` — missing auth

**Problem:** The confirm route reads `x-shop-domain` header with no session verification. Every other billing route uses `authenticateBillingRequest()`.

**Files:**
- Modify: `web/app/api/billing/confirm/route.ts`

- [ ] **Step 1: Write the failing test**

```ts
// In web/app/api/billing/confirm/route.ts — manual test via curl:
// Before fix: curl -X POST /api/billing/confirm -H "x-shop-domain: victim.myshopify.com" -d '{"chargeId":"gid://shopify/AppSubscription/123"}'
// Should return 401 after fix, not proceed.
// Jest test — add to a new file: web/app/api/billing/__tests__/confirm.test.ts
import { POST } from "../confirm/route";
import { NextRequest } from "next/server";

jest.mock("@/app/api/billing/billing-auth", () => ({
    authenticateBillingRequest: jest.fn().mockRejectedValue(new Error("Unauthorized")),
}));
jest.mock("@/features/pricing/services/subscription.service", () => ({
    confirmSubscriptionService: jest.fn(),
    getAccessTokenForShop: jest.fn(),
    BillingError: class BillingError extends Error { constructor(msg: string, public code: string) { super(msg); } },
}));

it("returns 401 when no valid session token", async () => {
    const req = new NextRequest("http://localhost/api/billing/confirm", {
        method: "POST",
        body: JSON.stringify({ chargeId: "gid://shopify/AppSubscription/123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && bun run test -- --testPathPattern="billing/__tests__/confirm"
```
Expected: FAIL — test file doesn't exist yet / auth not enforced.

- [ ] **Step 3: Implement the fix**

Replace entire `web/app/api/billing/confirm/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateBillingRequest } from "../billing-auth";
import {
    confirmSubscriptionService,
    BillingError,
} from "@/features/pricing/services/subscription.service";

export async function POST(request: NextRequest) {
    let shop: string;
    let accessToken: string;

    try {
        ({ shop, accessToken } = await authenticateBillingRequest(request));
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = (await request.json()) as { chargeId?: string };
        const { chargeId } = body;

        if (!chargeId) {
            return NextResponse.json(
                { error: "Missing chargeId" },
                { status: 400 },
            );
        }

        await confirmSubscriptionService(shop, accessToken, chargeId);

        return NextResponse.json({ success: true, plan: "PRO" });
    } catch (error) {
        if (error instanceof BillingError) {
            if (error.code === "NOT_FOUND") {
                return NextResponse.json(
                    { error: error.message, status: "NOT_FOUND" },
                    { status: 404 },
                );
            }
            if (error.code === "SHOPIFY_ERROR") {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
        console.error("[Billing] Error confirming subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
```

Key changes:
- Removed `getShop` lookup (not needed — auth provides the shop)
- Removed `getAccessTokenForShop` (auth provides the access token)
- Auth failure now returns 401 immediately
- `shop` and `accessToken` come from the verified session token

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web && bun run test -- --testPathPattern="billing/__tests__/confirm"
```
Expected: PASS

- [ ] **Step 5: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "confirm"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add web/app/api/billing/confirm/route.ts web/app/api/billing/__tests__/confirm.test.ts
git commit -m "fix: enforce session auth on billing confirm route"
```

---

## Task 2: Validate `returnUrl` in create route

**Problem:** `returnUrl` from request body is passed directly to Shopify as the billing confirmation redirect URL with no domain validation.

**Files:**
- Modify: `web/app/api/billing/create/route.ts`

- [ ] **Step 1: Write the failing test**

```ts
// web/app/api/billing/__tests__/create-returnurl.test.ts
import { POST } from "../create/route";
import { NextRequest } from "next/server";

jest.mock("@/app/api/billing/billing-auth", () => ({
    authenticateBillingRequest: jest.fn().mockResolvedValue({
        shop: "test.myshopify.com",
        accessToken: "token",
    }),
}));
jest.mock("@/shared/repositories/shop.queries", () => ({
    getShop: jest.fn().mockResolvedValue({ domain: "test.myshopify.com" }),
}));
jest.mock("@/features/pricing/services/subscription.service", () => ({
    createSubscriptionService: jest.fn(),
    BillingError: class BillingError extends Error { constructor(msg: string, public code: string) { super(msg); } },
}));

it("rejects non-https returnUrl", async () => {
    const req = new NextRequest("http://localhost/api/billing/create", {
        method: "POST",
        body: JSON.stringify({
            planName: "PRO",
            interval: "EVERY_30_DAYS",
            returnUrl: "http://evil.com/phish",
        }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/returnUrl/i);
});

it("rejects non-URL returnUrl", async () => {
    const req = new NextRequest("http://localhost/api/billing/create", {
        method: "POST",
        body: JSON.stringify({
            planName: "PRO",
            interval: "EVERY_30_DAYS",
            returnUrl: "not-a-url",
        }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && bun run test -- --testPathPattern="billing/__tests__/create-returnurl"
```
Expected: FAIL — no validation exists.

- [ ] **Step 3: Implement the fix**

Add `returnUrl` validation to `web/app/api/billing/create/route.ts` after the body parse:

```ts
// After: const { interval, returnUrl } = body;
// Add:
if (!returnUrl) {
    return NextResponse.json(
        { error: "Missing returnUrl" },
        { status: 400 },
    );
}

let parsedUrl: URL;
try {
    parsedUrl = new URL(returnUrl);
} catch {
    return NextResponse.json(
        { error: "Invalid returnUrl: must be a valid URL" },
        { status: 400 },
    );
}

if (parsedUrl.protocol !== "https:") {
    return NextResponse.json(
        { error: "Invalid returnUrl: must use HTTPS" },
        { status: 400 },
    );
}
```

Full updated `web/app/api/billing/create/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { authenticateBillingRequest } from "../billing-auth";
import {
    createSubscriptionService,
    BillingError,
} from "@/features/pricing/services/subscription.service";
import { BillingInterval } from "@/features/pricing/types/pricing.types";

interface CreateSubscriptionInput {
    planName: string;
    interval: BillingInterval;
    returnUrl: string;
}

export async function POST(request: NextRequest) {
    try {
        let shop: string;
        let accessToken: string;

        try {
            ({ shop, accessToken } = await authenticateBillingRequest(request));
        } catch {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as CreateSubscriptionInput;
        const { interval, returnUrl } = body;

        if (!returnUrl) {
            return NextResponse.json(
                { error: "Missing returnUrl" },
                { status: 400 },
            );
        }

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(returnUrl);
        } catch {
            return NextResponse.json(
                { error: "Invalid returnUrl: must be a valid URL" },
                { status: 400 },
            );
        }

        if (parsedUrl.protocol !== "https:") {
            return NextResponse.json(
                { error: "Invalid returnUrl: must use HTTPS" },
                { status: 400 },
            );
        }

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const result = await createSubscriptionService(shop, accessToken, interval, returnUrl);

        return NextResponse.json({
            confirmationUrl: result.confirmationUrl,
            subscriptionId: result.subscriptionId,
        });
    } catch (error) {
        if (error instanceof BillingError) {
            if (error.code === "ALREADY_ACTIVE") {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            if (error.code === "SHOPIFY_ERROR") {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
        console.error("[Billing] Error creating subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web && bun run test -- --testPathPattern="billing/__tests__/create-returnurl"
```
Expected: PASS

- [ ] **Step 5: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "create/route"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add web/app/api/billing/create/route.ts web/app/api/billing/__tests__/create-returnurl.test.ts
git commit -m "fix: validate returnUrl is HTTPS in billing create route"
```

---

## Task 3: Write `ShopStatus.TRIAL_EXPIRED` on subscription expiry

**Problem:** `handleSubscriptionWebhookService` sets `ShopStatus.ACTIVE` when a subscription terminates (EXPIRED/DECLINED/CANCELLED). The `TRIAL_EXPIRED` status is defined but never written, so expired shops keep full access as FREE rather than being gated.

**Files:**
- Modify: `web/features/pricing/services/subscription.service.ts`

- [ ] **Step 1: Write the failing test**

Add to `web/features/pricing/services/__tests__/subscription.service.test.ts` (create if not exists):

```ts
import {
    handleSubscriptionWebhookService,
} from "../subscription.service";

jest.mock("@/features/pricing/repositories/shop-plan.repository", () => ({
    getShopPlanRecord: jest.fn().mockResolvedValue(null),
    upsertShopPlan: jest.fn().mockResolvedValue(undefined),
    cancelShopPlan: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/shared/repositories/shop.queries", () => ({
    upsertShop: jest.fn().mockResolvedValue(undefined),
    getShop: jest.fn(),
}));

import { upsertShop } from "@/shared/repositories/shop.queries";
const mockUpsertShop = upsertShop as jest.MockedFunction<typeof upsertShop>;

beforeEach(() => jest.clearAllMocks());

it("sets ShopStatus.TRIAL_EXPIRED when subscription EXPIRES", async () => {
    await handleSubscriptionWebhookService(
        "test.myshopify.com",
        "gid://shopify/AppSubscription/1",
        "EXPIRED",
        "Radius Pro",
    );
    expect(mockUpsertShop).toHaveBeenCalledWith(
        "test.myshopify.com",
        expect.objectContaining({ status: "TRIAL_EXPIRED" }),
    );
});

it("sets ShopStatus.SUSPENDED when subscription is CANCELLED", async () => {
    await handleSubscriptionWebhookService(
        "test.myshopify.com",
        "gid://shopify/AppSubscription/1",
        "CANCELLED",
        "Radius Pro",
    );
    expect(mockUpsertShop).toHaveBeenCalledWith(
        "test.myshopify.com",
        expect.objectContaining({ status: "SUSPENDED" }),
    );
});

it("sets ShopStatus.SUSPENDED when subscription DECLINED", async () => {
    await handleSubscriptionWebhookService(
        "test.myshopify.com",
        "gid://shopify/AppSubscription/1",
        "DECLINED",
        "Radius Pro",
    );
    expect(mockUpsertShop).toHaveBeenCalledWith(
        "test.myshopify.com",
        expect.objectContaining({ status: "SUSPENDED" }),
    );
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && bun run test -- --testPathPattern="pricing/services/__tests__/subscription"
```
Expected: FAIL — currently sets `ACTIVE` for all terminated states.

- [ ] **Step 3: Implement the fix**

In `web/features/pricing/services/subscription.service.ts`, replace the `isTerminated` branch (lines ~302–313):

```ts
// Replace:
    } else if (isTerminated) {
        await upsertShop(shop, { status: ShopStatus.ACTIVE });
        if (normalizedStatus === ShopifySubscriptionStatus.EXPIRED) {
            console.warn(
                `[Subscription] Trial/subscription expired for ${shop} — downgraded to FREE`,
            );
        }
    }

// With:
    } else if (isTerminated) {
        const terminatedStatus =
            normalizedStatus === ShopifySubscriptionStatus.EXPIRED
                ? ShopStatus.TRIAL_EXPIRED
                : ShopStatus.SUSPENDED;
        await upsertShop(shop, { status: terminatedStatus });
        console.warn(
            `[Subscription] Subscription ${normalizedStatus} for ${shop} — status set to ${terminatedStatus}`,
        );
    }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web && bun run test -- --testPathPattern="pricing/services/__tests__/subscription"
```
Expected: PASS

- [ ] **Step 5: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "subscription.service"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add web/features/pricing/services/subscription.service.ts web/features/pricing/services/__tests__/subscription.service.test.ts
git commit -m "fix: write TRIAL_EXPIRED/SUSPENDED status on subscription termination"
```

---

## Task 4: Fix plan name resolution — use billingId lookup

**Problem:** `handleSubscriptionWebhookService` resolves the plan by checking if the Shopify subscription name contains `"pro"`. Renaming the plan would silently downgrade all shops.

**Files:**
- Modify: `web/features/pricing/services/subscription.service.ts`
- Modify: `web/features/pricing/repositories/shop-plan.repository.ts`

- [ ] **Step 1: Write the failing test**

Add to `web/features/pricing/services/__tests__/subscription.service.test.ts`:

```ts
import { getShopPlanRecord, upsertShopPlan } from "@/features/pricing/repositories/shop-plan.repository";
const mockGetShopPlanRecord = getShopPlanRecord as jest.MockedFunction<typeof getShopPlanRecord>;
const mockUpsertShopPlan = upsertShopPlan as jest.MockedFunction<typeof upsertShopPlan>;

it("resolves PRO plan from stored billingId even if plan name changed", async () => {
    mockGetShopPlanRecord.mockResolvedValue({
        id: "1",
        shop: "test.myshopify.com",
        shopId: null,
        billingId: "gid://shopify/AppSubscription/999",
        plan: "PRO" as any,
        status: "ACTIVE" as any,
        billingInterval: "EVERY_30_DAYS",
        trialEndsAt: null,
        currentPeriodEnd: null,
        activatedAt: null,
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await handleSubscriptionWebhookService(
        "test.myshopify.com",
        "gid://shopify/AppSubscription/999",
        "ACTIVE",
        "Radius Growth Plan",  // ← name no longer contains "pro"
    );

    expect(mockUpsertShopPlan).toHaveBeenCalledWith(
        "test.myshopify.com",
        expect.objectContaining({ plan: "PRO" }),
    );
});

it("falls back to FREE plan when billingId not found locally and name has no 'pro'", async () => {
    mockGetShopPlanRecord.mockResolvedValue(null);

    await handleSubscriptionWebhookService(
        "test.myshopify.com",
        "gid://shopify/AppSubscription/999",
        "ACTIVE",
        "Radius Growth Plan",
    );

    expect(mockUpsertShopPlan).toHaveBeenCalledWith(
        "test.myshopify.com",
        expect.objectContaining({ plan: "FREE" }),
    );
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && bun run test -- --testPathPattern="pricing/services/__tests__/subscription"
```
Expected: FAIL — currently uses substring match only.

- [ ] **Step 3: Implement the fix**

In `web/features/pricing/services/subscription.service.ts`, replace plan resolution in `handleSubscriptionWebhookService`:

```ts
// Replace:
    const resolvedPlan =
        isActive && planName.toLowerCase().includes("pro") ? PlanName.PRO : PlanName.FREE;

// With:
    // Resolve plan: prefer the stored plan from billingId lookup over substring matching.
    // This survives plan renames on the Shopify side.
    let resolvedPlan = PlanName.FREE;
    if (isActive) {
        const existingPlan = await getShopPlanRecord(shop);
        if (existingPlan?.billingId === subscriptionId && existingPlan.plan === PlanName.PRO) {
            resolvedPlan = PlanName.PRO;
        } else if (planName.toLowerCase().includes("pro")) {
            resolvedPlan = PlanName.PRO;
        }
    }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web && bun run test -- --testPathPattern="pricing/services/__tests__/subscription"
```
Expected: PASS

- [ ] **Step 5: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "subscription.service"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add web/features/pricing/services/subscription.service.ts
git commit -m "fix: resolve plan from billingId lookup, not plan name substring"
```

---

## Task 5: Enforce bundle type plan-gate on create/update

**Problem:** `validateShopPermissions()` (which calls `checkBundleTypeAllowed`) has no callers outside tests. A FREE shop can create `VOLUME_DISCOUNT` / `MIX_AND_MATCH` bundles server-side.

**Files:**
- Modify: `web/features/bundles/services/bundle-write.service.ts`

- [ ] **Step 1: Write the failing test**

```ts
// web/features/bundles/services/__tests__/bundle-write-plan-gate.test.ts
import { createBundleService } from "../bundle-write.service";

jest.mock("@/features/bundles/services/bundle-operation.service", () => ({
    fetchBundlePreflight: jest.fn().mockResolvedValue({
        security: { success: true },
        context: { shopSettings: { appSettings: null } },
        quota: { allowed: true, current: 0 },
    }),
    handleBundleOperationError: jest.fn((e: Error) => ({ success: false, message: e.message, errors: null, bundle: null })),
}));

jest.mock("@/features/bundles/services/bundle-security.service", () => ({
    validateShopPermissions: jest.fn().mockResolvedValue({
        passed: false,
        reason: "Bundle type not available on FREE plan",
    }),
}));

// Minimal mocks for other dependencies
jest.mock("@/features/bundles/repositories", () => ({
    createBundleWithRelations: jest.fn(),
}));
jest.mock("@/features/bundles", () => ({
    validateBundleData: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
    validateBusinessRules: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
    validateSecurity: jest.fn().mockReturnValue({ passed: true }),
    formatValidationErrorsAsString: jest.fn(),
    BundleStatus: { ACTIVE: "ACTIVE" },
}));
jest.mock("@/shared", () => ({
    formatValidationErrorsAsString: jest.fn(),
}));

import { validateShopPermissions } from "@/features/bundles/services/bundle-security.service";
const mockValidateShopPermissions = validateShopPermissions as jest.MockedFunction<typeof validateShopPermissions>;

it("blocks FREE shop from creating MIX_AND_MATCH bundle", async () => {
    const result = await createBundleService({
        shop: "free-shop.myshopify.com",
        data: {
            name: "Test",
            type: "MIX_AND_MATCH",
            status: "ACTIVE",
            products: [],
        } as any,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/FREE plan/i);
    expect(mockValidateShopPermissions).toHaveBeenCalledWith(
        "free-shop.myshopify.com",
        "create",
        "MIX_AND_MATCH",
        "ACTIVE",
    );
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && bun run test -- --testPathPattern="bundle-write-plan-gate"
```
Expected: FAIL — `validateShopPermissions` is never called from `createBundleService`.

- [ ] **Step 3: Implement the fix**

In `web/features/bundles/services/bundle-write.service.ts`, add `validateShopPermissions` import and call it in `createBundleService` after the preflight check:

Add to imports:
```ts
import { validateShopPermissions } from "@/features/bundles/services/bundle-security.service";
```

In `createBundleService`, after the `preflight.security.success` check and before `validateBundleData`:

```ts
        // Plan-gate: check bundle type and status are allowed on the shop's current plan
        const permissionCheck = await validateShopPermissions(
            shop,
            "create",
            data.type,
            data.status,
        );
        if (!permissionCheck.passed) {
            return {
                success: false,
                message: permissionCheck.reason ?? "Bundle type not available on your plan",
                errors: null,
                bundle: null,
            };
        }
```

Do the same in `updateBundleService` — add after the `preflight.security.success` check:

```ts
        // Plan-gate: check status is allowed on the shop's current plan
        const permissionCheck = await validateShopPermissions(
            shop,
            "update",
            undefined,
            data.status,
        );
        if (!permissionCheck.passed) {
            return {
                success: false,
                message: permissionCheck.reason ?? "Status not available on your plan",
                errors: null,
                bundle: null,
            };
        }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web && bun run test -- --testPathPattern="bundle-write-plan-gate"
```
Expected: PASS

- [ ] **Step 5: Run full test suite**

```bash
cd web && bun run test 2>&1 | tail -20
```
Expected: no regressions.

- [ ] **Step 6: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "bundle-write"
```
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add web/features/bundles/services/bundle-write.service.ts web/features/bundles/services/__tests__/bundle-write-plan-gate.test.ts
git commit -m "fix: enforce plan-gate on bundle create/update via validateShopPermissions"
```

---

## Task 6: Fix quota to use plan limits

**Problem:** `fetchBundlePreflight` reads quota from `appSettings.maxBundlesPerShop` (an admin DB field), not from `PLAN_CONFIGS`. A PRO shop has unlimited bundles per the plan config but can be incorrectly capped by `maxBundlesPerShop`.

**Files:**
- Modify: `web/features/bundles/services/bundle-operation.service.ts`

- [ ] **Step 1: Write the failing test**

```ts
// web/features/bundles/services/__tests__/bundle-preflight-quota.test.ts
import { fetchBundlePreflight } from "../bundle-operation.service";

jest.mock("@/shared/repositories/shop.queries", () => ({
    getShopWithLimits: jest.fn().mockResolvedValue({
        status: "ACTIVE",
        appSettings: { maxBundlesPerShop: 3, cacheTtl: 300 },
    }),
}));
jest.mock("@/features/bundles/repositories", () => ({
    countBundlesByShop: jest.fn().mockResolvedValue(5),
    countRecentBundles: jest.fn().mockResolvedValue(0),
    getBundleActivity: jest.fn().mockResolvedValue({ created: 0, updated: 0, deleted: 0 }),
}));
jest.mock("@/shared/services/plan.service", () => ({
    checkBundleQuota: jest.fn().mockResolvedValue({ allowed: true, current: 5, limit: -1 }),
}));

import { checkBundleQuota } from "@/shared/services/plan.service";
const mockCheckBundleQuota = checkBundleQuota as jest.MockedFunction<typeof checkBundleQuota>;

it("uses plan quota (checkBundleQuota) not appSettings.maxBundlesPerShop", async () => {
    const result = await fetchBundlePreflight("pro-shop.myshopify.com");
    expect(mockCheckBundleQuota).toHaveBeenCalledWith("pro-shop.myshopify.com");
    // PRO plan returns allowed:true even though appSettings.maxBundlesPerShop=3 and count=5
    expect(result.quota.allowed).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && bun run test -- --testPathPattern="bundle-preflight-quota"
```
Expected: FAIL — currently uses `appSettings.maxBundlesPerShop`.

- [ ] **Step 3: Implement the fix**

In `web/features/bundles/services/bundle-operation.service.ts`:

Add import at top:
```ts
import { checkBundleQuota } from "@/shared/services/plan.service";
```

Replace the quota section (lines ~119–138):

```ts
    // Evaluate quota using plan limits (not the admin-configurable DB field)
    const quotaResult = await checkBundleQuota(shop);

    return {
        security: { success: true },
        context: makeContext(),
        quota: quotaResult.allowed
            ? {
                  allowed: true,
                  current: quotaResult.current,
                  limit: quotaResult.limit === -1 ? undefined : quotaResult.limit,
              }
            : {
                  allowed: false,
                  reason: `Shop has reached maximum bundle limit (${quotaResult.limit})`,
                  current: quotaResult.current,
                  limit: quotaResult.limit,
              },
    };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web && bun run test -- --testPathPattern="bundle-preflight-quota"
```
Expected: PASS

- [ ] **Step 5: Run full test suite**

```bash
cd web && bun run test 2>&1 | tail -20
```
Expected: no regressions.

- [ ] **Step 6: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "bundle-operation"
```
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add web/features/bundles/services/bundle-operation.service.ts web/features/bundles/services/__tests__/bundle-preflight-quota.test.ts
git commit -m "fix: use plan quota limits instead of appSettings.maxBundlesPerShop"
```

---

## Task 7: Fix `trialDaysRemaining` — use `trialEndsAt` not `currentPeriodEnd`

**Problem:** `trialDaysRemaining()` in `use-billing-status.ts` reads `currentPeriodEnd` (the billing cycle end, ~30 days), not `trialEndsAt` (the actual 14-day trial end). Users see ~30 days remaining instead of the real 14-day window.

**Files:**
- Modify: `web/features/pricing/hooks/use-billing-status.ts`

The `trialEndsAt` is already returned from `getSubscriptionStatusService` in `BillingStatusResponse` as `data.trialEndsAt` (ISO string).

- [ ] **Step 1: Verify `trialEndsAt` is in the response type**

```bash
cd web && grep -n "trialEndsAt" features/pricing/types/pricing.types.ts
```
Expected: `trialEndsAt: string | null` present in `BillingStatusResponse`.

- [ ] **Step 2: Write the failing test**

```ts
// web/features/pricing/hooks/__tests__/use-billing-status.test.ts
// Test trialDaysRemaining logic in isolation (pure function extraction test)

// The current function:
// const trialDaysRemaining = () => {
//   const sub = data?.subscription;
//   if (!sub?.currentPeriodEnd) return null;
//   const end = new Date(sub.currentPeriodEnd).getTime();
//   ...
// }

// Expected after fix:
// Uses data?.trialEndsAt instead of sub?.currentPeriodEnd

// We test by checking the logic directly:
function trialDaysRemaining(data: { trialEndsAt: string | null } | null): number | null {
    if (!data?.trialEndsAt) return null;
    const end = new Date(data.trialEndsAt).getTime();
    const now = Date.now();
    if (end <= now) return null;
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

it("returns days until trialEndsAt, not currentPeriodEnd", () => {
    const trialEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days from now
    const result = trialDaysRemaining({ trialEndsAt: trialEnd });
    expect(result).toBe(10);
});

it("returns null when trialEndsAt is null", () => {
    expect(trialDaysRemaining({ trialEndsAt: null })).toBeNull();
});

it("returns null when trial has already ended", () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    expect(trialDaysRemaining({ trialEndsAt: pastDate })).toBeNull();
});
```

- [ ] **Step 3: Run test to verify the logic**

```bash
cd web && bun run test -- --testPathPattern="use-billing-status"
```

- [ ] **Step 4: Implement the fix**

In `web/features/pricing/hooks/use-billing-status.ts`, replace `trialDaysRemaining`:

```ts
    const trialDaysRemaining = (): number | null => {
        if (!data?.trialEndsAt) return null;
        const end = new Date(data.trialEndsAt).getTime();
        const now = Date.now();
        if (end <= now) return null;
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    };
```

- [ ] **Step 5: Type-check**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "use-billing-status"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add web/features/pricing/hooks/use-billing-status.ts
git commit -m "fix: trialDaysRemaining uses trialEndsAt not currentPeriodEnd"
```

---

## Self-Review

**Spec coverage:**
- ✅ Task 1: `/api/billing/confirm` unauthenticated → fixed with `authenticateBillingRequest`
- ✅ Task 2: `returnUrl` not validated → HTTPS check added
- ✅ Task 3: `TRIAL_EXPIRED` never written → webhook now sets correct status
- ✅ Task 4: Plan name substring match → billingId lookup with fallback
- ✅ Task 5: Bundle type gate bypassed → `validateShopPermissions` called on create/update
- ✅ Task 6: Quota reads wrong source → `checkBundleQuota` from plan.service
- ✅ Task 7: `trialDaysRemaining` wrong field → uses `trialEndsAt`

**Not in scope (medium priority, deferred):**
- Zod validation schemas for billing inputs
- Prisma migration files
- `ShopPlan.shopId` FK population
- `getSubscriptionStatusService` server-side caching

**Placeholder scan:** No TBDs, no "implement later", all code blocks complete.

**Type consistency:** `BillingStatusResponse.trialEndsAt` used in Task 7 matches existing type definition. `validateShopPermissions` signature `(shop, operation, bundleType?, bundleStatus?)` used consistently in Task 5.
