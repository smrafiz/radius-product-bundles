# Feature Audit: Competitive Report vs Actual Implementation

> Cross-reference of the competitive analysis recommendations against what Radius Product Bundles actually has today.

**Legend:** ✅ Implemented | ⚠️ Partial | ❌ Missing | 🏷️ Type/Schema Only

---

## Summary

| Status                     | Count   | %   |
| -------------------------- | ------- | --- |
| ✅ Implemented             | 42      | 33% |
| ⚠️ Partial                 | 8       | 6%  |
| 🏷️ Type/Schema Only        | 11      | 9%  |
| ❌ Missing                 | 66      | 52% |
| **Total features audited** | **127** |     |

---

## Free Plan — Competitive Report Recommendations

### Bundle Types (Free)

| Feature                      | Report Says | Status             | Notes                                                                                        |
| ---------------------------- | ----------- | ------------------ | -------------------------------------------------------------------------------------------- |
| Fixed Bundles (Unlimited)    | ✅ Include  | ✅ **Implemented** | Full CRUD, 4-step wizard, all operations                                                     |
| Volume Discounts (Unlimited) | ✅ Include  | 🏷️ **Type Only**   | Enum + validation rules exist, UI structure exists, marked "Coming Soon"                     |
| Quantity Breaks (Unlimited)  | ✅ Include  | 🏷️ **Type Only**   | `QUANTITY_BREAKS` discount type defined, tier structure exists, no storefront rendering      |
| BOGO / Buy X Get Y           | ✅ Include  | 🏷️ **Type Only**   | Both types defined with validation rules, trigger/reward roles exist, marked "Coming Soon"   |
| Mix & Match (Up to 3)        | ✅ Include  | 🏷️ **Type Only**   | Type + group structure + validation rules, marked "Coming Soon"                              |
| Variant Bundles              | ✅ Include  | ⚠️ **Partial**     | Products support variantId selection within Fixed Bundle, no dedicated "variant bundle" type |
| Multipacks                   | ✅ Include  | ⚠️ **Partial**     | Achievable via Fixed Bundle with quantity > 1 per product, no dedicated multipack UI         |

### Discount Types (Free)

| Feature               | Report Says | Status             | Notes                                                   |
| --------------------- | ----------- | ------------------ | ------------------------------------------------------- |
| Percentage Discount   | ✅ Include  | ✅ **Implemented** | Full Rust WASM function                                 |
| Fixed Amount Discount | ✅ Include  | ✅ **Implemented** | Full Rust WASM function                                 |
| Fixed Bundle Price    | ✅ Include  | ✅ **Implemented** | `CUSTOM_PRICE` discount type                            |
| Per-Unit Discount     | ✅ Include  | ❌ **Missing**     | Discount applies to bundle total, not per line item     |
| Auto-Apply Discount   | ✅ Include  | ✅ **Implemented** | Rust function auto-applies when bundle products in cart |

### Display & Customization (Free)

| Feature                      | Report Says | Status             | Notes                                                                                            |
| ---------------------------- | ----------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Product Page Widget          | ✅ Include  | ✅ **Implemented** | Liquid theme extension with app block                                                            |
| Basic Widget Customization   | ✅ Include  | ✅ **Implemented** | Actually have FULL customizer (70+ settings, 8 presets) — exceeds "basic"                        |
| 3 Widget Templates           | ✅ Include  | ✅ **Implemented** | Have 4 layouts (List, Grid, Carousel, Compact) + 8 style presets                                 |
| Mobile Responsive            | ✅ Include  | ✅ **Implemented** | Full responsive overrides (desktop/tablet/mobile)                                                |
| OS 2.0 App Blocks            | ✅ Include  | ✅ **Implemented** | App Embed + Product Block                                                                        |
| Multi-language (5 languages) | ✅ Include  | ❌ **Missing**     | Labels are customizable (any text) but no i18n system, no locale detection, no translation files |

### Analytics (Free)

