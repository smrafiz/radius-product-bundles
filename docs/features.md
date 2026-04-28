# Radius Bundles — Complete Feature Guide

> The all-in-one Shopify product bundling app. Create bundles, customize your storefront widget, track performance, and boost average order value.

---

## Table of Contents

- [Bundle Creation & Management](#1-bundle-creation--management)
- [Bundle Types](#2-bundle-types)
- [Discount Engine](#3-discount-engine)
- [Storefront Widget](#4-storefront-widget)
- [Style Customizer](#5-style-customizer)
- [Analytics & Insights](#6-analytics--insights)
- [Dashboard](#7-dashboard)
- [Scheduling & Automation](#8-scheduling--automation)
- [Settings & Configuration](#9-settings--configuration)
- [Shopify Integration](#10-shopify-integration)
- [Free vs Pro Plan Recommendation](#free-vs-pro-plan-recommendation)

---

## 1. Bundle Creation & Management

### Multi-Step Creation Wizard

A guided 4-step process to build bundles with validation at every step:

| Step              | What You Do                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **1. Products**   | Pick products (up to 20), set quantities, upload bundle images (up to 5), write name & description |
| **2. Discount**   | Choose discount type, set value, configure volume tiers or buy/get rules                           |
| **3. Appearance** | Select widget layout, theme, toggle display elements, customize colors & fonts                     |
| **4. Review**     | Preview full configuration, validate all settings, publish or save as draft                        |

### Full CRUD Operations

- **Create** — Full validation pipeline (schema + business rules + security checks), quota enforcement, name uniqueness, Shopify product creation, metafield sync
- **Edit** — Change any field with diff-based product list updates, conflict detection, and automatic metafield re-sync
- **Duplicate** — One-click clone with auto-numbered name, all products/settings/discount preserved, created as Draft
- **Delete** — Single or bulk delete (up to 100 at once), soft delete with analytics retention, Shopify product cleanup
- **Status Management** — Change status individually or in bulk: Draft, Active, Paused, Scheduled, Archived

### Bundle Listing & Filtering

- Paginated table view with configurable page size
- Real-time search by bundle name
- Multi-select status filter (Active, Draft, Paused, Archived, Scheduled)
- Filter by bundle type
- Sort by: date created, name, views, conversions, revenue, conversion rate (ASC/DESC)
- Row selection with checkboxes for bulk operations
- Skeleton loading states and empty state handling

### Bulk Actions

- Activate selected bundles (Draft → Active)
- Set selected to Draft (Active → Draft)
- Delete selected (with confirmation dialog)
- Select all / clear selection

### Bundle Details Display

Each bundle row shows:

- Thumbnail image from products
- Bundle name with type badge
- Status badge with color coding
- Discount type & value (e.g., "20% Off", "$10 Off", "Custom Price $49.99")
- Product count
- View count, conversions, revenue, conversion rate
- Quick action menu: Edit, Duplicate, Change Status, Delete

---

## 2. Bundle Types

Six bundle types are defined. Each has dedicated name patterns, validation rules, icons, and configuration metadata.

| Type                           | Description                                                       | Status       |
| ------------------------------ | ----------------------------------------------------------------- | ------------ |
| **Fixed Bundle**               | Curated set of specific products sold together at a discount      | Fully Active |
| **Buy X Get Y**                | Buy a required quantity, get another product free or discounted   | Coming Soon  |
| **BOGO**                       | Buy one, get one free or discounted (special case of Buy X Get Y) | Coming Soon  |
| **Volume Discount**            | Tiered pricing — buy more, save more with quantity break tiers    | Coming Soon  |
| **Mix & Match**                | Customers choose from product groups to build their own bundle    | Coming Soon  |
| **Frequently Bought Together** | Recommend complementary products based on purchase patterns       | Coming Soon  |

### Fixed Bundle Features (Active)

- Select 1-20 products with individual quantities
- Apply any discount type (Percentage, Fixed Amount, Custom Price, No Discount)
- Optional: Create as standalone Shopify product (appears in collections, search)
- Bundle images (up to 5) with media upload
- SEO fields: title, description, marketing copy
- Date range scheduling (start/end dates)
- Per-bundle widget appearance customization

---

## 3. Discount Engine

### Server-Side Discount Calculation (Rust WASM Function)

A compiled Rust function runs directly on Shopify's servers for tamper-proof, server-side discount calculation:

#### Line Item Discounts

- **Percentage** — X% off each bundle product (e.g., 15% off)
- **Fixed Amount** — Flat dollar amount off the bundle total (e.g., $10 off)
- **Custom Price** — Set a specific bundle total price (e.g., bundle for $49.99)
- **No Discount** — Bundle products together without any price reduction

#### Discount Controls

- Maximum discount cap — Set a ceiling on total savings
- Minimum order value — Only apply discount if cart meets threshold
- Quantity validation — Calculates complete bundle sets based on product quantities
- Selective discounting — Apply discount to all products or specific items only
- Security — Verifies products belong to bundle using tamper-proof merchandise data

#### Delivery (Shipping) Discounts

- Free shipping when bundle qualifies
- Custom shipping label messages (e.g., "Free shipping with Summer Bundle")
- Product validation — Ensures bundle products are actually in cart

---

## 4. Storefront Widget

A Liquid theme extension that renders interactive bundle widgets on product pages.

### 4 Responsive Layouts

| Layout       | Description                                                                    |
| ------------ | ------------------------------------------------------------------------------ |
| **List**     | Vertical product list with optional dividers (plus sign, line, or none)        |
| **Grid**     | Product card grid with configurable columns (2, 3, or 4)                       |
| **Carousel** | Swipeable product carousel with arrows/dots navigation, autoplay, drag support |
| **Compact**  | Condensed minimal view for tight spaces                                        |

### Product Cards

- Product image with lazy loading
- Product title (optionally hyperlinked to product page)
- Regular price and compare-at price display
- Discounted price calculation
- Quantity labels
- Out-of-stock detection (disables add-to-cart)

### Pricing Display

- Regular price (sum of all products)
- Bundle price (after discount applied)
- Savings amount ("You save $X")
- Savings badge (percentage or amount)
- Free shipping badge

### Cart Behavior

- Add to cart with bundle metadata (line item properties: `_bundle_id`, `_bundle_name`)
- Cart attribute injection for discount function (`_radiusDiscounts` JSON)
- After add-to-cart redirect options: cart page, checkout, theme default (drawer), or stay on page
- Max bundles per order enforcement
- Toast notifications (success/error)
- Standalone product mode — widget hidden, bundle properties injected on existing product form submit
- Buy Now button interception

### Analytics Tracking (Built-in)

- Automatic view tracking via IntersectionObserver (fires when widget enters viewport)
- Add-to-cart event tracking
- Custom JavaScript events for downstream integrations

### Progressive Enhancement

- Skeleton loading while data fetches
- Responsive breakpoint detection via data attributes
- Touch + mouse drag support for carousel
- Smart cart drawer detection (Shopify Dawn theme + custom themes)

---

## 5. Style Customizer

A full visual customizer with 70+ settings, real-time preview, 8 presets, and responsive device overrides.

### 5 Customizer Sections

#### Section 1: Appearance

- **Colors** — Primary/accent, text, background, border, savings highlight
- **Shape** — Corner roundness (sharp, modern, rounded)
- **Depth** — Shadow (none, soft, strong)
- **Spacing** — Compact, comfortable, spacious (responsive per device)

#### Section 2: Product Cards

- **Image** — Size (small/medium/large), fit (cover/contain), position (left/top for list layout)
- **Card Style** — Toggle custom card styling: background color, border, shadow (or inherit from Appearance)

#### Section 3: Button & Badge

- **Button** — Style (filled/outline), size (S/M/L), width (auto/full), background color (or inherit from primary)
- **Badge** — Position (top-left, top-right, inline), style (filled/outline)
- **Pricing Summary** — Toggle summary box, background color, style (minimal/card/highlight)

#### Section 4: Advanced

- **Container** — Max width (300-1200px), alignment (left/center/right), border toggle
- **Breakpoints** — Preset (standard/compact/wide) or custom tablet/mobile breakpoints
- **Typography** — Heading size (S/M/L), body text size (S/M/L)
- **Layout-Specific Controls:**
    - List: Divider style (none/line/plus)
    - Grid: Column count (2/3/4)
    - Carousel: Slides visible (2/3/4), navigation type (arrows/dots/both/none), autoplay toggle + speed
    - BOGO: FREE tag color
    - Buy X Get Y: Tier display (cards/list/tabs)
    - Volume Discount: Tier highlight color, display (table/cards)
    - Mix & Match: Group header color, selection style (checkbox/radio/highlight)
    - Frequently Bought Together: Separator style (plus/line/none), checkbox color

#### Section 5: Cart Banner (dedicated for cart banner bundle type)

- Colors: text, background, border, highlight
- Shape & depth same as Appearance
- Typography (responsive text size)
- Icon selector (tag/percent/gift/sparkle/fire/check/none) with custom icon color

### 8 Style Presets

One-click application with full customization after:

| Preset           | Style                                                  |
| ---------------- | ------------------------------------------------------ |
| **Minimal**      | Sharp edges, high contrast, no shadows                 |
| **Soft**         | Rounded corners, subtle shadows, comfortable spacing   |
| **Bold**         | High contrast, fully rounded, strong shadows, spacious |
| **Elegant**      | Sophisticated curves, shadows, spacious layout         |
| **Dark**         | Dark gray background, cyan accents, strong shadows     |
| **Nature**       | Green/organic tones, rounded, soft shadows             |
| **Warm**         | Orange/warm tones, rounded, soft shadows               |
| **Professional** | Blue accents, structured, no shadows, outline buttons  |

### Responsive Override System

Every responsive field supports per-device overrides:

- **Desktop** — Base layer (always applies)
- **Tablet** — Override for tablet screens (768-1024px default)
- **Mobile** — Override for mobile screens (<768px default)

Features:

- Visual indicator showing inherited vs. overridden values
- One-click clear override (revert to desktop/base)
- ~25 responsive fields including spacing, image size, typography, grid columns, carousel settings
- Custom breakpoint support (override standard tablet/mobile thresholds)

### Custom CSS

- Custom CSS class name injection (max 100 chars)
- Custom CSS code editor (max 10,000 chars) — direct CSS injection via metafield

---

## 6. Analytics & Insights

### Event Tracking Pipeline

```
Storefront Widget → App Proxy (/api/proxy/analytics/) → Repository (deduplicated) → BundleAnalytics (hourly aggregation)
```

- **Bundle Views** — Tracked per customer per day (logged-in) or per session per day (anonymous), deduplicated
- **Add to Cart** — Real-time tracking from storefront widget
- **Purchases** — Tracked via `orders/create` webhook with revenue calculation, new vs. returning customer detection, discount allocation handling

### Dashboard Metrics (4 KPI Cards)

| Metric                      | Details                                             |
| --------------------------- | --------------------------------------------------- |
| **Total Revenue**           | Current period sum with period-over-period growth % |
| **Revenue Growth**          | % change vs. previous period of same duration       |
| **Conversion Growth**       | % change in conversion rate period-over-period      |
| **Average Conversion Rate** | Overall views → purchases percentage                |

### Time-Series Charts (3 Charts)

- **Revenue Chart** — Daily revenue with $K formatting
- **Views Chart** — Daily unique views with K formatting
- **Purchases Chart** — Daily completed orders count

### Comparison Charts (3 Visualizations)

- **Funnel Performance** — Views → Add to Cart → Purchases conversion funnel
- **Conversion Rates** — Conversion rate trends over time
- **Revenue & AOV** — Revenue + Average Order Value dual metrics

### Performance Badges (6 Types)

Automatically assigned based on analytics data:

| Badge              | Condition                | Meaning                                     |
| ------------------ | ------------------------ | ------------------------------------------- |
| **High Converter** | Conversion rate >= 15%   | Exceptional at turning views into sales     |
| **Revenue Star**   | Revenue >= $5,000        | Major revenue contributor                   |
| **Hidden Gem**     | < 100 views + >= 10% CVR | Strong conversion, needs more promotion     |
| **Trending**       | >= 25% revenue growth    | Building momentum fast                      |
| **Declining**      | <= -25% revenue drop     | Needs pricing/composition review            |
| **High Interest**  | >= 30% add-to-cart rate  | Strong customer interest, optimize checkout |

### Health Status Classification (4 States)

| Status         | Condition                                                       |
| -------------- | --------------------------------------------------------------- |
| **New**        | < 30 views (insufficient data)                                  |
| **Healthy**    | >= 8% CVR and > $1,000 revenue                                  |
| **Needs Work** | High cart rate + low conversion, or high views + low conversion |
| **Poor**       | >= 50 views + < 3% CVR + < $500 revenue                         |

### Top Performing Bundles Table

- Top 5 bundles ranked by revenue
- Columns: name, revenue, views, purchases, conversion rate, ATC rate, AOV, revenue per view
- Primary badge display (Revenue Star > High Converter > Trending > Hidden Gem)
- Trend indicator (up/down % or "New")
- Low confidence warning for < 25 views

### All Bundles Analytics Table

- Paginated (10 per page)
- Search by name
- Sort by: revenue, views, purchases, conversion, created date
- Health status per bundle
- Status filter with counts

### Date Range Filtering

- Preset ranges: Last 7, 14, 30 days
- Custom date range picker
- Automatic previous-period comparison (same duration)
- 5-minute cache on all analytics queries

---

## 7. Dashboard

### Overview Metrics (4 Cards)

- Active Bundles count (links to bundle management)
- Total Revenue with growth indicator
- Conversion Rate with growth indicator
- Total Views (30-day) with growth indicator

### Top Performing Bundles

- Top 5 active bundles with thumbnail, name, type, views, conversion rate, revenue, status
- Clickable rows navigate to edit page

### Quick Actions (3 Cards)

- **Manage Bundles** — Navigate to bundle creation/management
- **View Analytics** — Navigate to analytics dashboard
- **App Settings** — Navigate to settings & customizer

### Setup Guide (5-Step Onboarding)

| Step                       | Detection                                 | Action                     |
| -------------------------- | ----------------------------------------- | -------------------------- |
| **1. Enable App Embed**    | Manual verification via Shopify Theme API | Opens theme editor         |
| **2. Create First Bundle** | Auto-detected (bundle count > 0)          | Navigate to create page    |
| **3. Customize Widget**    | Auto-detected (globalStyles modified)     | Open style customizer      |
| **4. Preview Storefront**  | Manual checkbox                           | Open storefront in new tab |
| **5. Track Analytics**     | Manual checkbox                           | Navigate to analytics page |

Features:

- Visual progress bar (X/5 completed)
- Expandable/collapsible step items
- Auto-disabled checkboxes for auto-detected steps
- Dismiss/show guide toggle
- Persistent state (DB-backed via Shop model)

### App Embed Status Banner

- Persistent warning when app embed is not enabled and setup guide is dismissed
- Direct link to theme editor for quick activation

### Feature Highlights

- Hero section showcasing key capabilities
- Feature bullet points with CTA to create a bundle

### Video Tutorials (3 Videos)

- "See it in action" — General overview
- "Getting started" — Setup walkthrough
- "Advanced tips" — Power user guide
- Embedded YouTube player with modal, position memory

### Review & Feedback

- 5-star rating interface
- Dynamic messaging based on rating
- Conditional actions:
    - High ratings (4-5): "Rate on App Store", "Share with friends"
    - Low ratings (1-3): "Contact Support", "View Help Center"
- Detailed feedback form submission

### Plan Upgrade Card

- Marketing card promoting Pro plan
- Navigate to pricing page

### Help & Support (3 Cards)

- **Support** — Email support link
- **Upcoming Features** — Feature roadmap link
- **Help Docs** — Documentation link

---

## 8. Scheduling & Automation

### Bundle Scheduling

- Set start date and end date on any bundle
- Status automatically changes to **Scheduled** when dates are set
- **Cron job** (`/api/cron/bundle-scheduler/`) runs on schedule:
    - Activates SCHEDULED bundles when start date arrives
    - Pauses ACTIVE bundles when end date passes
- Syncs Shopify product status on activation/deactivation

### Database Keep-Alive

- Cron endpoint pings database every 4 minutes
- Prevents Neon free-tier serverless database from suspending

---

## 9. Settings & Configuration

### General Settings

| Setting                          | Options                                             |
| -------------------------------- | --------------------------------------------------- |
| Default discount type            | Percentage, Fixed Amount, Custom Price, No Discount |
| Default discount value           | 0-100                                               |
| Max products per bundle          | 2-50                                                |
| Max bundles per shop             | Plan-based (read-only)                              |
| Bundle priority                  | Index-based or Discount-based sorting               |
| After add-to-cart redirect       | Default, Cart, Checkout, None                       |
| Hide third-party payment buttons | Toggle                                              |
| Stock validation                 | Toggle                                              |
| Max bundles per order            | 0-10 (0 = unlimited)                                |
| Cart savings banner              | Toggle                                              |
| Discount stacking                | Toggle                                              |
| Analytics tracking               | Toggle (privacy)                                    |
| Storefront cache TTL             | 0s, 1m, 5m, 15m, 1h                                 |
| Lazy load images                 | Toggle                                              |

### Label Customization

All customer-facing text is customizable:

- Widget heading, add-to-cart button text, quantity label
- Button states: adding, added, out-of-stock
- Price labels: regular, bundle, savings, badge
- Shipping labels: free shipping text, method title
- Cart messages: max bundles reached, savings text, custom price text

### Data Management Tools

- **Export settings** — Download JSON backup
- **Import settings** — Upload JSON to restore
- **Sync metafields** — Push settings to Shopify (storefront access)
- **Clear cache** — Bust all cached data
- **Reset to defaults** — Factory reset all settings

### Webhook Management

- Check webhook registration status
- Force register/re-register webhooks

---

## 10. Shopify Integration

### OAuth & Authentication

- Full Shopify OAuth flow (auth + callback)
- Offline session token management
- App proxy signature verification
- Session validation and refresh endpoints

### Webhooks (Auto-registered)

| Webhook                      | Handler                                     |
| ---------------------------- | ------------------------------------------- |
| `products/delete`            | Clears main product references from bundles |
| `shop/update`                | Syncs shop settings                         |
| `orders/create`              | Tracks bundle purchases, calculates revenue |
| `app/uninstalled`            | Deletes all shop data                       |
| GDPR (customer data erasure) | Handles privacy compliance                  |
| GDPR (shop data request)     | Handles data export requests                |

Cold-start recovery: webhooks auto-re-register if missing.

### Metafield Sync

- Bundle data synced to product metafields (storefront access)
- Global styles synced to app metafield
- Settings synced to app metafield
- Enables storefront widget to read bundle/style data without API calls

### GraphQL Integration

- Shopify Admin API 2026-04
- Auto-generated TypeScript types via `graphql-codegen`
- Product creation/update/status sync
- Metafield read/write operations

### App Proxy

- `/apps/bundles/` → `/api/proxy/`
- Product data endpoint (bundle details + Shopify product enrichment)
- Analytics tracking endpoint
- HMAC signature verification on all proxy requests

### Theme Extension

- App Embed block (global scripts, CSS, cart banner)
- Product Block (per-product bundle widget)
- Schema-based configuration in Shopify theme editor

---

## Free vs Pro Plan Recommendation

A generous free plan builds trust, drives organic installs, and creates loyal merchants who upgrade naturally. The philosophy: **give merchants everything they need to succeed, then charge for scale and power features.**

---

### Free Plan — "Everything to Get Started & Grow"

| Feature                | Included                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| Active bundles         | Up to **5**                                                      |
| Bundle types           | Fixed Bundle (+ all types as they launch)                        |
| Products per bundle    | Up to **10**                                                     |
| Discount types         | **All 4** (Percentage, Fixed Amount, Custom Price, No Discount)  |
| Widget layouts         | **All 4** (List, Grid, Carousel, Compact)                        |
| Style presets          | **All 8** presets                                                |
| Custom colors          | **Full** color customization (all 5 base colors)                 |
| Responsive overrides   | **Desktop + Tablet + Mobile**                                    |
| Custom CSS             | Not available                                                    |
| Analytics              | **Full dashboard**: views, revenue, conversion rate, add-to-cart |
| Charts                 | **All 3** time-series charts (Revenue, Views, Purchases)         |
| Comparison charts      | Not available (funnel, conversion rates, revenue & AOV)          |
| Performance badges     | **Top 3**: High Converter, Revenue Star, Trending                |
| Health status          | **Full** health classification (healthy, needs work, poor, new)  |
| Date range filter      | Last 7 / 14 / 30 days                                            |
| Bundle scheduling      | **Available** (start & end dates)                                |
| Free shipping badge    | **Available**                                                    |
| Label customization    | **Available** (all customer-facing text)                         |
| Bundle images          | Up to **3** per bundle                                           |
| Export/Import settings | Not available                                                    |
| Discount caps          | Not available                                                    |
| Custom breakpoints     | Not available (standard breakpoints only)                        |
| Priority support       | Community support                                                |
| Branding               | Small "Powered by Radius" link on widget                         |

**Why this is generous:**

- 5 bundles is enough to run a real bundling strategy, not just "test the app"
- All 4 discount types means merchants never feel blocked on pricing flexibility
- All 4 layouts and all 8 presets means every store can look great from day one
- Full responsive overrides means the widget works perfectly on mobile (where 70%+ of Shopify traffic is)
- Full analytics dashboard with health status means merchants can actually measure success
- Label customization means non-English stores work out of the box
- Scheduling means seasonal bundles work on Free

---

### Pro Plan — "Scale Without Limits"

| Feature                | Included                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Active bundles         | **Unlimited**                                                                              |
| Bundle types           | All types (as they launch)                                                                 |
| Products per bundle    | Up to **20**                                                                               |
| Discount types         | All 4                                                                                      |
| Widget layouts         | All 4                                                                                      |
| Style presets          | All 8                                                                                      |
| Custom colors          | Full + **layout-specific colors** (per-type accent colors, tier highlights, group headers) |
| Responsive overrides   | Desktop + Tablet + Mobile + **custom breakpoints**                                         |
| Custom CSS             | **Full editor** (10,000 chars) — complete design control                                   |
| Analytics              | Full dashboard + **comparison charts** (funnel, conversion trends, revenue & AOV)          |
| Charts                 | All 6 charts                                                                               |
| Performance badges     | **All 6** (+ Hidden Gem, Declining, High Interest)                                         |
| Health status          | Full                                                                                       |
| Date range filter      | **Custom date range** + all presets                                                        |
| Bundle scheduling      | Full                                                                                       |
| Free shipping badge    | Available                                                                                  |
| Label customization    | Available                                                                                  |
| Bundle images          | Up to **5** per bundle                                                                     |
| Export/Import settings | **Available** — backup & restore all settings                                              |
| Discount caps          | **Available** — max discount amount + min order value                                      |
| Custom breakpoints     | **Available** — define exact tablet/mobile pixel thresholds                                |
| Priority support       | **Email support** with faster response time                                                |
| Branding               | **No branding** — clean, white-label widget                                                |

---

### Plan Comparison at a Glance

|                      |     Free     |              Pro              |
| -------------------- | :----------: | :---------------------------: |
| Active bundles       |      5       |           Unlimited           |
| Products per bundle  |      10      |              20               |
| Discount types       |    All 4     |             All 4             |
| Layouts & presets    |     All      |              All              |
| Responsive overrides |   Standard   | Standard + custom breakpoints |
| Color customization  |  Full base   |    Full + layout-specific     |
| Custom CSS           |      —       |         10,000 chars          |
| Analytics dashboard  |     Full     |   Full + comparison charts    |
| Performance badges   |      3       |             All 6             |
| Scheduling           |     Yes      |              Yes              |
| Labels               | Customizable |         Customizable          |
| Bundle images        |      3       |               5               |
| Export/Import        |      —       |              Yes              |
| Discount caps        |      —       |              Yes              |
| Custom date range    |      —       |              Yes              |
| Branding removal     |      —       |              Yes              |
| Support              |  Community   |        Priority email         |

---

### Recommended Pricing

| Plan     | Price       | Target Merchant                                                                                               |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| **Free** | $0/month    | Any store getting started with bundles, small catalogs, < 100 orders/month                                    |
| **Pro**  | $9.99/month | Growing stores that need unlimited bundles, advanced analytics, full design control, and white-label branding |

**Why $9.99:** Competitive with Shopify bundle app market (most charge $14.99-$29.99). The generous free plan drives installs and reviews; $9.99 is an easy upgrade when merchants see value. Revenue comes from volume, not squeezing individual merchants.

---

### Natural Upgrade Triggers

These are the moments merchants organically discover they need Pro:

| Trigger                       | Message                                                               |
| ----------------------------- | --------------------------------------------------------------------- |
| Creating 6th bundle           | "You've maxed out 5 bundles on Free. Upgrade for unlimited bundles."  |
| Adding 11th product to bundle | "Free supports up to 10 products. Upgrade for up to 20."              |
| Trying Custom CSS             | "Want pixel-perfect control? Custom CSS is available on Pro."         |
| Viewing comparison charts     | "Unlock funnel analysis, conversion trends & AOV charts with Pro."    |
| Needing custom date range     | "Pro lets you analyze any date range — track seasonal campaigns."     |
| Wanting no branding           | "Remove 'Powered by Radius' with Pro for a clean, professional look." |
| Exporting settings            | "Back up and restore your settings across stores with Pro."           |
| Setting discount caps         | "Control maximum discount amounts and minimum order values on Pro."   |
| Growing past 3 images         | "Upload up to 5 bundle images on Pro for richer product showcases."   |

---

### Implementation Notes for Gating

Features that need plan-based gating:

| Gate                     | Check Point                                                  | Free Limit |
| ------------------------ | ------------------------------------------------------------ | ---------- |
| Bundle count             | `createBundleService` — check active count vs. plan limit    | 5          |
| Product count per bundle | Bundle validation schema — dynamic max based on plan         | 10         |
| Custom CSS               | Settings page — show upgrade banner instead of editor        | Locked     |
| Comparison charts        | Analytics page — blur/lock funnel, trends, AOV charts        | Locked     |
| Badge count              | Analytics — only show High Converter, Revenue Star, Trending | 3 of 6     |
| Custom date range        | Analytics date picker — disable custom range option          | Locked     |
| Export/Import            | Settings tools tab — show upgrade prompt                     | Locked     |
| Discount caps            | Bundle form — hide max discount amount fields                | Locked     |
| Custom breakpoints       | Customizer — hide custom breakpoint inputs                   | Locked     |
| Layout-specific colors   | Customizer — hide per-type accent color fields               | Locked     |
| Branding removal         | Widget rendering — conditional "Powered by" link             | Shown      |
| Image count              | Media upload — limit to 3 with upgrade prompt                | 3          |

The `Shop` model already has `plan` and `trialEndsAt` fields for plan management. The `AppSettings` model has `maxBundleLimit` which can be set per plan.
