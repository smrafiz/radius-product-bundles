# AI Sidekick Integration - Project Tracker

**Last Updated:** March 24, 2026  
**Status:** Widget Detection Enhanced (ShopifyQL Ready for AI)

---

## Overview

This document tracks the AI Sidekick integration project for the Radius Product Bundles app. It complements the detailed plan in `docs/ai-sidekick-integration-plan.md`.

---

## Project Summary

| Item         | Details                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| **Goal**     | Add AI capabilities to product bundles app, positioned for Sidekick integration |
| **Approach** | Shopify Native First → Rule-Based → Light AI → Sidekick                         |
| **Timeline** | 4-6 weeks to v1                                                                 |
| **Status**   | ShopifyQL Infrastructure Complete                                               |

---

## Key Decisions Made

### 1. Simplified Approach (vs Original Plan)

| Instead of...            | We chose...                 |
| ------------------------ | --------------------------- |
| Complex AI orchestration | Simple rules engine         |
| AI for everything        | AI only for text generation |
| 6+ months development    | 4-6 weeks to v1             |
| Build from scratch       | Use Shopify native data     |

### 2. Hybrid Architecture: Custom DB + ShopifyQL (for AI)

**KEEP in Custom Database (Bundle-Specific):**

- `bundleViews` - Shopify can't distinguish bundle views from product views
- `bundleAddToCarts` - Need bundle-specific cart tracking
- `BundleView` (unique) - Shopify doesn't track unique per-customer views
- `crossSellViews` - Custom metric
- Revenue, conversions, purchases per bundle

**KEEP in Custom Database (Simpler Approach):**

- ALL analytics data for the current UI (views, carts, purchases, revenue, conversions)
- Custom DB is simpler, no rate limiting, no token issues

**ShopifyQL Infrastructure Ready (for Future AI Features):**

- `sessions` table for visitor/conversion funnels (unique to ShopifyQL)
- Product pairing analysis from orders
- Customer behavior patterns
- Available but not used in current analytics UI

### 3. Important Insight

**Custom DB was the right call for analytics UI:**

- Simpler implementation
- No token auth issues
- No rate limiting
- No date range complexity
- Bundle-specific data requires custom tracking anyway

**ShopifyQL adds value for AI features that need:**

- Session/visitor data (views → carts → purchases funnel)
- Product co-purchase patterns
- Customer behavior at scale

---

## Current Progress

### ✅ Completed

- [x] Research: Shopify Sidekick capabilities
- [x] Research: ShopifyQL analytics API
- [x] Gap Analysis: Custom DB vs ShopifyQL
- [x] Created: `docs/ai-sidekick-integration-plan.md` (v2 simplified)
- [x] ShopifyQL Service: `web/shared/services/shopify-analytics.service.ts`
- [x] ShopifyQL Types: `web/shared/types/services/shopify-analytics.types.ts`
- [x] ShopifyQL GraphQL: `web/lib/graphql/schema/queries/shopifyql.graphql`
- [x] ShopifyQL Server Actions: `web/features/analytics/actions/shopifyql-metrics.action.ts`
- [x] OAuth `read_reports` scope added to app
- [x] Token fix: Using OAuth access token (not JWT) for ShopifyQL queries
- [x] Date range validation and capping (max 365 days)
- [x] **REVERTED:** Analytics UI back to Custom DB (simpler, working)
- [x] ShopifyQL infrastructure preserved for future AI features
- [x] **Widget Detection Enhanced:** Using Theme App Extensions API + template pattern matching

### 📋 To Do (AI Features)

- [ ] Build bundle health scoring (Phase 1)
- [ ] Build product pairing engine (Phase 1)
- [ ] Build pricing recommendations (Phase 1)
- [ ] Integrate Claude for text generation (Phase 2)
- [ ] Build AI dashboard (Phase 3)
- [ ] Apply for Sidekick developer preview (Phase 4)

---

## File Structure

```
docs/
├── ai-sidekick-integration-plan.md    # Detailed plan (v2)
└── ai-sidekick-progress.md           # This file

web/
├── lib/
│   └── graphql/
│       └── schema/
│           └── queries/
│               └── shopifyql.graphql           # ✅ ShopifyQL GraphQL query
├── shared/
│   ├── services/
│   │   └── shopify-analytics.service.ts       # ✅ ShopifyQL service
│   └── types/
│       └── services/
│           ├── index.ts                       # ✅ Barrel export
│           └── shopify-analytics.types.ts     # ✅ Types
└── features/
    └── analytics/
        ├── actions/
        │   ├── shopifyql-metrics.action.ts    # ✅ Server actions (ready)
        │   └── analytics.action.ts            # ✅ Custom DB actions (in use)
        ├── api/
        │   └── analytics.queries.ts          # ✅ Has shopifyQLQueries (unused, ready)
        ├── hooks/
        │   └── use-analytics.ts              # ✅ Uses custom DB (reverted)
        └── components/
            └── analytics-metrics/
                └── analytics-metrics.tsx      # ✅ Uses custom DB data
```

---

## ShopifyQL Service (Complete)

**Location:** `web/shared/services/shopify-analytics.service.ts`

### Available Functions

| Function                     | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `getSalesMetrics()`          | Revenue, orders, AOV for a date range                    |
| `getSalesByDay()`            | Time-series data for charts                              |
| `getProductPerformance()`    | Top products for pairing analysis                        |
| `getCustomerMetrics()`       | New vs returning customers                               |
| `getCustomerTrends()`        | Customer acquisition over time                           |
| `getSessionMetrics()`        | Visitors, views, carts, checkouts (unique to ShopifyQL!) |
| `getTopConvertingProducts()` | Product conversion funnels                               |
| `findCoPurchasedProducts()`  | Product pairing suggestions                              |
| `getSalesComparison()`       | Period over period comparison                            |
| `getOrdersByStatus()`        | Orders by fulfillment status                             |
| `getSalesByLocation()`       | Sales by geographic location                             |
| `getBundleRevenue()`         | Bundle-specific revenue (requires `_bundle_id` property) |

