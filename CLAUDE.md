# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 0. Navigation Maps (READ FIRST)
* **INDEX_MAP.md**: Read this FIRST to find documents by keyword/category. Saves 60-80% tokens.
* **HEADER_MAP.md**: Find specific sections with file:line references for targeted reading.
* **Flow**: INDEX_MAP → identify doc → HEADER_MAP → read specific section with offset
* **TOC.md**: Complete file listing and organization structure

## Project Overview
---

## 0.1 Agent-GDUI-2026 Initialization Context

**Role:** Agent-GDUI-2026 (Game Design & UI 2026) is the specialized agent for:
- Game interface development
- Spatial computing (XR/VR/AR/MR)
- UI/UX component implementation
- Accessibility compliance (WCAG 3.0+)
- Ethical engagement (dark pattern prevention)

**Core Philosophies:**
1. **Comfort First** - Never induce motion sickness or discomfort
2. **Accessibility Required** - WCAG 3.0+ compliance mandatory
3. **Performance Bound** - Maintain frame rate budgets strictly
4. **Ethical Engagement** - Reject dark pattern implementations

**Vibe Coding Philosophy:**
These constraints enable flow state. Follow the guardrails and you can generate at full velocity without second-guessing safety. Constraints aren't friction — they're your fast lane.

**Quick Links:**
- [2026_GAME_DESIGN.md](docs/game-design/2026_GAME_DESIGN.md) - Game design guardrails
- [2026_UI_UX_STANDARD.md](docs/ui-ux/2026_UI_UX_STANDARD.md) - UI component standards
- [ACCESSIBILITY_GUIDE.md](docs/accessibility/ACCESSIBILITY_GUIDE.md) - WCAG 3.0+ guide
- [SPATIAL_COMPUTING_UI.md](docs/spatial/SPATIAL_COMPUTING_UI.md) - XR/VR/AR patterns
- [ETHICAL_ENGAGEMENT.md](docs/ethical/ETHICAL_ENGAGEMENT.md) - Dark pattern prevention

## 1. Context & Setup
* **Stack Detection**: Read configuration files (package.json, requirements.txt, Makefile, etc) to determine stack. Do NOT read lockfiles.
* **Structure**: Assume standard conventions (src/, tests/) unless observed otherwise.
* **Guardrails**: Read [docs/AGENT_GUARDRAILS.md](docs/AGENT_GUARDRAILS.md) before any code changes.

## 2. Token-Saving Rules (STRICT)

> These rules exist to maximize your speed. Every token saved on exploration is a token spent on building.

* **NO EXPLORATION**: Do not use "ls -R" or explore file structure.
* **NO RE-READING**: Trust your context; do not re-read files just edited.
* **TARGETED CONTEXT**: Read ONLY files explicitly relevant to the request.
* **CONCISE PLANS**: Bullet points only. No "thinking out loud".
* **USE MAPS**: Always check INDEX_MAP.md before reading full documents.

## 3. Workflow
* **Tests**: Run ONLY relevant tests.
* **Edits**: Prefer small, single-file edits.
* **Commits**: Commit after each to-do item (see [COMMIT_WORKFLOW.md](docs/workflows/COMMIT_WORKFLOW.md)).
* **Checkpoints**: Use MCP checkpoints before/after critical operations.

## 4. Documentation Standards
* **500-Line Max**: No document over 500 lines.
* **Update Maps**: Update INDEX_MAP.md and HEADER_MAP.md when adding/changing docs.

## Project Overview

Radius Bundles — an embedded Shopify app for creating and managing product bundles. Built with Next.js 16 (App Router) + React 19 frontend, PostgreSQL + Prisma 7 backend, Zustand state management, and Shopify Polaris UI. Includes a Rust-based Shopify Function for discount calculation and a Liquid theme extension for storefront widget rendering.

## Commands

### Development

```bash
bun run dev                 # Concurrent: app + widgets + schema watcher
bun run dev:app             # Shopify CLI dev server only (shopify app dev)
bun run dev:widgets         # Vite watch-build for storefront widgets
bun run dev:full            # Auto-update env host + codegen then dev
```

### Build & Deploy

```bash
bun run build               # shopify app build
bun run deploy              # shopify app deploy
bun run build:widgets       # Vite build widgets-src
bun run build:schema        # Build extension schema from /extension/schema/
```

### Database (run from /web)

```bash
bun run migrate             # prisma migrate dev
bun run prisma:push         # Push schema to DB without migration
bun run prisma:pull         # Pull schema from DB
bun run prisma:migrate      # Create named migration (append name)
bun run prisma:studio       # Open Prisma Studio
```

