import { BundleConfig, BundleType } from "@/types";

export const bundleTypeConfigs: Record<BundleType, BundleConfig> = {
    FIXED_BUNDLE: {
        label: "Fixed Bundle",
        id: "FIXED_BUNDLE",
        slug: "fixed-bundle",
        description: "Bundle products together at a fixed price with discount",
        features: ["Fixed bundle price", "Multiple products"],
        icon: "📦",
        badge: { text: "New", tone: "success" },
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
    MIX_MATCH: {
        label: "Mix & Match",
        id: "MIX_MATCH",
        slug: "mix-match",
        description: "Choose any combination from products",
        features: ["Pick any 3 for $50", "Mix different categories"],
        icon: "🔄",
        badge: { text: "New", tone: "success" },
    },
    CROSS_SELL: {
        label: "Frequently Bought Together",
        id: "CROSS_SELL",
        slug: "cross-sell",
        description: "Frequently Bought Together",
        features: ["Smart product suggestions", "AI-powered recommendations"],
        icon: "🤝",
        badge: { text: "AI", tone: "info" },
    },
};
