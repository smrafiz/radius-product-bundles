# BOGO & BXGY Integration — Complete Research Report & Implementation Plan

> **Validated**: Shopify Dev MCP, Context7, Sequential Thinking MCP (Feb 2026)
> **Decisions**: Additive metafields, BOGO-only Phase 1 (1/1 fixed), widget split first, edit flow included

---

## 1. WHAT EXISTS TODAY

### Schema (Ready)
| Field | Model | Status |
|---|---|---|
| `BundleType` enum | `BOGO`, `BUY_X_GET_Y` | Defined |
| `buyQuantity Int?` | Bundle | Exists |
| `getQuantity Int?` | Bundle | Exists |
| `role` enum | BundleProduct | `TRIGGER`, `REWARD`, `INCLUDED`, `OPTIONAL`, `GROUP_OPTION` |
| `discountedProductIds` | Bundle | Exists |
| `discountApplication` | Bundle | `"bundle"` or `"products"` |

### Constants (Partially ready)
- `comingSoon: false` already set for both BOGO and BUY_X_GET_Y
- `badge: { text: "Coming soon!" }` still present — needs removal
- Allowed discount types: `PERCENTAGE`, `FIXED_AMOUNT`, `NO_DISCOUNT` — **missing `CUSTOM_PRICE`**

### Validation (Basic)
- Zod superRefine checks `buyQuantity` + `getQuantity` exist for BOGO/BXGY
- `bundle-rules.validation.ts` already expects TRIGGER/REWARD roles but store never assigns them
- **Missing**: uses-per-order-limit validation, same-product logic

### Rust Function (Generic, no BXGY logic)
- Handles `PERCENTAGE`, `FIXED_AMOUNT`, `CUSTOM_PRICE`, `NO_DISCOUNT`
- Discounts ALL bundle products equally
- **Missing**: trigger/reward product differentiation, deal count calculation, same-product handling
- **Missing**: `amountPerQuantity` in GraphQL input query (needed for CUSTOM_PRICE per reward item)

### Store (No role management)
- All products hardcoded as `role: "INCLUDED"` (6 locations in bundle.store.ts)
- No `setProductRole()`, `triggerProducts`, or `rewardProducts` methods

---

## 2. SHOPIFY DISCOUNT APPROACH — RECOMMENDATION

**Continue with Custom Shopify Function (Rust WASM)** ✅ Confirmed by Shopify Dev MCP

| Factor | Native BXGY API | Custom Function (Current) |
|---|---|---|
| Already built | No | Yes |
| Unified for all bundle types | No (separate per bundle) | Yes (1 function) |
| CUSTOM_PRICE support | No | Yes |
| Max discount cap | No | Yes |
| Same-product BOGO | Limited | Full control |
| Multiple bundles | Separate discounts each | Single function handles all |
| Metafield security | N/A | Tamper-proof (trusted source) |

### Why Not Native API
- `discountAutomaticBxgyCreate` would fragment discount system
- Would need 2 different systems: function for FIXED_BUNDLE, native for BOGO/BXGY
- Native only supports `discountOnQuantity` (percentage or fixed amount) — no CUSTOM_PRICE
- Native creates SEPARATE discounts per bundle vs 1 function for all

### Shopify Admin API BXGY Mutations (Reference Only)
- `discountAutomaticBxgyCreate` / `discountAutomaticBxgyUpdate` — automatic BXGY
- `discountCodeBxgyCreate` / `discountCodeBxgyUpdate` — code-based BXGY
- Structure: `customerBuys` (trigger) + `customerGets` (reward)
- `customerGets.value.discountOnQuantity`: `{ quantity, effect: { percentage } }`
- Percentage range: 0.00-1.00 (1.0 = free) — different from Function API (0-100)

### Validated Function API Facts (Shopify Dev MCP + Context7)
- `CartLineTarget.quantity` is valid for limiting discount to N units of a line
- `ProductDiscountCandidateFixedAmount.applies_to_each_item` is valid for per-item CUSTOM_PRICE
- Percentage range 0-100 (NOT 0-1 like Admin API)
- `cart.lines.discounts.generate.run` is the correct target

---

## 3. STOREFRONT WIDGET — RECOMMENDATION

**Two-section layout** for BOGO/BXGY:

