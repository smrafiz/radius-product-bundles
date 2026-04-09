# Radius Product Bundles — Free Plan Features (QA Guide)

> **Audience:** QA tester — covers every feature available on the FREE plan, how to access it, and what to test.

---

## App Overview

Radius Product Bundles is a Shopify embedded app that lets merchants create product bundles with discounts. It has two plans:

| | Free | Pro ($9.99/mo) |
|---|---|---|
| Max bundles | 5 | Unlimited |
| Max products per bundle | 10 | Unlimited |
| Bundle types | 3 | 6 |
| Statuses | 3 | 5 |
| Discount types | 3 | 5+ |

This document covers **Free plan only**.

---

## Navigation & Pages

| Page | Route | Free access |
|---|---|---|
| Dashboard | `/dashboard` | Yes |
| Bundle List | `/bundles` | Yes |
| Create Bundle | `/bundles/create` | Yes |
| Bundle Wizard | `/bundles/create/:type` | Yes (3 types) |
| Edit Bundle | `/bundles/:id/edit` | Yes |
| Analytics | `/analytics` | Locked (Pro) |
| Settings | `/settings` | Yes (partial) |
| Pricing | `/pricing` | Yes |
| Support | `/support` | Yes |

---

## 1. Dashboard

**Route:** `/dashboard`

The dashboard is the landing page after install. It contains:

| Section | What it shows | Free |
|---|---|---|
| Setup Guide | 5-step onboarding checklist | Yes |
| Widget Status Banner | Whether app embed + widget block are active | Yes |
| Analytics Disabled Warning | Shows if analytics tracking is off | Yes |
| Metrics Overview | KPI cards (views, carts, revenue) | Yes (basic) |
| Recent Bundles | Table of recently created active bundles | Yes |
| Quick Actions | Shortcut buttons (Create bundle, Settings, etc.) | Yes |
| Features Section | App features overview | Yes |
| Video Overview | Tutorial videos | Yes |
| Review Banner | Prompt to leave review | Yes |

### Setup Guide (6 Steps)

| # | Step Key | Title | Detection | Primary Button |
|---|---|---|---|---|
| 0 | `appEmbedEnabled` | Enable the app embed | **Auto** — App Bridge `shopify.app.extensions()` checks theme extension status | "Open theme editor" + "Check status" |
| 1 | `firstBundleCreated` | Create your first product bundle | **Auto** — Prisma bundle count > 0 | "Create bundle" |
| 2 | `widgetBlockAdded` | Add bundle widget to your theme | **Auto** — REST API widget block status check | "Open theme editor" + "Check status" |
| 3 | `widgetCustomized` | Customize your settings | **Auto** — AppSettings record exists in DB | "Go to settings" |
| 4 | `storefrontPreviewed` | Preview your live storefront | **Auto** — BundleView count > 0 in DB | "View storefront" (opens store, auto-marks complete) |
| 5 | `analyticsViewed` | Monitor bundle analytics | **Manual** — marked when user visits analytics page | "Go to analytics" |

**UI details:**
- Progress ring shows X/6 complete
- First incomplete step auto-expands
- Steps 0 & 2 have "Check status" secondary button (shows toast)
- Dismiss button (✕) persists to DB (`setupGuideDismissed`)
- Auto-dismisses when all 6 complete

**QA checks:**
- Each step completes correctly (auto-detection + manual)
- Dismiss/restore guide persists across sessions
- Progress ring updates accurately
- "Check status" toasts show correct result
- Theme editor links open with correct params (app embed vs widget block URLs differ)
- All 6 complete → guide auto-dismisses

---

## 2. Bundle Types (Free Plan)

Three bundle types are available on Free:

### 2.1 Fixed Bundle

- **Description:** Group products together at a combined price with discount
- **Use case:** "Skincare Essentials Kit" — 3 products bundled at 15% off
- **Min products:** 2
- **Layouts:** GRID, LIST
- **Discount types:** Percentage, Fixed Amount, No Discount

### 2.2 BOGO (Buy One Get One)

- **Description:** Customer buys 1 product, gets 1 product free or discounted
- **Use case:** "Buy 1 T-Shirt, Get 1 Free"
- **Min products:** 2 (1 trigger + 1 reward)
- **Layouts:** CLASSIC_CARD, COMPACT_GRID
- **Discount types:** Percentage, Fixed Amount, No Discount
- **Special:** Products have roles — TRIGGER (what customer pays for) and REWARD (what customer gets discounted/free)
- **Same Product Toggle:** Can use same product as both trigger and reward

