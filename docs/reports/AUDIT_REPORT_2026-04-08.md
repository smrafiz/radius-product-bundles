# Project Audit Report
**Date:** 2026-04-08
**Branch:** subscription
**Scope:** Naming · Patterns · Interfaces · Structure · Rust Security

---

## Summary

| Dimension | Severity | Status |
|---|---|---|
| Naming | Low | 4 findings |
| Patterns | Low | 2 findings |
| Interfaces | Medium | 3 findings |
| Structure | Medium | 5 findings |
| Rust Security | High | 2 HIGH · 7 MEDIUM · 8 LOW |

---

## 1. Naming

### Inconsistencies

**Store/domain naming overlap**
- `web/shared/stores/shop.store.ts` (interface: `Shop`, `ShopStoreState`) vs `web/shared/stores/shop-settings.store.ts` (interface: `ShopSettings`, `ShopSettingsState`) — same domain, two stores with overlapping semantics
- Established pattern: consolidate or rename to make domain boundaries explicit

**Store exported name vs file name**
- `web/features/analytics/stores/bundle-analytics.store.ts` exports `useAllBundlesTableStore` — file name does not reflect exported hook name
- Established pattern: file name should mirror exported hook name

**Repository file naming (dots vs hyphens)**
- `web/features/bundles/repositories/bundle.queries.ts` vs `web/features/bundles/repositories/bundle-validation.queries.ts` — inconsistent separator
- Established pattern: dots (majority usage, e.g. `bundle.queries.ts`, `bundle.mutations.ts`)

**Shared types vs feature types re-export style**
- `web/shared/types/index.ts` re-exports from `"./api"`, `"./state"` (no suffix) while all feature types use `*.types.ts` suffix internally
- Established pattern: use `.types.ts` suffix throughout

### Clean
- camelCase/snake_case — consistent
- Hook `use*` prefix — consistent
- Store `use*Store` suffix — consistent
- Component PascalCase — consistent
- `CONSTANT_CASE` — consistent
- `-action.ts` suffix on server actions — consistent
- `*.test.ts` test file naming — consistent

---

## 2. Patterns

### Inconsistencies

**Error handling: `.catch()` vs `try/catch`**
- `web/features/dashboard/actions/setup-guide.action.ts:28` and `web/features/pricing/api/billing.mutations.ts:28` use `.catch()` instead of `try/catch`
- Established pattern: `try/catch` (94% majority — 122 vs 13 instances)

**Silent `.catch()` swallowing errors**
- `web/features/dashboard/hooks/use-setup-guide.ts:131` — silent catch with no logging or comment explaining intent
- vs `:155` in same file — documented catch with cleanup rationale
- Established pattern: document the reason when intentionally swallowing an error

### Clean
- Async/await — consistent throughout
- Zustand store structure (immer + devtools middleware) — consistent
- React Query mutation factory pattern — consistent
- Logging — `console.error("[functionName]")` with labels, no debug logs in prod
- Server actions — 100% consistent (`"use server"` → `handleSessionToken()` → service → `ApiResponse<T>`)
- Repository/service layer separation — no cross-layer violations

---

## 3. Interfaces

### Inconsistencies

**Type signature mismatch on `createBundleAction`**
- `web/features/bundles/actions/bundle-mutations.action.ts:496` — declares `bundleData: CreateBundleActionInput`
- Callers at `web/features/bundles/hooks/form/use-bundle-submit.ts:301` and `:598` pass `ExtendedBundleFormData`
- The action itself parses against `bundleSchema` which expects `BundleFormData`
- `updateBundleAction` at `:605` correctly uses `BundleFormData`
- Established pattern: use `BundleFormData` as the parameter type

**Incompatible spread on `duplicateBundleAction`**
- `web/features/bundles/actions/bundle-mutations.action.ts:475` — spreads `DuplicateBundleResult { success, data, message }` into `ApiResponse { status, data, message?, errors? }`
- Leaks a `success` property not part of the `ApiResponse` contract
- Established pattern: set `status` explicitly (all other actions in same file: `:129`, `:195`, `:276`)

**Loose `any` type on service result**
- `web/features/bundles/types/service.types.ts:80` — `UpdateBundleStatusResult.bundle: any`
- Accessed at `web/features/bundles/hooks/actions/use-bundle-actions.ts:143` where `.status` is read
- Established pattern: all other service result types are fully typed

