/*
 * Bundle calculations
 */

import { Bundle } from "@prisma/client";
import { SelectedItem } from "@/features/bundles";

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

/**
 * Calculate total bundle price
 */
export function calculateBundlePrice(items: SelectedItem[]): number {
    return items.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        return total + price * item.quantity;
    }, 0);
}

/**
 * Calculate discount amount based on discount type and value
 */
export function calculateDiscountAmount(
    bundlePrice: number,
    discountType: string,
    discountValue: number,
    maxDiscountAmount?: number,
): number {
    let discount = 0;

    switch (discountType) {
        case "PERCENTAGE":
            discount = (bundlePrice * discountValue) / 100;
            break;
        case "FIXED_AMOUNT":
            discount = discountValue;
            break;
        default:
            discount = 0;
    }

    // Apply maximum discount cap if set
    if (maxDiscountAmount && discount > maxDiscountAmount) {
        discount = maxDiscountAmount;
    }

    // Discount cannot exceed the bundle price
    return Math.min(discount, bundlePrice);
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercentage(
    originalPrice: number,
    discountedPrice: number,
): number {
    if (originalPrice === 0) return 0;
    return Math.round(
        ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
}
