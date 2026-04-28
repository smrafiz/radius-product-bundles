# Radius Bundles — Full Product Vision & Roadmap

> Current state + planned features across 5 phases. Schema readiness and dependencies noted per feature.

---

## Current State Summary

### Fully Implemented (Production-Ready)

| #   | Feature             | Details                                                                                |
| --- | ------------------- | -------------------------------------------------------------------------------------- |
| 1   | Bundle CRUD         | Create, edit, duplicate, delete (soft), status management, bulk actions                |
| 2   | Fixed Bundle Type   | Full flow — products, discount, appearance, review                                     |
| 3   | Discount Engine     | Rust WASM function — percentage, fixed, custom price, no discount, free shipping, caps |
| 4   | Storefront Widget   | 4 layouts (list, grid, carousel, compact), product cards, pricing, cart integration    |
| 5   | Style Customizer    | 70+ settings, 8 presets, 5 sections, responsive overrides (desktop/tablet/mobile)      |
| 6   | Analytics           | View/cart/purchase tracking, 6 badges, 4 health states, charts, funnel, date filtering |
| 7   | Dashboard           | 4 KPI cards, top bundles, quick actions, setup guide, tutorials, feedback              |
| 8   | Bundle Scheduling   | Start/end dates with cron automation                                                   |
| 9   | Settings            | General, labels, styles, advanced CSS, data tools, webhook management                  |
| 10  | Shopify Integration | OAuth, webhooks (6 handlers), metafield sync, app proxy, theme extension               |

### Schema-Only (Tables exist, no implementation)

| Feature         | Tables Ready                                | What's Missing                                              |
| --------------- | ------------------------------------------- | ----------------------------------------------------------- |
| A/B Testing     | ABTest, TestResult                          | Traffic splitting, variant serving, significance calculator |
| Automation      | Automation, AutomationLog, AutomationBundle | Trigger evaluation, execution engine                        |
| Dynamic Pricing | PricingRule, PricingRuleBundle              | Rule evaluation, condition matching                         |
| AI Insights     | AIInsight                                   | LLM integration, insight generation                         |
| Templates       | Template, TemplateReview                    | Template marketplace, ratings system                        |

### Type-Only (Enum/type defined, no dedicated logic)

| Feature                    | What Exists                                      | What's Missing                                   |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Buy X Get Y                | Bundle type enum, validation rules, UI structure | Storefront rendering, dedicated creation UX      |
| BOGO                       | Bundle type enum, validation rules               | Storefront rendering, dedicated creation UX      |
| Volume Discount            | Bundle type enum, tier structure                 | Tier storefront rendering, dedicated creation UX |
| Mix & Match                | Bundle type enum, group structure                | Group selector storefront, dedicated creation UX |
| Frequently Bought Together | Bundle type enum                                 | Product affinity engine, recommendation logic    |

---

## Phase 1 — AI Insights Engine (No Schema Changes)

### 1.1 Bundle Performance AI Advisor

**Goal:** Analyze BundleAnalytics time-series data via LLM to generate actionable optimization insights.

**What it does:**

- Analyzes conversion funnels, revenue trends, and product performance per bundle
- Generates specific, actionable recommendations (pricing adjustments, product swaps, promotion timing)
- Populates existing `AIInsight` table with types: OPTIMIZATION, RECOMMENDATION, WARNING
- Surfaces insights in existing dashboard AI Insights card (currently placeholder)
- Tracks confidence scoring, expiration dates, and whether insights were applied

**Data sources:** BundleAnalytics (views, carts, purchases, revenue by hour/day), Bundle (discount config, products, status history)

**Schema changes:** None — uses existing AIInsight table

**Dependencies:** None — can launch independently

---

### 1.2 Smart Bundle Name & Copy Generator

**Goal:** LLM-powered content generation for bundle names, marketing copy, and SEO metadata.

**What it does:**

- Generates creative bundle names from selected product list
- Writes marketing copy for `Bundle.marketingCopy` field
- Creates SEO title and description for `Bundle.seoTitle` and `Bundle.seoDescription`
- Integrates into bundle creation step 1 (Products) as "Generate with AI" buttons
- Multiple suggestions with merchant selection

**Schema changes:** None — uses existing fields

**Dependencies:** None

---

### 1.3 AI Pricing Suggestions

**Goal:** Data-driven discount optimization recommendations per bundle.

**What it does:**

- Analyzes conversion rates at different price points
- Compares performance across bundle discount types and values
- Suggests optimal discount percentage/amount to maximize revenue or conversion
- Uses existing `discountType` / `discountValue` fields
- Shows projected impact: "Changing from 15% to 20% could increase conversions by ~12%"

**Schema changes:** None

**Dependencies:** Sufficient analytics data (30+ days recommended)

---

