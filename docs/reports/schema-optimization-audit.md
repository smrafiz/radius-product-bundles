# Schema Optimization Audit

**Date:** 2026-03-09
**Schema:** `prisma/schema.prisma.clean`
**Sources:** Prisma docs, Shopify Dev MCP (Admin GraphQL API), Neon serverless best practices, sequential analysis

---

## Critical (must fix for production)

### 1. `Float` → `Decimal` for monetary fields

Prisma docs recommend `Decimal @db.Decimal(10, 2)` for money. `Float` causes IEEE 754 precision errors (e.g., `0.1 + 0.2 ≠ 0.3`).

**Shopify standard confirms this:** Shopify's Admin GraphQL API uses `Decimal!` for `MoneyV2.amount` (monetary values) and `Float!` only for `PricingPercentageValue.percentage`. Our schema should follow the same split.

**Applied changes:**

| Model           | Field               | Before   | After                         | Reason                                                    |
| --------------- | ------------------- | -------- | ----------------------------- | --------------------------------------------------------- |
| Bundle          | `discountValue`     | `Float`  | `Decimal @db.Decimal(10, 2)`  | Serves both % and fixed — Decimal is safe for both        |
| Bundle          | `minOrderValue`     | `Float?` | `Decimal? @db.Decimal(10, 2)` | Money                                                     |
| Bundle          | `maxDiscountAmount` | `Float?` | `Decimal? @db.Decimal(10, 2)` | Money                                                     |
| Bundle          | `mixAndMatchPrice`  | `Float?` | `Decimal? @db.Decimal(10, 2)` | Money                                                     |
| Bundle          | `revenue`           | `Float`  | `Decimal @db.Decimal(12, 2)`  | Money (wider for aggregates)                              |
| BundleProduct   | `customPrice`       | `Float?` | `Decimal? @db.Decimal(10, 2)` | Money                                                     |
| BundleProduct   | `discountPercent`   | `Float?` | `Float?`                      | **Kept as Float** — percentage only (matches Shopify API) |
| BundleAnalytics | `bundleRevenue`     | `Float`  | `Decimal @db.Decimal(12, 2)`  | Money                                                     |

### 2. `BundleView.date`: `String` → `DateTime`

Storing dates as strings prevents proper range queries, indexing, and timezone handling.

```prisma
// Before
date String

// After
date DateTime @db.Date
```

**Impact:** Enables `WHERE date BETWEEN` queries, proper sorting, and index utilization.

---

## High Priority

### 3. Redundant dual-key: `Bundle.shop` + `Bundle.shopId`

Bundle has both `shop` (domain string) and `shopId` (optional FK to Shop). All indexes and queries use the `shop` string field — `shopId` is never used in queries.

**Options:**

- **A)** Remove `shopId` and `Shop` relation from Bundle (simpler, matches current usage)
- **B)** Make `shopId` required, drop `shop` string, use relation consistently (more normalized)

**Recommendation:** Option A for initial release — simpler, no migration complexity.

### 4. Missing index: `Session.shop`

Session lookups by shop domain have no index, causing full table scans.

```prisma
// Add to Session model
@@index([shop])
```

### 5. Redundant index: `BundleView @@index([bundleId])`

PostgreSQL automatically creates indexes for unique constraints. The two unique constraints on BundleView both start with `bundleId`:

- `@@unique([bundleId, customerId, date])`
- `@@unique([bundleId, sessionId, date])`

The standalone `@@index([bundleId])` is redundant — remove it.

### 6. Missing index: `BundleProduct.groupId`

Used in joins with `BundleProductGroup` but not indexed. Queries filtering by group will cause table scans.

```prisma
// Add to BundleProduct model
@@index([groupId])
```

---

## Medium Priority

### 7. `BundleSettings` as 1:1 table

After cleanup, BundleSettings only has: `layout`, `title`, `subtitle`, `cartButtonText`, and 8 display booleans. This could be a `Json` field on Bundle to eliminate a join.

**Trade-off:** Separate table = type safety + cleaner schema. Json field = fewer joins + simpler queries. Current approach is acceptable.

### 8. No `@db.VarChar` constraints

String fields have no length limits at the DB level. PostgreSQL handles unlimited text fine, but adding constraints improves DB-level validation.

**Candidates:**

| Field                           | Suggested Constraint |
| ------------------------------- | -------------------- |
| `Bundle.name`                   | `@db.VarChar(255)`   |
| `Bundle.description`            | `@db.Text`           |
| `Bundle.discountApplication`    | `@db.VarChar(50)`    |
| `BundleSettings.title`          | `@db.VarChar(255)`   |
| `BundleSettings.subtitle`       | `@db.VarChar(500)`   |
| `BundleSettings.cartButtonText` | `@db.VarChar(100)`   |
| `Shop.domain`                   | `@db.VarChar(255)`   |
| `Shop.plan`                     | `@db.VarChar(50)`    |