### Clean
- Zod schemas → TypeScript types: consistent inference throughout
- `ApiResponse<T>` shape: consistent across all action layers
- Component prop interfaces: match actual component usage
- Hook return types: properly typed
- Zod-to-TypeScript inference (`globalStylesSchema`, `appSettingsSchema`): correct
- Product types alignment (`BundleProduct`, `SelectedItem`): consistent with schema

---

## 4. Structure

### Inconsistencies

**`pricing/` feature — missing barrel `index.ts` in all subdirectories**
- Missing: `pricing/actions/`, `hooks/`, `repositories/`, `services/`, `types/`, `constants/`
- Every other feature (analytics, bundles, settings, dashboard, webhooks) has barrel exports in all subdirectories

**`dashboard/` feature — missing barrel `index.ts` in most subdirectories**
- Missing: `dashboard/actions/`, `constants/`, `repositories/`, `services/`, `stores/`, `utils/`
- Established pattern: all subdirectories export via `index.ts`

**`support/` feature is structurally bare**
- Only has `components/` and `constants/`
- Missing: `actions/`, `api/`, `hooks/`, `repositories/`, `services/`, `stores/`, `types/`
- Established pattern: minimum viable feature includes `types/`, `hooks/`, `constants/`

**`webhooks/` missing `api/` directory**
- No `api/` with queryKeys/queries/mutations
- All other features with server communication have `api/`

**Test file placement split**
- Flat: `web/features/bundles/services/bundle-security.service.test.ts`
- In `__tests__/`: `bundles/services/__tests__/bundle-preflight-quota.test.ts`, `bundles/schema/__tests__/zod.schema.test.ts`, `pricing/hooks/__tests__/use-billing-status.test.ts`
- Established pattern: `__tests__/` subdirectory (majority)

### Clean
- `@/` alias imports — consistent throughout (no relative import drift)
- Complete features (analytics, bundles) — fully consistent directory layout
- `components/index.ts` barrel exports — consistent
- Feature root `index.ts` — consistent across all features

---

## 5. Rust Security

**File:** `extension/extensions/radius-discount-function/src/`

### HIGH

**H-1** `cart_lines_discounts_generate_run.rs:863` — Incomplete zero-guard before division
```rust
let per_unit = subtotal / line_qty as f64;
```
The `if line_qty > 0` guard only covers the `if let Some(qty_map)` branch. A `line_qty = 0` reaching this path produces `f64::INFINITY` or `NaN`, which propagates into Shopify's discount API as an undefined discount value.
**Impact:** Potential infinite/NaN discount sent to checkout.

**H-2** `cart_lines_discounts_generate_run.rs:748` — `continue` instead of `return None` on invalid `expected_qty`
```rust
if *expected_qty <= 0 { continue; }  // skips product, doesn't abort bundle
```
A bundle with one product having `expected_qty = 0` silently skips it. `min_sets` is computed from remaining products only — discount fires even when bundle is not fully satisfied.
**Impact:** Discount applied when bundle requirements are not met.

### MEDIUM

**M-1** `cart_lines_discounts_generate_run.rs:41` — `discount_value: f64` floating-point representation errors
- `10.1` in JSON → `10.100000000000001` in Shopify Decimal API
- Accepted trade-off only if Shopify rounds on ingestion (unverified)

**M-2** `cart_lines_discounts_generate_run.rs:282–289` — `total_reward_qty` computed twice in separate passes
- `safe_mul` overflow (`None`) counted as 0 in second pass while first pass skipped via `continue`
- Consistent by accident; separation is fragile on refactor

**M-3** `cart_delivery_options_discounts_generate_run.rs:254` — Only first delivery group gets free shipping
- Carts with multiple delivery groups (local pickup + shipping) partially discounted
- No comment explaining the single-group choice
**Impact:** Incomplete free-shipping application on multi-group carts.

**M-4** `cart_lines_discounts_generate_run.rs:180–196, 534–550` — Max-discount cap with unclear `applies_to_each_item`
- Cap converts `Percentage` → `FixedAmount` with `applies_to_each_item: None`
- If Shopify defaults to per-line, full capped amount applies to each line item
**Impact:** Potential over-discount on multi-line bundles.

**M-5** `cart_lines_discounts_generate_run.rs:347–353` — BOGO same-product deal count uses `.max()` instead of conservative logic
- With multiple variant lines for same product, picks line with most deals
- Customer could receive more discounts than intended