```
┌──────────────────────────────────┐
│  ★ BUY 1 GET 1 FREE             │  ← Deal banner
├──────────────────────────────────┤
│  YOU BUY                         │
│  ┌────────┐  ┌────────┐         │
│  │ Prod A │  │ Prod B │         │  ← Trigger products (full price)
│  │ $29.99 │  │ $19.99 │         │
│  └────────┘  └────────┘         │
│          ──── → ────             │  ← Arrow/divider
│  YOU GET                         │
│  ┌────────┐                      │
│  │ Prod C │  ← FREE badge       │  ← Reward products (discounted)
│  │ ~~$24~~ │  $0.00             │
│  └────────┘                      │
│                                  │
│  Total: $49.98  Save $24.99     │
│  [ Add Bundle to Cart ]          │
└──────────────────────────────────┘
```

For **same-product BOGO**: Single product card with "Buy 1 + Get 1 FREE" badge, quantity auto-set to 2.

### Widget Architecture Decision: Split First
Before adding BXGY templates, split `bundle-widget.ts` (~2600 lines) into modules:
- `base-widget.ts` — shared logic (slider, toast, analytics, cart operations)
- `fixed-bundle-renderer.ts` — existing FIXED_BUNDLE template
- `bxgy-renderer.ts` — new BOGO/BXGY two-section template

---

## 4. BXGY DISCOUNT FEATURES (All Supported)

| Scenario | Discount Type | How It Works |
|---|---|---|
| Buy 1 Get 1 **FREE** (BOGO) | `PERCENTAGE` @ 100 | 100% off reward qty |
| Buy 1 Get 1 at **50% off** | `PERCENTAGE` @ 50 | 50% off reward qty |
| Buy 1 Get 1 at **$10 off** | `FIXED_AMOUNT` @ 10 | $10 off per reward item |
| Buy 1 Get 1 at **$5 flat** | `CUSTOM_PRICE` @ 5 | `original_price - $5` = discount |
| Buy 3 Get 2 FREE (Phase 2) | `PERCENTAGE` @ 100 | Scales: 6 trigger → 2 deals → 4 free |
| BOGO same product | `PERCENTAGE` @ 100 | `items_per_deal = 1+1 = 2`, half discounted |

### Deal Stacking (`usesPerOrderLimit`)
- `null` = unlimited stacking
- `1` = deal applies once per order
- `3` = max 3 applications (Buy 3 → Get 3 free)

### Same Product Logic
When trigger and reward products overlap:
```
total_in_cart = 4, buy_qty = 1, get_qty = 1
items_per_deal = 1 + 1 = 2
deal_count = 4 / 2 = 2
→ 2 items discounted, 2 at full price
```

### Different Product Logic
```
Product A (trigger) in cart = 3, buy_qty = 1, get_qty = 1
deal_count = 3 / 1 = 3
→ Discount up to 3 of Product B (reward) at specified discount
```

---

## 5. FUNCTION API TECHNICAL DETAILS

### Target: `cart.lines.discounts.generate.run`

### Output Structure
```
CartLinesDiscountsGenerateRunResult {
    operations: [CartOperation!]!
}

CartOperation @oneOf:
  - productDiscountsAdd: ProductDiscountsAddOperation

ProductDiscountsAddOperation {
    selectionStrategy: ALL | FIRST
    candidates: [ProductDiscountCandidate!]!
}

ProductDiscountCandidate {
    targets: [ProductDiscountCandidateTarget!]!
    value: ProductDiscountCandidateValue!
    message: String
}

ProductDiscountCandidateTarget @oneOf:
  - cartLine: CartLineTarget { id, quantity? }

ProductDiscountCandidateValue @oneOf:
  - percentage: Percentage { value: Decimal (0-100 range!) }
  - fixedAmount: ProductDiscountCandidateFixedAmount { amount, appliesToEachItem? }
```

### Key Difference: Function API uses 0-100 for percentage (not 0-1 like Admin API)

### Discount Value Patterns

**Percentage:**
```rust
value: ProductDiscountCandidateValue::Percentage(Percentage {
    value: Decimal(50.0), // 50% off
}),
```

**Fixed Amount:**
```rust
value: ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
    amount: Decimal(10.0), // $10 off
    applies_to_each_item: Some(true),
}),
```

**Custom Price ($5 flat):**
```rust
// Requires amountPerQuantity in GraphQL input query
let unit_price = line.cost().amount_per_quantity().amount().0;
let discount_per_unit = unit_price - 5.0;
value: ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
    amount: Decimal(discount_per_unit),
    applies_to_each_item: Some(true),
}),
```

---

## 6. METAFIELD BACKWARD COMPATIBILITY

### Decision: Additive Fields (No Breaking Changes)

