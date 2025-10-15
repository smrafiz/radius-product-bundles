import { bundleTypeConfigs, discountTypeConfigs, } from "@/config";
import { BundleStatus, BundleType, DiscountConfig, DiscountType, ProductGroup, } from "@/types";
import { BUNDLE_STATUSES, BundleConfig, BundleStatusBadge, } from "@/features/bundles";

export const getDiscountProperty = <
    T extends keyof Pick<
        DiscountConfig,
        "label" | "slug" | "description" | "symbol" | "suffix" | "format"
    >,
>(
    type: DiscountType,
    property: T,
): DiscountConfig[T] | null => {
    const config = discountTypeConfigs[type];
    return config?.[property] ?? null;
};
