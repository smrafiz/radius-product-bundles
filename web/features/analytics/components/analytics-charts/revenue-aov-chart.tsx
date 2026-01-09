"use client";

import { useMemo } from "react";
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
import { ChartSkeleton, useAnalytics } from "@/features/analytics";
import { formatCurrency, SkeletonLine } from "@/shared";

/**
 * Revenue + AOV Chart
 *
 * Shows Revenue (bars) + Average Order Value (line)
 * Helps understand volume AND quality of sales
 */
export function RevenueAOVChart() {
    const { chartData, isChartLoading } = useAnalytics();

    const formattedData = useMemo(() => {
        if (!chartData) return [];

        return chartData.map((point) => {
            // Calculate Average Order Value
            const aov =
                point.purchases > 0 ? point.revenue / point.purchases : 0;

            return {
                date: new Date(point.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                revenue: point.revenue,
                aov: Number(aov.toFixed(2)),
            };
        });
    }, [chartData]);

    // Calculate totals and average AOV
    const summary = useMemo(() => {
        if (!chartData) return { totalRevenue: 0, avgAOV: 0 };

        const totals = chartData.reduce(
            (acc, point) => ({
                revenue: acc.revenue + point.revenue,
                purchases: acc.purchases + point.purchases,
            }),
            { revenue: 0, purchases: 0 },
        );

        return {
            totalRevenue: totals.revenue,
            avgAOV:
                totals.purchases > 0 ? totals.revenue / totals.purchases : 0,
        };
    }, [chartData]);

    // Skeleton loading
    if (isChartLoading) {
        return <ChartSkeleton />;
    }

    return (
        <s-section>
            <s-stack gap="base">
                {/* Header */}
                <s-heading>Revenue Analysis</s-heading>
                <s-stack gap="small-200">
                    {[
                        {
                            label: "Total Revenue",
                            value: formatCurrency(summary.totalRevenue),
                        },
                        {
                            label: "Avg Order Value",
                            value: formatCurrency(summary.avgAOV),
                        },
                    ].map((row) => (
                        <s-stack
                            key={row.label}
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-text>{row.label}</s-text>
                            <s-text type="strong" tone="info">
                                <span className="font-medium">
                                    {row.value.toLocaleString()}
                                </span>
                            </s-text>
                        </s-stack>
                    ))}
                </s-stack>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart
                        data={formattedData}
                        margin={{ top: 10, right: 0, bottom: 20, left: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="0"
                            stroke="#F0F0F0"
                            horizontal={true}
                            vertical={false}
                        />

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
                                fontWeight: "bold",
                            }}
                            formatter={(
                                value: number | undefined,
                                name?: string,
                            ) => {
                                const seriesName = name ?? "";
                                if (value == null) {
                                    return ["—", seriesName];
                                }

                                if (seriesName === "Revenue") {
                                    return [formatCurrency(value), seriesName];
                                }
                                return [formatCurrency(value), seriesName];
                            }}
                            cursor={{
                                stroke: "#E5E5E5",
                                strokeWidth: 1,
                                strokeDasharray: "4 4",
                            }}
                        />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9CA3AF", fontSize: 11, dy: 10 }}
                            minTickGap={30}
                        />

                        {/* Left Y-Axis for Revenue */}
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#008CFF", fontSize: 11 }}
                            tickFormatter={(value) => {
                                if (value >= 1000) {
                                    return `$${Math.round(value / 100)}K`;
                                }
                                return `$${Math.round(value / 100)}`;
                            }}
                            width={45}
                        />

                        {/* Right Y-Axis for AOV */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#FF6B6B", fontSize: 11 }}
                            tickFormatter={(value) => {
                                if (value >= 1000) {
                                    return `$${Math.round(value / 100)}K`;
                                }
                                return `$${Math.round(value / 100)}`;
                            }}
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
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: "#FF6B6B",
                                fill: "#fff",
                            }}
                        />

                        <Legend
                            align="center"
                            verticalAlign="bottom"
                            wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </s-stack>
        </s-section>
    );
}