### 9. `cuid()` deprecation

Prisma is deprecating `cuid()` in favor of `cuid2()`. Not urgent but worth updating when convenient.

```prisma
// Current
id String @id @default(cuid())

// Future
id String @id @default(cuid(2))
```

---

## Low Priority

### 10. Dual analytics indexes

BundleAnalytics has both `@@index([bundleId, date])` and `@@index([date, bundleId])`. Both are justified only if the app queries analytics in both directions (by bundle and by date range). Verify query patterns — if only querying by bundle, the second index wastes write performance.

### 11. Partial index for soft delete

Prisma doesn't support partial indexes natively. A raw SQL migration could add a filtered index for non-deleted bundles:

```sql
CREATE INDEX idx_bundles_active ON bundles (shop, status, type)
WHERE "deletedAt" IS NULL;
```

This would improve query performance for the common case (listing non-deleted bundles).

---

## Unused Fields (confirmed via codebase scan)

These fields exist in the clean schema but have zero references in application code:

### Bundle

| Field          | Notes                                              |
| -------------- | -------------------------------------------------- |
| `shopId`       | FK to Shop — all queries use `shop` string instead |
| `priorityType` | Only in test fixtures, no logic                    |

### BundleProduct

| Field             | Notes                 |
| ----------------- | --------------------- |
| `customPrice`     | Never read or written |
| `discountPercent` | Never read or written |
| `isRequired`      | Never read or written |
| `minQuantity`     | Never read or written |
| `maxQuantity`     | Never read or written |

### Enum Values (partially unused)

| Enum                | Unused Values                                   | Notes                 |
| ------------------- | ----------------------------------------------- | --------------------- |
| `BundleProductRole` | `OPTIONAL`                                      | Not actively used     |
| `BundleType`        | `VOLUME_DISCOUNT`, `FREQUENTLY_BOUGHT_TOGETHER` | Marked comingSoon     |
| `DiscountType`      | `CUSTOM_PRICE`, `QUANTITY_BREAKS`               | No logic handles them |
| `ShopStatus`        | `SUSPENDED`, `TRIAL_EXPIRED`, `NOT_CONFIGURED`  | Never referenced      |

---

## Models Removed in Clean Schema

Removed from `schema.prisma` → `schema.prisma.clean` (confirmed unused or schema-only):

| Model               | Reason                                         |
| ------------------- | ---------------------------------------------- |
| `ABTest`            | Schema only — empty "coming soon" page         |
| `TestResult`        | Schema only — depends on ABTest                |
| `Automation`        | Schema only — types only                       |
| `AutomationBundle`  | Junction table — only used in deletion cleanup |
| `AutomationLog`     | Schema only — depends on Automation            |
| `PricingRule`       | Partial — UI is static plan cards              |
| `PricingRuleBundle` | Junction table — only used in deletion cleanup |
| `AIInsight`         | Schema only — placeholder dashboard card       |
| `Template`          | Schema only — empty feature                    |
| `TemplateReview`    | Schema only — depends on Template              |
| `Notification`      | Schema only — type definitions only            |
| `AlertRule`         | Schema only — type definitions only            |

### Fields Removed from Bundle

| Field            | Reason                  |
| ---------------- | ----------------------- |
| `aiOptimized`    | No AI logic exists      |
| `aiScore`        | No AI logic exists      |
| `marketingCopy`  | No copy generator built |
| `seoTitle`       | No SEO generator built  |
| `seoDescription` | No SEO generator built  |

### Fields Removed from BundleSettings

| Field        | Reason                                               |
| ------------ | ---------------------------------------------------- |
| `theme`      | Zero code references (WidgetTheme enum also removed) |
| `widget`     | Zero code references                                 |
| `variant`    | Zero code references                                 |
| `misc`       | Zero code references                                 |
| `responsive` | Zero code references                                 |
| `style`      | Zero code references                                 |

### Enums Removed

`TestType`, `TestStatus`, `AutomationStatus`, `TriggerType`, `PricingStatus`, `AIInsightType`, `TemplateDifficulty`, `NotificationType`, `NotificationPriority`, `AlertRuleStatus`, `AlertFrequency`, `WidgetTheme`

---

## Schema Files

| File                          | Purpose                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `prisma/schema.prisma`        | Active schema (23 models, 16 enums)                     |
| `prisma/schema.prisma.backup` | Exact copy of active schema                             |
| `prisma/schema.prisma.clean`  | Cleaned schema for initial release (11 models, 5 enums) |
