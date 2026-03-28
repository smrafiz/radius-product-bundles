# AI-Powered Product Bundles — Simplified Plan

**Status:** Planning
**Last Updated:** March 28, 2026
**Approach:** Custom DB + Admin API → Rule-Based → Light AI → Sidekick

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

### Data Strategy (Updated March 28, 2026)

All analytics stay in **Custom DB**. Product recommendations use **Admin API orders query** for co-occurrence analysis. ShopifyQL was evaluated and removed — Admin API provides better raw line item access with existing `read_orders` scope. See `docs/ai-product-recommendations-plan.md`.

---

## Executive Summary

This is a **pragmatic implementation plan** that prioritizes speed-to-value over complexity.

**Key Principles:**

1. Use Custom DB + Admin API before building anything new
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
│  │  Data       │  ← Use existing sources                       │
│  │  Sources    │                                               │
│  └─────────────┘     • Custom DB (BundleAnalytics)             │
│         │            • Admin API orders (co-occurrence)          │
│         ▼            • Webhooks for events                      │
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

## Phase 0: Data Strategy (Complete)

### Data Sources

| Data Need | Source | Status |
| --- | --- | --- |
| Bundle analytics | Custom DB (`BundleAnalytics`) | In use |
| Product catalog | Admin API products query | In use |
| Order co-occurrence | Admin API orders query | Planned (see `ai-product-recommendations-plan.md`) |
| Webhooks | `orders/create`, `products/delete` | In use |

### What Stays in Custom DB

| Metric | Why |
| --- | --- |
| `bundleViews` | Shopify has product views, not bundle views |
| `bundleAddToCarts` | Need bundle-specific cart tracking |
| `BundleView` (unique) | Shopify doesn't give unique customer tracking |
| Revenue, purchases | Already tracked per-bundle with hourly granularity |

### Tasks

- [x] Custom DB analytics working
- [x] ShopifyQL evaluated and removed (Admin API is better for co-occurrence)
- [ ] Build product recommendation engine (see `ai-product-recommendations-plan.md`)

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

**Moved to dedicated plan:** See `docs/ai-product-recommendations-plan.md` for the full co-occurrence algorithm using Admin API orders query.

Key points:
- Fetch last 250 paid orders via Admin API (`read_orders` scope)
- Extract product pairs per order, filter out bundles via `LineItemGroup`
- Rank by co-occurrence frequency + lift score
- Store in existing `AIInsight` table (type: `RECOMMENDATION`)
- Dashboard card with "Create Bundle" CTA

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
│   ├── bundle-health.service.ts              # Phase 1
│   ├── pricing-recommendation.service.ts     # Phase 1
│   ├── ai-insights.service.ts                # Phase 2
│   └── sidekick-ready.service.ts             # Phase 4
├── components/
│   ├── bundle-intelligence-dashboard.tsx      # Phase 3
│   ├── health-score-chart.tsx
│   ├── pricing-card.tsx
│   ├── insight-summary.tsx
│   └── quick-actions.tsx
├── hooks/
│   ├── use-bundle-health.ts
│   └── use-ai-insights.ts
├── types/
│   └── ai.types.ts
└── index.ts

web/features/recommendations/                  # Product pairing (separate feature)
├── See docs/ai-product-recommendations-plan.md for full structure
```

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

## Next Steps

1. [ ] Build product recommendation engine (see `ai-product-recommendations-plan.md`)
2. [ ] Build simple health score calculator
3. [ ] Test with 1-2 real bundles
4. [ ] Get merchant feedback

---

## The Bottom Line

| Do This                   | Not This                |
| ------------------------- | ----------------------- |
| Custom DB + Admin API     | Rebuild analytics       |
| Rules for decisions       | AI for everything       |
| Ship in weeks             | Ship in months          |
| Simple and reliable       | Complex and magical     |
| Iterate based on feedback | Plan everything upfront |

---

## Resources

- [Admin API Orders](https://shopify.dev/docs/api/admin-graphql/latest/queries/orders)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Product Recommendations Plan](docs/ai-product-recommendations-plan.md)

---

_Document Version: 3.0 (ShopifyQL removed, Admin API approach)_
_Last Updated: March 28, 2026_
