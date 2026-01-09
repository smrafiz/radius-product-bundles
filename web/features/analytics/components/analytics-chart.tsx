"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { CHART_METRICS, ChartSkeleton, useAnalytics } from "@/features/analytics";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";

/**
 * Analytics chart with metric tabs
 */
export function AnalyticsChart() {
    const { chartData, isChartLoading } = useAnalytics();
    const [activeMetric, setActiveMetric] = useState<
        "revenue" | "views" | "purchases"
    >("revenue");

    const formattedData = useMemo(() => {
        if (!chartData) {
            return [];
        }

        return chartData.map((point) => ({
            date: new Date(point.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            revenue: point.revenue,
            views: point.views,
            purchases: point.purchases,
            addToCarts: point.addToCarts,
        }));
    }, [chartData]);

    // Get current metric config
    const currentMetric = CHART_METRICS.find((m) => m.key === activeMetric)!;

    // Calculate total for active metric
    const totalValue = useMemo(() => {
        if (!chartData) return 0;
        return chartData.reduce((sum, point) => sum + point[activeMetric], 0);
    }, [chartData, activeMetric]);

    if (isChartLoading) {
        return <ChartSkeleton />;
    }

    return (
        <s-section>
            <s-stack gap="base">
                {/* Metric tabs */}
                <s-stack
                    direction="inline"
                    gap="small-200"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    {/* Header with total */}
                    <s-stack gap="small-200">
                        <s-heading>
                            Total {currentMetric.label.toLowerCase()} over time
                        </s-heading>
                        <s-heading>
                            <span className="text-xl">
                                {currentMetric.formatter(totalValue)}
                            </span>
                        </s-heading>
                    </s-stack>
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
                        {/* Minimal grid */}
                        <CartesianGrid
                            strokeDasharray="0"
                            stroke="#F0F0F0"
                            horizontal={true}
                            vertical={false}
                        />

                        {/* Tooltip */}
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: "1px solid #E5E5E5",
                                padding: "8px 12px",
                                background: "#fff",
                                fontSize: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            labelStyle={{
                                color: "#6B7280",
                                fontSize: 11,
                                marginBottom: 4,
                                fontWeight: "bold"
                            }}
                            formatter={(value: number | undefined) => {
                                if (value === undefined) {
                                    return ["-", currentMetric.label];
                                }

                                return [
                                    currentMetric.formatter(value),
                                    currentMetric.label,
                                ];
                            }}
                            cursor={{
                                stroke: "#E5E5E5",
                                strokeWidth: 1,
                                strokeDasharray: "4 4",
                            }}
                        />

                        {/* X-Axis */}
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#9CA3AF",
                                fontSize: 11,
                                dy: 10,
                            }}
                            minTickGap={30}
                        />

                        {/* Y-Axis */}
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#9CA3AF",
                                fontSize: 11,
                            }}
                            tickFormatter={currentMetric.yAxisFormatter}
                            width={50}
                        />

                        {/* Dynamic gradient */}
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

                        {/* Area chart */}
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
                        {formattedData.length > 0 &&
                            `${formattedData[0].date} - ${formattedData[formattedData.length - 1].date}, ${new Date().getFullYear()}`}
                    </s-text>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
