# AI-Powered Product Bundles — Simplified Plan

**Status:** Planning  
**Last Updated:** March 2026  
**Approach:** Shopify Native First → Rule-Based → Light AI → Sidekick

---

## Current Analytics Analysis (March 2026)

Based on codebase analysis of `web/features/analytics/` and Prisma schema:

### Your Current Implementation

| Metric                       | Table              | How Tracked                  |
| ---------------------------- | ------------------ | ---------------------------- |
| `bundleViews`                | `bundle_analytics` | Storefront widget            |
| `bundleAddToCarts`           | `bundle_analytics` | Storefront widget            |
| `bundlePurchases`            | `bundle_analytics` | Webhook                      |
| `bundleRevenue`              | `bundle_analytics` | Webhook                      |
| `newCustomerPurchases`       | `bundle_analytics` | Webhook + customer lookup    |
| `returningCustomerPurchases` | `bundle_analytics` | Webhook + customer lookup    |
| `crossSellViews`             | `bundle_analytics` | Custom                       |
| `BundleView` (unique)        | `bundle_views`     | Custom per-customer tracking |

### What ShopifyQL Provides

| Data Source     | Available Metrics                                                     |
| --------------- | --------------------------------------------------------------------- |
| **`sessions`**  | `sessions`, `product_views`, `add_to_carts`, `checkouts`, `orders`    |
| **`sales`**     | `gross_sales`, `net_sales`, `total_sales`, `orders`, `aov`, `returns` |
| **`customers`** | `new_customers`, `returning_customers`                                |
| **`products`**  | `total_sales`, `orders`, `units_sold` by product                      |

### Gap Analysis

| Your Metric                  | Can Shopify Replace? | Recommendation                                |
| ---------------------------- | -------------------- | --------------------------------------------- |
| `bundleViews`                | ❌ No                | Keep - Shopify can't distinguish bundle views |
| `bundleAddToCarts`           | ❌ No                | Keep - Need bundle-specific cart tracking     |
| `bundlePurchases`            | ✅ Yes               | Could replace with ShopifyQL                  |
| `bundleRevenue`              | ✅ Yes               | Could replace with ShopifyQL                  |
| `newCustomerPurchases`       | ✅ Yes               | Use ShopifyQL `customers`                     |
| `returningCustomerPurchases` | ✅ Yes               | Use ShopifyQL `customers`                     |
| `crossSellViews`             | ❌ No                | Keep - custom metric                          |
| `BundleView` (unique)        | ❌ No                | Keep - Shopify doesn't give unique tracking   |

### Recommended Hybrid Approach

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HYBRID ARCHITECTURE (Recommended)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐│
│  │  KEEP (Custom DB)      │    │  REPLACE (ShopifyQL)               ││
│  │                         │    │                                     ││
│  │  • Bundle views        │    │  • Revenue from ShopifyQL          ││
│  │  • Bundle add-to-carts │    │  • New vs returning customers      ││
│  │  • Unique tracking     │    │  • Product performance             ││
│  │  • Cross-sell tracking │    │  • Session/visitor data           ││
│  │                         │    │                                     ││
│  └─────────────────────────┘    └─────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  BUILD NEW (ShopifyQL + Your Logic)                                 ││
│  │                                                                       ││
│  │  • Product pairing engine (co-purchase analysis)                    ││
│  │  • Bundle health scoring (combine Shopify data + your views)        ││
│  │  • Revenue predictions (time-series on Shopify sales)              ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Executive Summary

This is a **pragmatic implementation plan** that prioritizes speed-to-value over complexity.

**Key Principles:**

1. Use Shopify's native data before building anything custom
2. Rules over AI for decisions (deterministic > magical)
3. AI for text only, not for critical business logic
4. Ship fast, iterate faster

**Timeline:** 4-6 weeks to v1, not 6+ months

---

