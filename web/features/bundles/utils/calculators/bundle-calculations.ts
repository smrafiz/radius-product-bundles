import { Bundle } from "@prisma/client";

/**
 * Calculate bundle statistics
 */
export function calculateBundleStats(bundle: Bundle) {
    return {
        conversionRate:
            bundle.views > 0 ? (bundle.conversions / bundle.views) * 100 : 0,
        avgRevenue:
            bundle.conversions > 0 ? bundle.revenue / bundle.conversions : 0,
    };
}