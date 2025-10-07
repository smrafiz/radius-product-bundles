"use client";

import { MetricCard } from "@/shared/components";
import { useDashboardStore } from "@/stores/dashboard";
import { formatCurrency, formatPercentage } from "@/shared/utils";

/**
 * Dashboard metrics section
 */
export function DashboardMetrics() {
    const { metrics, bundles } = useDashboardStore();

    const activeBundles = bundles.filter(
        (bundle) => bundle.status === "ACTIVE"
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics?.totalRevenue || 0)}
                growth={metrics?.revenueGrowth}
            />
            <MetricCard
                title="Conversion Rate"
                value={formatPercentage(metrics?.avgConversionRate || 0)}
                growth={metrics?.conversionGrowth}
            />
            <MetricCard
                title="Active Bundles"
                value={activeBundles.toString()}
                action={{ label: "View all", url: "/bundles" }}
                comparisonLabel="Total created"
            />
            <MetricCard
                title="Total Views"
                value={(metrics?.totalViews || 0).toLocaleString()}
                action={{ label: "View details", url: "/analytics" }}
                comparisonLabel="Last 30 days"
            />
        </div>
    );
}