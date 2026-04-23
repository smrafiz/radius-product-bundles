# Discount Function Security Audit Report

**Date:** 2026-04-13
**Status:** 8 of 21 findings fixed (S-3, S-4, S-5, S-6, S-8, S-9/M-1, S-12/S-13, S-14)
**Scope:** Rust discount function (all 4 bundle types) + Frontend AJAX manipulation vectors
**Files Audited:**
- `extension/extensions/radius-discount-function/src/main.rs`
- `extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs`
- `extension/extensions/radius-discount-function/src/cart_delivery_options_discounts_generate_run.rs`
- `web/widgets/src/bundle-widget.ts`
- `web/widgets/src/lib/volume-renderer.ts`
- `web/widgets/src/lib/cart-attributes.ts`
- `web/widgets/src/lib/cart.ts`
- `web/app/api/proxy/analytics/route.ts`
- `web/app/api/proxy/products/route.ts`
- `web/lib/shopify/proxy/verify-proxy.ts`
- `extension/extensions/product-bundle-widget/blocks/app-block.liquid`

**Overall Risk:** MEDIUM — Architecture is sound with a well-designed split-trust model; residual gaps exist in edge cases.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Trust Boundary Model](#2-trust-boundary-model)
3. [Per-Bundle-Type Security Trace](#3-per-bundle-type-security-trace)
4. [Findings Summary](#4-findings-summary)
5. [Detailed Findings — Rust Function](#5-detailed-findings--rust-function)
6. [Detailed Findings — Frontend / AJAX](#6-detailed-findings--frontend--ajax)
7. [Verified Secure Areas](#7-verified-secure-areas)
8. [Remediation Priority](#8-remediation-priority)

---

## 1. Architecture Overview

The discount system uses a **split-trust architecture**:

```
Storefront Widget (client) → Cart Attributes (untrusted) → Shopify Checkout
                                                                ↓
                                              Rust WASM Function (server-side)
                                                  ↓                    ↓
                                    Metafields (trusted)     Cart Lines (Shopify GIDs)
                                                  ↓
                                         Discount Targets → Shopify applies discount
```

**Key principle:** The Rust function uses cart attributes only for bundle identification (which bundle ID to look up). All discount parameters — type, value, product membership, roles, quantities, status — come from **metafields** (server-side, admin-scope-only writes).

---

## 2. Trust Boundary Model

| Data Source | Trust Level | Used For | Can Customer Modify? |
|---|---|---|---|
| Metafields (`$app:active_bundles`) | **TRUSTED** | Discount type, value, product lists, roles, quantities, status, volume tiers, free shipping flag | No (requires admin API scope) |
| `line.merchandise()` GIDs | **TRUSTED** | Product identity verification | No (Shopify server-resolved) |
| `_radiusDiscounts` cart attribute | **UNTRUSTED** | Bundle ID lookup, `requiredLineCount`, display metadata | **Yes** (browser console, fetch interceptor) |
| `_bundle_id` line item property | **UNTRUSTED** | Bundle identification on cart line | **Yes** (can be set via Cart API) |
| `_product_ids` line item property | **UNTRUSTED** | Display only (widget rendering) | **Yes** |

---

## 3. Per-Bundle-Type Security Trace

### 3.1 FIXED_BUNDLE

**Flow:**
```
Widget (bundle-widget.ts:1286-1296)
  → Adds products to cart with _bundle_id line item property
  → Writes _radiusDiscounts cart attribute with bundle config
  → Checkout triggers Rust function
  → Rust reads _radiusDiscounts → extracts bundle_id (untrusted, ID only)
  → Looks up bundle_id in metafield HashMap (trusted)
  → Validates each cart line's product GID via is_product_in_bundle()
  → Calculates complete_sets from product_quantities (metafield)
  → Applies discount using metafield discount_type/discount_value
```

**Can a customer get unauthorized discounts?** **No.**
- Discount type and value come from the metafield
- Product membership validated against tamper-proof merchandise GIDs
- `complete_sets` calculation uses metafield `product_quantities`
- Only gap: `required_line_count` comes from cart attribute (see finding M-1), but `product_quantities` validation is the primary gate

**Can a customer discount non-bundle products?** **No.**
- `is_product_in_bundle()` (line 75-107) checks the product's GID against the metafield's `product_quantities` and `product_variant_ids` maps
- GIDs come from `line.merchandise()` which is Shopify-provided, not client-supplied

**Can NO_DISCOUNT be bypassed?** **No.**
- `cart_lines_discounts_generate_run.rs:1084` — explicit `"NO_DISCOUNT" => return None`

---

### 3.2 BOGO (Buy One Get One)

**Flow:**
```
Widget (bundle-widget.ts:1283-1296)
  → Adds TRIGGER + REWARD products with _bundle_id property
  → Writes _radiusDiscounts cart attribute
  → Checkout triggers Rust function
  → Rust reads _radiusDiscounts → extracts bundle_id
  → Looks up metafield → reads product_roles or variant_roles (trusted)
  → Classifies cart lines as TRIGGER or REWARD based on metafield roles
  → Calculates deal_count from actual cart quantities vs expected quantities
  → Applies discount ONLY to REWARD lines using metafield discount values
```

**Can a customer promote TRIGGER to REWARD?** **No.**
- Role assignment comes from `product_roles` HashMap in the metafield
- The cart attribute does not carry role information that the Rust function trusts
- Even if a customer modifies `_product_roles` line item property, the Rust function reads roles from the metafield, not from line item properties

**Can a customer get more deals than entitled?** **Partially mitigated.**
- Deal count is calculated from `cart_qty / items_per_deal` where `items_per_deal = buy_qty + get_qty` (both from metafield)
- However, the same-product path has a divergence between `deal_count` (computed via `max()`) and `qty_to_discount` (computed per-line) — see finding S-2
- This is a correctness issue, not a customer-exploitable vulnerability

**Can NO_DISCOUNT be bypassed?** **No.**
- `cart_lines_discounts_generate_run.rs:333` — explicit `"NO_DISCOUNT" => return None`

---

### 3.3 BXGY (Buy X Get Y)

**Flow:**
```
Widget (bundle-widget.ts:1283-1296)
  → Same as BOGO but with flexible quantities (buy X, get Y)
  → Writes _radiusDiscounts with BXGY config
  → Checkout triggers Rust function
  → Rust reads metafield → classifies lines via product_roles or variant_roles
  → Calculates deal_count: min(trigger_qty / buy_qty, reward_qty / get_qty)
  → For same-product mode: uses set equality to detect, then max() per line
  → Applies discount to REWARD lines only
```

**Can a customer manipulate quantities to get extra deals?** **No.**
- `buy_qty` and `get_qty` come from the metafield
- Deal count is constrained by actual cart quantities divided by metafield-defined expected quantities
- The min() across trigger and reward ensures both sides must be satisfied

**Same security properties as BOGO** — roles from metafield, GIDs from Shopify, discount values from metafield.

**Can NO_DISCOUNT be bypassed?** **No.**
- `cart_lines_discounts_generate_run.rs:685` — explicit `"NO_DISCOUNT" => return None`

---

### 3.4 VOLUME_DISCOUNT

**Flow:**
```
Widget (volume-renderer.ts:685-693, 1030-1041, 1279-1290)
  → Customer selects quantity via slider, calculator, or tier list
  → Widget writes _radiusDiscounts with selected tier discount info
  → NOTE: The tier discount in cart attribute is IGNORED by Rust
  → Checkout triggers Rust function
  → Rust reads _radiusDiscounts → extracts bundle_id
  → Reads volume_tiers from metafield (trusted)
  → Aggregates actual cart quantity per product from cart lines
  → Finds matching tier based on actual quantity vs metafield tier thresholds
  → Applies per-unit discount from the matched metafield tier
```

**Can a customer get a higher-tier discount by manipulating cart attributes?** **No.**
- The Rust function at `cart_lines_discounts_generate_run.rs:169-279` (`calculate_volume_discount`) reads `volume_tiers` exclusively from the metafield
- Cart attribute `discountValue` is ignored for volume bundles
- Tier matching uses actual cart line quantities (Shopify-provided), not client-reported values

**Can a customer set quantity to 0 and still get a discount?** **No.**
- Tier matching requires `qty >= tier.min_quantity` (from metafield)
- If no tier matches, no discount is applied

**Can NO_DISCOUNT be bypassed?** **No.**
- Volume discount path checks `discount_type` from metafield; if `"NO_DISCOUNT"`, returns `None`

---

## 4. Findings Summary

| ID | Severity | Bundle Types | Title |
|---|---|---|---|
| S-1 | **HIGH** | All | `f64` used for all monetary arithmetic — precision loss |
| S-2 | **HIGH** | BOGO/BXGY | Same-product deal count diverges from qty_to_discount |
| S-3 | **HIGH** | BOGO/BXGY | `total_reward_qty` double-computed with different None handling |
| S-4 | MEDIUM | All (delivery) | No bundle-ID length validation in delivery path |
| S-5 | MEDIUM | VOLUME | Negative quantity cast to u64 wraps to huge number |
| S-6 | MEDIUM | BOGO/BXGY | `items_per_deal` overflow not checked before guard |
| S-7 | MEDIUM | All (shipping) | Free shipping targets only first() delivery group |
| S-8 | MEDIUM | FIXED | `complete_sets = 1` fallback on empty product_quantities |
| S-9 | MEDIUM | FIXED (legacy) | `required_line_count` from untrusted cart attribute |
| S-10 | LOW | All | f64 equality comparisons on monetary thresholds |
| S-11 | LOW | BOGO/BXGY | Duplicate CUSTOM_PRICE logic with subtle divergence |
| S-12 | LOW | All | No upper bound on discount_value (200% percentage possible) |
| S-13 | LOW | VOLUME | Volume tier discount not bounded above for PERCENTAGE |
| S-14 | LOW | All | Unbounded cart_configs vec — potential DoS |
| M-1 | MEDIUM | FIXED (legacy) | requiredLineCount bypass via cart attribute manipulation |
| M-2 | LOW | VOLUME | Cart attribute carries ignored discount metadata |
| M-3 | MEDIUM | All | Liquid JSON uses string interpolation without \| json filter |
| L-1 | LOW | All | Analytics events can be inflated via proxy |
| L-2 | LOW | All | innerHTML usage in cart drawer (safe — Shopify-sourced) |
| L-3 | LOW | All | Widget constructor exposed on window |
| L-4 | LOW | VOLUME | No upper bound on volume quantity input |

---

## 5. Detailed Findings — Rust Function

### S-1 — HIGH | All Bundle Types
#### `f64` used for all monetary arithmetic — precision loss on large amounts

**Location:** `cart_lines_discounts_generate_run.rs` lines 41, 228-229, 299, 308, 321, 650, 659, 671, 1048, 1057, 1069

**Description:**
`MetafieldBundleConfig.discount_value` is `f64`. Every monetary calculation — percentage, fixed amount, custom price, volume tier discount — uses `f64` arithmetic:

```rust
// Volume tier (line 228):
unit_price * (tier.discount / 100.0) * line_qty as f64

// BXGY fixed amount (line 308):
bundle_settings.discount_value * total_reward_qty as f64

// Fixed bundle percentage (line 1048):
bundle_total * bundle_settings.discount_value / 100.0
```

`unit_price` comes from `line.cost().amount_per_quantity().amount().0` — a Decimal wrapper coerced to `f64`. IEEE 754 doubles have 53-bit mantissas, so `0.1 + 0.2 != 0.3` in f64. Percentage calculations on large carts round unpredictably.

**Impact:**
- A $999.99 cart with 33% FIXED_BUNDLE discount could receive ~$0.01 more or less than intended
- For CUSTOM_PRICE, rounding direction determines whether `discount_needed <= 0.0` evaluates to true, potentially suppressing the discount on edge values
- Not customer-exploitable, but causes inconsistent pricing

**Recommendation:** Use integer cents or `rust_decimal::Decimal` for all monetary arithmetic. If staying with f64, round to 2 decimal places before comparison and before returning discount values.

---

### S-2 — HIGH | BOGO / BXGY (same-product path)
#### Same-product deal count uses `max()` — diverges from `qty_to_discount`

**Location:** `cart_lines_discounts_generate_run.rs` lines 504-510, 583

**Description:**
When `is_same_product = true`, deal count is computed as `max()` over per-line values:

```rust
// Line 504-510: Global deal_count
let deal_count: i32 = if is_same_product {
    reward_lines.iter()
        .map(|bl| *bl.line.quantity() / items_per_deal)
        .max()
        .unwrap_or(0)
} else { ... };
```

But `qty_to_discount` for same-product path (line 583) computes independently per line:

```rust
// Line 583: Per-line qty_to_discount
let per_product_deals = *bl.line.quantity() / items_per_deal;
safe_mul(per_product_deals, get_qty)
```

The `deal_count` variable computed above is **never used** in the same-product qty_to_discount path. The two values can diverge, resulting in a different number of items being discounted than the deal count suggests.

**Impact:** Correctness issue. The discount could be slightly more or less generous than intended depending on how the same product is split across cart lines. Not directly customer-exploitable since they can't control Shopify's cart line splitting behavior.

**Recommendation:** Use a single, cart-wide deal count for same-product BOGO/BXGY. Sum all quantities, divide by `items_per_deal`, then distribute `qty_to_discount` across lines.

---

### S-3 — HIGH | BOGO / BXGY (variant_roles path)
#### `total_reward_qty` computed twice with different None fallbacks

**Location:** `cart_lines_discounts_generate_run.rs` lines 419-433 vs 439-445

**Description:**
First loop (builds `targets`):
```rust
// Lines 419-433: If safe_mul returns None → SKIP the line (continue)
let qty_to_discount = std::cmp::min(
    match safe_mul(deal_count, get_qty) { Some(v) => v, None => continue },
    *bl.line.quantity(),
);
```

Second loop (computes `total_reward_qty`):
```rust
// Lines 439-445: If safe_mul returns None → use 0 (not skip)
let total_reward_qty: i32 = reward_lines.iter()
    .map(|bl| std::cmp::min(
        safe_mul(deal_count, get_qty).unwrap_or(0),
        *bl.line.quantity(),
    ))
    .sum();
```

When `safe_mul` overflows, the first loop skips the line (excluded from `targets`), but the second loop includes it as 0. This means `total_reward_qty` could include items not actually in `targets`.

**Impact:** For `FIXED_AMOUNT` with `applies_to_each_item: Some(true)`, the discount amount passed to Shopify via `build_bxgy_candidate` would be calculated using a `total_reward_qty` that doesn't match `targets`. This only triggers on integer overflow (very large quantities), so exploitation requires impractical cart sizes.

**Recommendation:** Compute `total_reward_qty` from the same loop that builds `targets`, or refactor to a single pass that accumulates both.

---

### S-4 — MEDIUM | All Bundle Types (delivery path)
#### No bundle-ID length validation in delivery discount path

**Location:** `cart_delivery_options_discounts_generate_run.rs` (no equivalent of line 789 from cart_lines path)

**Description:**
The line-item discount path validates:
```rust
// cart_lines path, line 789:
if cart_config.bundle_id.is_empty() || cart_config.bundle_id.len() > 100 {
    continue;
}
```

The delivery discount path has **no equivalent check**. A cart attribute with an extremely long bundle_id string wastes function memory/time.

**Impact:** Low — the bundle_id only flows into a `HashMap::get()` lookup (which fails for invalid IDs) and into the response struct. But a 10MB string would consume WASM heap.

**Recommendation:** Add the same length validation to the delivery discount path.

---

### S-5 — MEDIUM | VOLUME_DISCOUNT
#### Negative `i32` quantity cast to `u64` wraps to huge number

**Location:** `cart_lines_discounts_generate_run.rs` lines 196-198, 224

**Description:**
```rust
let qty = *bl.line.quantity() as u64;  // line 198
let line_qty = *bl.line.quantity() as u64;  // line 224
```

`line.quantity()` returns `i32`. If Shopify ever returns `-1` (malformed input), `-1i32 as u64 = 18446744073709551615`. This propagates into:
- `product_qty` HashMap accumulation — overflows sum
- `line_qty as f64` cast — produces `1.844e19` multiplier
- If `max_discount_amount` is unset, an enormous discount value reaches Shopify

**Impact:** Only exploitable if Shopify returns negative quantities, which is not currently possible. Defense-in-depth gap.

**Recommendation:** Add `if qty <= 0 { continue; }` before the `u64` cast, or use `i32` throughout with explicit bounds checking.

---

### S-6 — MEDIUM | BOGO / BXGY
#### `items_per_deal` overflow not checked before guard

**Location:** `cart_lines_discounts_generate_run.rs` lines 376-379

**Description:**
```rust
let items_per_deal = buy_qty + get_qty;
if items_per_deal <= 0 || buy_qty <= 0 || get_qty <= 0 {
    return None;
}
```

`buy_qty` and `get_qty` are `i32`. If both are large (e.g., `i32::MAX/2 + 1`), the sum overflows. In WASM release builds, overflow wraps silently. Depending on the specific values, the result could be positive (benign — produces tiny deal count) or negative (caught by `<= 0` guard).

**Impact:** Only exploitable via compromised metafield values. Not a customer vector.

**Recommendation:** Use `buy_qty.checked_add(get_qty).unwrap_or(return None)`.

---

### S-7 — MEDIUM | All Types (free shipping)
#### Free shipping targets only first() delivery group

**Location:** `cart_delivery_options_discounts_generate_run.rs` line 254

**Description:**
```rust
let first_delivery_group = match input.cart().delivery_groups().first() {
    Some(group) => group,
    None => return Ok(no_discount),
};
```

Shopify carts can have multiple delivery groups (split shipments, mixed in-store + delivery). The function applies 100% shipping discount only to the first group.

**Impact:** Customers with multiple delivery groups pay shipping on subsequent groups despite qualifying for free shipping. This is an under-discount issue (merchant loses value proposition, customer pays more), not an over-discount exploit.

**Recommendation:** Iterate over all delivery groups that contain bundle products.

---

### S-8 — MEDIUM | FIXED_BUNDLE
#### `complete_sets = 1` fallback on empty `product_quantities`

**Location:** `cart_lines_discounts_generate_run.rs` lines 887-889

**Description:**
```rust
let complete_sets: i32 = if let Some(qty_map) = product_quantities {
    if qty_map.is_empty() {
        1  // ← fallback: allows discount even with no products defined
    } else { ... }
```

If a bundle metafield has `product_quantities: {}` (empty object), `complete_sets` defaults to 1. In practice, `bundle_lines` would be empty (no products pass `is_product_in_bundle` with an empty map), so no targets are built. But this is a latent risk — if `is_product_in_bundle` logic changes, discounts could fire on zero-product bundles.

**Impact:** Currently dead code path. Latent risk only.

**Recommendation:** Change fallback to `0` instead of `1`.

---

### S-9 — MEDIUM | FIXED_BUNDLE (legacy bundles)
#### `required_line_count` sourced from untrusted cart attribute

**Location:** `cart_lines_discounts_generate_run.rs` lines 867-870

**Description:**
```rust
if !is_bxgy {
    if let Some(required) = cart_config.required_line_count {
        if bundle_lines.len() < required {
            continue;
        }
    }
}
```

`required_line_count` comes from `CartBundleConfig` (deserialized from `_radiusDiscounts` cart attribute), which is **customer-writable**. A customer could set `requiredLineCount: 0` to bypass the minimum-lines guard.

**Mitigating factor:** The primary validation is `complete_sets` from `product_quantities` (metafield), which independently verifies all required products are present. This check is defense-in-depth for legacy bundles that might lack `product_quantities`.

**Impact:** Only affects bundles without `product_quantities` in their metafield. For bundles with `product_quantities` populated, this check is redundant and the bypass has no effect.

**Recommendation:** Move `required_line_count` to the metafield configuration, or remove the check entirely and ensure all bundles have `product_quantities` populated.

---

### S-10 — LOW | All Types
#### f64 equality comparisons on monetary thresholds

**Location:** `cart_lines_discounts_generate_run.rs` lines 806-809, 1041, 249-251, 264, 292-294

**Description:**
```rust
if min_order > 0.0 && cart_subtotal < min_order { ... }
if bundle_settings.discount_value < 0.0 { ... }
if capped_discount <= 0.0 { return None; }
```

These comparisons are on `f64` values. A cart subtotal that should be exactly $50.00 might compute to $49.99999999999997, bypassing a $50 minimum order threshold.

**Impact:** Edge case — affects merchants with minimum order values. Not intentionally exploitable.

**Recommendation:** Use epsilon-aware comparisons or integer cents.

---

### S-11 — LOW | BOGO / BXGY
#### Duplicate CUSTOM_PRICE logic with subtle divergence

**Location:** `cart_lines_discounts_generate_run.rs` lines 297-334 vs 648-687

**Description:**
`build_bxgy_candidate` (variant_roles path) and the inline block (product_roles path) have near-identical `match discount_type` blocks. For CUSTOM_PRICE:
- `build_bxgy_candidate` (line 318): `deal_count = total_reward_qty` (items, not deals)
- Inline path (line 669): uses actual `deal_count` from outer scope

This means CUSTOM_PRICE bundles via the variant_roles path compute `total_custom_price` using item count instead of deal count.

**Impact:** Under-discount for variant_roles CUSTOM_PRICE bundles (merchant loses intended discount). Not customer-exploitable.

**Recommendation:** Ensure both paths use the same `deal_count` for CUSTOM_PRICE calculation.

---

### S-12 — LOW | All Types
#### No upper bound on `discount_value` for PERCENTAGE type

**Location:** `cart_lines_discounts_generate_run.rs` line 41

**Description:**
A `discount_value` of 200.0 for PERCENTAGE type would produce `2 * bundle_total` as the calculated discount. Only possible via compromised metafield (admin scope required). If `max_discount_amount` is unset, the value reaches Shopify.

**Recommendation:** Add `if discount_value > 100.0 { return None; }` for PERCENTAGE type.

---

### S-13 — LOW | VOLUME_DISCOUNT
#### Volume tier discount not bounded for PERCENTAGE type

**Location:** `cart_lines_discounts_generate_run.rs` lines 220-233

**Description:**
```rust
if tier.discount < 0.0 { continue; }
```

Negative tier discounts are skipped, but `tier.discount = 150.0` for PERCENTAGE would produce `unit_price * 1.5 * qty` — a discount larger than the item price.

**Recommendation:** Add `if discount > 100.0 { continue; }` for PERCENTAGE volume tiers.

---

### S-14 — LOW | All Types
#### Unbounded cart_configs vector — potential DoS

**Location:** `cart_lines_discounts_generate_run.rs` line 743

**Description:**
```rust
let cart_configs: Vec<CartBundleConfig> = serde_json::from_str(cart_attr_value)?;
```

A cart attribute with 10,000 bundle entries causes 10,000 loop iterations, each scanning all cart lines. With Shopify's 250-line cart limit: 2,500,000 operations — potentially exceeding the WASM CPU budget.

**Impact:** Self-DoS only (customer's own checkout slows/fails). No cross-shop impact.

**Recommendation:** Add `if cart_configs.len() > 50 { return Ok(no_discount); }`.

---

## 6. Detailed Findings — Frontend / AJAX

### M-1 — MEDIUM | FIXED_BUNDLE (legacy)
#### Cart attribute manipulation to bypass requiredLineCount

**Location:**
- `web/widgets/src/lib/cart-attributes.ts:34-39` (writes attribute)
- `extension/extensions/radius-discount-function/src/cart_lines_discounts_generate_run.rs:866-870` (reads attribute)

**Description:**
A customer can manipulate `_radiusDiscounts` via browser console:
```javascript
fetch('/cart/update.js', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    attributes: {
      _radiusDiscounts: JSON.stringify([{
        bundleId: "actual-bundle-id",
        requiredLineCount: 1,  // TRUSTED by Rust — should be 3
        // ... other fields (ignored by Rust for discount calc)
      }])
    }
  })
});
```

**Impact:** Only affects legacy bundles without `product_quantities` in metafield. Modern bundles are protected by `complete_sets` validation.

**Recommendation:** Ensure all bundles have `product_quantities` populated. Move `required_line_count` to metafield or remove the check.

---

### M-2 — LOW | VOLUME_DISCOUNT
#### Cart attribute carries discount metadata (defense-in-depth)

**Location:** `web/widgets/src/lib/volume-renderer.ts:685-693, 1030-1041, 1279-1290`

**Description:**
The volume widget writes selected tier discount info (`discountType`, `discountValue`) into `_radiusDiscounts`. The Rust function **ignores** these values for volume bundles, reading `volume_tiers` from the metafield instead.

**Impact:** No current exploit path. Future code that reads these fields from the cart attribute would be vulnerable.

**Recommendation:** Remove discount metadata from the volume cart attribute, or document prominently that these fields are display-only and must never be trusted.

---

### M-3 — MEDIUM | All Types (Liquid template)
#### `bundle_structure_json` uses string interpolation without `| json` filter

**Location:** `extension/extensions/product-bundle-widget/blocks/app-block.liquid:526`

**Description:**
```liquid
{% capture bundle_structure_json %}
  {"id": "{{ bundle_id }}","name": "{{ bundle_heading }}",...}
{% endcapture %}
```

Several fields (`bundle_id`, `discountType`, `discountApplication`) are interpolated without `| escape` or `| json` filter. Values come from metafields (merchant-controlled), so a merchant with `"` in a bundle name could break JSON structure.

**Impact:** Self-XSS only — merchant controls their own data. Could break widget silently for their own customers.

**Recommendation:** Use `| json` filter for the entire structure, or apply `| escape` to all unescaped interpolations.

---

### L-1 — LOW | All Types
#### Analytics events can be inflated via proxy

**Location:**
- `web/widgets/src/bundle-widget.ts:1358-1373`
- `web/app/api/proxy/analytics/route.ts:42-43`

**Description:**
The analytics proxy accepts `bundleId` from the request body without verifying bundle existence.

**Mitigating factors:**
- App Proxy signature verification prevents calls from outside Shopify
- Rate limiting: 100 req/min per shop
- Deduplication: per customer/session/day

---

### L-2 — LOW | All Types
#### `innerHTML` in cart drawer update

**Location:** `web/widgets/src/lib/cart.ts:121`

```typescript
currentCartDrawer.innerHTML = newCartDrawer.innerHTML;
```

**Status:** Safe — content comes from fetching `/cart?section_id=cart-drawer`, a Shopify-served section. Not customer-controllable.

---

### L-3 — LOW | All Types
#### Widget constructor exposed on `window`

**Location:** `web/widgets/src/bundle-widget.ts:1476`

```typescript
(window as any).RadiusBundleWidget = RadiusBundleWidget;
```

**Impact:** An attacker could instantiate `new RadiusBundleWidget(element)`, but this only triggers normal flow (fetch, render). Cannot bypass Rust discount validation.

---

### L-4 — LOW | VOLUME_DISCOUNT
#### No upper bound on volume quantity input (calculator layout)

**Location:** `web/widgets/src/lib/volume-renderer.ts:991`

**Description:** Calculator input uses `Math.max(1, ...)` (lower bound only). Customer could enter 999999.

**Mitigating factors:** `MAX_QUANTITY = 10000` in Rust. Shopify cart limits. Inventory constraints.

---

## 7. Verified Secure Areas

These areas were explicitly checked and found correctly implemented:

1. **Product membership verification** — `is_product_in_bundle()` uses tamper-proof merchandise GIDs from `line.merchandise()`, not client-supplied line item properties.

2. **Discount parameters from metafield** — `discount_type`, `discount_value`, `status`, `max_discount_amount`, `free_shipping`, `volume_tiers`, `product_roles`, `variant_roles`, `product_quantities` all come from the trusted metafield.

3. **NO_DISCOUNT type** — Explicit `return None` in all three discount paths (BXGY line 333/685, Fixed line 1084).

4. **Bundle status check** — `status != "ACTIVE"` guard prevents discounts on DRAFT/PAUSED/ARCHIVED bundles.

5. **Negative discount guard** — `discount_value < 0.0` checked in all major paths.

6. **safe_mul overflow protection** — `MAX_QUANTITY = 10000` cap prevents i32 overflow in quantity arithmetic.

7. **Bundle ID as lookup key only** — Cart attribute `bundle_id` is used solely for HashMap lookup against the metafield. Cannot inject discount parameters.

8. **main_product_id exclusion** — Correctly excluded from discount targets to prevent double-discounting.

9. **App Proxy HMAC verification** — `crypto.createHmac("sha256", secret)` with `crypto.timingSafeEqual()`. Rate limited at 100 req/min per shop.

10. **Cross-shop isolation** — Metafields are scoped per-shop. A bundle_id from another merchant's shop has no metafield entry.

11. **Delivery discount product verification** — `is_product_in_bundle()` called before granting free shipping.

---

## 8. Remediation Priority

### Immediate (before next deploy)

| ID | Fix | Effort |
|---|---|---|
| S-9/M-1 | Move `required_line_count` to metafield OR ensure all bundles have `product_quantities` | Small |
| S-14 | Add `cart_configs.len() > 50` guard | Trivial |
| S-12/S-13 | Add `discount_value > 100.0` guard for PERCENTAGE type | Trivial |

### Next Sprint

| ID | Fix | Effort |
|---|---|---|
| S-3 | Unify `total_reward_qty` computation (single pass) | Small |
| S-4 | Add bundle-ID length validation to delivery path | Trivial |
| S-5 | Add `qty <= 0` guard before u64 cast | Trivial |
| S-6 | Use `checked_add` for `items_per_deal` | Trivial |
| S-8 | Change empty map fallback from `1` to `0` | Trivial |
| M-3 | Apply `\| json` filter in Liquid template | Small |

### Backlog

| ID | Fix | Effort |
|---|---|---|
| S-1 | Migrate monetary arithmetic to integer cents or Decimal | Large |
| S-2 | Refactor same-product deal count to cart-wide calculation | Medium |
| S-7 | Iterate all delivery groups for free shipping | Medium |
| S-11 | Deduplicate CUSTOM_PRICE logic between two code paths | Medium |

---

*Report generated from comprehensive audit of Rust WASM discount function and frontend widget security posture across all four bundle types (FIXED_BUNDLE, BOGO, BXGY, VOLUME_DISCOUNT).*