Current metafield structure (`product_quantities`):
```json
{
  "status": "ACTIVE",
  "discount_type": "PERCENTAGE",
  "discount_value": 10,
  "product_quantities": {
    "gid://shopify/Product/111": 2,
    "gid://shopify/Product/222": 1
  }
}
```

New metafield structure for BOGO (additive — existing fields untouched):
```json
{
  "status": "ACTIVE",
  "discount_type": "PERCENTAGE",
  "discount_value": 100,
  "bundle_type": "BOGO",
  "buy_quantity": 1,
  "get_quantity": 1,
  "uses_per_order_limit": null,
  "product_quantities": {
    "gid://shopify/Product/111": 1,
    "gid://shopify/Product/222": 1
  },
  "product_roles": {
    "gid://shopify/Product/111": "TRIGGER",
    "gid://shopify/Product/222": "REWARD"
  }
}
```

**Why additive**:
- `product_quantities` stays `HashMap<String, i32>` — zero change for existing FIXED_BUNDLE bundles
- `product_roles` is a new `Option<HashMap<String, String>>` — only present for BOGO/BXGY
- Rust function checks: if `product_roles.is_some() && bundle_type == "BOGO"` → use BXGY logic, else → existing logic
- No migration needed for existing metafields

### Cart Attribute (`_radiusDiscounts`) — Keep Minimal
Cart attribute does NOT need `bundle_type`/`buy_qty`/`get_qty`. The metafield (trusted source) already has these. Cart attribute remains:
```json
{
  "bundleId": "123",
  "bundleName": "BOGO Deal",
  "requiredLineCount": 2,
  "discountType": "NO_DISCOUNT",
  "discountValue": 0,
  ...
}
```

---

## 7. IMPLEMENTATION PLAN

### Phase 1: BOGO (Priority — ships first)

BOGO only: fixed buy 1 / get 1 quantities. Phase 2 unlocks arbitrary quantities.

#### 1A. Schema & Constants
| # | Task | File | Change |
|---|---|---|---|
| 1 | Add `usesPerOrderLimit` column | `schema.prisma` | `usesPerOrderLimit Int?` on Bundle |
| 2 | Run migration | `web/` | `bun run prisma:migrate add-uses-per-order-limit` |
| 3 | Add `CUSTOM_PRICE` to BOGO/BXGY | `discount-types.constants.ts:19-20` | Add to allowed arrays |
| 4 | Remove "Coming soon!" badge | `bundle-types.constants.ts:169,182` | Delete `badge` properties |
| 5 | Add BOGO-specific labels | `bundle-details.constants.ts` | Deal description templates |

#### 1B. Types & Validation
| # | Task | File | Change |
|---|---|---|---|
| 6 | Add `usesPerOrderLimit` to types | `bundle.types.ts` | New optional field |
| 7 | Add `sameProductMode` to form types | `bundle.types.ts` | Boolean flag |
| 8 | Enhance Zod validation | `zod.schema.ts` | Product role checks, qty constraints |
| 9 | Add role validation for BOGO | `zod.schema.ts` superRefine | Every product must be TRIGGER or REWARD |

**Validation rules for BOGO:**
```
- buyQuantity === 1 (enforced, not editable)
- getQuantity === 1 (enforced, not editable)
- At least 1 TRIGGER product
- At least 1 REWARD product
- PERCENTAGE: 0 < value ≤ 100
- FIXED_AMOUNT: value > 0
- CUSTOM_PRICE: value > 0
- usesPerOrderLimit: optional, min 1
```

#### 1C. Store State
| # | Task | File | Change |
|---|---|---|---|
| 10 | Add role management | `bundle.store.ts` | `setProductRole(id, role)` |
| 11 | Add computed selectors | `bundle.store.ts` | `triggerProducts`, `rewardProducts` |
| 12 | Add `sameProductMode` state | `bundle.store.ts` | Boolean + toggle action |
| 13 | Add `usesPerOrderLimit` | `bundle.store.ts` | Number field in bundleData |

#### 1D. Products Step UI (Step 1 — Create & Edit)
| # | Task | Location | Description |
|---|---|---|---|
| 14 | Create `TriggerRewardProductsStep` | `steps/products/` | Conditional wrapper for BOGO/BXGY |
| 15 | Create `TriggerSection` | `steps/products/` | "Customer Buys" product picker + list |
| 16 | Create `RewardSection` | `steps/products/` | "Customer Gets" product picker + list |
| 17 | Create `SameProductToggle` | `steps/products/` | Checkbox to mirror trigger → reward |
| 18 | Create `DealSummaryCard` | `steps/products/` | Real-time "Buy 1 → Get 1 FREE" preview |
| 19 | Add role badges to `ProductItem` | `steps/products/product-item.tsx` | TRIGGER/REWARD badge on each card |
| 20 | Update `StepContent` | `form/step-content.tsx` | Route to TriggerReward step when BOGO/BXGY |