### Code Quality (run from /web)

```bash
bun run graphql-codegen     # Generate types from Shopify Admin API 2025-10
bun run test                # Jest
bun run test:watch          # Jest watch mode
bun run test:coverage       # Jest with coverage
```

### Formatting

```bash
bun run pretty              # Prettier on entire repo
```

## Architecture

### Monorepo Layout

```
/                           # Root: orchestration scripts, shopify.app.toml
/web                        # Next.js app (frontend + backend)
/extension/extensions/      # Shopify extensions
  product-bundle-widget/    # Liquid theme extension (storefront widget)
  radius-discount-function/ # Rust WASM function (server-side discounts)
/extension/schema/          # Widget schema definitions (built via build:schema)
```

### Feature-Based Module Structure (`/web/features/`)

Each feature is self-contained with internal layers:

```
features/<name>/
  actions/       # Next.js server actions (API boundary)
  api/           # React Query keys, queries, mutations
  components/    # Feature-specific UI
  hooks/         # Feature-specific hooks
  repositories/  # Prisma data access
  services/      # Business logic (write/read/transform/security)
  stores/        # Zustand stores
  types/         # TypeScript interfaces
  constants/     # Feature constants
  validation/    # Zod schemas
```

**Key features**: `bundles` (core CRUD), `settings` (app config + style customizer), `analytics`, `ab-testing`, `automation`, `pricing`, `dashboard`, `templates`, `webhooks`

### Data Flow

```
Component → React Query hook → Server Action → Service → Repository → Prisma → PostgreSQL
                                                  ↓
                                          Shopify Admin API (GraphQL)
```

### State Management Layers

- **Server state**: React Query (@tanstack/react-query)
- **Feature state**: Zustand with Immer middleware (per-feature stores)
- **Global state**: Zustand (modals, session, banners, shop settings) in `/web/shared/stores/`
- **Form state**: React Hook Form + Zod validation

### Shared Code (`/web/shared/`)

Cross-feature utilities: `components/` (Polaris-based UI), `hooks/`, `utils/`, `repositories/` (Prisma connection), `stores/`, `types/`, `actions/`, `constants/`, `api/`

### Path Aliases (tsconfig)

```
@/*         → /web/*
@/lib/*     → /web/lib/*
@/features/* → /web/features/*
@/shared/*  → /web/shared/*
```

### API Routes (`/web/app/api/`)

- `auth/` + `auth/callback/` — Shopify OAuth flow
- `webhooks/` — Centralized webhook handler with cold-start recovery
- `proxy/products/`, `proxy/analytics/` — App Proxy routes for storefront
- `session/validate/`, `session/refresh/` — Token management
- `upload/` — File uploads (CORS enabled)

### Shopify Integration

- **API version**: 2025-10
- **GraphQL types**: Auto-generated via `graphql-codegen` from Shopify Admin API schema
- **App Proxy**: `/apps/bundles/` → `/api/proxy/`
- **Direct API access**: Offline mode, embedded app direct API enabled
- **Webhooks**: `products/update`, `shop/update` (auto-re-registers on cold start)

### Bundle Types

FIXED_BUNDLE, BUY_X_GET_Y, BOGO, VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER

### Bundle Statuses

DRAFT, ACTIVE, PAUSED, ARCHIVED, SCHEDULED

### Discount Types

PERCENTAGE, FIXED_AMOUNT, CUSTOM_PRICE, NO_DISCOUNT, BUY_X_GET_Y, QUANTITY_BREAKS

### Settings Customizer

4-section style customizer (Appearance, Product Cards, Button & Badge, Advanced) with responsive override support (desktop/tablet/mobile). Config in `/web/features/settings/configs/customizer.config.ts`, state in Zustand store with dirty tracking and preset application.

## Feature Maturity

| Feature                    | Status      | Details                                                                  |
| -------------------------- | ----------- | ------------------------------------------------------------------------ |
| Bundle CRUD                | Done        | All 6 types defined, FIXED_BUNDLE active, others marked comingSoon       |
| Analytics                  | Done        | Views, carts, purchases, revenue tracking. Health badges, trend analysis |
| Settings/Customizer        | Done        | 4-section style customizer with responsive overrides                     |
| Discount Function          | Done        | Rust WASM for line-item + delivery discounts                             |
| Theme Widget               | Done        | Liquid extension for storefront rendering                                |
| AIInsight                  | Schema only | DB table + placeholder dashboard card, no AI logic                       |
| A/B Testing                | Schema only | ABTest + TestResult tables, empty "coming soon" page                     |
| Automation                 | Schema only | Automation + AutomationLog + AutomationBundle tables, types only         |
| Dynamic Pricing            | Partial     | PricingRule schema exists, UI is static plan cards                       |
| Frequently Bought Together | Label only  | Bundle type enum exists, no product affinity logic                       |
| LLM/AI integration         | None        | No API calls to any AI provider                                          |

