# AI Product Recommendations — Lightweight Approach

**Status:** Planning
**Last Updated:** March 28, 2026
**Approach:** Admin API Orders → Co-Occurrence Matrix → AIInsight Table → Dashboard Card
**Supersedes:** ShopifyQL-based `findCoPurchasedProducts()` from `ai-sidekick-integration-plan.md`

---

## Why Admin API Over ShopifyQL

| Factor | ShopifyQL | Admin API Orders |
|---|---|---|
| Access | `read_reports` scope, admin-only | `read_orders` scope (already have) |
| Data | Aggregated sales reports | Raw line items per order |
| Product pairs | Limited co-purchase view | Full control over pair extraction |
| Filtering | Can't exclude bundle orders | Can filter by `lineItemGroup` |
| API access | Not accessible from embedded apps | Standard GraphQL query |
| Real-time | Report-level lag | Near real-time via webhook |

**Decision:** Use Admin API `orders` query for co-occurrence. ShopifyQL fully removed from codebase.

---

## Existing Infrastructure

| Asset | Status | Location |
|---|---|---|
| `read_orders` scope | Ready | `shopify.app.toml` |
| `orders/create` webhook | Subscribed | `shopify.app.toml` → `/api/webhooks` |
| `AIInsight` Prisma model | Schema exists | `web/prisma/schema.prisma:318` |
| `AIInsightType.RECOMMENDATION` | Enum ready | `web/prisma/schema.prisma:545` |
| AI Insights dashboard card | Not built | Placeholder in CLAUDE.md roadmap |
| `executeGraphQLQuery` helper | Ready | `web/lib/` |
| Order `LineItem.product` field | Available | Shopify Admin API schema |
| `LineItemGroup` (bundle detection) | Available | Can filter out bundle purchases |

### AIInsight Schema (existing, zero changes needed)

```prisma
model AIInsight {
    id          String        @id @default(cuid())
    shop        String
    type        AIInsightType    // RECOMMENDATION
    category    String           // "product-pairing"
    title       String           // "Frequently Bought Together: Product A + Product B"
    description String           // "Purchased together in 23 of 150 orders (15.3%)"
    confidence  Float            // 0.0-1.0 (co-occurrence frequency / total orders)
    impact      String           // "high" | "medium" | "low"
    actionable  Boolean          // true
    actionType  String?          // "create-bundle"
    actionData  Json?            // { productIds, productTitles, coOccurrenceCount, ... }
    implemented Boolean          // false → true when merchant creates bundle
    views       Int              // Track how often merchant sees this
    applied     Int              // Track how often merchant acts on this
    improvement Float?           // Post-implementation conversion lift
    bundleId    String?          // Set after merchant creates bundle from recommendation
    testId      String?          // For future A/B test integration
    createdAt   DateTime
    expiresAt   DateTime?        // Recommendations expire (re-compute weekly)
    shopId      String?
}
```

---

## Architecture

### Data Flow

```
Merchant clicks "Analyze Orders"
        │
        ▼
Server Action (recommendations.action.ts)
        │
        ▼
Admin API: orders(first: 250, query: "financial_status:paid")
        │
        ▼
Extract line items → product ID pairs per order
        │
        ▼
Filter out:
  - Bundle purchases (LineItemGroup)
  - Single-item orders
  - Gift cards
        │
        ▼
Co-Occurrence Engine (pure function):
  - Count pair frequency across all orders
  - Calculate confidence (pair_count / total_orders)
  - Rank by frequency
        │
        ▼
Filter out pairs already in existing bundles
        │
        ▼
Store top 10 in AIInsight table (type: RECOMMENDATION)
        │
        ▼
Dashboard Card displays recommendations
  - Product pair with images + titles
  - Co-occurrence count + confidence %
  - "Create Bundle" CTA → pre-fills bundle creation
```

### GraphQL Query