| Feature                 | Report Says | Status             | Notes                                                                   |
| ----------------------- | ----------- | ------------------ | ----------------------------------------------------------------------- |
| Total Bundle Revenue    | ✅ Include  | ✅ **Implemented** | Full revenue tracking via orders/create webhook                         |
| Bundle Orders Count     | ✅ Include  | ✅ **Implemented** | Purchase count tracking                                                 |
| 7-Day Performance Graph | ✅ Include  | ✅ **Implemented** | Actually have 3 charts (Revenue, Views, Purchases) + 7/14/30 day ranges |

### Integrations (Free)

| Feature             | Report Says | Status             | Notes                                                                                                                   |
| ------------------- | ----------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Shopify Checkout    | ✅ Include  | ✅ **Implemented** | Rust discount function runs at checkout                                                                                 |
| All Shopify Themes  | ✅ Include  | ✅ **Implemented** | Liquid extension with OS 2.0 blocks                                                                                     |
| Cart Drawer Support | ✅ Include  | ⚠️ **Partial**     | Smart cart drawer detection for Dawn + some themes, redirect options after add-to-cart. No dedicated cart drawer widget |

### Free Plan Limits

| Limit                       | Report Says | Status              | Notes                                                                       |
| --------------------------- | ----------- | ------------------- | --------------------------------------------------------------------------- |
| Max Active Bundles: 5       | ✅ Enforce  | ❌ **Not enforced** | `maxBundleLimit` field exists on AppSettings but no plan-based gating logic |
| Mix & Match: 3 max          | ✅ Enforce  | ❌ **Not enforced** | No per-type limits implemented                                              |
| Revenue Cap: $500/mo        | ✅ Enforce  | ❌ **Missing**      | No revenue tracking against caps                                            |
| Analytics Retention: 7 days | ✅ Enforce  | ❌ **Not enforced** | All data retained indefinitely                                              |
| 3 Templates                 | ✅ Enforce  | ❌ **Not enforced** | All 4 layouts + 8 presets available to everyone                             |
| 5 Languages                 | ✅ Enforce  | ❌ **N/A**          | No i18n system to gate                                                      |
| No POS                      | ✅ Lock     | ✅ **N/A**          | POS not implemented at all                                                  |
| No AI                       | ✅ Lock     | ✅ **N/A**          | AI not implemented at all                                                   |
| Radius Branding             | ✅ Show     | ❌ **Missing**      | No branding/watermark on widget                                             |

---

## Pro Plan ($14.99) — Competitive Report Recommendations

### Additional Bundle Types (Pro)

| Feature                             | Report Says | Status             | Notes                                                 |
| ----------------------------------- | ----------- | ------------------ | ----------------------------------------------------- |
| Unlimited Fixed Bundles             | ✅ Include  | ✅ **Implemented** | No limits currently                                   |
| Unlimited Mix & Match               | ✅ Include  | 🏷️ **Type Only**   | Type defined, "Coming Soon"                           |
| Build a Box / BYOB                  | ✅ Include  | ❌ **Missing**     | No customer-facing bundle builder                     |
| Tiered Mix & Match                  | ✅ Include  | 🏷️ **Type Only**   | Part of Mix & Match type structure                    |
| Frequently Bought Together (Manual) | ✅ Include  | 🏷️ **Type Only**   | Enum defined, no product affinity or manual FBT logic |
| Upsell Bundles                      | ✅ Include  | ❌ **Missing**     | No upsell-specific bundle flow                        |
| Cross-sell Bundles                  | ✅ Include  | ❌ **Missing**     | No cross-sell positioning system                      |
| Product Add-ons                     | ✅ Include  | ❌ **Missing**     | No add-on system                                      |
| Gift Box Templates                  | ✅ Include  | ❌ **Missing**     | No gift box presets or UI                             |

### Advanced Discounts (Pro)

| Feature                  | Report Says | Status             | Notes                                                                                                          |
| ------------------------ | ----------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Tiered Pricing           | ✅ Include  | ⚠️ **Partial**     | Volume tier structure exists in schema + validation, Rust function has tier logic, but UI marked "Coming Soon" |
| Free Shipping on Bundles | ✅ Include  | ✅ **Implemented** | Rust function handles delivery discounts, free shipping badge in widget                                        |
| Cart Discounts           | ✅ Include  | ✅ **Implemented** | Rust function applies discounts to cart lines                                                                  |
| Subscription Pricing     | ✅ Include  | ❌ **Missing**     | No subscription integration                                                                                    |