### 2.3 Buy X Get Y

- **Description:** Customer buys X items, gets Y items free or discounted (flexible quantities)
- **Use case:** "Buy 2 Get 1 50% Off"
- **Min products:** 2
- **Layouts:** COMPACT_GRID, MINIMALIST
- **Discount types:** Percentage, Fixed Amount, No Discount
- **Special:** Per-product editable quantities, multiple Buy products allowed, role dropdown per product

### Locked Bundle Types (Pro only — visible with Pro badge)

- **Volume Discount** — tiered quantity-based pricing (redirects to `/pricing`)
- **Mix & Match** — hidden, coming soon
- **Frequently Bought Together** — hidden, coming soon

---

## 3. Bundle Creation Wizard

**Route:** `/bundles/create` → select type → `/bundles/create/:bundleType`

The wizard has **4 steps:**

### Step 1: Products

| Field | Description | Notes |
|---|---|---|
| Bundle Name | Auto-generated from type, editable | Random name from type-specific patterns |
| Products | Select from Shopify product picker | Min 2 (Fixed/BOGO/BXGY), max 10 on Free |
| Product Roles | TRIGGER / REWARD assignment | BOGO/BXGY only |
| Same Product Toggle | Use 1 product for both buy & get | BOGO/BXGY only |
| Quantities | Per-product qty | Editable for BXGY, locked for BOGO |

**QA checks:**
- Cannot proceed with < 2 products (Fixed/BOGO/BXGY)
- Cannot add > 10 products on Free plan
- Product picker opens Shopify resource picker
- Clear All removes all products
- Role assignment works correctly

### Step 2: Discount

| Field | Description | Free types |
|---|---|---|
| Discount Type | Percentage / Fixed Amount / No Discount | All 3 available |
| Discount Value | Numeric input (0-100 for %, dollar amount for fixed) | Yes |
| Buy Quantity | How many trigger items customer must buy | BOGO/BXGY |
| Get Quantity | How many reward items customer receives | BOGO/BXGY |

**Also in this step (all types except Volume Discount):**
- Bundle as Product — create a Shopify product representing the bundle (available on Free)

**Pro-locked in this step:**
- Bundle Behavior settings (`bundle_behavior` feature gate)
- Advanced discount controls

**QA checks:**
- Percentage validates 0-100 range
- Fixed amount validates positive number
- BOGO enforces buy 1 / get 1
- BXGY allows custom buy/get quantities

### Step 3: Appearance

| Field | Description | Free |
|---|---|---|
| Widget Layout | Visual template for storefront | 2 layouts per type (see §2) |
| Widget Position | Where widget appears on product page | Yes |
| Display Settings | Show/hide images, prices, quantity, savings | Yes |

**Pro-locked layouts** show with a Pro badge and open cross-sell modal on click.

**QA checks:**
- Only allowed layouts for the bundle type are selectable
- Locked layouts show Pro badge
- Preview updates when layout changes

### Step 4: Review

| Section | Description |
|---|---|
| Form Error Summary | Banner showing any validation errors |
| Bundle Summary | Name, type, status, products, discount |
| Product List | All selected products with roles/quantities |
| Discount Details | Type, value, savings calculation |

**QA checks:**
- All entered data displays correctly
- Errors from previous steps shown
- Submit creates the bundle
- Redirect to bundle list or edit page after creation

---

## 4. Bundle Management

### Bundle List Page

**Route:** `/bundles`

| Feature | Description | Free |
|---|---|---|
| Bundle Table | Name, products, type, discount, status | Yes |
| Search | Filter by bundle name | Yes |
| Status Filter | Filter by status tabs | Yes |
| Create Button | Opens type selection | Yes |
| Edit | Click bundle name → edit page | Yes |
| View | Preview popover showing products | Yes |
| Delete | Delete with confirmation modal | Yes |
| Duplicate | Copy bundle | **Pro only** (opens cross-sell) |
| Bulk Select | Checkbox multi-select | Yes |
| Bulk Actions | Actions on selected bundles | Yes |
| Pagination | Navigate bundle pages | Yes |
| Metrics Overview | KPI cards above table | Yes |