**UX Flow:**
```
[Same product for both? ☑]     ← Toggle

┌─ CUSTOMER BUYS (1 item) ──────┐
│ [+ Add products]               │
│ ┌──────────────────────┐       │
│ │ 🏷 TRIGGER  Product A│       │
│ │ $29.99      Qty: 1   │       │
│ └──────────────────────┘       │
└────────────────────────────────┘
        ↓ arrow/divider ↓
┌─ CUSTOMER GETS (1 item) ──────┐
│ [Auto-filled when same product]│
│ ┌──────────────────────┐       │
│ │ 🎁 REWARD  Product A │       │
│ │ Discounted  Qty: 1   │       │
│ └──────────────────────┘       │
└────────────────────────────────┘

┌─ Deal Preview ─────────────────┐
│ Buy 1 × Product A → Get 1 FREE│
└────────────────────────────────┘
```

#### 1E. Discount Step UI (Step 2)
| # | Task | Location | Description |
|---|---|---|---|
| 21 | Create `BxgyDiscountSettings` | `steps/discount/` | BOGO-specific discount controls |
| 22 | Add "Applies to reward products" label | `steps/discount/` | Clear context |
| 23 | Add `usesPerOrderLimit` input | `steps/discount/` | Number field with tooltip |
| 24 | Create `DealPreviewCard` | `steps/discount/` | "Buy 1 → Get 1 at 50% off" live preview |
| 25 | Add CUSTOM_PRICE option | `steps/discount/` | "Set price for reward product" |
| 26 | Update `DiscountStep` routing | `steps/discount/discount-step.tsx` | Render BXGY settings when applicable |

#### 1F. Review Step UI (Step 4)
| # | Task | Location | Description |
|---|---|---|---|
| 27 | Create `BxgyReviewSection` | `steps/review/` | Trigger/reward product tables |
| 28 | Create `DealCalculationPreview` | `steps/review/` | Full price breakdown |
| 29 | Update `ReviewStep` | `steps/review/review-step.tsx` | BOGO/BXGY conditional rendering |

#### 1G. Edit Flow
| # | Task | File | Description |
|---|---|---|---|
| 30 | Load TRIGGER/REWARD roles on edit | `use-bundle-edit.ts` or equivalent | Populate store with saved roles |
| 31 | Pre-fill sameProductMode on edit | Store initialization | Detect if trigger === reward products |
| 32 | Reuse TriggerReward step for edit | Same components as create | No separate edit-only components |

#### 1H. Services & Data Layer
| # | Task | File | Change |
|---|---|---|---|
| 33 | Update `bundle-write.service.ts` | services/ | Save roles, buyQty, getQty, usesPerOrderLimit |
| 34 | Update `bundle-transformer.service.ts` | services/ | Transform BOGO data for API/DB |
| 35 | Update `bundle.mutations.ts` | repositories/ | Persist usesPerOrderLimit |
| 36 | Update metafield sync | services/ | Include `bundle_type`, `product_roles`, quantities |

#### 1I. Rust Discount Function
| # | Task | File | Change |
|---|---|---|---|
| 37 | Add `amountPerQuantity` to GraphQL input | `cart_lines_discounts_generate_run.graphql` | Required for CUSTOM_PRICE per reward item |
| 38 | Add fields to `MetafieldBundleConfig` | `cart_lines_discounts_generate_run.rs` | `bundle_type`, `buy_quantity`, `get_quantity`, `uses_per_order_limit`, `product_roles` |
| 39 | Add `calculate_bxgy_discount()` | `cart_lines_discounts_generate_run.rs` | Core BXGY logic |
| 40 | Add same-product handling | `cart_lines_discounts_generate_run.rs` | `items_per_deal` math |
| 41 | Add reward-only targeting | `cart_lines_discounts_generate_run.rs` | Only discount REWARD products |
| 42 | Add CUSTOM_PRICE for rewards | `cart_lines_discounts_generate_run.rs` | Per-item price using `amountPerQuantity` |
| 43 | Add tests | `cart_lines_discounts_generate_run.rs` | All 6 scenarios |