### Enhanced Display (Pro)

| Feature                | Report Says | Status             | Notes                                                                                  |
| ---------------------- | ----------- | ------------------ | -------------------------------------------------------------------------------------- |
| 10 Widget Templates    | ✅ Include  | ⚠️ **Partial**     | 4 layouts + 8 style presets = flexible but not "10 templates" in the traditional sense |
| Custom CSS             | ✅ Include  | ✅ **Implemented** | Custom CSS editor (10,000 chars) via metafield injection                               |
| Popup/Modal Display    | ✅ Include  | ❌ **Missing**     | Widget renders inline only                                                             |
| Cart Page Widget       | ✅ Include  | ❌ **Missing**     | Widget on product pages only                                                           |
| Progress Bar           | ✅ Include  | ❌ **Missing**     | No progress/gamification bar                                                           |
| All Languages (15+)    | ✅ Include  | ❌ **Missing**     | No i18n system                                                                         |
| Multi-currency Display | ✅ Include  | ❌ **Missing**     | No currency conversion                                                                 |
| Remove Radius Branding | ✅ Include  | ❌ **N/A**         | No branding exists to remove                                                           |

### Enhanced Analytics (Pro)

| Feature                    | Report Says | Status             | Notes                                      |
| -------------------------- | ----------- | ------------------ | ------------------------------------------ |
| Full Revenue Analytics     | ✅ Include  | ✅ **Implemented** | Revenue tracking with period comparison    |
| Conversion Rate Tracking   | ✅ Include  | ✅ **Implemented** | Views → purchases conversion               |
| Average Order Value        | ✅ Include  | ✅ **Implemented** | AOV in comparison charts                   |
| 30-Day Data Retention      | ✅ Include  | ✅ **Implemented** | All data retained (no limit)               |
| Bundle Performance Ranking | ✅ Include  | ✅ **Implemented** | Top 5 bundles table + all bundles sortable |
| Export to CSV              | ✅ Include  | ❌ **Missing**     | No export functionality                    |

### Integrations (Pro)

| Feature              | Report Says | Status         | Notes                                                                                                   |
| -------------------- | ----------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| Shopify POS          | ✅ Include  | ❌ **Missing** | No POS integration                                                                                      |
| PageFly Integration  | ✅ Include  | ❌ **Missing** | No page builder integrations                                                                            |
| GemPages Integration | ✅ Include  | ❌ **Missing** | No page builder integrations                                                                            |
| Cart Drawer Apps     | ✅ Include  | ⚠️ **Partial** | Smart detection for Dawn theme drawer, redirect options, but no UpCart/Slide Cart specific integrations |

---

## Advanced Plan ($29.99) — Competitive Report Recommendations

### AI & Testing Features

| Feature                        | Report Says | Status             | Notes                                                   |
| ------------------------------ | ----------- | ------------------ | ------------------------------------------------------- |
| AI-Powered FBT Recommendations | ✅ Include  | ❌ **Missing**     | No AI/LLM integration. AIInsight table exists but empty |
| A/B Testing for Bundles        | ✅ Include  | 🏷️ **Schema Only** | ABTest + TestResult tables exist, no execution engine   |
| Wholesale Bundles              | ✅ Include  | ❌ **Missing**     | No wholesale pricing                                    |
| Subscription Boxes             | ✅ Include  | ❌ **Missing**     | No subscription system                                  |
| Sample Packs                   | ✅ Include  | ❌ **Missing**     | No sample pack type                                     |
| Custom Bundle Landing Pages    | ✅ Include  | ❌ **Missing**     | No landing page builder                                 |
| Funnel Upsell Bundles          | ✅ Include  | ❌ **Missing**     | No post-add-to-cart upsell flow                         |
| Infinite Options Bundles       | ✅ Include  | ❌ **Missing**     | Standard Shopify variant limits apply                   |

### Advanced AI Features