### Bundle Statuses (Free Plan)

| Status | Description |
|---|---|
| DRAFT | Created but not visible on storefront |
| ACTIVE | Live and visible to customers |
| ARCHIVED | Removed from storefront, kept in records |

**Pro-only statuses** (shown with Pro badge):
- PAUSED — temporarily hidden
- SCHEDULED — activates at future date

### Edit Bundle

**Route:** `/bundles/:id/edit`

Same wizard steps as creation. All fields editable. Status can be changed via status popover dropdown.

---

## 5. Settings

**Route:** `/settings`

### 5.1 General Tab (Free features)

| Section | Setting | Free |
|---|---|---|
| **Defaults** | Default discount type | Yes |
| | Default discount value | Yes |
| **Cart Behavior** | After add-to-cart action (Default/Cart/Checkout/Stay) | Yes |
| | Enable stock validation | Yes |
| **Privacy** | Enable analytics tracking (on/off) | Yes |
| **Performance** | Storefront cache duration | Yes |
| | Lazy load product images | Yes |

**Pro-locked in General tab:**
- Bundle priority strategy
- Hide third-party payment buttons
- Max bundles per order
- Show savings banner in cart
- Allow discount stacking

### 5.2 Style Tab

Opens the **Style Customizer** — a modal for visual customization of the bundle widget.

| Setting | Description | Free |
|---|---|---|
| Style Presets | 8 built-in + Custom (Minimal, Soft, Bold, Elegant, Dark, Nature, Warm, Professional) | Yes |
| Primary Color | Widget accent color | Yes |
| Text Color | Widget text color | Yes |
| Background Color | Widget background | Yes |
| Border Style | Widget border | Yes |
| Corner Style | Sharp / Modern (8px) / Rounded (20px) | Yes |
| Shadow | None / Soft / Strong | Yes |
| Spacing | Compact / Comfortable / Spacious | Yes |
| Image Size | Small (60px) / Medium (80px) / Large (120px) | Yes |
| Image Position | Top / Left / Right | Yes |

**Pro-locked in Style tab:**
- Responsive overrides (per-device tablet/mobile settings)
- Custom CSS injection

### 5.3 Labels Tab

| Section | Free |
|---|---|
| Widget Texts (headings, buttons, qty labels) | Yes |
| Button States (Adding, Added, Out of Stock text) | Yes |
| Price Labels (Regular price, Bundle price, Savings, Badge) | Yes |
| BOGO/BXGY Labels (13 fields: deal badge, free text, buy/get prefixes, you pay/save, trigger/reward badges, total, checklist progress/hint/completed, locked/unlocked reward, pricing locked) | Yes |
| Shipping Labels | **Pro only** |
| Cart Limits Messages | **Pro only** |
| Cart Page Savings Banner | **Pro only** |

### 5.4 Advanced Tab

| Setting | Free |
|---|---|
| Custom CSS class | **Pro only** |
| Custom CSS code | **Pro only** |

### 5.5 Tools Tab

Utility tools for the app.

---

## 6. Storefront Widget (Customer-Facing)

The widget renders on Shopify product pages when a product belongs to an active bundle.

### How It Works

1. Merchant enables **App Embed** in Shopify theme editor
2. Merchant adds **Widget Block** to product page template
3. Widget reads bundle data from product metafields (`$app.bundle_ids`)
4. JavaScript renders the appropriate layout based on bundle type

### Widget by Bundle Type

#### Fixed Bundle Widget

| Layout | Free | Description |
|---|---|---|
| LIST | Yes | Vertical product list with divider options (+, -, none) |
| GRID | Yes | Configurable column grid (1-6 columns) |
| COMPACT | Pro | Minimal list view |
| SLIDER | Pro | Horizontal carousel with dots/arrows navigation |

**Shows:** Product images, names, prices, quantity, total bundle price, savings amount, Add to Cart button

#### BOGO Widget

| Layout | Free | Description |
|---|---|---|
| CLASSIC_CARD | Yes | 2-column card design with Buy/Get sections |
| COMPACT_GRID | Yes | Grid tiles with role badges |
| MINIMALIST | Pro | Hero product + supporting items |
| SLEEK | Pro | Modern streamlined design |
| CHECKLIST | Pro | Interactive checklist with unlock progress |
| SPLIT_DEAL | Pro | Side-by-side "Buy + Get" equation layout |
| BXGY (default) | Pro | Classic BXGY layout |

