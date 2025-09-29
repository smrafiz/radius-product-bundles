import { BundleListItem, BundleMetrics } from "@/types";

/**
 * Wrapper function to start the loader and execute the callback
 * @param callback
 * @returns
 */
export const withLoader = (callback: () => void) => {
    return () => {
        window.shopify.loading(true);
        callback();
    };
};

export const calculateMetrics = (bundles: BundleListItem[]): BundleMetrics => {
    const totalRevenue = bundles.reduce((sum, b) => sum + (b.revenue || 0), 0);
    const revenueAllTime = bundles.reduce((sum, b) => sum + (b.revenueAllTime || 0), 0);
    const totalViews = bundles.reduce((sum, b) => sum + (b.views || 0), 0);
    const activeBundles = bundles.filter((b) => b.status === "ACTIVE").length;
    const totalBundles = bundles.length;
    const avgConversionRate =
        bundles.length > 0 ? bundles.reduce((sum, b) => sum + (b.conversionRate || 0), 0) / bundles.length : 0;

    return {
        totalRevenue,
        revenueAllTime,
        totalViews,
        activeBundles,
        totalBundles,
        avgConversionRate,
        revenueGrowth: 0,
        conversionGrowth: 0,
    };
}

// Remove null/undefined values
export const removeNulls = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(removeNulls);
    }
    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, v]) => v !== null && v !== undefined)
                .map(([k, v]) => [k, removeNulls(v)]),
        );
    }
    return obj;
};