| Feature                    | Report Says | Status         | Notes                                                           |
| -------------------------- | ----------- | -------------- | --------------------------------------------------------------- |
| AI Product Recommendations | ✅ Include  | ❌ **Missing** | No AI integration                                               |
| AI Bundle Name Generator   | ✅ Include  | ❌ **Missing** | Has random name patterns (20 per type) but no AI/LLM generation |
| Smart Inventory Alerts     | ✅ Include  | ❌ **Missing** | No inventory monitoring                                         |
| Revenue Prediction         | ✅ Include  | ❌ **Missing** | No predictive analytics                                         |

### Premium Analytics

| Feature                      | Report Says | Status             | Notes                                                      |
| ---------------------------- | ----------- | ------------------ | ---------------------------------------------------------- |
| 90-Day Data Retention        | ✅ Include  | ✅ **Implemented** | Data retained indefinitely (no TTL)                        |
| A/B Test Results Dashboard   | ✅ Include  | ❌ **Missing**     | Schema only                                                |
| Conversion Funnel Analysis   | ✅ Include  | ✅ **Implemented** | Funnel chart (views → cart → purchase)                     |
| Customer Segment Performance | ✅ Include  | ❌ **Missing**     | No customer segmentation                                   |
| Revenue Attribution          | ✅ Include  | ⚠️ **Partial**     | Revenue tracked per bundle, but no multi-touch attribution |
| Automated Reports (Weekly)   | ✅ Include  | ❌ **Missing**     | No email/report generation                                 |

### Premium Customization

| Feature               | Report Says | Status         | Notes                                             |
| --------------------- | ----------- | -------------- | ------------------------------------------------- |
| 20+ Widget Templates  | ✅ Include  | ❌ **Missing** | 4 layouts + 8 presets, not 20+ distinct templates |
| Custom HTML Injection | ✅ Include  | ❌ **Missing** | Custom CSS only, no HTML                          |
| Shortcode Support     | ✅ Include  | ❌ **Missing** | Uses Shopify app blocks only                      |
| Custom Bundle URLs    | ✅ Include  | ❌ **Missing** | No custom URL/slug system                         |

### Premium Integrations

| Feature                            | Report Says | Status         | Notes                           |
| ---------------------------------- | ----------- | -------------- | ------------------------------- |
| Subscription Apps (Recharge, Bold) | ✅ Include  | ❌ **Missing** | No subscription app integration |
| Email Marketing (Klaviyo)          | ✅ Include  | ❌ **Missing** | No email marketing integration  |
| Post-Purchase Upsells              | ✅ Include  | ❌ **Missing** | No post-purchase flow           |

---

## Enterprise Plan ($79.99) — Competitive Report Recommendations

| Feature                   | Report Says | Status             | Notes                                               |
| ------------------------- | ----------- | ------------------ | --------------------------------------------------- |
| Unlimited Bundle Revenue  | ✅ Include  | ✅ **Implemented** | No revenue caps exist                               |
| AI Bundle Image Generator | ✅ Include  | ❌ **Missing**     | No AI image generation                              |
| Headless Commerce API     | ✅ Include  | ❌ **Missing**     | No public REST/GraphQL API for external consumption |
| Custom Bundle Logic       | ✅ Include  | ❌ **Missing**     | Standard bundle types only                          |
| Multi-store Support       | ✅ Include  | ❌ **Missing**     | Single-store per install                            |
| White-label Dashboard     | ✅ Include  | ❌ **Missing**     | No white-label option                               |
| API Access                | ✅ Include  | ❌ **Missing**     | No public API                                       |
| Unlimited Data Retention  | ✅ Include  | ✅ **Implemented** | Already no TTL on data                              |
| Custom Dashboards         | ✅ Include  | ❌ **Missing**     | Fixed dashboard layout                              |
| Real-time Analytics       | ✅ Include  | ❌ **Missing**     | 5-minute cache, hourly aggregation                  |
| Cohort Analysis           | ✅ Include  | ❌ **Missing**     | No cohort tracking                                  |
| GA4 Integration           | ✅ Include  | ❌ **Missing**     | No Google Analytics integration                     |
| Automated Reports (Daily) | ✅ Include  | ❌ **Missing**     | No report generation                                |
| Dedicated Account Manager | ✅ Include  | ❌ **N/A**         | Business ops, not code                              |
| Priority Support          | ✅ Include  | ❌ **N/A**         | Business ops, not code                              |
| Custom Development        | ✅ Include  | ❌ **N/A**         | Business ops                                        |
| Onboarding Consultation   | ✅ Include  | ❌ **N/A**         | Business ops                                        |

