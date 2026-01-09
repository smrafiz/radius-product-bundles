import { useMemo } from "react";

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
        if (!data) return [];
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
        if (denominator === 0) return "0";
        return ((numerator / denominator) * 100).toFixed(decimals);
    }, [numerator, denominator, decimals]);
}