## Architecture: Simple First

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW (Simplified)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                               │
│  │  Shopify    │  ← Use native APIs first                      │
│  │  Native    │                                               │
│  │  Data      │     • Admin API for metrics                   │
│  └─────────────┘     • ShopifyQL for analytics                 │
│         │            • Webhooks for events                      │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │  Rules      │  ← Your value-add                            │
│  │  Engine     │                                               │
│  └─────────────┘     • Bundle health scoring                   │
│         │            • Product pairing (co-purchase matrix)       │
│         ▼            • Simple recommendations                   │
│  ┌─────────────┐                                               │
│  │  Light AI   │  ← Only where it adds real value             │
│  │  (Text)     │                                               │
│  └─────────────┘     • Generate human-readable insights        │
│         │            • Summarize metrics                        │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │  Dashboard  │  ← Show value to merchant                    │
│  │  & Actions  │                                               │
│  └─────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Shopify Native First (Week 1)

### What to Use Instead of Building

| Instead of building... | Use Shopify's...                   |
| ---------------------- | ---------------------------------- |
| Analytics pipeline     | **ShopifyQL** + Admin API          |
| Product catalog        | **Admin API products** query       |
| Order analysis         | **Orders API** + **Analytics API** |
| Customer segments      | **Segments API**                   |
| Inventory tracking     | **Inventory API**                  |

### Implementation (Already Created)

**File:** `web/features/ai/services/shopify-analytics.service.ts`

This service is ready to use:

```typescript
import {
    getSalesMetrics,
    getSalesByDay,
    getProductPerformance,
    getCustomerMetrics,
    getSessionMetrics,
} from "@/features/ai/services/shopify-analytics.service";

// Example: Get sales for last 30 days
const sales = await getSalesMetrics(shop, accessToken, {
    from: subDays(new Date(), 30),
    to: new Date(),
});

// Example: Get product performance for pairing analysis
const products = await getProductPerformance(
    shop,
    accessToken,
    {
        from: subDays(new Date(), 30),
        to: new Date(),
    },
    50,
);
```

### What to Keep Building

| Keep in Custom DB     | Why                                           |
| --------------------- | --------------------------------------------- |
| `bundleViews`         | Shopify has product views, not bundle views   |
| `bundleAddToCarts`    | Need bundle-specific cart tracking            |
| `BundleView` (unique) | Shopify doesn't give unique customer tracking |

### Tasks

- [x] **Created:** `shopify-analytics.service.ts` with ShopifyQL wrapper
- [ ] Set up required OAuth scopes (`read_reports`)
- [ ] Verify data accuracy with sample bundles
- [ ] Decide what to migrate from custom DB

---

## Phase 1: Rule-Based Intelligence (Weeks 2-3)

### Bundle Health Scoring (No AI)

**The Formula:**

```typescript
// web/features/ai/services/bundle-health.service.ts

interface HealthScore {
    overall: number; // 0-100
    breakdown: {
        conversion: number; // Max 25 points
        revenue: number; // Max 25 points
        margin: number; // Max 25 points
        velocity: number; // Max 25 points
    };
    status: "critical" | "warning" | "healthy" | "excellent";
    issues: string[];
    recommendations: string[];
}

export function calculateBundleHealth(
    bundle: Bundle,
    metrics: BundleMetrics,
): HealthScore {
    const conversionScore =
        metrics.conversionRate >= 0.03
            ? 25
            : metrics.conversionRate >= 0.02
              ? 15
              : 5;

    const revenueScore =
        metrics.revenue >= 5000
            ? 25
            : metrics.revenue >= 2000
              ? 15
              : metrics.revenue >= 500
                ? 10
                : 5;

    const marginScore =
        bundle.margin >= 40
            ? 25
            : bundle.margin >= 30
              ? 20
              : bundle.margin >= 20
                ? 10
                : 5;

    const velocityScore =
        metrics.ordersPerDay >= 5
            ? 25
            : metrics.ordersPerDay >= 2
              ? 15
              : metrics.ordersPerDay >= 0.5
                ? 10
                : 5;

    const overall =
        conversionScore + revenueScore + marginScore + velocityScore;

    return {
        overall,
        breakdown: {
            conversion: conversionScore,
            revenue: revenueScore,
            margin: marginScore,
            velocity: velocityScore,
        },
        status:
            overall >= 80
                ? "excellent"
                : overall >= 60
                  ? "healthy"
                  : overall >= 40
                    ? "warning"
                    : "critical",
        issues: generateIssues(
            conversionScore,
            revenueScore,
            marginScore,
            velocityScore,
        ),
        recommendations: generateRecommendations(
            conversionScore,
            revenueScore,
            marginScore,
            velocityScore,
        ),
    };
}

function generateIssues(...scores: number[]): string[] {
    const issues = [];
    if (scores[0] < 15) issues.push("Conversion rate below target");
    if (scores[1] < 15) issues.push("Revenue could be higher");
    if (scores[2] < 15) issues.push("Margin is below optimal");
    if (scores[3] < 15) issues.push("Sales velocity is low");
    return issues;
}

function generateRecommendations(...scores: number[]): string[] {
    const recs = [];
    if (scores[0] < 15)
        recs.push("Consider adjusting price or improving bundle presentation");
    if (scores[1] < 15) recs.push("Promote this bundle more actively");
    if (scores[2] < 15)
        recs.push("Review product costs or consider different product mix");
    if (scores[3] < 15)
        recs.push("Add urgency elements or limited-time offers");
    return recs;
}
```

