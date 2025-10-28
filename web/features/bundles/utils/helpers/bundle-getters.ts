/*
 * Bundle getters
 */

import {
    BUNDLE_STATUSES,
    BundleConfig,
    BundleStatus,
    BundleStatusBadge,
    BundleType,
    DISCOUNT_TYPES,
    DiscountConfig,
    DiscountType,
} from "@/features/bundles";
import { Bundle, BundleProduct } from "@prisma/client";
import { BUNDLE_TYPES } from "@/features/bundles/constants";

/*
 * Bundle status badge
 */
export const getBundleStatusBadge = (
    status: string | BundleStatusBadge,
): BundleStatusBadge => {
    const config = BUNDLE_STATUSES[status as BundleStatus] ?? {
        text: String(status),
        tone: "subdued",
    };

    return {
        text: config.text,
        tone: config.tone,
        children: config.text,
    };
};

/**
 * Get bundle configuration properties
 */
export const getBundleProperty = <
    T extends keyof Pick<BundleConfig, "label" | "icon" | "slug">,
>(
    type: BundleType,
    property: T,
): BundleConfig[T] | null => {
    const config = BUNDLE_TYPES[type];
    return config?.[property] ?? null;
};

/**
 * Get discount configuration properties
 */
export const getDiscountProperty = <
    T extends keyof Pick<
        DiscountConfig,
        "label" | "slug" | "description" | "symbol" | "suffix" | "format"
    >,
>(
    type: DiscountType,
    property: T,
): DiscountConfig[T] | null => {
    const config = DISCOUNT_TYPES[type];
    return config?.[property] ?? null;
};

/**
 * Extract unique product IDs from bundles
 */
export const extractProductIds = (
    bundles: (Bundle & { bundleProducts: BundleProduct[] })[],
): string[] => {
    return Array.from(
        new Set(
            bundles.flatMap((bundle) =>
                bundle.bundleProducts.map((bp) => bp.productId),
            ),
        ),
    );
};

/**
 * Map bundle type slug to ID
 */
export const bundleTypeMap = Object.values(BUNDLE_TYPES).reduce(
    (acc, c) => {
        acc[c.slug] = c.id;
        return acc;
    },
    {} as Record<string, BundleType>
);
