"use client";

import { useMemo } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import { useAnalytics } from "@/features/analytics";
import { formatCurrency } from "@/shared";

/**
 * Analytics chart component
 *
 * Displays time-series data for bundle performance.
 */
export function AnalyticsChart() {
    const { chartData, isChartLoading } = useAnalytics();

    const formattedData = useMemo(() => {
        if (!chartData) return [];

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

    if (isChartLoading) {
        return (
            <s-section>
                <s-heading>Bundle Performance Trends</s-heading>
                <div
                    style={{
                        height: 340,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <s-spinner size="large" />
                </div>
            </s-section>
        );
    }

    return (
        <s-section>
            <s-heading>Bundle Performance Trends</s-heading>
            <ResponsiveContainer width="100%" height={340}>
                <LineChart
                    data={formattedData}
                    margin={{ top: 10, right: 30, bottom: 20, left: 25 }}
                >
                    <CartesianGrid
                        stroke="#e3e3e3"
                        horizontal={true}
                        vertical={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e3e3e3",
                            padding: 10,
                            background: "#fff",
                            fontSize: 11,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === "revenue")
                                return formatCurrency(value);
                            return value;
                        }}
                        cursor={{ stroke: "#e3e3e3", strokeWidth: 1 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#13ACF0"
                        strokeWidth={2}
                        name="Revenue"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#00C9A7"
                        strokeWidth={2}
                        name="Views"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="purchases"
                        stroke="#FF6B6B"
                        strokeWidth={2}
                        name="Purchases"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: "#6B7280", fontSize: 11, dy: 12 }}
                        axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                    />
                    <Legend
                        align="center"
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: 20 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </s-section>
    );
}