---

### Product Pairing (Co-Purchase Matrix)

**Simple but effective:**

```typescript
// web/features/ai/services/product-pairing.service.ts

interface ProductPairingResult {
    productId: string;
    pairedWith: { productId: string; frequency: number }[];
    recommendation: "high" | "medium" | "low";
    reasoning: string;
}

export async function findProductPairs(
    productIds: string[],
): Promise<ProductPairingResult[]> {
    // Get orders containing these products
    const orders = await getOrdersContainingProducts(productIds);

    // Build co-purchase matrix
    const coPurchaseMatrix = buildCoPurchaseMatrix(orders, productIds);

    // Generate recommendations
    return productIds.map((productId) => {
        const pairs = coPurchaseMatrix[productId] || [];
        const totalCoPurchases = pairs.reduce((sum, p) => sum + p.frequency, 0);

        return {
            productId,
            pairedWith: pairs
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5),
            recommendation:
                totalCoPurchases > 50
                    ? "high"
                    : totalCoPurchases > 20
                      ? "medium"
                      : "low",
            reasoning:
                totalCoPurchases > 50
                    ? "Frequently bought together - strong candidate for bundle"
                    : totalCoPurchases > 20
                      ? "Occasionally bought together - test with bundle"
                      : "No strong co-purchase pattern - consider other factors",
        };
    });
}

function buildCoPurchaseMatrix(
    orders: Order[],
    productIds: string[],
): Record<string, { productId: string; frequency: number }[]> {
    const matrix: Record<string, { productId: string; frequency: number }[]> =
        {};

    for (const productId of productIds) {
        matrix[productId] = [];

        // Find orders containing this product
        const ordersWithProduct = orders.filter((o) =>
            o.lineItems.some((item) => item.productId === productId),
        );

        // Count co-purchases
        const coPurchases: Record<string, number> = {};
        for (const order of ordersWithProduct) {
            for (const item of order.lineItems) {
                if (
                    item.productId !== productId &&
                    productIds.includes(item.productId)
                ) {
                    coPurchases[item.productId] =
                        (coPurchases[item.productId] || 0) + 1;
                }
            }
        }

        matrix[productId] = Object.entries(coPurchases)
            .map(([pid, freq]) => ({ productId: pid, frequency: freq }))
            .sort((a, b) => b.frequency - a.frequency);
    }

    return matrix;
}
```

---

### Simple Pricing Recommendations

```typescript
// web/features/ai/services/pricing-recommendation.service.ts

interface PricingRecommendation {
    currentPrice: number;
    suggestedPrice: number;
    range: { min: number; max: number };
    reasoning: string;
}

export function suggestPrice(
    bundle: Bundle,
    metrics: BundleMetrics,
): PricingRecommendation {
    const costs = bundle.products.reduce((sum, p) => sum + (p.cost || 0), 0);
    const currentPrice =
        bundle.discountType === "percentage"
            ? calculatePercentagePrice(bundle)
            : bundle.fixedPrice || currentPrice;

    const competitorPrices = getCompetitorPrices(bundle.category); // From API or manual

    // Simple rules
    const targetMargin = 0.35; // 35% margin target
    const minPrice = costs * 1.25; // At least 25% margin
    const maxPrice = competitorPrices?.max * 1.1 || currentPrice * 1.3;

    let suggestedPrice: number;
    let reasoning: string;

    if (metrics.conversionRate < 0.015) {
        // Low conversion = price too high
        suggestedPrice = currentPrice * 0.9;
        reasoning =
            "Conversion is low. Reducing price by 10% should improve conversion by ~20%.";
    } else if (metrics.conversionRate > 0.05 && metrics.margin < 30) {
        // High conversion but low margin = can raise price
        suggestedPrice = currentPrice * 1.1;
        reasoning =
            "Strong conversion with low margin. Testing 10% price increase.";
    } else if (competitorPrices?.avg) {
        // Match competitor average with better margin
        suggestedPrice = Math.max(minPrice, competitorPrices.avg * 0.95);
        reasoning =
            "Adjusted to be competitive while maintaining target margin.";
    } else {
        suggestedPrice = currentPrice;
        reasoning = "Current pricing appears optimal based on performance.";
    }

    return {
        currentPrice,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        range: { min: minPrice, max: maxPrice },
        reasoning,
    };
}
```

