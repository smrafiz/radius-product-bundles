"use client";

import { ReactNode, useMemo } from "react";
import {
    Area,
    AreaChart,
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ChartSkeleton } from "@/features/analytics";

/**
 * Chart type options
 */
type ChartType = "area" | "line" | "bar" | "composed";

/**
 * Y-Axis configuration for dual-axis charts
 */
interface YAxisConfig {
    id: string;
    orientation: "left" | "right";
    color?: string;
    formatter?: (value: number) => string;
    domain?: [number, number] | ["auto", "auto"];
    width?: number;
    label?: string;
}

/**
 * Data series configuration
 */
interface SeriesConfig {
    key: string;
    name: string;
    color: string;
    type: "area" | "line" | "bar";
    yAxisId?: string;
    strokeWidth?: number;
    fillOpacity?: number;
}

/**
 * Base chart component props
 */
interface BaseChartProps {
    // Data
    data: any[];
    isLoading: boolean;

    // Chart configuration
    chartType?: ChartType;
    series: SeriesConfig[];
    height?: number;

    // Header
    title: string | ReactNode;
    tooltipTitle?: string;
    tooltipDescription?: string;
    tooltipFormula?: string;
    summaryStats?: Array<{
        label: string;
        value: string | number;
    }>;

    // Axes
    xAxisKey: string;
    yAxes?: YAxisConfig[];

    // Styling
    showLegend?: boolean;
    showDateIndicator?: boolean;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };

    // Custom tooltip formatter
    tooltipFormatter?: (value: number, name: string) => [string, string];
}

/**
 * Reusable Base Chart Component
 *
 * Supports area, line, bar, and composed charts with dual Y-axes
 */
export function BaseChart({
    data,
    isLoading,
    chartType = "line",
    series,
    height = 240,
    title,
    tooltipTitle,
    tooltipDescription,
    tooltipFormula,
    summaryStats,
    xAxisKey,
    yAxes = [{ id: "default", orientation: "left" }],
    showLegend = true,
    showDateIndicator = true,
    margin = { top: 10, right: 10, bottom: 20, left: 0 },
    tooltipFormatter,
}: BaseChartProps) {
    // Determine chart component
    const ChartComponent = useMemo(() => {
        switch (chartType) {
            case "area":
                return AreaChart;
            case "bar":
                return AreaChart;
            case "composed":
                return ComposedChart;
            case "line":
            default:
                return LineChart;
        }
    }, [chartType]);

    // Skeleton loading
    if (isLoading) {
        return <ChartSkeleton />;;
    }

    // Get primary color from the first series
    const primaryColor = series[0]?.color || "#008CFF";

    return (
        <s-section>
            <s-stack gap="base">
                {/* Header with total */}
                <s-stack gap="small-200">
                    <s-heading>{title}</s-heading>
                    {summaryStats && summaryStats.length > 0 && (
                        <s-heading>
                            <span className="text-xl">
                                {summaryStats.values}
                            </span>
                        </s-heading>
                    )}
                </s-stack>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={height}>
                    <ChartComponent data={data} margin={margin}>
                        {/* Grid */}
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
                            }}
                            formatter={
                                tooltipFormatter ||
                                ((value: number) => value.toLocaleString())
                            }
                        />

                        {/* X-Axis */}
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9CA3AF", fontSize: 11, dy: 10 }}
                            minTickGap={30}
                        />

                        {/* Y-Axes */}
                        {yAxes.map((yAxis) => (
                            <YAxis
                                key={yAxis.id}
                                yAxisId={yAxis.id}
                                orientation={yAxis.orientation}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: yAxis.color || "#9CA3AF",
                                    fontSize: 11,
                                }}
                                tickFormatter={yAxis.formatter}
                                domain={yAxis.domain}
                                width={yAxis.width || 40}
                            />
                        ))}

                        {/* Render series based on type */}
                        {series.map((s) => {
                            const commonProps = {
                                key: s.key,
                                dataKey: s.key,
                                name: s.name,
                                yAxisId: s.yAxisId || yAxes[0].id,
                            };

                            switch (s.type) {
                                case "area":
                                    return (
                                        <Area
                                            {...commonProps}
                                            type="monotone"
                                            stroke={s.color}
                                            strokeWidth={s.strokeWidth || 2}
                                            fill={`url(#${s.key}Gradient)`}
                                            dot={false}
                                            activeDot={{
                                                r: 4,
                                                strokeWidth: 2,
                                                stroke: s.color,
                                                fill: "#fff",
                                            }}
                                        />
                                    );

                                case "bar":
                                    return (
                                        <Bar
                                            {...commonProps}
                                            fill={s.color}
                                            fillOpacity={s.fillOpacity || 0.7}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    );

                                case "line":
                                default:
                                    return (
                                        <Line
                                            {...commonProps}
                                            type="monotone"
                                            stroke={s.color}
                                            strokeWidth={s.strokeWidth || 2}
                                            dot={false}
                                            activeDot={{
                                                r: 4,
                                                strokeWidth: 2,
                                                fill: "#fff",
                                            }}
                                        />
                                    );
                            }
                        })}

                        {/* Gradients for area charts */}
                        <defs>
                            {series
                                .filter((s) => s.type === "area")
                                .map((s) => (
                                    <linearGradient
                                        key={`${s.key}Gradient`}
                                        id={`${s.key}Gradient`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={s.color}
                                            stopOpacity={0.15}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={s.color}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                ))}
                        </defs>

                        {/* Legend */}
                        {showLegend && (
                            <Legend
                                align="center"
                                verticalAlign="bottom"
                                wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                                iconType="line"
                            />
                        )}
                    </ChartComponent>
                </ResponsiveContainer>

                {/* Date indicator */}
                {showDateIndicator && data.length > 0 && (
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <s-text tone="info">
                            {data[0][xAxisKey]} -{" "}
                            {data[data.length - 1][xAxisKey]},{" "}
                            {new Date().getFullYear()}
                        </s-text>
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
