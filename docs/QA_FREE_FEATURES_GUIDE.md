# Radius Bundles — Free Plan Features (QA Guide)

> **Audience:** QA tester — covers every feature available on the FREE plan, how to access it, and what to test.

---

## App Overview

Radius Bundles is a Shopify embedded app that lets merchants create product bundles with discounts. It has two plans:

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
| Analytics | `/analytics` | Partial (basic free, full Pro) |
| Settings | `/settings` | Yes (partial) |
| Pricing | `/pricing` | Yes |
| Support | `/support` | Yes |

---

## 1. Dashboard

**Route:** `/dashboard`

The dashboard is the landing page after install. It contains:

| Section | What it shows                                    | Free |
|---|--------------------------------------------------|---|
| Setup Guide | 6-step onboarding checklist                      | Yes |
| Widget Status Banner | Whether app embed + widget block are active      | Yes |
| Analytics Disabled Warning | Shows if analytics tracking is off               | Yes |
| Metrics Overview | KPI cards (views, carts, revenue)                | Yes (basic) |
| Recent Bundles | Table of recently created active bundles         | Yes |
| Quick Actions | Shortcut buttons (Create bundle, Settings, etc.) | Yes |
| Features Section | App features overview                            | Yes |
| Video Overview | Tutorial videos                                  | Yes |
| Review Banner | Prompt to leave review                           | Yes |

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

| Section | Tool | Free | Description |
|---|---|---|---|
| **Data Management** | Export Settings | Yes | Download all settings as JSON file |
| | Import Settings | Yes | Upload JSON file to restore settings (opens confirmation modal) |
| **Sync & Cache** | Sync to Shopify | Yes | Force push settings + styles to Shopify metafields |
| | Clear Cache | Yes | Purge all cached data (settings, locales, plan) |
| **Webhook Management** | Check Webhooks | Yes | Shows registered webhooks, missing webhooks, GDPR compliance status |
| | Force Register Webhooks | Yes | Re-registers all webhooks from scratch (results shown in modal) |
| **Danger Zone** | Reset Settings | Yes | Factory reset all settings to defaults (confirmation required) |

**QA checks:**
- Export → download JSON → import on different store → verify settings restored
- Sync to Shopify → verify metafields updated (check Shopify admin → Settings → Custom data)
- Clear cache → verify fresh data loads on next page visit
- Check Webhooks → verify all required topics listed as registered
- Force Register → verify success toast + all webhooks active
- Reset Settings → verify all customizations removed, defaults restored

---

## 6. Analytics Page

**Route:** `/analytics`

Analytics is **partially available** on Free — the page is accessible, basic metrics and charts are visible, but advanced sections are Pro-locked.

### Free (visible and interactive)

| Section | Details |
|---|---|
| **4 Metric Cards** | Total Revenue, Revenue Growth, Conversion Rate, Conversion Growth |
| **Main Chart** | Area chart — toggle between Revenue, Views, Purchases over time |
| **Date Range Picker** | Select custom date ranges |
| **Top Bundles Table** | Top **3 bundles only** (Pro shows top 10) with: rank, name, badge, revenue, AOV, trend, orders, views, CVR |
| **Analytics Disabled Banner** | Warning if analytics off in Settings |

### Pro-locked (visible as placeholders with Pro badge)

| Section | What it shows locked |
|---|---|
| **Customer Journey Funnel** | Gray placeholder + Pro badge |
| **Conversion Performance chart** | Gray placeholder + Pro badge |
| **Revenue Analysis chart** | Gray placeholder + Pro badge |
| **All Bundles Performance table** | Gray placeholder + Pro badge (replaces full table) |

Clicking any locked placeholder opens the Cross-Sell Modal.

### Performance Badges (on bundle rows)

| Badge | Criteria | Free |
|---|---|---|
| High Converter | ≥15% CVR | Yes |
| Revenue Star | ≥$5K revenue | Yes |
| Trending | ≥25% growth | Yes |
| Hidden Gem | <100 views + ≥10% CVR | Pro |
| Declining | ≤-25% drop | Pro |
| High Interest | ≥30% ATC rate | Pro |

**QA checks:**
- Free user can access `/analytics` page (nav link visible)
- 4 metric cards show real data
- Main chart toggles between Revenue/Views/Purchases
- Date range picker filters data correctly
- Top 3 bundles show in performance table
- Locked sections show Pro badge placeholders
- Clicking locked section opens Cross-Sell Modal
- Auto-marks setup guide step 5 on page visit

---

## 7. Storefront Widget (Customer-Facing)

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

### Widget Display Features

