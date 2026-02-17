/*
 * Bundle getters
 */

import {
    BUNDLE_STATUSES,
    BundleConfig,
    BundleConfiguration,
    BundleStatus,
    BundleStatusBadge,
    BundleType,
    CREATE_STATUSES,
    DISCOUNT_TYPES,
    DiscountConfig,
    DiscountType,
    DisplaySettings,
    EDIT_STATUSES,
    ExtendedBundleFormData,
} from "@/features/bundles";
import { BUNDLE_TYPES } from "@/features/bundles/constants";
import { Bundle, BundleProduct } from "@/prisma/generated/client";

/*
 * Strip deleted suffix
 */
export function stripDeletedSuffix(name: string): string {
    return name.replace(/\s*\[deleted-\d+]$/, "");
}

/*
 * Bundle status badge
 */
export const getBundleStatusBadge = (status: string): BundleStatusBadge => {
    const capitalizeWords = (str: string) =>
        str.replace(/\b\w/g, (char) => char.toUpperCase());

    const config = BUNDLE_STATUSES[status as BundleStatus] ?? {
        text: capitalizeWords(String(status)),
        tone: "neutral",
    };

    return {
        text: config.text,
        tone: config.tone,
    };
};

/**
 * Get bundle configuration properties
 */
export const getBundleProperty = <
    T extends keyof Pick<BundleConfig, "label" | "slug">,
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
            bundles.flatMap((bundle) => {
                const ids = bundle.bundleProducts.map((bp) => bp.productId);

                if (bundle.mainProductId) {
                    ids.push(bundle.mainProductId);
                }

                return ids;
            }),
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
    {} as Record<string, BundleType>,
);

export const initialDisplaySettings: DisplaySettings = {
    layout: "LIST",
    theme: "STORE_DEFAULT",
    title: "Bundle Offers",
    cartButtonText: "Add bundle to cart",
    // colorTheme: "brand",
    showImages: true,
    showSavingsBadge: true,
    showPrices: true,
    showComparePrices: true,
    showQuantity: true,
    showSavings: true,
    showFreeShipping: true,
    enableHyperLink: false,
    widget: {
        showOnMobile: true,
    },
    style: {
        primaryColor: "#303030",
        secondaryColor: "#666666",
        textColor: "#333333",
        buttonFontSize: 16,
        buttonBgColor: "",
        buttonTextColor: "#ffffff",
        buttonRadius: 8,
        badgeFontSize: 16,
        badgeBgColor: "",
        badgeTextColor: "#ffffff",
        badgeRadius: 8,
        productBgColor: "#f7f7f7",
        productTextColor: "#333333",
        productBorderColor: "#e3e3e3",
        productRadius: 12,
        productFontSize: 16,
        boxBgColor: "#ffffff",
        boxRadius: 12,
        boxBorderWidth: 1,
        boxMaxWidth: 800,
        boxAlignment: "center",
        imageRadius: 6,
        imageSize: undefined,
        imageFit: "contain",
        headingFontSize: 20,
        headingColor: "",
        headingTransform: "",
        headingLabel: "Bundle Offers",
        quantityLabel: "Qty:",
        regularPriceLabel: "Regular price:",
        bundlePriceLabel: "Bundle price:",
        youSaveLabel: "You save:",
        freeShippingLabel: "Free shipping",
    },
};

export const initialBundleData: Partial<ExtendedBundleFormData> = {
    name: "",
    type: undefined as BundleType | undefined,
    status: "DRAFT" as BundleStatus,
    products: [],
    discountType: undefined as DiscountType | undefined,
    discountValue: undefined,
    description: "",
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    startDate: undefined,
    endDate: undefined,
    createProduct: false,
    productTitle: "",
    productDescription: "",
    mainProductId: undefined,
    mainVariantId: undefined,
    priority: 0,
};

export const initialConfiguration: BundleConfiguration = {
    discountApplication: "bundle",
};

/**
 * Get available statuses based on mode
 */
export function getAvailableStatuses(mode: "create" | "edit"): BundleStatus[] {
    return mode === "create" ? CREATE_STATUSES : EDIT_STATUSES;
}

/**
 * Maps bundle status to appropriate Shopify product status.
 */
export function getShopifyProductStatus(
    bundleStatus: BundleStatus,
): "ACTIVE" | "DRAFT" | "ARCHIVED" {
    switch (bundleStatus) {
        case "ACTIVE":
            return "ACTIVE";
        case "ARCHIVED":
            return "ARCHIVED";
        case "DRAFT":
        case "SCHEDULED":
        case "PAUSED":
        default:
            return "DRAFT";
    }
}