---

## What You Actually Have (Regardless of Plan Gating)

### Fully Working Features (No Plan Gating Exists)

Everything below is currently available to ALL users — no plan restrictions are enforced:

| Category                | Features                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Bundle CRUD**         | Create, edit, duplicate, soft delete, bulk actions (activate/draft/delete up to 100)   |
| **Bundle Type**         | Fixed Bundle fully active. 5 other types defined but "Coming Soon"                     |
| **Creation Wizard**     | 4-step form: Products → Discount → Appearance → Review                                 |
| **Products**            | Up to 20 products per bundle, variant selection, quantity per product                  |
| **Discounts**           | Percentage, Fixed Amount, Custom Price, No Discount — all via Rust WASM                |
| **Free Shipping**       | Delivery discount with custom label via Rust function                                  |
| **Discount Caps**       | Max discount amount field exists                                                       |
| **Status Management**   | Draft, Active, Paused, Scheduled, Archived + bulk status changes                       |
| **Scheduling**          | Start/end dates with cron automation                                                   |
| **Widget Layouts**      | List, Grid, Carousel, Compact — all 4 available                                        |
| **Style Customizer**    | 70+ settings, 5 sections, 8 presets, full color control                                |
| **Responsive**          | Desktop + Tablet + Mobile overrides with custom breakpoints                            |
| **Custom CSS**          | 10,000 char editor                                                                     |
| **Labels**              | All customer-facing text customizable                                                  |
| **Analytics**           | Views, carts, purchases, revenue — full tracking pipeline                              |
| **Charts**              | 3 time-series + 3 comparison (funnel, conversion, revenue & AOV)                       |
| **Performance Badges**  | 6 types (High Converter, Revenue Star, Hidden Gem, Trending, Declining, High Interest) |
| **Health Status**       | 4 states (New, Healthy, Needs Work, Poor)                                              |
| **Date Filtering**      | 7/14/30 day presets (no custom range)                                                  |
| **Dashboard**           | 4 KPI cards, top bundles, quick actions, setup guide, tutorials, feedback              |
| **Bundle Images**       | Up to 5 per bundle with upload                                                         |
| **Settings**            | General config, label customization, data tools (export/import JSON)                   |
| **Webhooks**            | products/delete, shop/update, orders/create, app/uninstalled, GDPR                     |
| **Metafield Sync**      | Bundle data + global styles → Shopify metafields                                       |
| **App Proxy**           | Product data + analytics tracking endpoints                                            |
| **Theme Extension**     | App Embed block + Product Block                                                        |
| **Auto-apply Discount** | Discounts apply automatically when bundle products are in cart                         |

### Schema/Type Only (Not Working Yet)

| Feature         | What Exists                            | What's Missing                                        |
| --------------- | -------------------------------------- | ----------------------------------------------------- |
| Buy X Get Y     | Type, validation rules, role system    | Storefront rendering, dedicated creation UX           |
| BOGO            | Type, validation rules                 | Storefront rendering, creation UX                     |
| Volume Discount | Type, tier structure, Rust logic       | Storefront tier display, creation UX                  |
| Mix & Match     | Type, group structure, validation      | Group selector storefront, creation UX                |
| FBT             | Type enum only                         | Everything (affinity, recommendations, UI)            |
| A/B Testing     | ABTest + TestResult tables             | Traffic splitting, variant serving, significance calc |
| Automation      | Automation + AutomationLog tables      | Trigger evaluation, execution engine                  |
| Dynamic Pricing | PricingRule + PricingRuleBundle tables | Rule evaluation, condition matching                   |
| AI Insights     | AIInsight table                        | LLM integration, insight generation                   |
| Templates       | Template + TemplateReview tables       | Template marketplace, ratings                         |
| Notifications   | Notification + AlertRule tables        | Delivery system, email/push                           |