| Feature | Setting | Default | Free |
|---|---|---|---|
| Product images | `showImages` | true | Yes |
| Prices | `showPrices` | true | Yes |
| Compare prices | `showComparePrices` | true | Yes |
| Savings amount | `showSavings` | true | Yes |
| Savings badge | `showSavingsBadge` | true | Yes |
| Product quantity | `showQuantity` | true | Yes |
| Free shipping badge | `showFreeShipping` | true | Yes |
| Product hyperlinks | `enableHyperLink` | false | Yes |
| Pricing summary box | `pricingSummaryBox` | true | Yes |
| Stock validation | `enableStockValidation` | true | Yes |
| Lazy load images | `lazyLoadImages` | false | Yes |

### Standalone Bundle Mode

When a bundle has a "main product" (created via Bundle as Product), the widget operates in **standalone mode** on that product's page:

- Widget container is hidden (no visible widget)
- Hidden form inputs (`_bundle_id`, `_bundle_name`) injected into product form
- "Buy Now" button is hidden (prevents checkout bypass)
- Add to Cart from the product form adds all bundle products
- Analytics still tracks `bundle_view` event

**QA checks:**
- Create bundle with "Bundle as Product" enabled
- Visit the main product page → widget should NOT be visible
- Click Add to Cart → all bundle products added with bundle attributes
- "Buy Now" button should be hidden

### Cart Behavior

| Step | What happens |
|---|---|
| Click "Add to Cart" | Validates stock → adds all bundle products as line items |
| Cart Attributes | Stores `_radiusDiscounts` JSON (all active bundles) + per-item `_bundle_id`, `_bundle_name`, `_bundle_discount_type`, `_bundle_discount_value` |
| After Add | Behavior per settings: open cart drawer / redirect to cart / checkout / stay |
| Toast | Success or error notification |
| Cart Count | Auto-updates cart bubble |
| Max per order | If `maxBundlesPerOrder` > 0, counts existing bundles in cart and blocks if at limit (shows error toast) |

### Cart Auto-Cleanup

The widget monitors the cart and automatically removes invalid bundle data:

- If a bundle product is manually removed from cart → remaining bundle items are cleaned up
- If a bundle is deactivated server-side → `_radiusDiscounts` entry removed on next cart update
- If bundle settings changed server-side → discount values updated in cart attributes
- Intercepts fetch calls to `/cart/change`, `/cart/update`, `/cart/clear`
- Debounced updates (500ms)
- Dispatches `radiusBundles:cleanup` custom event

**QA checks:**
- Add bundle → remove one product from cart → verify other bundle products removed
- Deactivate bundle in admin → refresh cart page → verify bundle attributes cleaned
- Change discount value in admin → refresh cart → verify cart attributes updated

### Cart Page Savings Banner (App Embed)

A separate widget (not the product page widget) that shows on the **cart page**:

- Displays real-time savings for all bundles in cart
- Updates when bundles are added/modified/removed
- Positioned at top of cart form automatically
- Polls cart every 10 seconds + listens to `cart:change` events
- Shows bundle name, discount amount, free shipping status

**Customization** (via Settings → Style → Cart Banner section):
- Background, text, border, highlight colors
- Corner style, shadow, spacing
- Font size (small/medium/large)
- Icon type (tag, percent, gift, sparkle, fire, check, none)

**QA checks:**
- Add bundle to cart → navigate to cart page → verify banner appears
- Shows correct savings amount per bundle
- Remove bundle → banner disappears
- Test different icon types and colors via customizer

### Analytics Tracking (if enabled)

| Event | When |
|---|---|
| `bundle_view` | Bundle widget enters viewport (0.5 threshold, 1s debounce) |
| `bundle_add_to_cart` | After successful add to cart |
| `page_view` | Page load with bundles present (product + cart pages) |

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
- Carousel autoplay works (if enabled: rotates, pauses on hover)
- Product hyperlinks navigate to product pages (if enabled)
- Pricing summary box shows/hides per settings
- Free shipping badge appears when bundle has free shipping

---

## 8. Pro-Locked Features (Visible but Gated)

These features are **visible** on the Free plan but show a **Pro badge** and **lock overlay**. Clicking opens a **Cross-Sell Modal** prompting upgrade.

| Feature | Where it appears |
|---|---|
| Full Analytics (comparison charts + all bundles table) | Analytics page |
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

## 9. Free Plan Limits & Enforcement

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

## 10. Testing Checklist Summary

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
- Max bundles per order limit → error toast when exceeded
- Remove 1 product from bundle in cart → auto-cleanup removes remaining
- Standalone bundle product → widget hidden, form injection works
- Cart savings banner appears/disappears correctly

### Storefront Integration Tests