---

## Phase 2: Light AI for Text (Week 4)

### When to Use AI

| Use Case                         | Use AI?  | Reason                      |
| -------------------------------- | -------- | --------------------------- |
| Generate human-readable insights | ✅ Yes   | Saves dev time, looks smart |
| Summarize bundle performance     | ✅ Yes   | Natural language is better  |
| Suggest product descriptions     | ✅ Yes   | AI is good at this          |
| **Decide prices**                | ❌ No    | Rules are better            |
| **Determine bundle health**      | ❌ No    | Rules are deterministic     |
| **Detect anomalies**             | ⚠️ Maybe | Simple thresholds first     |

### Implementation

```typescript
// web/features/ai/services/ai-insights.service.ts

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface BundleInsight {
    summary: string; // 1-2 sentence summary
    highlights: string[]; // Key points
    tips: string[]; // Actionable suggestions
}

export async function generateBundleInsights(
    bundle: Bundle,
    metrics: BundleMetrics,
    health: HealthScore,
): Promise<BundleInsight> {
    const prompt = `
    Generate a brief analysis of this bundle's performance.
    
    Bundle: ${bundle.name}
    Revenue: $${metrics.revenue.toLocaleString()}
    Orders: ${metrics.orders}
    Conversion Rate: ${(metrics.conversionRate * 100).toFixed(1)}%
    Health Score: ${health.overall}/100
    Status: ${health.status}
    
    Issues: ${health.issues.join(", ") || "None"}
    Recommendations: ${health.recommendations.join(", ") || "None"}
    
    Respond with:
    - A 1-2 sentence summary
    - 2-3 key highlights  
    - 2-3 actionable tips
    
    Keep it conversational and merchant-friendly. No jargon.
  `;

    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        response.content[0].type === "text" ? response.content[0].text : "";

    // Parse response (simplified - in production use structured output)
    return parseInsightsResponse(text);
}

function parseInsightsResponse(text: string): BundleInsight {
    // Simple parsing - in production use JSON mode
    const lines = text.split("\n").filter((l) => l.trim());

    return {
        summary: lines[0] || "Bundle is performing within expectations.",
        highlights: lines
            .slice(1, 4)
            .filter((l) => l.includes("•") || l.includes("-")),
        tips: lines
            .slice(4, 7)
            .filter((l) => l.includes("•") || l.includes("-")),
    };
}
```

### Cost Estimate

| Feature                    | Requests/Month | Cost             |
| -------------------------- | -------------- | ---------------- |
| Bundle insights (per view) | ~5,000         | ~$0.50           |
| Product descriptions       | ~500           | ~$5.00           |
| Weekly digest emails       | ~1,000         | ~$1.00           |
| **Total**                  | ~6,500         | **~$6.50/month** |

---

## Phase 3: Dashboard & Actions (Weeks 5-6)

### Bundle Intelligence Dashboard