**Shows:** Trigger products (full price) → Reward products (discounted/FREE), deal badge, savings

#### Buy X Get Y Widget

| Layout | Free | Description |
|---|---|---|
| COMPACT_GRID | Yes | Grid with quantity badges |
| MINIMALIST | Yes | Hero product + supporting items |
| (all BOGO layouts) | Pro | Same renderer options as BOGO above |

**Shows:** Buy products with quantities → Get products with discount, total price breakdown

#### Volume Discount Widget (Pro only)

| Layout | Description |
|---|---|
| VOLUME_TIER_LIST | Tier comparison table (default) |
| VOLUME_PRICING_CARDS | Card-based tier display |
| VOLUME_SLIDER | Quantity slider with live tier selection |
| VOLUME_CALCULATOR | Input-based quantity selector with pricing |

### Cart Behavior

| Step | What happens |
|---|---|
| Click "Add to Cart" | Validates stock → adds all bundle products as line items |
| Cart Attributes | Stores `_bundle_id`, `_bundle_name`, `_bundle_discount_type`, `_bundle_discount_value` |
| After Add | Behavior per settings: open cart drawer / redirect to cart / checkout / stay |
| Toast | Success or error notification |
| Cart Count | Auto-updates cart bubble |

### Analytics Tracking (if enabled)

| Event | When |
|---|---|
| `bundle_view` | Bundle widget enters viewport (0.5 threshold, 1s debounce) |
| `bundle_add_to_cart` | After successful add to cart |
| `page_view` | Page load with bundles present |

**Endpoint:** `/apps/radius-bundles/analytics` (POST via App Proxy)

**QA checks:**
- Widget renders on product pages with active bundles
- Widget does NOT render on the bundle's own standalone product page
- Layout matches what was configured in the wizard
- Styles match customizer settings
- Add to Cart works and adds all products
- Cart attributes are set correctly
- Analytics events fire (check network tab)
- Stock validation prevents add when out of stock

---

## 7. Pro-Locked Features (Visible but Gated)

These features are **visible** on the Free plan but show a **Pro badge** and **lock overlay**. Clicking opens a **Cross-Sell Modal** prompting upgrade.

| Feature | Where it appears |
|---|---|
| Full Analytics | Analytics page |
| A/B Testing | Navigation + page |
| Automation | Navigation + page |
| AI Insights | Dashboard card + page |
| Custom CSS | Settings → Advanced |
| Responsive Overrides | Settings → Style |
| Templates | Navigation + page |
| Export Data | Various |
| Remove Branding | Settings |
| Duplicate Bundle | Bundle list actions + edit page |
| Bundle Behavior | Discount step |
| Advanced Discount Controls | Discount step |
| Advanced Cart Controls | Settings → General |
| Auto Translate | Settings |
| Volume Discount | Bundle type selection (redirects to pricing) |

---

## 8. Free Plan Limits & Enforcement

| Limit | Value | Enforcement |
|---|---|---|
| Max bundles | 5 | Server-side (`bundle-security.service.ts`) + QuotaBar UI |
| Max products/bundle | 10 | Wizard validation + server-side |
| Bundle types | FIXED_BUNDLE, BOGO, BUY_X_GET_Y | Type selection card + server redirect |
| Statuses | DRAFT, ACTIVE, ARCHIVED | Status popover + server-side |
| Discount types | PERCENTAGE, FIXED_AMOUNT, NO_DISCOUNT | Discount step |
| Layouts | 2 per type (see §2) | Appearance step + server-side |

### QuotaBar

Appears when approaching or at the bundle limit. Shows `X / 5 bundles used` with an upgrade button at the limit.

**QA checks:**
- Create 5 bundles → 6th should be blocked
- QuotaBar appears and shows correct count
- Deleting a bundle frees up quota
- Server rejects creation beyond limit even if UI is bypassed

---

## 9. Testing Checklist Summary

### Happy Path (End-to-End)

