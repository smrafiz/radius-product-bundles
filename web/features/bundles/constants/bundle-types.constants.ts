/*
 * Bundle types constants
 */

import type { BundleConfig, BundleType } from "@/features/bundles";

/**
 * Bundle type configurations
 */
export const BUNDLE_TYPES = {
    FIXED_BUNDLE: {
        label: "Fixed Bundle",
        id: "FIXED_BUNDLE",
        slug: "fixed-bundle",
        description: "Bundle products together at a fixed price with discount",
        features: ["Fixed bundle price", "Multiple products"],
        icon: "📦",
        badge: { text: "Popular", tone: "warning" },
    },
    BUY_X_GET_Y: {
        label: "Buy X Get Y",
        id: "BUY_X_GET_Y",
        slug: "buy-x-get-y",
        description:
            "Customer buys X items and gets Y items free or discounted",
        features: ["Buy 2 Get 1 Free", "Buy 3 Get 2nd 50% Off"],
        icon: "📊",
        badge: { text: "New", tone: "success" },
    },
    BOGO: {
        label: "BOGO",
        id: "BOGO",
        slug: "bogo",
        description:
            "Classic buy one get one offer with various discount options",
        features: ["Buy 1 Get 1 Free", "Buy 1 Get 1 50% Off"],
        icon: "🔀",
        badge: { text: "New", tone: "success" },
    },
    VOLUME_DISCOUNT: {
        label: "Volume Discount",
        id: "VOLUME_DISCOUNT",
        slug: "volume-discount",
        description: "Offer discounts based on quantity purchased",
        features: ["Buy 2 Save 10%", "Buy 5 Save 20%"],
        icon: "🎁",
        badge: { text: "New", tone: "success" },
    },
    MIX_AND_MATCH: {
        label: "Mix & Match",
        id: "MIX_AND_MATCH",
        slug: "mix-and-match",
        description: "Choose any combination from products",
        features: ["Pick any 3 for $50", "Mix different categories"],
        icon: "🔄",
        badge: { text: "New", tone: "success" },
    },
    FREQUENTLY_BOUGHT_TOGETHER: {
        label: "Frequently Bought Together",
        id: "FREQUENTLY_BOUGHT_TOGETHER",
        slug: "frequently-bought-together",
        description: "Frequently Bought Together",
        features: ["Smart product suggestions", "AI-powered recommendations"],
        icon: "🤝",
        badge: { text: "AI", tone: "info" },
    },
} as const satisfies Record<BundleType, BundleConfig>;