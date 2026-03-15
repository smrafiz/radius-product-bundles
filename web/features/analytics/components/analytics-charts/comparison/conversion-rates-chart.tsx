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
    InsufficientDataState,
    NoActivityState,
    NoDataState,
    useAnalytics,
    useAnalyticsStore,
    useChartTotals,
    useConversionRate,
    useFormattedChartData,
    useSmartChartDisplay,
} from "@/features/analytics";
import { useTranslations } from "@/lib/i18n/provider";
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

/**
 * Conversion Rates Chart - Using useSmartChartDisplay Hook
 */
export function ConversionRatesChart() {
    const t = useTranslations("Analytics.Charts");
    const { chartData, isChartLoading } = useAnalytics();
    const { preset } = useAnalyticsStore();
    const display = useSmartChartDisplay(chartData, preset);

    // Format data with conversion rates
    const formattedData = useFormattedChartData(chartData, (point) => {
        const viewToCartRate =
            point.views > 0 ? (point.addToCarts / point.views) * 100 : 0;

        const cartToPurchaseRate =
            point.addToCarts > 0
                ? (point.purchases / point.addToCarts) * 100
                : 0;

        return {
            date: formatChartDate(new Date(point.date)),
            viewToCartRate: Number(viewToCartRate.toFixed(2)),
            cartToPurchaseRate: Number(cartToPurchaseRate.toFixed(2)),
        };
    });

    // Calculate totals
    const totals = useChartTotals(chartData, [
        "views",
        "addToCarts",
        "purchases",
    ]);

    // Calculate average conversion rates
    const avgViewToCart = useConversionRate(totals.addToCarts, totals.views);
    const avgCartToPurchase = useConversionRate(
        totals.purchases,
        totals.addToCarts,
    );

    // Loading state
    if (isChartLoading) {
        return <ChartSkeleton tabs={false} />;
    }

    // Show empty state (for presets only)
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
        <>
            <ChartWrapper
                title={t("conversionTitle")}
                description="Track how effectively you convert views to cart additions and cart additions to purchases. Higher percentages indicate better funnel optimization."
                formula="View→Cart = (Add-to-Cart / Views) × 100%
                Cart→Purchase = (Purchases / Add-to-Cart) × 100%"
                showInfoBanner={display.showInfoBanner}
                infoBannerMessage={display.bannerMessage}
                summaryStats={[
                    { label: t("avgViewToCart"), value: `${avgViewToCart}%` },
                    {
                        label: t("avgCartToPurchase"),
                        value: `${avgCartToPurchase}%`,
                    },
                    { label: ".", value: "" },
                ]}
            >
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                        data={formattedData}
                        margin={CHART_MARGINS.default}
                    >
                        <CartesianGrid {...CHART_GRID_CONFIG} />

                        <Tooltip
                            {...CHART_TOOLTIP_CONFIG}
                            formatter={(value) =>
                                value == null
                                    ? "-"
                                    : `${Number(value).toFixed(1)}%`
                            }
                        />

                        <XAxis dataKey="date" {...CHART_XAXIS_CONFIG} />

                        <YAxis
                            {...CHART_YAXIS_CONFIG}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                        />

                        <Line
                            dataKey="viewToCartRate"
                            stroke="#008CFF"
                            name={t("viewToCart")}
                            {...getLineConfig("#008CFF", 2.5)}
                        />

                        <Line
                            dataKey="cartToPurchaseRate"
                            stroke="#9B59B6"
                            name={t("cartToPurchase")}
                            {...getLineConfig("#9B59B6", 2.5)}
                        />

                        <Legend {...CHART_LEGEND_CONFIG} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartWrapper>
        </>
    );
}
