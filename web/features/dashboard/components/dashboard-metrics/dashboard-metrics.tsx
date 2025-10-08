"use client";

import { MetricCard } from "@/shared/components";
import { formatCurrency, formatPercentage } from "@/shared/utils";
import { useDashboardData, useDashboardStore } from "@/features/dashboard";

/**
 * Dashboard metrics section
 */
export function DashboardMetrics() {
    const { bundles } = useDashboardStore();
    const { metrics: liveMetrics, isMetricsFetching } = useDashboardData();

    const activeBundles = bundles.filter(
        (bundle) => bundle.status === "ACTIVE"
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
                title="Total Revenue"
                value={formatCurrency(liveMetrics?.totalRevenue || 0)}
                growth={liveMetrics?.revenueGrowth}
                loading={isMetricsFetching}
            />
            <MetricCard
                title="Conversion Rate"
                value={formatPercentage(liveMetrics?.avgConversionRate || 0)}
                growth={liveMetrics?.conversionGrowth}
                loading={isMetricsFetching}
            />
            <MetricCard
                title="Active Bundles"
                value={activeBundles.toString()}
                action={{ label: "View all", url: "/bundles" }}
                comparisonLabel="Total created"
                loading={isMetricsFetching}
            />
            <MetricCard
                title="Total Views"
                value={(liveMetrics?.totalViews || 0).toLocaleString()}
                action={{ label: "View details", url: "/analytics" }}
                comparisonLabel="Last 30 days"
                loading={isMetricsFetching}
            />
        </div>
    );
}