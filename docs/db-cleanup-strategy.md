# DB & Codebase Cleanup Strategy
> Pre-submission cleanup — remove all unimplemented, stub, and disconnected code

---

## Decision Points (answer before executing)

See bottom of this file for open questions.

---

## Scope Summary

| Layer | Action | Scope |
|---|---|---|
| Prisma schema | Drop 10 unused models | ABTest, TestResult, Automation, AutomationBundle, AutomationLog, PricingRule, PricingRuleBundle, AIInsight, Notification, AlertRule |
| Prisma schema | Remove 8+ unused Bundle fields | aiOptimized, aiScore, marketingCopy, seoTitle, seoDescription, usesPerOrderLimit, volumeTiers, allowMixAndMatch, mixAndMatchPrice, discountedProductIds |
| Prisma enums | Drop 12 unused enums | TestType, TestStatus, AutomationStatus, TriggerType, PricingStatus, AIInsightType, TemplateDifficulty, NotificationType, NotificationPriority, AlertRuleStatus, AlertFrequency, QUANTITY_BREAKS |
| Prisma enums | Trim BundleType enum | Remove VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER |
| Prisma enums | Trim BundleStatus enum | Remove DELETED (soft delete plan deferred) — **decision needed** |
| Features | Delete 5 stub/empty features | ab-testing, automation, customers, products, templates |
| Features | Trim notification | Delete all notification code |
| Features | Trim pricing | Delete entirely or gut to static page |
| App routes | Remove stub routes | /ab-testing page |
| DB migration | Drop 10 tables + columns | Via `prisma migrate dev` |

---

## Phase 1 — Prisma Schema (Models)

### 1.1 Models to DROP entirely

All 10 have zero business logic — no services, actions, repositories, or UI.

| Model | Tables Dropped | Cascade |
|---|---|---|
| `ABTest` | `ab_tests` | TestResult (cascade) |
| `TestResult` | `test_results` | — |
| `Automation` | `automations` | AutomationLog, AutomationBundle (cascade) |
| `AutomationBundle` | `automation_bundles` | — |
| `AutomationLog` | `automation_logs` | — |
| `PricingRule` | `pricing_rules` | PricingRuleBundle (cascade) |
| `PricingRuleBundle` | `pricing_rule_bundles` | — |
| `AIInsight` | `ai_insights` | — |
| `Notification` | `notifications` | — |
| `AlertRule` | `alert_rules` | — |

**Also remove**: Template + TemplateReview (6 type refs only, no CRUD)
**Decision needed**: Template model — see Q4 below.

---

### 1.2 Bundle Fields to REMOVE

| Field | Current State | Safe to Drop? |
|---|---|---|
| `aiOptimized` | Always false | ✓ Yes |
| `aiScore` | Always null | ✓ Yes |
| `marketingCopy` | Never written | ✓ Yes |
| `seoTitle` | Never written | ✓ Yes |
| `seoDescription` | Never written | ✓ Yes |
| `usesPerOrderLimit` | Set to undefined in getters | ✓ Yes |
| `volumeTiers` | Never used | ✓ Yes — if VOLUME_DISCOUNT dropped |
| `allowMixAndMatch` | Always false | ✓ Yes — if MIX_AND_MATCH dropped |
| `mixAndMatchPrice` | Always null | ✓ Yes — if MIX_AND_MATCH dropped |
| `discountedProductIds` | Set but never read | ✓ Yes |
| `deletedAt` | Unused (soft delete deferred) | **Decision needed** |
| `startDate / endDate` | Used for SCHEDULED status | ⚠ Keep if SCHEDULED status kept |

---

### 1.3 Shop Fields to AUDIT

| Field | Usage |
|---|---|
| `setupGuideDismissed` | Used in setup guide — keep |
| `setupProgress` | Used in setup guide — keep |
| `firstBundleCreated` | Used in setup guide — keep |
| `widgetCustomized` | Used in setup guide — keep |
| `storefrontPreviewed` | Used in setup guide — keep |
| `analyticsViewed` | Used in setup guide — keep |

---

## Phase 2 — Prisma Schema (Enums)

### 2.1 Enums to DROP entirely

| Enum | Reason |
|---|---|
| `TestType` | ABTest dropped |
| `TestStatus` | ABTest dropped |
| `AutomationStatus` | Automation dropped |
| `TriggerType` | Automation dropped |
| `PricingStatus` | PricingRule dropped |
| `AIInsightType` | AIInsight dropped |
| `TemplateDifficulty` | Template dropped (if Q4 = yes) |
| `NotificationType` | Notification dropped |
| `NotificationPriority` | Notification dropped |
| `AlertRuleStatus` | AlertRule dropped |
| `AlertFrequency` | AlertRule dropped |

### 2.2 Enums to TRIM

| Enum | Values to Remove | Remaining |
|---|---|---|
| `BundleType` | VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER | FIXED_BUNDLE, BUY_X_GET_Y, BOGO |
| `DiscountType` | QUANTITY_BREAKS | PERCENTAGE, FIXED_AMOUNT, CUSTOM_PRICE, NO_DISCOUNT, BUY_X_GET_Y |
| `BundleStatus` | DELETED | DRAFT, ACTIVE, PAUSED, ARCHIVED, SCHEDULED |
| `BundleProductRole` | GROUP_OPTION | TRIGGER, REWARD, INCLUDED, OPTIONAL |

> ⚠ **GROUP_OPTION** is used by MIX_AND_MATCH bundle type — safe to remove only if MIX_AND_MATCH is removed.
> ⚠ **SCHEDULED** status — keep if startDate/endDate logic is kept. **Decision needed.**

---

## Phase 3 — Feature Code

### 3.1 Feature Directories to DELETE entirely

