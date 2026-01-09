"use client";

import { useMemo } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ChartSkeleton, useAnalytics } from "@/features/analytics";

/**
 * Funnel Performance Chart
 */
export function FunnelPerformanceChart() {
    const { chartData, isChartLoading } = useAnalytics();

    const formattedData = useMemo(() => {
        if (!chartData) {
            return [];
        }

        return chartData.map((point) => ({
            date: new Date(point.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            views: point.views,
            addToCarts: point.addToCarts,
            purchases: point.purchases,
        }));
    }, [chartData]);

    // Calculate totals for summary
    const totals = useMemo(() => {
        if (!chartData) {
            return { views: 0, addToCarts: 0, purchases: 0 };
        }

        return chartData.reduce(
            (acc, point) => ({
                views: acc.views + point.views,
                addToCarts: acc.addToCarts + point.addToCarts,
                purchases: acc.purchases + point.purchases,
            }),
            { views: 0, addToCarts: 0, purchases: 0 },
        );
    }, [chartData]);

    // Skeleton loading
    if (isChartLoading) {
        return <ChartSkeleton />;
    }

    return (
        <s-section>
            <s-stack gap="base">
                {/* Header */}
                <s-heading>Funnel Performance</s-heading>
                <s-stack gap="small-200">
                    {[
                        { label: "Views", value: totals.views },
                        { label: "Add to Cart", value: totals.addToCarts },
                        { label: "Purchases", value: totals.purchases },
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
                    <LineChart
                        data={formattedData}
                        margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
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
                            formatter={(value: number | undefined) =>
                                value == null ? "" : value.toLocaleString()
                            }
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

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9CA3AF", fontSize: 11 }}
                            width={40}
                        />

                        {/* Views Line */}
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#00C896"
                            strokeWidth={2}
                            name="Views"
                            dot={false}
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: "#00C896",
                                fill: "#fff",
                            }}
                        />

                        {/* Add-to-Cart Line */}
                        <Line
                            type="monotone"
                            dataKey="addToCarts"
                            stroke="#FFA500"
                            strokeWidth={2}
                            name="ATC"
                            dot={false}
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: "#FFA500",
                                fill: "#fff",
                            }}
                        />

                        {/* Purchases Line */}
                        <Line
                            type="monotone"
                            dataKey="purchases"
                            stroke="#FF6B6B"
                            strokeWidth={2}
                            name="Purchases"
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
                            iconType="line"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </s-stack>
        </s-section>
    );
}