**Rust logic pseudocode:**
```rust
fn calculate_bxgy_discount(bundle: &MetafieldBundleConfig, lines: &[CartLine]) -> Vec<Candidate> {
    let roles = bundle.product_roles.as_ref();

    // Separate trigger and reward lines using product_roles (additive field)
    let trigger_lines = lines.filter(|l| roles.get(l.product_id) == Some("TRIGGER"));
    let reward_lines = lines.filter(|l| roles.get(l.product_id) == Some("REWARD"));

    let trigger_qty: i32 = trigger_lines.sum(|l| l.quantity);
    let buy_qty = bundle.buy_quantity.unwrap_or(1);
    let get_qty = bundle.get_quantity.unwrap_or(1);

    // Same-product check: trigger and reward product sets overlap
    let same_product = has_overlap(trigger_product_ids, reward_product_ids);

    let deal_count = if same_product {
        let items_per_deal = buy_qty + get_qty;
        trigger_qty / items_per_deal
    } else {
        trigger_qty / buy_qty
    };

    // Apply uses_per_order_limit
    let deal_count = match bundle.uses_per_order_limit {
        Some(limit) if limit > 0 => min(deal_count, limit),
        _ => deal_count,
    };

    let reward_discount_qty = deal_count * get_qty;

    // Target only reward products, up to reward_discount_qty
    // For CUSTOM_PRICE: use amountPerQuantity to calculate per-unit discount
    build_candidates(reward_lines, reward_discount_qty, bundle.discount_type, bundle.discount_value)
}
```

**Routing in main function:**
```rust
// In cart_lines_discounts_generate_run():
if bundle_settings.bundle_type.as_deref() == Some("BOGO")
    || bundle_settings.bundle_type.as_deref() == Some("BUY_X_GET_Y")
{
    // New BXGY path
    calculate_bxgy_discount(bundle_settings, &bundle_lines)
} else {
    // Existing FIXED_BUNDLE path (unchanged)
    existing_discount_logic(...)
}
```

#### 1J. Widget Split & BOGO Template
| # | Task | File | Change |
|---|---|---|---|
| 44 | Extract `base-widget.ts` | `widgets/src/` | Shared logic (slider, toast, analytics, cart ops) |
| 45 | Extract `fixed-bundle-renderer.ts` | `widgets/src/` | Existing FIXED_BUNDLE template |
| 46 | Create `bxgy-renderer.ts` | `widgets/src/` | New BOGO two-section template |
| 47 | Add BXGY Liquid template | `product-bundle-widget/` | Two-section layout |
| 48 | Update `BundleWidget` React component | `shared/components/bundle-widget/` | Admin preview for BOGO |

#### 1K. Bundle Listing
| # | Task | File | Change |
|---|---|---|---|
| 49 | Add bundle type badge to listing | Bundle list table | Show "BOGO" badge alongside status badge |

---

### Phase 2: BUY_X_GET_Y (Extension of BOGO)

| # | Task | Description |
|---|---|---|
| 50 | Unlock quantity inputs | Show qty fields when type=BUY_X_GET_Y (not BOGO) |
| 51 | Update validation | `buyQuantity >= 1`, `getQuantity >= 1` (not fixed at 1) |
| 52 | Update deal preview | Dynamic "Buy X → Get Y at Z% off" text |
| 53 | Update Rust function | Already handles variable quantities from Phase 1 |
| 54 | Update storefront widget | Variable qty display |

**BUY_X_GET_Y adds only**: editable quantity fields. Everything else reuses BOGO infrastructure.

---

### Phase 3: Polish & Edge Cases

| # | Task | Priority |
|---|---|---|
| 55 | Same-product BOGO: single card with "Buy 1 + Get 1" badge | High |
| 56 | Multiple products per side (buy A+B, get C free) | Medium |
| 57 | Collection-based triggers/rewards (future) | Low |
| 58 | "Cheapest item free" variant selection | Medium |
| 59 | E2E: create BOGO → add to cart → verify discount at checkout | Critical |
| 60 | E2E: create BXGY → variable quantities → checkout | Critical |
| 61 | Mobile widget layout testing | High |

---

## 8. FILE IMPACT MAP