1. Install app → Dashboard loads with Setup Guide
2. Enable App Embed in theme editor → Step 1 auto-completes
3. Create Fixed Bundle → select 2-3 products → set 10% discount → choose GRID layout → review → submit
4. Bundle appears in list with DRAFT status
5. Change status to ACTIVE
6. Visit storefront product page → widget renders with correct layout and pricing
7. Click Add to Cart → products added with bundle attributes
8. Create BOGO bundle → assign trigger/reward → verify storefront rendering
9. Create BXGY bundle → set quantities → verify storefront
10. Customize widget styles in Settings → verify storefront reflects changes
11. Update labels in Settings → verify storefront text changes

### Edge Cases

- Create 5 bundles → attempt 6th (blocked)
- Add 10 products → attempt 11th (blocked)
- Try Pro-only status (PAUSED) → Pro badge shown
- Try Pro-only layout → Pro badge + cross-sell modal
- Try duplicate → cross-sell modal
- Delete all bundles → empty state shown
- Disable analytics → events stop firing
- Out-of-stock product in bundle → Add to Cart blocked (if stock validation on)
- Same product in trigger & reward (BOGO) → works with toggle

### Cross-Sell Modal

- Appears on any Pro-locked feature click
- Shows upgrade benefits
- Links to pricing page
- Dismissible

---

## 10. Translations & Localization

### Admin App (i18n)

The admin UI uses a custom React i18n system.

| Aspect | Details |
|---|---|
| Translation files | `/web/messages/en.json` (English), `/web/messages/fr.json` (French) |
| Hook | `useTranslations("Namespace.Section")` → `t("key")` |
| Parameter interpolation | `t("key", { param: "value" })` replaces `{param}` |
| Locale detection | `NEXT_LOCALE` cookie → dynamic import of locale JSON |
| RTL support | Auto-detected for Arabic, Hebrew, Farsi, Urdu |
| Direction sync | `<html lang="..." dir="ltr|rtl">` set by `LocaleSync` component |

**QA checks (Free):**
- Admin UI displays in correct language based on Shopify locale
- All UI strings come from translation files (no hardcoded text)
- RTL layout flips correctly for RTL languages

### Storefront Widget Labels (Free)

Merchants customize widget text via **Settings → Labels** tab. These labels appear on the customer-facing widget.

| What | Where |
|---|---|
| Edit labels | Settings → Labels tab (per-locale) |
| Label storage | Database (AppSettings) → synced to Shopify metafields |
| Storefront delivery | Metafields → `global.labels` in Liquid → widget JS |

**Locale fallback chain on storefront:**
1. Exact locale match (e.g., `en-us`)
2. Base locale (e.g., `en`)
3. Store's primary locale
4. Built-in defaults from extension locale files

**Built-in storefront locales** (no merchant action needed):
English, French, German, Spanish, Italian, Portuguese, Japanese

**QA checks:**
- Change a label in Settings → verify it appears on storefront widget
- Switch storefront language → widget shows correct locale's labels
- Placeholders like `{amount}`, `{count}`, `{name}` resolve to actual values
- If no custom label set, built-in default shows

### Auto-Translate (Pro Only)

| Aspect | Details |
|---|---|
| Feature gate | `auto_translate` → `lock-overlay` on Free |
| Where | Settings → Labels → locale picker → "Auto Translate" button |
| Engine | MyMemory Translation API (free tier) |
| Behavior | Translates source locale labels → target locale; only fills **blank** fields |
| Cooldown | 30 seconds per shop (prevents API quota exhaustion) |
| Saving | Translations appear in form but are **not saved** until merchant clicks Save |
| Placeholders | `{placeholder}` patterns are preserved (not translated) |
| Supported | 40+ languages via locale mapping |

**QA checks (Free plan):**
- "Auto Translate" button shows lock icon on Free plan
- Clicking opens Cross-Sell Modal
- Locale picker still visible (can manually edit labels per locale)
- "Refresh locales" button works (fetches from Shopify, 24h cache)

---

## 11. Key URLs & Endpoints

| Purpose | URL |
|---|---|
| App home | `https://<shop>.myshopify.com/admin/apps/radius-bundles` |
| App Proxy base | `https://<shop>.myshopify.com/apps/radius-bundles/` |
| Bundle data (proxy) | `/apps/radius-bundles/products?productId=<id>` |
| Analytics (proxy) | `/apps/radius-bundles/analytics` (POST) |
| OAuth callback | `/api/auth/callback` |
| Webhooks | `/api/webhooks` |
