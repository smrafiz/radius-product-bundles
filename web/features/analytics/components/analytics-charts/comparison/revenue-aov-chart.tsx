"use client";

import {
    CHART_GRID_CONFIG,
    CHART_LEGEND_CONFIG,
    CHART_MARGINS,
    CHART_TOOLTIP_CONFIG,
    CHART_XAXIS_CONFIG,
    ChartSkeleton,
    ChartWrapper,
    formatChartDate,
    getActiveDotConfig,
    InsufficientDataState,
    NoActivityState,
    NoDataState,
    useAnalytics,
    useAnalyticsStore,
    useChartTotals,
    useFormattedChartData,
    useSmartChartDisplay,
} from "@/features/analytics";
import { formatCurrency } from "@/shared";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

/**
 * Revenue + AOV Chart
 *
 * Shows Revenue (bars) + Average Order Value (line)
 */
export function RevenueAOVChart() {
    const { chartData, isChartLoading } = useAnalytics();
    const { preset } = useAnalyticsStore();
    const display = useSmartChartDisplay(chartData, preset);

    // Format data with AOV calculation
    const formattedData = useFormattedChartData(chartData, (point) => {
        const aov = point.purchases > 0 ? point.revenue / point.purchases : 0;

        return {
            date: formatChartDate(new Date(point.date)),
            revenue: point.revenue,
            aov: Number(aov.toFixed(2)),
        };
    });

    // Calculate totals
    const totals = useChartTotals(chartData, ["revenue", "purchases"]);
    const avgAOV = totals.purchases > 0 ? totals.revenue / totals.purchases : 0;

    // Loading state
    if (isChartLoading) {
        return <ChartSkeleton tabs={false} />;
    }

    // Show the empty state if data is invalid
    if (display.shouldShowEmptyState) {
        switch (display.emptyStateReason) {
            case "no_data":
                return <NoDataState />;
            case "insufficient_points":
                return (
                    <InsufficientDataState
                        currentPoints={display.points || 1}
                    />
                );
            case "no_activity":
                return <NoActivityState />;
            default:
                return <NoDataState />;
        }
    }

    return (
        <ChartWrapper
            title="Revenue Analysis"
            description="Understand both volume (total revenue) and quality (average order value) of your bundle sales. Increasing AOV means customers are buying more valuable bundles."
            formula="AOV = Total Revenue / Number of Purchases"
            showInfoBanner={display.showInfoBanner}
            infoBannerMessage={display.bannerMessage}
            summaryStats={[
                {
                    label: "Total Revenue",
                    value: formatCurrency(totals.revenue),
                },
                { label: "Avg Order Value", value: formatCurrency(avgAOV) },
            ]}
        >
            <ResponsiveContainer width="100%" height={240}>
                <ComposedChart
                    data={formattedData}
                    margin={CHART_MARGINS.withRightAxis}
                >
                    <CartesianGrid {...CHART_GRID_CONFIG} />

                    <Tooltip
                        {...CHART_TOOLTIP_CONFIG}
                        formatter={(value, name) => {
                            if (value == null) return ["—", name ?? ""];
                            return [formatCurrency(Number(value)), name ?? ""];
                        }}
                    />

                    <XAxis dataKey="date" {...CHART_XAXIS_CONFIG} />

                    {/* Left Y-Axis for Revenue */}
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#008CFF", fontSize: 11 }}
                        tickFormatter={(value) =>
                            value >= 1000
                                ? `$${Math.round(value / 100)}K`
                                : `$${Math.round(value / 100)}`
                        }
                        width={45}
                    />

                    {/* Right Y-Axis for AOV */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#FF6B6B", fontSize: 11 }}
                        tickFormatter={(value) =>
                            value >= 1000
                                ? `$${Math.round(value / 100)}K`
                                : `$${Math.round(value / 100)}`
                        }
                        width={45}
                    />

                    {/* Revenue Bars */}
                    <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        fill="#008CFF"
                        fillOpacity={0.7}
                        radius={[4, 4, 0, 0]}
                        name="Revenue"
                    />

                    {/* AOV Line */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="aov"
                        stroke="#FF6B6B"
                        strokeWidth={2.5}
                        name="Avg Order Value"
                        dot={false}
                        activeDot={getActiveDotConfig("#FF6B6B")}
                    />

                    <Legend {...CHART_LEGEND_CONFIG} />
                </ComposedChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