```
MODIFY:
  web/prisma/schema.prisma                                    # +1 field
  web/features/bundles/constants/discount-types.constants.ts  # Add CUSTOM_PRICE
  web/features/bundles/constants/bundle-types.constants.ts    # Remove badges
  web/features/bundles/schema/zod.schema.ts                   # Enhanced validation
  web/features/bundles/stores/bundle.store.ts                 # Role management
  web/features/bundles/types/bundle.types.ts                  # New fields
  web/features/bundles/services/bundle-write.service.ts       # BOGO/BXGY save
  web/features/bundles/services/bundle-transformer.service.ts # Transform
  web/features/bundles/repositories/bundle.mutations.ts       # Persist
  web/features/bundles/hooks/.../use-bundle-edit.ts            # Load roles on edit
  web/features/bundles/components/.../step-content.tsx         # Routing
  web/features/bundles/components/.../discount-step.tsx        # Conditional
  web/features/bundles/components/.../review-step.tsx          # Conditional
  web/features/bundles/components/.../product-item.tsx         # Role badges
  extension/.../cart_lines_discounts_generate_run.graphql      # +amountPerQuantity
  extension/.../cart_lines_discounts_generate_run.rs           # BXGY logic
  extension/.../product-bundle-widget/                         # Liquid layout
  web/shared/components/bundle-widget/                         # Admin preview

CREATE:
  web/widgets/src/base-widget.ts                               # Extracted shared logic
  web/widgets/src/fixed-bundle-renderer.ts                     # Extracted FIXED_BUNDLE template
  web/widgets/src/bxgy-renderer.ts                             # New BOGO/BXGY template
  web/features/bundles/components/.../trigger-reward-products-step.tsx
  web/features/bundles/components/.../trigger-section.tsx
  web/features/bundles/components/.../reward-section.tsx
  web/features/bundles/components/.../same-product-toggle.tsx
  web/features/bundles/components/.../deal-summary-card.tsx
  web/features/bundles/components/.../bxgy-discount-settings.tsx
  web/features/bundles/components/.../deal-preview-card.tsx
  web/features/bundles/components/.../bxgy-review-section.tsx
  web/features/bundles/components/.../deal-calculation-preview.tsx
```

---

## 9. RISK MATRIX

| Risk | Severity | Mitigation |
|---|---|---|
| Metafield backward compatibility | **Critical** | Additive `product_roles` field — zero change to existing bundles |
| Same-product deal count math | High | Extensive unit tests in Rust |
| Missing `amountPerQuantity` in input query | Medium | Add to GraphQL query before CUSTOM_PRICE impl |
| Cart attribute tampering | Low | Already mitigated — metafield is source of truth |
| CUSTOM_PRICE per-item calculation | Medium | Use `cost.amountPerQuantity` in function |
| Form state complexity | Medium | Reuse existing store patterns, add role layer |
| Widget file size (2600+ lines) | Medium | Split into modules BEFORE adding BXGY code |
| Widget layout breaking existing | Low | Conditional rendering, FIXED_BUNDLE unchanged |
| Edit flow missing | **Critical** | Included in Phase 1 — shared components for create & edit |
| Cart attribute bloat | Low | Keep minimal — `bundle_type`/`buy_qty`/`get_qty` stay in metafield only |

---

## 10. SHOPIFY API REFERENCE

### Admin API Mutations
- `discountAutomaticBxgyCreate` — [Docs](https://shopify.dev/docs/api/admin-graphql/latest/mutations/discountAutomaticBxgyCreate)
- `discountCodeBxgyCreate` — [Docs](https://shopify.dev/docs/api/admin-graphql/latest/mutations/discountCodeBxgyCreate)
- `discountAutomaticBxgyUpdate` — [Docs](https://shopify.dev/docs/api/admin-graphql/latest/mutations/discountAutomaticBxgyUpdate)

### Function API
- Discount Function API — [Docs](https://shopify.dev/docs/api/functions/latest/discount)
- Build a Discount Function — [Docs](https://shopify.dev/docs/apps/build/discounts/build-discount-function?extension=rust)

### Other References
- Shopify BXGY Help — [Docs](https://help.shopify.com/en/manual/discounts/discount-types/buy-x-get-y)
- Discounts Reference App — [GitHub](https://github.com/Shopify/discounts-reference-app)

---

## 11. TASK COUNT SUMMARY

| Phase | Tasks | Focus |
|---|---|---|
| Phase 1 (BOGO) | 49 | Schema, constants, types, validation, store, UI (create+edit), services, Rust function, widget split, listing |
| Phase 2 (BXGY) | 5 | Unlock qty inputs, update validation/preview/widget |
| Phase 3 (Polish) | 7 | Same-product UX, multi-product, collection triggers, E2E tests |
| **Total** | **61** | |
