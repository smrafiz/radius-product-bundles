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
import { SkeletonLine } from "@/shared";

/**
 * Conversion Rates Chart
 *
 * Shows View-to-Cart % and Cart-to-Purchase %
 * Helps track performance quality and improvements
 */
export function ConversionRatesChart() {
    const { chartData, isChartLoading } = useAnalytics();

    const formattedData = useMemo(() => {
        if (!chartData) return [];

        return chartData.map((point) => {
            // Calculate conversion rates
            const viewToCartRate =
                point.views > 0 ? (point.addToCarts / point.views) * 100 : 0;

            const cartToPurchaseRate =
                point.addToCarts > 0
                    ? (point.purchases / point.addToCarts) * 100
                    : 0;

            return {
                date: new Date(point.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                viewToCartRate: Number(viewToCartRate.toFixed(2)),
                cartToPurchaseRate: Number(cartToPurchaseRate.toFixed(2)),
            };
        });
    }, [chartData]);

    // Calculate average conversion rates
    const averages = useMemo(() => {
        if (!chartData) return { viewToCart: 0, cartToPurchase: 0 };

        const totals = chartData.reduce(
            (acc, point) => ({
                views: acc.views + point.views,
                addToCarts: acc.addToCarts + point.addToCarts,
                purchases: acc.purchases + point.purchases,
            }),
            { views: 0, addToCarts: 0, purchases: 0 },
        );

        return {
            viewToCart:
                totals.views > 0
                    ? ((totals.addToCarts / totals.views) * 100).toFixed(1)
                    : "0",
            cartToPurchase:
                totals.addToCarts > 0
                    ? ((totals.purchases / totals.addToCarts) * 100).toFixed(1)
                    : "0",
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
                <s-heading>Conversion Performance</s-heading>
                <s-stack gap="small-200">
                    {[
                        {
                            label: "Avg View-to-Cart",
                            value: averages.viewToCart,
                        },
                        {
                            label: "Avg Cart-to-Purchase",
                            value: averages.cartToPurchase,
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
                                    {row.value.toLocaleString()}%
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
                            formatter={(
                                value: number | undefined,
                                name?: string,
                            ) => {
                                return [
                                    value == null
                                        ? "-"
                                        : `${value.toFixed(1)}%`,
                                    name ?? "",
                                ];
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

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9CA3AF", fontSize: 11 }}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                            width={40}
                        />

                        {/* View-to-Cart Rate */}
                        <Line
                            type="monotone"
                            dataKey="viewToCartRate"
                            stroke="#008CFF"
                            strokeWidth={2.5}
                            name="View → Cart"
                            dot={false}
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: "#008CFF",
                                fill: "#fff",
                            }}
                        />

                        {/* Cart-to-Purchase Rate */}
                        <Line
                            type="monotone"
                            dataKey="cartToPurchaseRate"
                            stroke="#9B59B6"
                            strokeWidth={2.5}
                            name="Cart → Purchase"
                            dot={false}
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: "#9B59B6",
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