## Phase 2 — Product Affinity & Recommendations

### 2.1 Order Co-occurrence Analysis

**Goal:** Build a product affinity graph from order history to power "Frequently Bought Together" bundles.

**What it does:**

- Processes `orders/create` webhook to extract product pairs purchased together
- Builds co-occurrence matrix: Product A bought with Product B — count, frequency, recency
- Batch recalculation job for affinity scores (nightly or weekly)
- Decays old data to keep recommendations fresh

**Schema changes:** New `ProductAffinity` table:

```
ProductAffinity {
  id, shopId, productIdA, productIdB,
  coOccurrenceCount, affinityScore, lastCalculated,
  createdAt, updatedAt
}
```

**Dependencies:** `orders/create` webhook (already implemented), sufficient order volume

---

### 2.2 AI Bundle Suggestions

**Goal:** Automatically recommend complementary product groupings for new bundles.

**What it does:**

- Uses affinity data + LLM reasoning to suggest product combinations
- Auto-generates FREQUENTLY_BOUGHT_TOGETHER bundles with confidence scores
- Merchant review/approve workflow before publishing
- Populates `Bundle.aiOptimized` and `Bundle.aiScore` fields

**Schema changes:** None

**Dependencies:** Phase 2.1 (affinity data)

---

### 2.3 Customer Segment Recommendations

**Goal:** Cluster customers by behavior and recommend segment-specific bundles.

**What it does:**

- Analyzes BundleView data (customerId, sessionId patterns)
- Clusters customers by purchase behavior (frequency, value, product preferences)
- Recommends which bundles to promote to which segments
- Could integrate with Shopify customer segments/tags

**Schema changes:** None

**Dependencies:** Significant analytics data volume

---

## Phase 3 — A/B Testing (Schema Exists, Needs Logic)

### 3.1 A/B Test Execution Engine

**Goal:** Run controlled experiments on bundle configurations to find what converts best.

**What it does:**

- Traffic splitting via `ABTest.trafficSplit` (e.g., 50/50, 70/30)
- Variant serving via App Proxy (different pricing, layout, or copy per visitor)
- Records results into existing `TestResult` model
- Statistical significance calculator (chi-squared or Bayesian)
- Auto-completes test when `minSampleSize` reached + significance threshold met
- Dashboard for monitoring active tests with real-time metrics

**Schema changes:** None — uses existing ABTest + TestResult tables

**Dependencies:** None — can launch independently

---

### 3.2 AI Test Hypothesis Generator

**Goal:** Automatically identify what to test and generate test variants.

**What it does:**

- Analyzes underperforming bundles → suggests what to test
- Auto-generates variants: pricing alternatives, copy variations, layout options, product mix changes
- Populates `ABTest.hypothesis` and `ABTest.variantConfig` via LLM
- Post-test AI summary with actionable takeaways

**Schema changes:** None

**Dependencies:** Phase 3.1 (test execution engine)

---

## Phase 4 — Automation Engine (Schema Exists, Needs Execution)

### 4.1 Trigger Evaluation System

**Goal:** Automated actions based on bundle performance, inventory, and schedule conditions.

**Trigger types:**

- **SCHEDULE** — Cron-based bundle activation/deactivation (e.g., "Activate every Friday at 6pm")
- **PERFORMANCE** — React to metric thresholds (e.g., "Pause if conversion drops below 2%")
- **INVENTORY** — Pause bundles when products go out of stock
- **CUSTOMER_BEHAVIOR** — Trigger on view/cart patterns (e.g., "High cart abandonment → show discount popup")

**What it does:**

- Evaluates trigger conditions on schedule (cron) or event (webhook)
- Executes configured actions (status change, notification, discount adjustment)
- Logs everything to existing `AutomationLog` model
- Dashboard for managing active automations with execution history

**Schema changes:** None — uses existing Automation + AutomationLog + AutomationBundle tables

**Dependencies:** None

---

### 4.2 AI Auto-Optimization Loop

**Goal:** Closed-loop system that detects problems, tests solutions, and applies winners.

**What it does:**

- If bundle health degrades → auto-creates A/B test with AI-suggested variants
- If A/B test finds winner → auto-applies with merchant notification
- Seasonal pattern detection → suggests scheduled bundles (e.g., "This bundle performs 40% better on weekends")
- Anomaly detection for sudden conversion drops or revenue spikes

**Schema changes:** None

**Dependencies:** Phase 3.1 (A/B testing) + Phase 4.1 (automation triggers)

---

## Phase 5 — Advanced AI Features

### 5.1 Dynamic Pricing Engine

**Goal:** Real-time price adjustment within merchant-defined bounds based on conditions.

**What it does:**

