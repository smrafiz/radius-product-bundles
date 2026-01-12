"use client";

import {
    CHART_GRID_CONFIG,
    CHART_LEGEND_CONFIG,
    CHART_MARGINS,
    CHART_TOOLTIP_CONFIG,
    CHART_XAXIS_CONFIG,
    CHART_YAXIS_CONFIG,
    ChartSkeleton,
    ChartWrapper,
    formatChartDate,
    getLineConfig,
    useAnalytics,
    useChartTotals,
    useFormattedChartData,
} from "@/features/analytics";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";

/**
 * Funnel Performance Chart
 */
export function FunnelPerformanceChart() {
    const { chartData, isChartLoading } = useAnalytics();

    // Format data for the chart
    const formattedData = useFormattedChartData(chartData, (point) => ({
        date: formatChartDate(new Date(point.date)),
        views: point.views,
        addToCarts: point.addToCarts,
        purchases: point.purchases,
    }));

    // Calculate totals
    const totals = useChartTotals(chartData, [
        "views",
        "addToCarts",
        "purchases",
    ]);

    // Loading state
    if (isChartLoading) {
        return <ChartSkeleton tabs={false} />;
    }

    return (
        <ChartWrapper
            title="Funnel Performance"
            description="Track how customers progress through your bundle funnel from initial view to final purchase. Identify drop-off points to optimize conversion."
            formula="Flow: Views → Add-to-Cart → Purchases"
            summaryStats={[
                { label: "Views", value: totals.views },
                { label: "Add to Cart", value: totals.addToCarts },
                { label: "Purchases", value: totals.purchases },
            ]}
        >
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={formattedData} margin={CHART_MARGINS.default}>
                    <CartesianGrid {...CHART_GRID_CONFIG} />

                    <Tooltip
                        {...CHART_TOOLTIP_CONFIG}
                        formatter={(value: number | undefined) =>
                            value == null ? "" : value.toLocaleString()
                        }
                    />

                    <XAxis dataKey="date" {...CHART_XAXIS_CONFIG} />
                    <YAxis {...CHART_YAXIS_CONFIG} />

                    <Line
                        dataKey="views"
                        stroke="#00C896"
                        name="Views"
                        {...getLineConfig("#00C896")}
                    />

                    <Line
                        dataKey="addToCarts"
                        stroke="#FFA500"
                        name="ATC"
                        {...getLineConfig("#FFA500")}
                    />

                    <Line
                        dataKey="purchases"
                        stroke="#FF6B6B"
                        name="Purchases"
                        {...getLineConfig("#FF6B6B")}
                    />

                    <Legend {...CHART_LEGEND_CONFIG} />
                </LineChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