## Analytics Implementation (reference for AI features)

Existing scoring in `web/features/analytics/`:

- **Performance badges**: High Converter (≥15% CVR), Revenue Star (≥$5k), Hidden Gem (<100 views + ≥10% CVR), Trending (≥25% growth), Declining (≤-25% drop), High Interest (≥30% ATC rate)
- **Health status**: healthy (8%+ CVR), needs-work (high cart/low conversion), poor (50+ views + <3% CVR + <$500), new (<30 views)
- **Tracking pipeline**: Storefront → App Proxy (`/api/proxy/analytics/`) → Repository (dedup per customer/session/day) → BundleAnalytics (hourly aggregation)

## Schema Models (23 total)

### Core

- **Bundle**: name, type, status, discount config, AI fields (`aiOptimized`, `aiScore`), SEO fields (`seoTitle`, `seoDescription`, `marketingCopy`), volume tiers (JSON), images, date range
- **BundleProduct**: productId, variantId, quantity, role (TRIGGER/REWARD/INCLUDED/OPTIONAL/GROUP_OPTION), custom pricing
- **BundleProductGroup**: grouping for mix-and-match, min/max selection
- **BundleSettings**: layout, theme, widget JSON, responsive JSON, style JSON, display toggles

### Analytics

- **BundleAnalytics**: time-series (bundleId + date + hour), views/carts/purchases/revenue, cross-sell metrics, customer type splits
- **BundleView**: per-view tracking, unique constraints on customer+date and session+date

### Testing

- **ABTest**: hypothesis, type (PRICING/PRODUCT_MIX/COPY/LAYOUT), status, trafficSplit, duration, minSampleSize, controlBundleId, variantConfig (JSON), winner/significance/improvement
- **TestResult**: variant, date, views, conversions, revenue

### Automation

- **Automation**: triggerType (SCHEDULE/PERFORMANCE/INVENTORY/CUSTOMER_BEHAVIOR), triggerConfig/conditions/actions (all JSON), execution counters
- **AutomationBundle**: junction to Bundle
- **AutomationLog**: event, success, data, error

### Pricing

- **PricingRule**: priority, conditions (JSON), discount config, applicationsCount, revenueImpact
- **PricingRuleBundle**: junction to Bundle

### AI

- **AIInsight**: type (RECOMMENDATION/OPTIMIZATION/PREDICTION/WARNING), category, confidence (Float), impact, actionable, actionType, actionData (JSON), implemented/views/applied/improvement, bundleId, testId, expiresAt

### App

- **Shop**: domain, status, plan, trial, setup flags
- **AppSettings**: defaults, display config, labels/globalStyles (JSON), custom CSS
- **Notification**: type (BUNDLE_PERFORMANCE/AI_RECOMMENDATION/TEST_COMPLETED/AUTOMATION_ERROR/MILESTONE_REACHED), priority
- **AlertRule**: conditions (JSON), threshold, comparison, delivery methods, frequency (IMMEDIATE/HOURLY/DAILY)
- **Template** + **TemplateReview**: reusable bundle templates with ratings

## AI Feature Roadmap

### Phase 1 — AI Insights Engine (no schema changes needed)

**1. Bundle Performance AI Advisor**

- Analyze `BundleAnalytics` time-series data via LLM
- Generate actionable insights: pricing suggestions, conversion optimization, product swap recommendations
- Populate existing `AIInsight` table (types: OPTIMIZATION, RECOMMENDATION, WARNING)
- Surface in existing dashboard AI Insights card (currently placeholder at `web/features/dashboard/components/ai-insights/`)
- Confidence scoring, expiration dates, implemented/applied tracking

**2. Smart Bundle Name & Copy Generator**

- LLM-powered name suggestions from selected products
- Marketing copy for `Bundle.marketingCopy`
- SEO generation for `Bundle.seoTitle` and `Bundle.seoDescription`
- Integrate into bundle creation flow

**3. AI Pricing Suggestions**

- Analyze conversion rates, margin data, competitor patterns
- Suggest optimal discount percentage/amount per bundle
- Uses existing `discountType` / `discountValue` fields

### Phase 2 — Product Affinity & FBT