**M-6** `cart_lines_discounts_generate_run.rs:270–271` — `f64` accumulation for `reward_total`
- NaN propagation possible if Shopify returns malformed `amount().0`
- Not an overflow risk (f64 range is enormous)

**M-7** `cart_lines_discounts_generate_run.rs:890–898` — `FIXED_AMOUNT` non-BXGY scaled by `complete_sets` + `applies_to_each_item: None`
- If Shopify applies per-target-line, discount multiplies by both `complete_sets` and line count
**Impact:** Potential large over-discount on multi-line fixed-amount bundles.

### LOW / INFORMATIONAL

**L-1** `cart_delivery_options_discounts_generate_run.rs:173` — JSON parse errors silently swallowed (no log)
- Line-items function logs the same error; delivery function does not

**L-2** `cart_lines_discounts_generate_run.rs:486–488` — Duplicate `discount_value < 0.0` guard
- Outer guard is dead code for the variant-roles path; inner guard in `build_bxgy_candidate` already covers it

**L-3** `cart_lines_discounts_generate_run.rs:631` — Single-space bundle ID `" "` passes length/empty checks
- Silently finds no match in `active_bundles`, no log emitted

**L-4** `cart_lines_discounts_generate_run.rs:939` — `f64` in format string for PERCENTAGE case
- Produces `"10.000000000001% off"` in discount title for non-round values

**L-5** `safe_mul` (line 22) — Caps the product at 10,000, not individual inputs
- `safe_mul(1, 10001)` = `Some(10001)` passes the guard
- Guard only fires when product exceeds 10,000

**L-6** `cart_lines_discounts_generate_run.rs:117–122` — `#[allow(dead_code)]` on struct suppresses all field warnings
- Makes it harder to spot genuinely unused fields in future

**L-7** `main.rs:2` — `use std::process` / `process::abort()` is dead code in WASM binary

**L-8** `cart_lines_discounts_generate_run.rs:486–488` — See L-2 above (same finding)

### Clean
- No `unsafe` blocks
- No `unwrap()` on user-controlled data
- No `[n]` index access on user-provided collections
- All `serde_json` deserialization errors handled (except L-1)
- Empty cart / missing metafield / inactive bundle — all handled with early returns
- `safe_mul` with `checked_mul` covers all quantity × quantity multiplication paths
- `discount_value < 0.0` guards present on all discount paths
- Bundle ID validation (empty + length > 100) present
- Bundle status `!= "ACTIVE"` guard prevents inactive bundle discounts
- Min order value validated before discount logic
- Unit tests cover `safe_mul` and `is_product_in_bundle` boundary conditions

---

## Recommended Fix Priority

| # | Finding | File | Priority |
|---|---|---|---|
| 1 | Rust H-1: incomplete zero-guard before `per_unit` division | `cart_lines_discounts_generate_run.rs:863` | High |
| 2 | Rust H-2: `continue` instead of `return None` for invalid `expected_qty` | `cart_lines_discounts_generate_run.rs:748` | High |
| 3 | Interface: `createBundleAction` param type mismatch | `bundle-mutations.action.ts:496` | Medium |
| 4 | Interface: `duplicateBundleAction` spreads wrong shape | `bundle-mutations.action.ts:475` | Medium |
| 5 | Interface: `UpdateBundleStatusResult.bundle: any` | `service.types.ts:80` | Medium |
| 6 | Structure: missing `index.ts` barrels in `pricing/` subdirectories | `pricing/*/` | Low |
| 7 | Structure: missing `index.ts` barrels in `dashboard/` subdirectories | `dashboard/*/` | Low |
| 8 | Structure: standardize test placement to `__tests__/` | `bundles/services/` | Low |
| 9 | Rust M-3: clarify/fix single-group free shipping | `cart_delivery_options_discounts_generate_run.rs:254` | Medium |
| 10 | Rust M-7: clarify `applies_to_each_item` behavior for FIXED_AMOUNT | `cart_lines_discounts_generate_run.rs:890` | Medium |
| 11 | Naming: rename `bundle-validation.queries.ts` to use dot separator | `repositories/` | Low |
| 12 | Patterns: replace `.catch()` with `try/catch` in setup-guide and billing | `setup-guide.action.ts`, `billing.mutations.ts` | Low |