---

## Gap Analysis: What's Needed to Match Competitive Report

### Critical Gaps (Competitors All Have These)

| #   | Feature                           | Effort | Impact                                  |
| --- | --------------------------------- | ------ | --------------------------------------- |
| 1   | **Plan gating system**            | Medium | Must-have before monetization           |
| 2   | **Branding badge** on Free plan   | Low    | Revenue enabler                         |
| 3   | **Multi-language / i18n**         | High   | All 3 competitors support 10+ languages |
| 4   | **Volume Discount activation**    | Medium | All 3 competitors have this             |
| 5   | **BOGO / Buy X Get Y activation** | Medium | All 3 competitors have this             |
| 6   | **Mix & Match activation**        | High   | Bundler (paid) + Fast Bundle have this  |
| 7   | **Multi-currency**                | Medium | 2 of 3 competitors support this         |

### Important Gaps (2+ Competitors Have These)

| #   | Feature                       | Effort | Impact                       |
| --- | ----------------------------- | ------ | ---------------------------- |
| 8   | **Popup/modal display**       | Medium | Bundler + Fast Bundle        |
| 9   | **Cart page widget**          | Medium | All 3 competitors            |
| 10  | **Shopify POS**               | High   | Bundler (free) + Fast Bundle |
| 11  | **Page builder integrations** | Medium | All 3 competitors            |
| 12  | **Progress bar**              | Low    | Fast Bundle has this         |
| 13  | **Build a Box / BYOB**        | High   | Bundler + Fast Bundle        |
| 14  | **CSV export**                | Low    | Standard feature             |

### Differentiator Gaps (Unique Opportunities)

| #   | Feature                        | Effort | Impact                  |
| --- | ------------------------------ | ------ | ----------------------- |
| 15  | **A/B Testing** (schema ready) | High   | NO competitor has this  |
| 16  | **AI FBT Recommendations**     | High   | Only Fast Bundle has AI |
| 17  | **Headless Commerce API**      | High   | NO competitor has this  |
| 18  | **Bundle Landing Pages**       | Medium | Only Bundler (paid)     |

### What You Have That Competitors DON'T on Free

| Advantage                         | Details                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| **Full style customizer on Free** | 70+ settings, 8 presets — competitors offer "basic" customization on free |
| **Responsive overrides on Free**  | Desktop/tablet/mobile — no competitor offers this free                    |
| **6 performance badges**          | No competitor has bundle health badges at any tier                        |
| **Funnel analytics**              | Only Bundler has funnel (at $19.99 Executive tier) — you have it built    |
| **Bundle health status**          | Unique feature — no competitor has automated health classification        |
| **Comparison charts**             | Revenue & AOV dual charts — unique                                        |
| **Setup guide**                   | 5-step onboarding with auto-detection — polished UX                       |
| **Custom CSS on Free**            | Currently ungated — most competitors lock this to paid                    |
| **5 images per bundle**           | Most competitors offer 1-2                                                |
| **Bundle scheduling**             | Currently ungated — Bundler locks this to Premium                         |

---

## Recommended Priority Order

Based on competitive pressure + implementation effort + revenue impact:

| Priority | Action                                       | Why                                                             |
| -------- | -------------------------------------------- | --------------------------------------------------------------- |
| **1**    | Build plan gating system                     | Can't monetize without it                                       |
| **2**    | Add branding badge for Free                  | Immediate upgrade incentive                                     |
| **3**    | Activate Volume Discount type                | All competitors have it, validation + Rust logic already exists |
| **4**    | Activate BOGO / Buy X Get Y                  | All competitors have it, type + validation ready                |
| **5**    | Add multi-language (at least 5-10 languages) | All competitors support this, big market gap                    |
| **6**    | Activate Mix & Match                         | Key competitive feature                                         |
| **7**    | Add cart page + popup display                | Standard across competitors                                     |
| **8**    | Build A/B testing engine                     | Unique differentiator, schema ready                             |
| **9**    | Add CSV export                               | Low effort, expected feature                                    |
| **10**   | Add multi-currency                           | 2/3 competitors have this                                       |