- Add bundle → check cart attributes (`_radiusDiscounts` JSON)
- Deactivate bundle → refresh cart → attributes cleaned up
- Change discount in admin → cart attributes update on next page load
- Multiple bundles in cart → each tracked separately
- Bundle priority: index-based vs discount-based (Settings → General)

### Cross-Sell Modal

- Appears on any Pro-locked feature click
- Shows upgrade benefits
- Links to pricing page
- Dismissible

---

## 11. Translations & Localization

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

## 12. Discount Function (Rust/WASM — Server-Side)

The discount is applied by a **Shopify Function** (compiled Rust → WASM) that runs server-side at checkout. This is invisible to the merchant but critical for QA.

| Aspect | Details |
|---|---|
| Line-item discounts | Applies percentage/fixed/custom-price discount to bundle product lines |
| Delivery discounts | Applies free shipping when bundle has `freeShipping: true` |
| Validation | Verifies products in cart actually belong to the bundle (tamper-proof) |
| Deal counting | BOGO/BXGY: calculates how many complete "deals" fit based on cart quantities |
| Safety guards | Overflow protection (`safe_mul`), zero-qty guard, bundle ID validation |

**QA checks:**
- Create bundle with 10% off → add to cart → verify discount applied at checkout
- Fixed amount discount → verify correct dollar amount deducted
- Free shipping bundle → verify shipping is $0 at checkout
- Add only partial bundle products → verify NO discount applied
- BOGO: buy 2 of trigger, 1 of reward → verify only 1 deal's discount applied
- Multiple bundles in same cart → verify each gets independent discount

---

## 13. Bundle Scheduling (Pro Status — SCHEDULED)

| Aspect | Details |
|---|---|
| Status | SCHEDULED (Pro only) |
| Fields | `startDate`, `endDate` on Bundle model |
| Cron job | `/api/cron/bundle-scheduler/` — runs daily |
| Activation | SCHEDULED → ACTIVE when `startDate` arrives |
| Deactivation | ACTIVE → PAUSED when `endDate` passes |
| Auth | Protected by `CRON_SECRET` bearer token |

**Not testable on Free plan** (SCHEDULED status is Pro-locked), but the cron job runs for all shops.

---

## 14. Support Page

**Route:** `/support`

| Section | Content |
|---|---|
| Quick Actions | Common action buttons |
| FAQ | Frequently asked questions (expandable) |
| Resources Panel | Documentation link, email support |
| Contact | Email support button |

---

## 15. Backend & Infrastructure (for reference)

### Webhook Handlers

| Topic | What it does |
|---|---|
| `products/delete` | Clears main product references from bundles |
| `shop/update` | Syncs shop settings to DB |
| `orders/create` | Tracks bundle purchases, calculates revenue for analytics |
| `app/uninstalled` | Deletes all shop data |
| GDPR `customers/data_request` | Logs compiled customer data |
| GDPR `customers/redact` | Handles customer data erasure |
| GDPR `shop/redact` | Handles shop data deletion |

- All webhooks: HMAC verified, idempotent (7-day dedup via `WebhookDelivery` table)
- Cold-start recovery: auto-re-registers missing webhooks on first request

### API Routes

| Route | Purpose |
|---|---|
| `/api/auth` + `/api/auth/callback` | Shopify OAuth flow |
| `/api/webhooks` | Centralized webhook handler |
| `/api/proxy/products` | Storefront product/bundle data (App Proxy) |
| `/api/proxy/analytics` | Storefront analytics tracking (App Proxy) |
| `/api/session/validate` + `/api/session/refresh` | Token management |
| `/api/upload` | File uploads (20MB max, rate-limited: 10 req/60s per shop) |
| `/api/billing/confirm` + `/api/billing/cancel` + `/api/billing/status` | Shopify billing (Pro plan) |
| `/api/cron/bundle-scheduler` | Daily scheduled bundle activation/deactivation |
| `/api/cron/keep-alive` | Database keep-alive ping (every 4 min, prevents Neon cold start) |

### Metafield Sync

Bundle and settings data flows to the storefront via Shopify metafields:
- `$app.bundle_ids` on products → tells widget which bundles apply
- App-level metafields → global styles, labels, settings
- Sync triggered on: bundle save, settings save, or manual "Sync to Shopify" tool

---

## 16. Key URLs & Endpoints

| Purpose | URL |
|---|---|
| App home | `https://<shop>.myshopify.com/admin/apps/radius-bundles` |
| App Proxy base | `https://<shop>.myshopify.com/apps/radius-bundles/` |
| Bundle data (proxy) | `/apps/radius-bundles/products?productId=<id>` |
| Analytics (proxy) | `/apps/radius-bundles/analytics` (POST) |
| OAuth callback | `/api/auth/callback` |
| Webhooks | `/api/webhooks` |