```graphql
query GetRecentOrders($first: Int!, $query: String) {
  orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
    nodes {
      id
      createdAt
      lineItems(first: 50) {
        nodes {
          product {
            id
            title
            featuredImage {
              url
              altText
            }
          }
          quantity
          isGiftCard
          lineItemGroup {
            id
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Variables:** `{ first: 250, query: "financial_status:paid created_at:>2026-01-28" }`

**Notes:**
- 60-day default window (Shopify limit without `read_all_orders`)
- `financial_status:paid` excludes pending/refunded
- `lineItemGroup.id` identifies bundle purchases → exclude from co-occurrence
- `isGiftCard` → exclude

---

## Co-Occurrence Algorithm

```
Input: orders[] (each with lineItems[])
Output: productPairs[] ranked by frequency

1. For each order:
   a. Extract product IDs from line items
   b. Filter out: gift cards, bundle line items (has lineItemGroup)
   c. Skip orders with < 2 unique products
   d. Generate all unique pairs (A,B) where A < B (avoid duplicates)

2. Count frequency of each pair across all orders

3. Calculate metrics per pair:
   - coOccurrenceCount: raw frequency
   - confidence: coOccurrenceCount / totalMultiProductOrders
   - lift: (P(A,B)) / (P(A) * P(B)) — how much more likely than random

4. Rank by: lift > 2.0 first, then by coOccurrenceCount

5. Filter out pairs where both products are already in the same bundle

6. Return top 10
```

### Confidence & Impact Thresholds

| Metric | High | Medium | Low |
|---|---|---|---|
| Co-occurrence count | >= 20 | 10-19 | 5-9 |
| Confidence | >= 15% | 8-14% | 3-7% |
| Lift | >= 3.0 | 2.0-2.9 | 1.5-1.9 |
| Min orders to show | 5+ | 5+ | 5+ |

Pairs with < 5 co-occurrences are suppressed (insufficient data).

---

## Phases

### v1: Pure Co-Occurrence (Quick Win)

**No LLM, no new schema, no new scopes.**

| Component | File | Purpose |
|---|---|---|
| GraphQL query | `web/lib/graphql/operations/orders.operations.ts` | Fetch recent orders with line items |
| Co-occurrence engine | `web/features/recommendations/services/co-occurrence.service.ts` | Pure function: orders → ranked pairs |
| Recommendation service | `web/features/recommendations/services/recommendations.service.ts` | Orchestrate: fetch → compute → store |
| AIInsight repository | `web/features/recommendations/repositories/ai-insight.repository.ts` | CRUD for AIInsight table |
| Server action | `web/features/recommendations/actions/recommendations.action.ts` | API boundary |
| Types | `web/features/recommendations/types/recommendations.types.ts` | Interfaces |
| React Query | `web/features/recommendations/api/recommendations.queries.ts` | Query keys + hooks |
| Hook | `web/features/recommendations/hooks/use-recommendations.ts` | `useRecommendations()` |
| Dashboard card | `web/features/recommendations/components/recommendation-card/` | UI + "Create Bundle" CTA |

**UX Flow:**
1. Dashboard shows "Product Recommendations" card
2. First visit: "Analyze your orders to discover bundle opportunities" + button
3. After analysis: Shows top 5 product pairs with images, titles, co-occurrence count
4. Each pair has "Create Bundle" button → navigates to bundle creation with products pre-filled
5. "Refresh" button to re-analyze (rate-limited to 1x per hour)
6. Stale recommendations (>7 days) show "outdated" badge

### v1.5: LLM-Enhanced Reasoning

**Add after v1 ships and validates.**

- Feed co-occurrence data + product metadata to Claude
- Generate natural language reasoning: "These products are often bought together because..."
- Suggest bundle name, marketing copy, pricing strategy
- Store enriched data in `AIInsight.actionData`
- Cost: ~$0.01 per analysis (single Claude Haiku call)

### v2: Real-Time via Webhook

**Add if merchants want fresher data.**

- `orders/create` webhook already fires → extract product pairs
- Accumulate in `ProductAffinity` table (Phase 2 from CLAUDE.md roadmap)
- Incremental updates instead of full re-computation
- Requires new schema: `ProductAffinity(productA, productB, count, lastSeen)`

---

## File Structure

```
web/features/recommendations/
├── actions/
│   └── recommendations.action.ts        # Server action
├── api/
│   └── recommendations.queries.ts       # React Query keys + options
├── components/
│   └── recommendation-card/
│       ├── recommendation-card.tsx       # Main card component
│       ├── recommendation-item.tsx       # Single pair row
│       └── index.ts
├── hooks/
│   └── use-recommendations.ts           # useRecommendations()
├── repositories/
│   └── ai-insight.repository.ts         # AIInsight CRUD
├── services/
│   ├── co-occurrence.service.ts         # Pure co-occurrence algorithm
│   └── recommendations.service.ts       # Orchestration
├── types/
│   └── recommendations.types.ts         # Interfaces
└── index.ts                             # Barrel exports