| Directory | Files | Why |
|---|---|---|
| `/web/features/ab-testing/` | 1 type file | Zero UI, zero logic |
| `/web/features/automation/` | 1 type file | Zero UI, zero logic |
| `/web/features/customers/` | Empty index.ts | Zero content |
| `/web/features/products/` | Empty index.ts | Zero content |
| `/web/features/templates/` | Empty index.ts | Zero content |
| `/web/features/notification/` | Types only | Zero UI, zero logic |

### 3.2 Feature Directories to TRIM

| Directory | What to Remove | What to Keep |
|---|---|---|
| `/web/features/pricing/` | Everything if dynamic pricing not needed | Nothing — or keep static pricing page UI only |
| `/web/features/bundles/types/` | VOLUME_DISCOUNT, MIX_AND_MATCH, FBT type guards + constants | Core bundle types |
| `/web/features/bundles/constants/` | `comingSoon` flags for removed types | Active type configs |
| `/web/features/settings/stores/` | `// TODO: Implement sync logic` comment | Actual implementation |

---

## Phase 4 — App Routes

### 4.1 Routes to REMOVE

| Route File | Action |
|---|---|
| `/web/app/ab-testing/page.tsx` | Delete file + directory |

### 4.2 Navigation to CLEAN

Check navigation config files for links to removed routes:

- `/web/shared/constants/routes.constants.ts` — remove AB_TESTING route
- `/web/shared/components/navigation/` — remove nav items for dropped features
- Any sidebar/navbar component referencing ab-testing, automation

---

## Phase 5 — Type Files

### 5.1 Type files to DELETE

| File | Reason |
|---|---|
| `/web/features/ab-testing/types/testing.types.ts` | Feature dropped |
| `/web/features/automation/types/automation.types.ts` | Feature dropped |
| `/web/features/notification/types/` | Feature dropped |

### 5.2 Bundle type constants to CLEAN

| File | Remove |
|---|---|
| `bundle-types.constants.ts` | VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER entries |
| Any `comingSoon` flag logic | Dead code once removed types are gone |

---

## Phase 6 — Database Migration

### Steps

```bash
# 1. Edit schema.prisma (remove models, enums, fields)
# 2. Run migration
cd web && bun run prisma:migrate cleanup_remove_unused_models

# 3. Verify
bun run prisma:studio

# 4. Type check
npx tsc --noEmit

# 5. Build check (if env available)
bun run build
```

### Migration will DROP these tables

```sql
-- Confirmed drops
DROP TABLE ab_tests;
DROP TABLE test_results;
DROP TABLE automations;
DROP TABLE automation_bundles;
DROP TABLE automation_logs;
DROP TABLE pricing_rules;
DROP TABLE pricing_rule_bundles;
DROP TABLE ai_insights;
DROP TABLE notifications;
DROP TABLE alert_rules;

-- Column drops from bundles table
ALTER TABLE bundles DROP COLUMN ai_optimized;
ALTER TABLE bundles DROP COLUMN ai_score;
ALTER TABLE bundles DROP COLUMN marketing_copy;
ALTER TABLE bundles DROP COLUMN seo_title;
ALTER TABLE bundles DROP COLUMN seo_description;
ALTER TABLE bundles DROP COLUMN uses_per_order_limit;
ALTER TABLE bundles DROP COLUMN volume_tiers;
ALTER TABLE bundles DROP COLUMN allow_mix_and_match;
ALTER TABLE bundles DROP COLUMN mix_and_match_price;
ALTER TABLE bundles DROP COLUMN discounted_product_ids;
-- (deletedAt — decision needed)
```

---

## Execution Order

```
1. Answer all open questions below
2. Edit schema.prisma (models → enums → fields)
3. Run migration → verify DB state
4. Delete feature directories (ab-testing, automation, customers, products, templates, notification)
5. Trim features (pricing, bundles constants)
6. Remove app routes (/ab-testing)
7. Clean navigation references
8. Remove type files
9. Run tsc --noEmit → fix all type errors
10. Run full test suite
11. Build check
```

---

## Open Questions

Before executing, please answer:

**Q1 — Soft delete (`DELETED` status + `deletedAt` field)**
The DELETED BundleStatus enum value and `deletedAt` field were added for a planned soft-delete feature that was never implemented. Hard deletes are currently used.
→ **Drop both** (simpler) or **keep** (plan to implement before submission)?

**Q2 — SCHEDULED bundle status**
`BundleStatus.SCHEDULED` exists with `startDate`/`endDate` fields. Is scheduling logic actually implemented and used, or is it schema-only?
→ **Keep SCHEDULED + date fields** or **drop them**?

**Q3 — Pricing page**
The pricing page (`/pricing`) shows static plan cards (no real billing logic). Options:
- A) Delete the pricing feature entirely
- B) Keep the static UI as a plans/upgrade page
- C) Connect it to real Shopify billing before submission

**Q4 — Template model**
`Template` + `TemplateReview` have 6 type references but zero CRUD UI. Options:
- A) Drop both models entirely
- B) Keep in schema as future scaffolding (but creates dead DB tables)

**Q5 — Unimplemented bundle types in navigation**
VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER — currently their `comingSoon` flag is `false` but no UI exists. Options:
- A) Remove from BundleType enum entirely (cleanest, but breaking if any bundles of these types exist in DB)
- B) Keep enum values but remove from UI/creation flow
- C) Mark `comingSoon: true` and show disabled in UI

**Q6 — BXGY DiscountType**
`DiscountType.BUY_X_GET_Y` is used by the BXGY bundle type. Keep it.
`DiscountType.QUANTITY_BREAKS` — is this used anywhere, or safe to drop?

**Q7 — Navigation items**
Are ab-testing or automation currently visible in the sidebar/navbar to end users? Should they disappear silently or show a redirect?