```typescript
// web/features/ai/components/bundle-intelligence-dashboard.tsx

"use client";

import { Card, Text, Badge, Button, BlockStack } from "@shopify/polaris";
import { HealthScoreChart } from "./health-score-chart";
import { ProductPairingList } from "./product-pairing-list";
import { PricingCard } from "./pricing-card";
import { InsightSummary } from "./insight-summary";

interface BundleIntelligenceDashboardProps {
  bundle: Bundle;
  metrics: BundleMetrics;
  health: HealthScore;
  pairs: ProductPairingResult[];
  pricing: PricingRecommendation;
  insights?: BundleInsight;
}

export function BundleIntelligenceDashboard({
  bundle,
  metrics,
  health,
  pairs,
  pricing,
  insights
}: BundleIntelligenceDashboardProps) {
  return (
    <BlockStack gap="400">
      {/* Header with Health Score */}
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Bundle Intelligence
          </Text>

          <HealthScoreChart score={health} />

          {insights && <InsightSummary insights={insights} />}
        </BlockStack>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingSm">Performance</Text>
          <MetricGrid metrics={metrics} />
        </BlockStack>
      </Card>

      {/* Product Pairing */}
      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingSm">Product Pairing</Text>
          <ProductPairingList pairs={pairs} />
          <Button variant="primary">Create Bundle with Top Pairing</Button>
        </BlockStack>
      </Card>

      {/* Pricing Recommendation */}
      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingSm">Pricing</Text>
          <PricingCard pricing={pricing} />
        </BlockStack>
      </Card>

      {/* Recommendations */}
      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingSm">AI Recommendations</Text>
          <ul>
            {health.recommendations.map((rec, i) => (
              <li key={i}>
                <Badge tone={health.status === "critical" ? "critical" : "info"}>
                  {rec}
                </Badge>
              </li>
            ))}
          </ul>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
```

### Quick Actions

```typescript
// web/features/ai/components/quick-actions.tsx

export function QuickActions({ bundleId }: { bundleId: string }) {
  return (
    <ActionList
      items={[
        {
          content: "Adjust Pricing",
          onAction: () => navigateTo(`/bundles/${bundleId}/pricing`),
        },
        {
          content: "Add Products",
          onAction: () => navigateTo(`/bundles/${bundleId}/products`),
        },
        {
          content: "Run Promotion",
          onAction: () => createPromotion(bundleId),
        },
        {
          content: "Pause Bundle",
          onAction: () => pauseBundle(bundleId),
        },
        {
          content: "Duplicate Bundle",
          onAction: () => duplicateBundle(bundleId),
        },
      ]}
    />
  );
}
```

---

## Phase 4: Sidekick Integration (Later)

### Wait for This

| Condition                 | Status              |
| ------------------------- | ------------------- |
| Developer preview open?   | ❌ Not yet          |
| Public documentation?     | ⚠️ Limited          |
| Production apps using it? | ❌ None             |
| **Recommendation**        | **Wait 3-6 months** |

### What to Prepare Now

Even without Sidekick integration, prepare your app:

```typescript
// web/features/ai/services/sidekick-ready.service.ts

// This data structure will work with Sidekick tools when ready

interface SidekickReadyData {
    bundles: {
        id: string;
        name: string;
        status: string;
        health: number;
        revenue: number;
    }[];

    insights: {
        type: "recommendation" | "alert" | "opportunity";
        title: string;
        description: string;
        actionRequired?: string;
    }[];

    metrics: {
        totalRevenue: number;
        activeBundles: number;
        topPerformer: string;
    };
}

// This will power future Sidekick tools
export function getSidekickReadyData(shop: string): SidekickReadyData {
    // Implementation will come from Phase 1-3 work
}
```

### When Ready, Add These Tools

```json
// Future: extensions/bundle-tools/tools.json
[
    {
        "name": "get_bundle_summary",
        "description": "Quick summary of bundle performance",
        "inputSchema": {
            "type": "object",
            "properties": { "bundle_id": { "type": "string" } }
        }
    },
    {
        "name": "get_recommendations",
        "description": "AI recommendations for a bundle",
        "inputSchema": {
            "type": "object",
            "properties": { "bundle_id": { "type": "string" } }
        }
    },
    {
        "name": "suggest_bundle_products",
        "description": "Suggest products to pair",
        "inputSchema": {
            "type": "object",
            "properties": { "category": { "type": "string" } }
        }
    }
]
```

---

