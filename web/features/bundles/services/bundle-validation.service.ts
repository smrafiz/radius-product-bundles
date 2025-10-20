/**
 * Bundle Validation Service - Business Logic Layer
 */

import { BundleFormData, bundleQueries, BundleType } from "@/features/bundles";

/**
 * Check for name conflicts
 */
export async function checkNameConflict(
    shop: string,
    name: string,
    excludeId?: string
): Promise<void> {
    const existingBundle = await bundleQueries.findBundleByName(shop, name, excludeId);

    if (existingBundle) {
        throw new Error(`Bundle with name "${name}" already exists`);
    }
}

/**
 * Infer a bundle type from form data
 */
export function inferBundleType(data: BundleFormData): BundleType {
    if (data.discountType === "NO_DISCOUNT") {
        return "FREQUENTLY_BOUGHT_TOGETHER";
    }

    if (data.discountType === "FREE_SHIPPING") {
        return "FIXED_BUNDLE";
    }

    return "FIXED_BUNDLE";
}