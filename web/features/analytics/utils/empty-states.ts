/**
 * Empty State Utility Functions
 */

import { ChartDataPoint } from "@/features/analytics";

/**
 * Check if the chart has any data
 */
export function hasChartData(chartData: any[] | null | undefined): boolean {
    return !!(chartData && chartData.length > 0);
}

/**
 * Check if the chart has sufficient data points for trends
 */
export function hasSufficientDataPoints(
    chartData: any[] | null | undefined,
    minPoints: number = 2,
): boolean {
    return !!(chartData && chartData.length >= minPoints);
}

/**
 * Check if the chart has any activity
 */
export function hasActivity(
    chartData: ChartDataPoint[] | null | undefined,
): boolean {
    if (!chartData || chartData.length === 0) {
        return false;
    }

    return chartData.some(
        (point) =>
            (point.views || 0) > 0 ||
            (point.addToCarts || 0) > 0 ||
            (point.purchases || 0) > 0,
    );
}

/**
 * Check if the chart has conversion data (views AND add-to-carts)
 */
export function hasConversionData(
    chartData: ChartDataPoint[] | null | undefined,
): boolean {
    if (!chartData || chartData.length === 0) {
        return false;
    }

    return chartData.some(
        (point) => (point.views || 0) > 0 && (point.addToCarts || 0) > 0,
    );
}

/**
 * Check if the chart has purchase data
 */
export function hasPurchaseData(
    chartData: ChartDataPoint[] | null | undefined,
): boolean {
    if (!chartData || chartData.length === 0) {
        return false;
    }

    return chartData.some(
        (point) => (point.purchases || 0) > 0 && (point.revenue || 0) > 0,
    );
}

/**
 * Calculate total activity across all data points
 */
export function calculateTotalActivity(
    chartData: ChartDataPoint[] | null | undefined,
): {
    totalViews: number;
    totalAddToCarts: number;
    totalPurchases: number;
    totalRevenue: number;
} {
    if (!chartData || chartData.length === 0) {
        return {
            totalViews: 0,
            totalAddToCarts: 0,
            totalPurchases: 0,
            totalRevenue: 0,
        };
    }

    return chartData.reduce(
        (acc, point) => ({
            totalViews: acc.totalViews + (point.views || 0),
            totalAddToCarts: acc.totalAddToCarts + (point.addToCarts || 0),
            totalPurchases: acc.totalPurchases + (point.purchases || 0),
            totalRevenue: acc.totalRevenue + (point.revenue || 0),
        }),
        {
            totalViews: 0,
            totalAddToCarts: 0,
            totalPurchases: 0,
            totalRevenue: 0,
        },
    );
}

/**
 * Check if data is limited (less than recommended days)
 */
export function isLimitedData(
    chartData: any[] | null | undefined,
    minDays: number = 7,
): boolean {
    if (!chartData) {
        return false;
    }
    return chartData.length < minDays;
}

/**
 * Get data status reason
 */
export function getDataStatusReason(
    chartData: any[] | null | undefined,
): "no_data" | "insufficient_points" | "no_activity" | "valid" {
    if (!hasChartData(chartData)) {
        return "no_data";
    }

    if (!hasSufficientDataPoints(chartData)) {
        return "insufficient_points";
    }

    if (!hasActivity(chartData as ChartDataPoint[])) {
        return "no_activity";
    }

    return "valid";
}

/**
 * Get conversion data status reason
 */
export function getConversionStatusReason(
    chartData: ChartDataPoint[] | null | undefined,
):
    | "no_data"
    | "insufficient_points"
    | "no_activity"
    | "no_conversions"
    | "valid" {
    const baseReason = getDataStatusReason(chartData);

    if (baseReason !== "valid") {
        return baseReason;
    }

    if (!hasConversionData(chartData)) {
        return "no_conversions";
    }

    return "valid";
}

/**
 * Get revenue data status reason
 */
export function getRevenueStatusReason(
    chartData: ChartDataPoint[] | null | undefined,
):
    | "no_data"
    | "insufficient_points"
    | "no_activity"
    | "no_purchases"
    | "valid" {
    const baseReason = getDataStatusReason(chartData);

    if (baseReason !== "valid") {
        return baseReason;
    }

    if (!hasPurchaseData(chartData)) {
        return "no_purchases";
    }

    return "valid";
}

/**
 * Get empty state component props based on reason
 *
 * Returns props for the appropriate empty state component
 * Use this with the component imports in your chart
 */
export function getEmptyStateProps(
    reason: string,
    points?: number,
): {
    component:
        | "NoDataState"
        | "InsufficientDataState"
        | "NoActivityState"
        | "NoConversionsState"
        | "NoPurchasesState";
    props?: any;
} | null {
    switch (reason) {
        case "no_data":
            return { component: "NoDataState" };

        case "insufficient_points":
            return {
                component: "InsufficientDataState",
                props: { currentPoints: points || 1 },
            };

        case "no_activity":
            return { component: "NoActivityState" };

        case "no_conversions":
            return { component: "NoConversionsState" };

        case "no_purchases":
            return { component: "NoPurchasesState" };

        default:
            return null;
    }
}