- Activates existing `PricingRule` model with rule evaluation engine
- AI-suggested conditions: time-of-day pricing, customer LTV tiers, cart value tiers, demand-based
- Real-time price adjustment within merchant-defined min/max bounds
- Tracks impact via existing `PricingRule.revenueImpact`
- Dashboard for managing rules with performance metrics

**Schema changes:** None — uses existing PricingRule + PricingRuleBundle tables

**Dependencies:** None (but more powerful with analytics data)

---

### 5.2 Natural Language Bundle Builder

**Goal:** Create bundles through conversational AI interface.

**What it does:**

- Chat interface: "Create a summer skincare bundle under $50 with 15% off"
- LLM parses intent → selects matching products from store catalog → configures bundle → shows preview
- Handles follow-up: "Add sunscreen too" or "Make the discount 20% instead"
- Merchant confirms and publishes
- Could suggest products if catalog is large: "I found 12 skincare products. Here are the top 5 by sales..."

**Schema changes:** None

**Dependencies:** None

---

### 5.3 Predictive Analytics

**Goal:** Forward-looking revenue and performance forecasting.

**What it does:**

- Revenue forecasting from BundleAnalytics time-series trends
- AIInsight type PREDICTION: "This bundle will likely generate $X next month"
- Churn prediction: identifies bundles losing traction before they flatline
- Seasonal adjustment: accounts for holidays, weekends, promotional periods
- Dashboard widget with confidence intervals

**Schema changes:** None

**Dependencies:** Sufficient analytics data volume (60+ days recommended)

---

## Implementation Priority Matrix

| #   | Feature                       | Schema Changes | Depends On     | Complexity | Business Impact |
| --- | ----------------------------- | -------------- | -------------- | ---------- | --------------- |
| 1.1 | Bundle Performance AI Advisor | None           | —              | Medium     | High            |
| 1.2 | Smart Copy Generator          | None           | —              | Low        | Medium          |
| 1.3 | AI Pricing Suggestions        | None           | —              | Medium     | High            |
| 2.1 | Order Co-occurrence           | New table      | orders webhook | Medium     | High            |
| 2.2 | AI Bundle Suggestions         | None           | #2.1           | Medium     | High            |
| 2.3 | Customer Segments             | None           | Data volume    | High       | Medium          |
| 3.1 | A/B Test Engine               | None           | —              | High       | Very High       |
| 3.2 | AI Hypothesis Generator       | None           | #3.1           | Medium     | High            |
| 4.1 | Automation Triggers           | None           | —              | High       | High            |
| 4.2 | Auto-Optimization Loop        | None           | #3.1 + #4.1    | Very High  | Very High       |
| 5.1 | Dynamic Pricing               | None           | —              | High       | High            |
| 5.2 | NL Bundle Builder             | None           | —              | High       | Medium          |
| 5.3 | Predictive Analytics          | None           | Data volume    | High       | Medium          |

**8 of 13 features need zero schema changes.** Only #2.1 requires a new table.

---

## Bundle Type Activation Roadmap

The 5 "coming soon" bundle types each need:

| Type                           | Storefront Widget                                  | Creation UX                                      | Discount Logic                            | Priority              |
| ------------------------------ | -------------------------------------------------- | ------------------------------------------------ | ----------------------------------------- | --------------------- |
| **Buy X Get Y**                | Trigger/reward product display, tier cards         | Buy/get quantity inputs, product role assignment | Trigger/reward matching in Rust function  | High                  |
| **BOGO**                       | FREE tag on reward product                         | Simplified buy-one-get-one UI                    | Special case of Buy X Get Y               | High                  |
| **Volume Discount**            | Quantity tier table/cards, tier highlighting       | Tier builder (quantity → discount)               | Tier matching by quantity in cart         | High                  |
| **Mix & Match**                | Product group selectors (checkbox/radio/highlight) | Group builder with min/max selection             | Group validation + combined discount      | Medium                |
| **Frequently Bought Together** | Checkbox product selector, separator style         | Auto-suggested products from affinity data       | Standard discount on selected combination | Low (needs Phase 2.1) |

---

## Technical Debt & Infrastructure

| Item                  | Status          | Notes                                                    |
| --------------------- | --------------- | -------------------------------------------------------- |
| Soft delete migration | Planned         | Add DELETED to BundleStatus enum, 13 queries need filter |
| Template marketplace  | Schema only     | Template + TemplateReview tables exist, no UI            |
| Notification system   | Schema only     | Notification + AlertRule tables exist, no delivery       |
| Rate limiting         | Not implemented | App proxy endpoints could benefit from rate limiting     |
| Background jobs       | Partial         | Only cron-based (Vercel cron), no proper job queue       |
| Error monitoring      | Not implemented | No Sentry/similar integration                            |
| E2E testing           | Not implemented | No Playwright/Cypress tests                              |
