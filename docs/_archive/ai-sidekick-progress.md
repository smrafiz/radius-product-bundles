# AI Sidekick Integration - Project Tracker

**Last Updated:** March 28, 2026
**Status:** ShopifyQL Removed — Admin API for Recommendations

---

## Overview

This document tracks the AI Sidekick integration project for the Radius Bundles app. It complements the detailed plan in `docs/ai-sidekick-integration-plan.md`.

---

## Project Summary

| Item         | Details                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| **Goal**     | Add AI capabilities to product bundles app, positioned for Sidekick integration |
| **Approach** | Shopify Native First → Rule-Based → Light AI → Sidekick                         |
| **Timeline** | 4-6 weeks to v1                                                                 |
| **Status**   | ShopifyQL removed, Admin API approach for recommendations                       |

---

## Key Decisions Made

### 1. Simplified Approach (vs Original Plan)

| Instead of...            | We chose...                 |
| ------------------------ | --------------------------- |
| Complex AI orchestration | Simple rules engine         |
| AI for everything        | AI only for text generation |
| 6+ months development    | 4-6 weeks to v1             |
| Build from scratch       | Use Shopify native data     |

### 2. Custom DB for All Analytics

- ALL analytics data stays in custom DB (views, carts, purchases, revenue, conversions)
- Simpler, no rate limiting, no token issues, bundle-specific tracking
- Product recommendations will use Admin API orders query (not ShopifyQL)

### 3. ShopifyQL Removed (March 28, 2026)

- ShopifyQL code, types, GraphQL query, server actions, hooks — all deleted
- `read_reports` scope removed from app config
- Reason: Admin API orders query is better for co-occurrence analysis (raw line items, `LineItemGroup` filtering, existing `read_orders` scope)
- See `docs/ai-product-recommendations-plan.md` for the replacement approach

---

## Current Progress

### ✅ Completed

- [x] Research: Shopify Sidekick capabilities
- [x] Research: ShopifyQL vs Admin API for product recommendations
- [x] Gap Analysis: Custom DB vs ShopifyQL → Custom DB wins for analytics
- [x] Created: `docs/ai-sidekick-integration-plan.md` (v2 simplified)
- [x] Created: `docs/ai-product-recommendations-plan.md` (Admin API approach)
- [x] **REMOVED:** ShopifyQL code, types, GraphQL, actions, hooks, `read_reports` scope
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
├── ai-sidekick-integration-plan.md        # AI strategy (v2)
├── ai-product-recommendations-plan.md     # Product recommendation approach
└── ai-sidekick-progress.md               # This file

web/features/
└── analytics/
    ├── actions/
    │   └── analytics.action.ts            # Custom DB actions (in use)
    ├── api/
    │   └── analytics.queries.ts           # Custom DB queries only
    ├── hooks/
    │   └── use-analytics.ts               # Custom DB hooks
    └── components/
        └── analytics-metrics/
            └── analytics-metrics.tsx       # Custom DB data
```

---

## Implementation Phases

### Phase 0: Data Strategy (Complete)

- [x] Custom DB for analytics UI (simpler, bundle-specific)
- [x] Admin API orders query for product recommendations
- [x] ShopifyQL removed (not needed)

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

### Shopify Sidekick Extensions

- **Status:** Developer Preview only (select partners)
- **Limits:** 20 tools/app, 5 intents, 400ms response, 4000 tokens
- **Recommendation:** Wait for general availability

---

## Key Decision: Admin API for Co-Occurrence (March 28, 2026)

**Changed:** Product pairing engine will use **Admin API orders query** instead of ShopifyQL `findCoPurchasedProducts()`.

| Reason | Detail |
|---|---|
| Already have `read_orders` scope | No new scope needed |
| Raw line item access | Can extract exact product pairs per order |
| Bundle filtering | `LineItemGroup` field lets us exclude bundle purchases |
| No ShopifyQL limitations | Not admin-only, no rate limit complexity |
| Existing webhook | `orders/create` already subscribed for future real-time |

**Full plan:** `docs/ai-product-recommendations-plan.md`

---

## Next Steps (Resume Here)

1. **For Analytics UI:** No changes needed - Custom DB is working
2. **For Product Recommendations (Quick Win):**
    - Build co-occurrence engine using Admin API orders query
    - Store in existing `AIInsight` table (type: `RECOMMENDATION`)
    - Dashboard card with "Create Bundle" CTA
    - See `docs/ai-product-recommendations-plan.md`
3. **For Other AI Features:**
    - Bundle health scoring using custom DB analytics
    - Claude integration for text generation (Phase 2)

---

## Notes

- **Conversation ID for Shopify Dev MCP:** `235eea5b-d514-4dd7-a895-1a898d808e39`
- Use `shopify-dev-mcp` tools for continuing research
- Memory also saved in AI knowledge graph
- **March 24, 2026:** Reverted analytics to Custom DB.
- **March 24, 2026:** Widget detection enhanced with Theme App Extensions API.
- **March 28, 2026:** ShopifyQL fully removed. Admin API orders query for recommendations.

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

- [Sidekick App Extensions](https://shopify.dev/docs/apps/build/sidekick)
- [Plan Document](docs/ai-sidekick-integration-plan.md)
- [Product Recommendations Plan](docs/ai-product-recommendations-plan.md)
