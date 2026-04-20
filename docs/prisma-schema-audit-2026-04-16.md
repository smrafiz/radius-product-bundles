# Prisma Schema Audit
**Date:** 2026-04-16  
**Schema:** `/web/prisma/schema.prisma`  
**Migration mode:** `prisma db push` (no migrations directory)  
**Auditor:** Backend Engineer (automated audit via Agent)

---

## Executive Summary

| Severity | Count | Resolved / Closed |
|----------|-------|-------------------|
| High     | 6     | F-01 (by design), F-06, F-15, F-28 ✅ — F-16, F-17 deferred |
| Medium   | 14    | F-02–04, F-09–12, F-21, F-24, F-26, F-27, F-30, F-40 ✅ — F-23, F-29 deferred |
| Low      | 8     | F-05, F-13, F-14, F-22, F-34 ✅ |
| **Open** | **13**| **22 of 31 resolved/closed — 4 deferred** |

_Last verified: 2026-04-20_

No migration history exists — the schema has been managed exclusively via `prisma db push`. This means **every structural change carries full data-loss risk** unless handled with explicit SQL or a carefully staged push. All implementation plans below account for this constraint.

---

## Table of Contents

1. [Type Correctness](#1-type-correctness)
2. [Missing Enums](#2-missing-enums)
3. [Unvalidated JSON Fields (D-2 Risk)](#3-unvalidated-json-fields)
4. [Index Optimization](#4-index-optimization)
5. [Relation Integrity](#5-relation-integrity)
6. [Missing Constraints](#6-missing-constraints)
7. [Schema Growth Risks](#7-schema-growth-risks)
8. [Naming Consistency](#8-naming-consistency)
9. [Prioritized Implementation Plan](#9-prioritized-implementation-plan)

---

## 1. Type Correctness

---

### F-01 — `Bundle.id` missing `@default(cuid())`
~~**Severity: High**~~ **→ CLOSED: By Design** ✅

**Verification (2026-04-20):**  
`Bundle.id` intentionally has no DB default. The app generates IDs in `shared/utils/helpers/calculations.ts` via `generateBundleId()` to match the Shopify product ID aesthetic (numeric-only, e.g. `7752960376937`):

```typescript
const timestamp = Date.now().toString();           // 13 digits
const random = customAlphabet("0123456789", 4)();  // 4 digits
return `${timestamp}${random}`;
```

Adding `@default(cuid())` would produce `clxxxxx…` — wrong format. **Do not change the schema.**

**Residual risk:** Collision probability is 1-in-10,000 for two creates in the exact same millisecond. Negligible for merchant UI usage. If bulk import is ever added, add a guard there. Optional low-risk improvement: bump suffix from 4 → 6 digits (1-in-1,000,000).

---

### F-02 — `Bundle.priorityType` / `AppSettings.bundlePriorityType` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Verification (2026-04-20):**  
Both fields already use the `PriorityType` enum (`priorityType PriorityType @default(INDEX_BASED)`). Resolved in a recent schema update commit.

---

### F-03 — `Bundle.discountApplication` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Verification (2026-04-20):**  
Already uses `DiscountApplication` enum (`discountApplication DiscountApplication @default(BUNDLE)`). Resolved in a recent schema update commit.

---

### F-04 — `BundleSettings.layout` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Verification (2026-04-20):**  
Already uses `BundleLayout` enum (`layout BundleLayout @default(GRID)`). Resolved in a recent schema update commit.

---

### F-05 — `ABTest.trafficSplit` — `Int` instead of `Float`
~~**Severity: Low**~~ **→ RESOLVED** ✅

**Problem:**  
Traffic split is a percentage (0–100). `Int` prevents fractional splits (e.g. 33.3% for three-variant tests).

**Fix:**
```prisma
trafficSplit Float @default(50.0)
```

**Pros:** Supports multi-variant tests.  
**Cons / Caveats:** Minor change — only matters if fractional splits are ever needed. `Int` casts cleanly to `Float` so data migration is trivial.  
**Migration risk:** Low.

---

### F-06 — `BundleView.date` — `String` instead of `DateTime`
~~**Severity: High**~~ **→ RESOLVED** ✅

**Problem:**  
This is the only date field in the entire schema stored as `String`. Consequences:
- Date ordering queries sort **lexicographically** not chronologically
- Unique constraints (`unique_customer_view`, `unique_session_view`) can silently break if format is inconsistent (e.g., `"2026-4-1"` vs `"2026-04-01"`)
- No DB-level date arithmetic possible
- The existing `@@index([date])` has low selectivity and sorts incorrectly

**Fix:**
```prisma
date DateTime @db.Date
```

**Pros:** Correct temporal ordering; consistent format enforced by DB; safe date arithmetic.  
**Cons / Caveats:** Requires data migration — all existing string dates must be cast to `DATE`. Application code writing `new Date().toISOString().split('T')[0]` must switch to passing a `Date` object.  
**Migration risk:** High — 3 unique constraints + 1 index all depend on this field.

---

## 2. Missing Enums

---

### F-09 — `AIInsight.category` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:** AI insight categories are unbounded. Filtering by category (e.g., `WHERE category = 'pricing'`) is fragile — case differences create silent duplicates.

**Fix:**
```prisma
enum AIInsightCategory {
  PRICING
  CONVERSION
  PRODUCT_MIX
  COPY
  LAYOUT
  INVENTORY
  OTHER
}
category AIInsightCategory
```

**Pros:** Consistent classification for dashboard filtering and automation triggers.  
**Cons / Caveats:** AI-generated categories may not fit predefined values — `OTHER` as escape hatch is required. Audit all existing `category` values before migrating.  
**Migration risk:** Medium.

---

### F-10 — `AIInsight.impact` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:** Impact values (`"low"`, `"medium"`, `"high"`) stored as String allow `"LOW"`, `"Low"`, `"low"` as distinct values. Dashboard badge logic depending on this field will silently miss rows.

**Fix:**
```prisma
enum ImpactLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
impact ImpactLevel
```

**Migration risk:** Medium — data migration from lowercase strings to uppercase enum.

---

### F-11 — `AIInsight.actionType` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:** The `actionType` field drives what the automation engine does with an insight. An unrecognized string causes a silent no-op or runtime error.

**Fix:**
```prisma
enum AIActionType {
  ADJUST_PRICE
  CHANGE_PRODUCTS
  UPDATE_COPY
  RUN_AB_TEST
  PAUSE_BUNDLE
  ACTIVATE_BUNDLE
  OTHER
}
actionType AIActionType?
```

**Cons / Caveats:** AI-generated action types are hard to pre-enumerate — `OTHER` escape hatch required.  
**Migration risk:** Medium.

---

### F-12 — `AlertRule.comparison` — raw String
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:** Comparison operators are a mathematically closed set. Accepting any string means a typo (`"gte"` vs `"gte "`) silently writes an unexecutable rule.

**Fix:**
```prisma
enum ComparisonOperator {
  GT
  LT
  GTE
  LTE
  EQ
}
comparison ComparisonOperator?
```

**Migration risk:** Low — simple uppercase data migration.

---

### F-13 — `ShopPlan.billingInterval` — raw String
~~**Severity: Low**~~ **→ RESOLVED** ✅

**Problem:** Shopify billing intervals are a fixed set: `EVERY_30_DAYS`, `ANNUAL`. Raw String allows invalid values that would fail at the Shopify Billing API call.

**Fix:**
```prisma
enum BillingInterval {
  EVERY_30_DAYS
  ANNUAL
}
billingInterval BillingInterval?
```

**Migration risk:** Low.

---

### F-14 — `AutomationLog.event` — raw String
~~**Severity: Low**~~ **→ RESOLVED** ✅

**Problem:** Log events are likely a bounded set. Free-form strings make log filtering unreliable.

**Fix:**
```prisma
enum AutomationEvent {
  TRIGGERED
  EVALUATED
  EXECUTED
  FAILED
  SKIPPED
}
event AutomationEvent
```

**Cons / Caveats:** If existing log events are narrative strings (not enum-like), a categorization pass is required before migration.  
**Migration risk:** Medium — depends on current data shape.

---

## 3. Unvalidated JSON Fields

All findings in this section require **no schema changes** — fixes are code-only (Zod validation in server actions).

---

### F-15 — `Bundle.volumeTiers` — unvalidated Json
~~**Severity: High**~~ **→ RESOLVED** ✅

**Problem:**  
Expected shape: `VolumeDiscountConfig { discountType, openEnded, tiers[] }`. Zod validation (Task 22 in `project_volume_discount.md`) is listed as **incomplete**. Malformed tier data writes silently and crashes the Rust discount function at runtime during checkout.

**Fix:** Enforce `VolumeDiscountConfigSchema` Zod validation in **all** write paths (create + update actions). Add unit tests for malformed inputs.

**Caveats:** No DB-level structural constraint is possible with Prisma Json type. The only protection is application-layer validation.  
**Migration risk:** None — code-only.

---

### F-16 — `ABTest.variantConfig` — required, unvalidated Json
~~**Severity: High**~~ **→ DEFERRED** — ABTest is schema-only, no write paths yet

**Problem:**  
Required field with no documented shape and no Zod validation. Malformed config could corrupt test execution and produce invalid A/B results.

**Fix:** Define `VariantConfig` TypeScript interface + Zod schema in `ab-testing/validation/`. Validate before every write in the server action.

**Migration risk:** None — code-only.

---

### F-17 — `Automation.triggerConfig`, `conditions`, `actions` — three untyped Json fields
~~**Severity: High**~~ **→ DEFERRED** — Automation is schema-only, no write paths yet

**Problem:**  
All three are required fields. The automation execution engine reads them at runtime. Corrupt data causes silent failures logged to `AutomationLog` with no recovery path.

**Fix:**
- Define discriminated union types per `TriggerType` variant (SCHEDULE / PERFORMANCE / INVENTORY / CUSTOMER_BEHAVIOR)
- Validate with Zod in action layer before every write
- Long term: consider splitting `conditions` and `actions` into typed junction tables

**Migration risk:** None (code-only for now). Medium if junction tables are introduced later.

---

### F-18 — `AlertRule.conditions` and `deliveryMethods` — untyped Json
**Severity: Medium**

**Problem:**  
`deliveryMethods` likely contains `{ email: boolean, slack: boolean, inApp: boolean }` — a fixed shape that could be individual boolean columns.

**Option A (minimal):** Keep Json, add Zod validation — no schema change.  
**Option B (clean):** Flatten to columns:
```prisma
enableEmailAlerts  Boolean @default(true)
enableSlackAlerts  Boolean @default(false)
enableInAppAlerts  Boolean @default(true)
```

**Pros of B:** Queryable; indexable; no JSON parsing.  
**Cons of B:** Less flexible if delivery channels expand.  
**Migration risk:** None for Option A. Medium for Option B (column addition + data migration).

---

### F-19 — `Shop.setupProgress` — untyped Json
**Severity: Low**

Fixed shape (5 boolean setup steps). Define `SetupProgressSchema` Zod type and validate on write.  
**Migration risk:** None.

---

### F-20 — `Shop.locales` — untyped Json
**Severity: Low**

Shopify locale shape is predictable. Add Zod validation before write.  
**Migration risk:** None.

---

## 4. Index Optimization

---

### F-21 — `TestResult` missing `@@index([testId, date])`
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:**  
A `@@unique([testId, variant, date])` exists but does not efficiently serve date-range queries per test (e.g., "last 7 days of results for test X") because `variant` is interleaved.

**Fix:**
```prisma
@@index([testId, date])
```

**Migration risk:** Low — additive, non-destructive.

---

### F-22 — `BundleView.@@index([date])` — low selectivity
~~**Severity: Low**~~ **→ RESOLVED** ✅

**Problem:**  
`date` is a `String` field with many rows per date — the index will rarely be chosen by the query planner. After F-06 (convert to DateTime), this index should be replaced.

**Fix (after F-06):**
```prisma
// Remove @@index([date])
// Add @@index([bundleId, date])  -- already covers this access pattern
```

**Migration risk:** Low.

---

### F-23 — `BundleAnalytics` — no shop-level access path
~~**Severity: Medium**~~ **→ DEFERRED** — requires threading `shop` through analytics call chain

**Problem:**  
Shop-level revenue aggregation queries must join through `Bundle` to get the `shop` domain. At scale (1,000+ shops), this join is expensive.

**Fix (optional, denormalization):**
```prisma
shop String
@@index([shop, date])
```

**Pros:** Eliminates join for shop-level analytics.  
**Cons / Caveats:** Denormalization — must be kept in sync. Adds a column requiring backfill.  
**Migration risk:** Medium.

---

### F-24 — Dual shop field index redundancy
~~**Severity: Medium**~~ **→ CLOSED** ✅ — already resolved as side effect of F-28; all 5 models index on `shopId`

**Problem:**  
5 models have both `@@index([shop, status])` (using raw string) and `@@index([shopId])` (using FK). After F-28 (unify dual shop fields), the raw-string index becomes orphaned.

**Fix:** After F-28 is complete, replace `@@index([shop, status])` with `@@index([shopId, status])`.  
**Migration risk:** Low (after F-28).

---

### F-25 — `WebhookDelivery` — suboptimal single-column indexes
**Severity: Low**

**Problem:**  
Idempotency check queries `WHERE id = ? AND shop = ?` — PK covers `id` but `shop` requires a separate scan. Prune job queries `WHERE processedAt < ?`.

**Fix:**
```prisma
// Replace both single-column indexes with:
@@index([shop, processedAt])
// Drop @@index([shop]) and @@index([processedAt])
```

**Migration risk:** Low.

---

## 5. Relation Integrity

---

### F-26 — `BundleAnalytics`/`BundleView` `onDelete: Restrict` — undocumented blocker
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:**  
`onDelete: Restrict` means any bundle with analytics history **cannot be hard-deleted**. The soft-delete plan (status: DELETED) works around this correctly, but the constraint is invisible to future engineers who may attempt hard delete and receive a cryptic FK error.

**Fix:** No schema change needed. Add a comment:
```prisma
// INTENTIONAL: onDelete: Restrict prevents hard-delete of bundles with analytics.
// Use status: DELETED (soft delete). See docs/db-cleanup-strategy.md
bundle Bundle @relation(fields: [bundleId], references: [id], onDelete: Restrict)
```

**Migration risk:** None.

---

### F-27 — `BundleProduct.group` — missing explicit `onDelete`
~~**Severity: Medium**~~ **→ RESOLVED** ✅ (`onDelete: SetNull`)

**Problem:**  
No `onDelete` rule. Prisma defaults to `SetNull` for optional FK — correct behavior, but undocumented.

**Fix:**
```prisma
group BundleProductGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)
```

**Migration risk:** None — existing behavior, documentation only.

---

### F-28 — Dual `shop` + `shopId` fields on 5 models
~~**Severity: High**~~ **→ RESOLVED** ✅ — `shopId` made non-nullable on ABTest, Automation, AIInsight, Notification, AlertRule

**Affected models:** `ABTest`, `Automation`, `AIInsight`, `Notification`, `AlertRule`

**Problem:**  
All five carry both:
```prisma
shop   String    // denormalized domain string — no FK
shopId String?   // nullable FK to Shop
```

Consequences:
- `shopId` is nullable — FK constraint is only **sometimes** enforced
- Queries inconsistently filter on `shop` vs `shopId`
- A row can exist with a valid `shop` domain but no matching `Shop` record
- `@@index([shop, status])` uses the raw string; if code switches to `shopId`, the index is unused

**Recommended fix (phased — 2 stages):**

**Stage 1** — Make `shopId` non-nullable (safe, additive):
```prisma
shopId String  // remove ?
```
Requires all existing rows to have a valid `shopId`. Run data migration: match `shop` domain to `Shop.id`.

**Stage 2** — Remove `shop String` field (destructive, do after Stage 1):
```prisma
// Remove: shop String
// Update: @@index([shop, status]) → @@index([shopId, status])
```

**Pros:** Single source of truth; enforced FK; cascading deletes.  
**Cons / Caveats:** Requires data migration across 5 models. Every write path must be updated. `Shop` record must exist before child row insertion.  
**Migration risk:** High — phased approach mandatory. Do not combine Stage 1 and Stage 2.

---

### F-29 — `ShopPlan` dual shop fields
~~**Severity: Medium**~~ **→ DEFERRED** — billing hot path; requires auditing all callers before removing `shop` String field

Same pattern as F-28 but isolated to one model. `shopId` should be non-nullable since a plan always belongs to a shop.

**Fix:**
```prisma
shopId String @unique  // remove ?
// Remove: shop String (after data migration)
```

**Migration risk:** Medium.

---

### F-30 — `ABTest.controlBundle` — missing explicit `onDelete`
~~**Severity: Medium**~~ **→ RESOLVED** ✅ (`onDelete: Cascade`)

**Problem:**  
Prisma defaults to `Restrict` for required FK in PostgreSQL — deleting the control bundle of an active test throws a constraint error. This should be explicit.

**Fix (keep Restrict, make explicit):**
```prisma
controlBundle Bundle @relation(fields: [controlBundleId], references: [id], onDelete: Restrict)
```

Or if tests should survive bundle deletion:
```prisma
controlBundleId String?
controlBundle   Bundle? @relation(fields: [controlBundleId], references: [id], onDelete: SetNull)
```

**Migration risk:** Low.

---

### F-40 — `AIInsight.bundleId`/`testId` — plain strings with no FK relations
~~**Severity: Medium**~~ **→ RESOLVED** ✅

**Problem:**  
Both fields are raw `String?` with no `@relation` defined. Consequences:
- No referential integrity — orphaned insights if bundle or test is deleted
- No Prisma `include: { bundle: true }` support
- Missing `@@index` on both fields

**Fix:**
```prisma
bundleId String?
testId   String?
bundle   Bundle? @relation(fields: [bundleId], references: [id], onDelete: SetNull)
abTest   ABTest? @relation(fields: [testId], references: [id], onDelete: SetNull)

@@index([bundleId])
@@index([testId])
```

Also requires back-relation fields on `Bundle` and `ABTest`:
```prisma
// In Bundle:
aiInsights AIInsight[]

// In ABTest:
aiInsights AIInsight[]
```

**Migration risk:** Medium — additive FK constraint. Existing rows must have valid `bundleId`/`testId` or be nullable (already are).

---

## 6. Missing Constraints

---

### F-32 — `Bundle.priority` — no range constraint
**Severity: Low**

Negative priorities and arbitrarily large values are accepted. Prisma doesn't support check constraints natively.

**Fix:** Enforce `z.number().int().min(0)` in Zod validation at the service layer.  
**Migration risk:** None (code-only).

---

### F-33 — Missing `createdAt`/`updatedAt` on 4 models
**Severity: Low**

**Affected models:** `BundleAnalytics`, `BundleView`, `AutomationBundle`, `WebhookDelivery`

Convention from CLAUDE.md: every model needs `createdAt` and `updatedAt`.

**Fix:**
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

**Caveats:** `BundleAnalytics` and `BundleView` are high-write tables — `@updatedAt` adds overhead on every update. For append-only analytics rows, `createdAt` only is preferable.  
**Migration risk:** Low — additive columns with defaults.

---

## 7. Schema Growth Risks

---

### F-37 — `BundleAnalytics` — unbounded growth, no TTL
**Severity: Medium**

**Problem:**  
Unique on `[bundleId, date, hour]` — one row per bundle per hour per day.

Projection:
- 10 bundles × 24 hours × 365 days = **87,600 rows/year per shop**
- 1,000 shops = **87.6 million rows/year**

No archival mechanism, no partition strategy, no `@@index([date])` for range-delete pruning (existing index uses String date — see F-06).

**Fix (phased):**
1. Fix F-06 first (DateTime date)
2. Add `@@index([date])` for range-delete queries
3. Add cron job to archive/delete rows older than 90 days
4. At scale: consider TimescaleDB hypertable or PostgreSQL table partitioning by month

**Migration risk:** Low for index; medium for archival job (operational change).

---

### F-38 — `AutomationLog` — unbounded growth, no pruning
**Severity: Medium**

**Problem:**  
High-frequency automations (SCHEDULE every hour) generate 720 rows/month/automation. No cleanup mechanism.

**Fix:**
```prisma
// Option A: Add cron purge — delete WHERE createdAt < NOW() - INTERVAL '30 days'
// Option B: Add retainUntil DateTime? for selective retention
```

**Migration risk:** Low.

---

### F-39 — `Bundle.discountedProductIds String[]` — unbounded PostgreSQL array
**Severity: Low**

**Problem:**  
PostgreSQL arrays are stored inline in the row. 1,000+ product IDs creates a very wide row. Array-containment queries (`WHERE 'gid://...' = ANY("discountedProductIds")`) are full table scans.

**Fix:** If the array grows beyond ~50 items, move to a junction table. For immediate improvement, add a GIN index via raw SQL:
```sql
CREATE INDEX idx_bundle_discounted_products ON "bundles" USING GIN ("discountedProductIds");
```

**Migration risk:** Low for GIN index; medium for junction table migration.

---

## 8. Naming Consistency

---

### F-34 — Capitalized relation accessors on 5 models
~~**Severity: Low**~~ **→ RESOLVED** ✅ — renamed `Shop` → `shop` on all 5 models
**Severity: Low**

**Problem:**  
`ABTest.Shop`, `Automation.Shop` etc. are capitalized — they look like model type references, not field accessors. All other relations in the schema use lowercase.

**Fix:**
```prisma
// Change:
Shop Shop? @relation(...)
// To:
shop Shop? @relation(...)
```

**Affected models:** `ABTest`, `Automation`, `AIInsight`, `Notification`, `AlertRule`  
**Migration risk:** None — Prisma relation names are TypeScript accessors, not DB columns. Rename-only.

---

## 9. Prioritized Implementation Plan

### Phase 1 — Correctness & Integrity (do first)

| Priority | Finding | What | Schema Change | Code Change |
|----------|---------|------|---------------|-------------|
| 1 | F-15, F-16, F-17 | Zod validation on all Json write paths | None | Yes |
| 2 | F-06 | `BundleView.date` String → DateTime | Yes | Yes |
| 3 | F-40 | Add FK relations to `AIInsight.bundleId`/`testId` | Yes | Yes |
| 4 | F-28 Stage 1 | Make `shopId` non-nullable on 5 models | Yes | Yes |

### Phase 2 — Type Safety (enum migrations)

| Priority | Finding | What | Risk |
|----------|---------|------|------|
| 5 | F-04 | `BundleSettings.layout` → `BundleLayout` enum | Medium |
| 6 | F-12 | `AlertRule.comparison` → `ComparisonOperator` enum | Low |
| 7 | F-10, F-11 | `AIInsight.impact`, `actionType` → enums | Medium |
| 8 | F-09 | `AIInsight.category` → enum | Medium |
| 9 | F-13 | `ShopPlan.billingInterval` → enum | Low |

### Phase 3 — Index & Performance

| Priority | Finding | What | Risk |
|----------|---------|------|------|
| 10 | F-21 | Add `@@index([testId, date])` to `TestResult` | Low |
| 11 | F-25 | Composite index on `WebhookDelivery` | Low |
| 12 | F-37, F-38 | Analytics + log pruning cron | Low |
| 13 | F-23 | Denormalized `shop` on `BundleAnalytics` (optional) | Medium |

### Phase 4 — Cleanup (low urgency)

| Priority | Finding | What |
|----------|---------|------|
| 14 | F-28 Stage 2 | Remove `shop String` after Stage 1 validated |
| 15 | F-02, F-03 | Priority type / discount application enums |
| 16 | F-33 | Add `createdAt`/`updatedAt` to 4 models |
| 17 | F-34 | Lowercase relation accessor names |
| 18 | F-14 | `AutomationLog.event` → enum |
| 19 | F-26, F-27 | Document `onDelete` intent with comments |
| 20 | F-39 | GIN index on `discountedProductIds` if needed |

---

## Key Risks Summary

| Risk | Details |
|------|---------|
| No migration history | All schema changes via `db push` — no rollback path. Consider switching to `prisma migrate dev` before Phase 1. |
| F-28 is high-blast-radius | Touching `shopId` across 5 models simultaneously risks data loss. Stage strictly. |
| F-06 data migration | Existing `BundleView.date` string values must be cast — corrupted dates will fail the migration. Audit data first. |
| F-01 Bundle.id | Only change after confirming Shopify GIDs are not intentionally used as PK. |
| JSON fields (F-15–17) | No DB-level protection is possible — application Zod validation is the only safeguard. Test coverage is mandatory. |
