"use client";

import { clsx } from "clsx";
import {
    CHART_GRID_CONFIG,
    CHART_METRICS,
    CHART_TOOLTIP_CONFIG,
    CHART_XAXIS_CONFIG,
    CHART_YAXIS_CONFIG,
    ChartSkeleton,
    ChartTitleTooltip,
    formatChartDate,
    InsufficientDataState,
    NoActivityState,
    NoDataState,
    useAnalytics,
    useAnalyticsStore,
    useFormattedChartData,
    useSmartChartDisplay,
} from "@/features/analytics";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";

/**
 * Analytics chart with metric tabs
 */
export function AnalyticsChart() {
    const { chartData, isChartLoading } = useAnalytics();
    const { preset } = useAnalyticsStore();
    const display = useSmartChartDisplay(chartData, preset);
    const [activeMetric, setActiveMetric] = useState<
        "revenue" | "views" | "purchases"
    >("revenue");

    // Format data for the chart
    const formattedData = useFormattedChartData(chartData, (point) => ({
        date: formatChartDate(new Date(point.date)),
        revenue: point.revenue,
        views: point.views,
        purchases: point.purchases,
        addToCarts: point.addToCarts,
    }));

    // Get current metric config
    const currentMetric = CHART_METRICS.find((m) => m.key === activeMetric)!;

    // Calculate total for active metric
    const totalValue =
        chartData?.reduce(
            (sum, point) => sum + (point[activeMetric] ?? 0),
            0,
        ) ?? 0;

    if (isChartLoading) {
        return <ChartSkeleton />;
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

    const dateLabel = (() => {
        if (formattedData.length === 0) return null;

        const firstPoint = chartData![0];
        const lastPoint = chartData![chartData!.length - 1];

        const firstDate = new Date(firstPoint.date);
        const lastDate = new Date(lastPoint.date);

        const sameDay = firstDate.toDateString() === lastDate.toDateString();
        const sameYear = firstDate.getFullYear() === lastDate.getFullYear();

        const firstLabel = formatChartDate(firstDate);
        const lastLabel = formatChartDate(lastDate);

        if (sameDay) {
            return `${firstLabel}, ${firstDate.getFullYear()}`;
        }

        if (sameYear) {
            return `${firstLabel} – ${lastLabel}, ${firstDate.getFullYear()}`;
        }

        return `${firstLabel}, ${firstDate.getFullYear()} – ${lastLabel}, ${lastDate.getFullYear()}`;
    })();

    return (
        <s-section>
            <s-stack gap="base">
                {/* Header with metric tabs */}
                <s-stack
                    direction="inline"
                    gap="small-200"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    {/* Title and total */}
                    <s-stack gap="small-200">
                        <s-heading>
                            <ChartTitleTooltip
                                title={`Total ${currentMetric.label}`}
                                description={currentMetric.description}
                                formula={currentMetric.formula}
                            >
                                Total {currentMetric.label.toLowerCase()} over
                                time
                            </ChartTitleTooltip>
                        </s-heading>
                        <s-heading>
                            <span className="text-xl">
                                {currentMetric.formatter(totalValue)}
                            </span>
                        </s-heading>
                    </s-stack>

                    {/* Metric tabs */}
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                    >
                        <s-button-group gap="none">
                            {CHART_METRICS.map((metric) => (
                                <s-button
                                    key={metric.key}
                                    slot="secondary-actions"
                                    onClick={() =>
                                        setActiveMetric(
                                            metric.key as
                                                | "revenue"
                                                | "views"
                                                | "purchases",
                                        )
                                    }
                                >
                                    <div
                                        className={clsx(
                                            activeMetric === metric.key &&
                                                "font-semibold",
                                        )}
                                        style={
                                            activeMetric === metric.key
                                                ? { color: metric.color }
                                                : undefined
                                        }
                                    >
                                        {metric.label}
                                    </div>
                                </s-button>
                            ))}
                        </s-button-group>
                    </s-stack>
                </s-stack>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                        data={formattedData}
                        margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                    >
                        {/* Grid */}
                        <CartesianGrid {...CHART_GRID_CONFIG} />

                        {/* Tooltip */}
                        <Tooltip
                            {...CHART_TOOLTIP_CONFIG}
                            formatter={(value: number | undefined) => {
                                if (value === undefined) {
                                    return ["-", currentMetric.label];
                                }
                                return [
                                    currentMetric.formatter(value),
                                    currentMetric.label,
                                ];
                            }}
                        />

                        {/* X-Axis */}
                        <XAxis dataKey="date" {...CHART_XAXIS_CONFIG} />

                        {/* Y-Axis */}
                        <YAxis
                            {...CHART_YAXIS_CONFIG}
                            tickFormatter={currentMetric.yAxisFormatter}
                            width={50}
                        />

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient
                                id={`${activeMetric}Gradient`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={currentMetric.color}
                                    stopOpacity={0.15}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={currentMetric.color}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        {/* Area */}
                        <Area
                            type="monotone"
                            dataKey={activeMetric}
                            stroke={currentMetric.color}
                            strokeWidth={2}
                            fill={`url(#${activeMetric}Gradient)`}
                            dot={false}
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: currentMetric.color,
                                fill: "#fff",
                            }}
                            animationDuration={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Date range indicator */}
                {dateLabel && (
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentMetric.color }}
                        />
                        <s-text tone="info">
                            <span className="text-[11px] text-[#70707b]">
                                {dateLabel}
                            </span>
                        </s-text>
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