web/lib/graphql/operations/
└── orders.operations.ts                 # NEW: GetRecentOrders query
```

---

## Edge Cases

| Case | Handling |
|---|---|
| Store has < 10 orders | Show "Need more order data" message |
| All orders are single-item | Show "No multi-product orders found" |
| All pairs already bundled | Show "All top pairs are already in bundles" |
| API rate limit hit | Retry with exponential backoff (existing `executeGraphQLQuery` pattern) |
| Products deleted since order | Skip pair (product field will be null) |
| Bundle line items in orders | Filter via `lineItemGroup` — exclude from co-occurrence |
| Same product different variants | Group by product ID (not variant ID) |

---

## Integration with Existing Features

### Bundle Creation Pre-fill

When merchant clicks "Create Bundle" on a recommendation:

```typescript
// Navigate to create page with pre-filled products
goTo(`/bundles/create?type=FIXED_BUNDLE&products=${productIds.join(',')}`)

// Bundle creation page reads query params and pre-fills product selection
```

### Track Implementation

When a bundle is created from a recommendation:
1. Set `AIInsight.implemented = true`
2. Set `AIInsight.bundleId = newBundle.id`
3. Future: Track conversion lift via `AIInsight.improvement`

### Dashboard Integration

Add `RecommendationCard` to `dashboard-page.tsx` alongside existing cards:
- Position: After setup guide, before callout cards
- Condition: Only show if shop has 10+ paid orders

---

## API Limits & Performance

| Constraint | Value | Mitigation |
|---|---|---|
| Orders query default | Last 60 days | Sufficient for recommendations |
| Orders per request | 250 max | Paginate if needed (v2) |
| Line items per order | 50 max | Rarely exceeded |
| Rate limit | 40 points/sec (Admin API) | Single query = ~10 points |
| Computation time | ~100ms for 250 orders | In-memory, no bottleneck |
| Storage | 10 AIInsight rows | Negligible |
| Refresh rate | 1x per hour max | Client-side throttle |

---

## Success Metrics

| Metric | Target | How |
|---|---|---|
| Recommendations generated | 80%+ of shops with 10+ orders | Track AIInsight creation |
| Merchant action rate | 20%+ click "Create Bundle" | Track `AIInsight.applied` |
| Bundle creation from recs | 10%+ follow through | Track `AIInsight.implemented` |
| Recommendation accuracy | Lift > 2.0 for top 3 pairs | Monitor `AIInsight.confidence` |

---

## Estimated Effort

| Task | Estimate |
|---|---|
| GraphQL query + types | Small |
| Co-occurrence service | Small |
| Recommendation service + repository | Small |
| Server action + React Query | Small |
| Dashboard card component | Medium |
| Bundle creation pre-fill | Small |
| Testing + edge cases | Medium |
| **Total** | **~2-3 days** |

---

_Complements: `docs/ai-sidekick-integration-plan.md` (overall AI strategy)_
_Replaces: ShopifyQL-based `findCoPurchasedProducts()` approach for co-occurrence_