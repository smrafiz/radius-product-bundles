import { useMemo } from "react";
import { ChartDataStatusResult } from "@/features/analytics";

/**
 * Format date for chart display
 */
export function formatChartDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

/**
 * Hook to format analytics chart data
 *
 * Converts raw analytics data into Recharts-compatible format
 */
export function useFormattedChartData<T extends Record<string, any>>(
    data: any[] | null | undefined,
    formatter: (point: any) => T,
) {
    return useMemo(() => {
        if (!data) {
            return [];
        }

        return data.map(formatter);
    }, [data, formatter]);
}

/**
 * Hook to calculate chart totals
 *
 * Sums up values for specified keys across all data points
 */
export function useChartTotals<T extends Record<string, number>>(
    data: any[] | null | undefined,
    keys: (keyof T)[],
) {
    type Totals = Record<keyof T, number>;

    return useMemo(() => {
        if (!data) {
            return keys.reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {} as Totals);
        }

        return data.reduce((acc, point) => {
            keys.forEach((key) => {
                acc[key] = (acc[key] || 0) + (point[key] || 0);
            });
            return acc;
        }, {} as Totals);
    }, [data, keys]);
}

/**
 * Hook to calculate conversion rate
 */
export function useConversionRate(
    numerator: number,
    denominator: number,
    decimals = 1,
): string {
    return useMemo(() => {
        if (denominator === 0) {
            return "0";
        }

        return ((numerator / denominator) * 100).toFixed(decimals);
    }, [numerator, denominator, decimals]);
}

/**
 * Hook to check chart data validity
 */
export function useChartDataStatus(
    chartData: any[] | null | undefined,
): ChartDataStatusResult {
    // No data at all
    if (!chartData || chartData.length === 0) {
        return {
            isValid: false,
            reason: "no_data",
        };
    }

    // Insufficient data points (need at least 2 for trends)
    if (chartData.length < 2) {
        return {
            isValid: false,
            reason: "insufficient_points",
            points: chartData.length,
        };
    }

    // Check for any activity
    const hasActivity = chartData.some(
        (point) =>
            (point.views || 0) > 0 ||
            (point.addToCarts || 0) > 0 ||
            (point.purchases || 0) > 0,
    );

    if (!hasActivity) {
        return {
            isValid: false,
            reason: "no_activity",
        };
    }

    // Valid data
    return {
        isValid: true,
        reason: null,
    };
}

/**
 * Hook to check conversion data validity
 */
export function useConversionDataStatus(
    chartData: any[] | null | undefined,
): ChartDataStatusResult {
    // Check base validity first
    const baseStatus = useChartDataStatus(chartData);

    if (!baseStatus.isValid) {
        return baseStatus;
    }

    // Check for conversion data (views and add-to-carts)
    const hasConversionData = chartData!.some(
        (point) => (point.views || 0) > 0 && (point.addToCarts || 0) > 0,
    );

    if (!hasConversionData) {
        return {
            isValid: false,
            reason: "no_conversions",
        };
    }

    return { isValid: true, reason: null };
}

/**
 * Hook to check revenue data validity
 */
export function useRevenueDataStatus(
    chartData: any[] | null | undefined,
): ChartDataStatusResult {
    // Check base validity first
    const baseStatus = useChartDataStatus(chartData);

    if (!baseStatus.isValid) {
        return baseStatus;
    }

    // Check for purchase data (purchases and revenue)
    const hasPurchases = chartData!.some(
        (point) => (point.purchases || 0) > 0 && (point.revenue || 0) > 0,
    );

    if (!hasPurchases) {
        return {
            isValid: false,
            reason: "no_purchases",
        };
    }

    return { isValid: true, reason: null };
}