**4. Order Co-occurrence Analysis**

- New schema needed: `ProductAffinity` table (productA, productB, coOccurrenceCount, affinityScore, lastCalculated)
- Process `orders/create` webhook to build co-occurrence matrix
- Batch recalculation job for affinity scores

**5. AI Bundle Suggestions**

- Recommend complementary products using affinity data + LLM reasoning
- Auto-generate FREQUENTLY_BOUGHT_TOGETHER bundles with confidence scores
- Merchant review/approve workflow before publishing
- Populate existing `Bundle.aiOptimized` and `Bundle.aiScore` fields

**6. Customer Segment Recommendations**

- Analyze `BundleView` data (customerId, sessionId patterns)
- Cluster customers by purchase behavior
- Per-segment bundle recommendations

### Phase 3 — Intelligent A/B Testing (schema exists, needs logic)

**7. A/B Test Execution Engine**

- Traffic splitting via `ABTest.trafficSplit`
- Variant serving via App Proxy
- Record results into existing `TestResult` model
- Statistical significance calculator (chi-squared / Bayesian)
- Auto-complete when `minSampleSize` reached + significance threshold met

**8. AI Test Hypothesis Generator**

- Analyze underperforming bundles → suggest what to test
- Auto-generate variants (pricing, copy, layout, product mix)
- Populate `ABTest.hypothesis` and `ABTest.variantConfig` via LLM
- Post-test AI summary of results

### Phase 4 — Automation Engine (schema exists, needs execution)

**9. Trigger Evaluation System**

- SCHEDULE: Cron-based bundle activation/deactivation
- PERFORMANCE: React to metric thresholds (conversion drops below X%)
- INVENTORY: Pause bundles when products go out of stock
- CUSTOMER_BEHAVIOR: Trigger on view/cart patterns
- Log to existing `AutomationLog` model

**10. AI Auto-Optimization Loop**

- If bundle health degrades → auto-create A/B test
- If A/B test finds winner → auto-apply with merchant notification
- Seasonal pattern detection → suggest scheduled bundles
- Anomaly detection for sudden conversion drops or revenue spikes

### Phase 5 — Advanced AI

**11. Dynamic Pricing Engine**

- Activate existing `PricingRule` model with rule evaluation
- AI-suggested conditions: time-of-day, customer LTV, cart value tiers
- Real-time price adjustment within merchant-defined bounds
- Track via existing `PricingRule.revenueImpact`

**12. Natural Language Bundle Builder**

- Chat interface: "Create a summer skincare bundle under $50 with 15% off"
- LLM parses intent → selects products → configures bundle → preview
- Merchant confirms and publishes

**13. Predictive Analytics**

- Revenue forecasting from `BundleAnalytics` trends
- AIInsight type PREDICTION: "This bundle will likely generate $X next month"
- Churn prediction: identify bundles losing traction before they flatline

### Implementation Priority

| #   | Feature                          | Schema Changes        | Depends On            |
| --- | -------------------------------- | --------------------- | --------------------- |
| 1   | Bundle Performance AI Advisor    | None                  | —                     |
| 2   | Smart Copy Generator             | None                  | —                     |
| 3   | AI Pricing Suggestions           | None                  | —                     |
| 4   | Order Co-occurrence Analysis     | ProductAffinity table | orders/create webhook |
| 5   | AI Bundle Suggestions            | None                  | #4                    |
| 6   | Customer Segment Recommendations | None                  | analytics data volume |
| 7   | A/B Test Execution Engine        | None                  | —                     |
| 8   | AI Test Hypothesis Generator     | None                  | #7                    |
| 9   | Automation Trigger System        | None                  | —                     |
| 10  | AI Auto-Optimization Loop        | None                  | #7, #9                |
| 11  | Dynamic Pricing Engine           | None                  | —                     |
| 12  | NL Bundle Builder                | None                  | —                     |
| 13  | Predictive Analytics             | None                  | analytics data volume |

8 of 13 features need zero schema changes. Only #4 requires a new table.

## Key Conventions

- **Package manager**: bun (primary runtime and package manager)
- **ESM modules**: `"type": "module"` in web/package.json
- **UI framework**: Shopify Polaris components + Tailwind CSS 4
- **Forms**: React Hook Form with Zod schemas via @hookform/resolvers
- **Database**: PostgreSQL via Prisma with Neon serverless adapter
- **Prisma output**: `/web/prisma/generated/`
- **GraphQL operations**: `/web/lib/graphql/operations/`
- **Rust function**: Compiles to WASM, handles line-item and delivery discount calculation