### Features

- **Date validation**: Invalid dates default to 7 days ago
- **Date range capping**: Max 365 days to avoid rate limiting
- **Rate limit handling**: Clear error message for rate limit errors
- **OAuth token**: Uses session.accessToken (not JWT)

### Required OAuth Scope

```
read_reports
```

---

## Implementation Phases

### Phase 0: Shopify Native First (Week 1)

- [x] ShopifyQL service created
- [x] OAuth scope added
- [x] Token handling fixed
- [x] Date range validation added
- [x] **DECIDED**: Keep Custom DB for analytics UI (simpler)
- [x] ShopifyQL infrastructure preserved for AI

### Phase 1: Rule-Based Intelligence (Weeks 2-3)

- [ ] Bundle health scoring
- [ ] Product pairing engine
- [ ] Pricing recommendations

### Phase 2: Light AI (Week 4)

- [ ] Claude integration for text
- [ ] Insight generation
- [ ] Cost optimization

### Phase 3: Dashboard (Weeks 5-6)

- [ ] UI components
- [ ] Charts
- [ ] Quick actions

### Phase 4: Sidekick Integration (Later)

- [ ] Wait for developer preview
- [ ] Apply for early access
- [ ] Build extension

---

## Key Insights from Research

### Why Custom DB for Analytics UI

| Aspect          | Custom DB | ShopifyQL              |
| --------------- | --------- | ---------------------- |
| Setup           | Simple    | Token auth, scopes     |
| Bundle-specific | ✅ Native | ❌ Can't filter        |
| Rate limits     | None      | Yes (complexity-based) |
| Maintenance     | Low       | High                   |
| Failure modes   | Fewer     | Token expiry, limits   |

**Conclusion:** Custom DB is simpler for bundle-specific analytics. ShopifyQL adds value for AI features needing session/conversion data.

### ShopifyQL Unique Value

The `sessions` table is the **only way** to get:

- Product-level conversion funnels (views → carts → checkouts → orders)
- Visitor analytics per product
- This data is valuable for AI bundle recommendations

### Shopify Sidekick Extensions

- **Status:** Developer Preview only (select partners)
- **Limits:** 20 tools/app, 5 intents, 400ms response, 4000 tokens
- **Recommendation:** Wait for general availability

---

## Next Steps (Resume Here)

1. **For Analytics UI:** No changes needed - Custom DB is working
2. **For AI Features:** ShopifyQL infrastructure is ready:
    - Build bundle health scoring using `getSalesMetrics()`
    - Build product pairing using `getProductPerformance()` and `findCoPurchasedProducts()`
    - Use `getSessionMetrics()` for conversion funnel insights

---

## Notes

- **Conversation ID for Shopify Dev MCP:** `235eea5b-d514-4dd7-a895-1a898d808e39`
- Use `shopify-dev-mcp` tools for continuing research
- Memory also saved in AI knowledge graph
- **March 24, 2026:** Reverted analytics to Custom DB. ShopifyQL ready for AI.
- **March 24, 2026:** Widget detection enhanced with Theme App Extensions API.

---

## Widget Detection Fix (March 24, 2026)

### Problem

The "Add bundle widget to your theme" setup guide task was reporting "not added" even when the widget was added via Shopify CLI dev mode theme editor.

### Root Causes Identified

1. **Missing OAuth Scope:** Initial error was `read_themes` scope not granted → Fixed by adding to `shopify.app.toml`

2. **Theme Type Mismatch:** Shopify CLI dev mode creates a **development theme** (role: "development"), not the main published theme. Code was only checking `role=main` → Fixed to check ALL themes

3. **Pattern Detection Limited:** Only checking two templates (`templates/product.json`, `sections/main-product.liquid`) → Expanded to check more templates and use Theme App Extensions API

### Solution Implemented

**File:** `web/features/dashboard/actions/widget-block-status.action.ts`

1. **Added Theme App Extensions API:** Uses `/admin/api/2025-10/theme/app_extensions.json` to check if app extensions are active for each theme

2. **Expanded Template Detection:** Checks multiple templates:
    - `templates/product.json`
    - `sections/main-product.liquid`
    - `templates/index.json`
    - `templates/page.json`
    - `templates/collection.json`

3. **Multiple Pattern Matching:** Searches for multiple pattern formats:
    - `shopify://apps/product-bundles47/blocks/app-block`
    - `shopify://apps/product-bundle-widget/blocks/app-block`

4. **App Embed Detection:** Checks theme settings for app embeds:
    - `app-embed-product-bundles47`
    - `app-embed-product-bundle-widget`

### Key API Endpoints

| Endpoint                                           | Purpose                 |
| -------------------------------------------------- | ----------------------- |
| `GET /admin/api/2025-10/themes.json`               | List all themes         |
| `GET /admin/api/2025-10/themes/{id}/assets.json`   | Get theme assets        |
| `GET /admin/api/2025-10/theme/app_extensions.json` | Check active extensions |

### Files Modified

```
web/features/dashboard/actions/widget-block-status.action.ts  # Enhanced widget detection
shopify.app.toml                                              # Added read_themes scope
docs/ai-sidekick-progress.md                                   # Documented changes
```

---

## Resources

- [ShopifyQL Documentation](https://shopify.dev/docs/apps/build/shopifyql)
- [Sidekick App Extensions](https://shopify.dev/docs/apps/build/sidekick)
- [Plan Document](docs/ai-sidekick-integration-plan.md)
