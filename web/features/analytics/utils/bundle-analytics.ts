/**
 * Calculate bundle health status based on multiple signals
 */
export function calculateHealthStatus(bundle: {
    views: number;
    conversionRate: number;
    revenue: number;
    addToCartRate: number;
}): { status: "healthy" | "needs-work" | "poor" | "new"; reason: string } {
    // New bundle (insufficient data)
    if (bundle.views < 10) {
        return {
            status: "new",
            reason: "Insufficient data for reliable analysis (< 30 views)",
        };
    }

    // Healthy: Good conversion and revenue
    if (bundle.conversionRate >= 8 && bundle.revenue > 1000) {
        return {
            status: "healthy",
            reason: "Strong conversion rate and revenue performance",
        };
    }

    // Good conversion but low revenue (new or niche)
    if (bundle.conversionRate >= 8 && bundle.revenue <= 1000) {
        return {
            status: "healthy",
            reason: "Excellent conversion rate, growing revenue",
        };
    }

    // High cart rate but low conversion (checkout friction)
    if (bundle.addToCartRate >= 20 && bundle.conversionRate < 5) {
        return {
            status: "needs-work",
            reason: "High interest but low conversion - check checkout flow",
        };
    }

    // Decent traffic but low conversion (product issue)
    if (bundle.views >= 100 && bundle.conversionRate < 5) {
        return {
            status: "needs-work",
            reason: "Low conversion despite traffic - review pricing or value prop",
        };
    }

    // Low cart rate (interest problem)
    if (bundle.addToCartRate < 10) {
        return {
            status: "needs-work",
            reason: "Low add-to-cart rate - improve bundle appeal or visibility",
        };
    }

    // Poor: Low everything with sufficient data
    if (
        bundle.views >= 50 &&
        bundle.conversionRate < 3 &&
        bundle.revenue < 500
    ) {
        return {
            status: "poor",
            reason: "Low conversion and revenue - consider revising bundle strategy",
        };
    }

    // Default: Needs work (catch-all)
    return {
        status: "needs-work",
        reason: "Performance below targets - review and optimize",
    };
}