## Simplified Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIMELINE: 6 WEEKS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Week 1: Shopify Native                                         │
│  ├── ShopifyQL analytics setup                                  │
│  ├── Metrics service                                            │
│  └── Data verification                                          │
│                                                                  │
│  Week 2: Rule-Based Engine                                      │
│  ├── Health scoring                                             │
│  ├── Product pairing (co-purchase)                              │
│  └── Pricing recommendations                                    │
│                                                                  │
│  Week 3: Rule Refinement                                        │
│  ├── Edge cases                                                 │
│  ├── Test with real data                                        │
│  └── Tune thresholds                                            │
│                                                                  │
│  Week 4: Light AI                                               │
│  ├── Claude integration for text                                │
│  ├── Insight generation                                         │
│  └── Cost optimization                                          │
│                                                                  │
│  Week 5: Dashboard                                              │
│  ├── UI components                                              │
│  ├── Charts and visualizations                                   │
│  └── Quick actions                                              │
│                                                                  │
│  Week 6: Polish & Launch                                        │
│  ├── Testing                                                    │
│  ├── Performance optimization                                   │
│  └── Documentation                                             │
│                                                                  │
│  Future: Sidekick Integration                                   │
│  └── When developer preview opens                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cost Comparison

| Approach         | My Original Plan | This Plan               |
| ---------------- | ---------------- | ----------------------- |
| Development time | 6+ months        | 6 weeks                 |
| AI API costs     | $500+/month      | ~$7/month               |
| Complexity       | High             | Low                     |
| Reliability      | AI can fail      | Rules are deterministic |
| Time to value    | Slow             | Fast                    |

---

## File Structure

```
web/features/ai/
├── services/
│   ├── shopify-analytics.service.ts   # ✅ NEW - ShopifyQL wrapper (Phase 0)
│   ├── shopify-native.service.ts      # Phase 0
│   ├── bundle-health.service.ts      # Phase 1
│   ├── product-pairing.service.ts    # Phase 1
│   ├── pricing-recommendation.service.ts  # Phase 1
│   ├── ai-insights.service.ts        # Phase 2
│   └── sidekick-ready.service.ts     # Phase 4
├── components/
│   ├── bundle-intelligence-dashboard.tsx  # Phase 3
│   ├── health-score-chart.tsx
│   ├── product-pairing-list.tsx
│   ├── pricing-card.tsx
│   ├── insight-summary.tsx
│   └── quick-actions.tsx
├── hooks/
│   ├── use-bundle-health.ts
│   ├── use-product-pairing.ts
│   └── use-ai-insights.ts
├── types/
│   └── ai.types.ts
└── index.ts
```

### ShopifyQL Service (Already Created)

**File:** `web/features/ai/services/shopify-analytics.service.ts`

This service wraps ShopifyQL to provide:

- `getSalesMetrics()` - Revenue, orders, AOV
- `getSalesByDay()` - Time-series data for charts
- `getProductPerformance()` - Top products for pairing
- `getCustomerMetrics()` - New vs returning customers
- `getSessionMetrics()` - Visitor data
- `findCoPurchasedProducts()` - Product pairing analysis

---

## Success Metrics

| Metric                | Target                                | How to Measure       |
| --------------------- | ------------------------------------- | -------------------- |
| Development time      | 6 weeks                               | Project tracking     |
| Bundle creation rate  | +20%                                  | Compare before/after |
| Dashboard engagement  | 60%+ daily use                        | Analytics            |
| Cost per insight      | <$0.01                                | API costs / views    |
| Health score accuracy | 80%+ alignment with merchant feedback | Survey               |

---

## Next Steps (This Week)

1. [ ] Set up ShopifyQL in the app
2. [ ] Create `shopify-native.service.ts` with metrics query
3. [ ] Build simple health score calculator
4. [ ] Test with 1-2 real bundles
5. [ ] Get merchant feedback

---

## The Bottom Line

| Do This                   | Not This                |
| ------------------------- | ----------------------- |
| Shopify native data       | Rebuild analytics       |
| Rules for decisions       | AI for everything       |
| Ship in weeks             | Ship in months          |
| Simple and reliable       | Complex and magical     |
| Iterate based on feedback | Plan everything upfront |

---

## Resources

- [ShopifyQL Documentation](https://shopify.dev/docs/api/shopifyql)
- [Admin API Analytics](https://shopify.dev/docs/api/admin-rest/2024-01/resources/analytics)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Shopify Segments](https://shopify.dev/docs/api/admin-rest/2024-01/resources/segment)

---

_Document Version: 2.0 (Simplified)_  
_Last Updated: March 2026_
