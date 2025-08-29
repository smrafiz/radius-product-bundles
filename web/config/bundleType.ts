import {
    CalendarIcon,
    ChartVerticalIcon,
    CheckCircleIcon,
    ColorIcon,
    OrderIcon,
    PlusCircleIcon,
} from "@shopify/polaris-icons";
import { BundleConfig, BundleType } from "@/types";

export const bundleTypeConfigs: Record<BundleType, BundleConfig> = {
    FIXED_BUNDLE: {
        id: "FIXED_BUNDLE",
        label: "Fixed Bundle",
        slug: "fixed-bundle",
        description: "Bundle products together at a fixed price with discount",
        features: ["Fixed bundle price", "Multiple products", "Set discount amount"],
        icon: CalendarIcon,
    },
    BUY_X_GET_Y: {
        id: "BUY_X_GET_Y",
        label: "Buy X Get Y",
        slug: "buy-x-get-y",
        description: "Customer buys X items and gets Y items free or discounted",
        features: ["Buy 2 Get 1 Free", "Buy 3 Get 2nd 50% Off"],
        icon: PlusCircleIcon,
    },
    BOGO: {
        id: "BOGO",
        label: "BOGO",
        slug: "bogo",
        description: "Classic buy one get one offer with various discount options",
        features: ["Buy 1 Get 1 Free", "Buy 1 Get 1 50% Off"],
        icon: OrderIcon,
    },
    VOLUME_DISCOUNT: {
        id: "VOLUME_DISCOUNT",
        label: "Volume Discount",
        slug: "volume-discount",
        description: "Offer discounts based on quantity purchased",
        features: ["Buy 2 Save 10%", "Buy 5 Save 20%"],
        icon: ChartVerticalIcon,
    },
    MIX_MATCH: {
        id: "MIX_MATCH",
        label: "Mix & Match",
        slug: "mix-match",
        description: "Choose any combination from selected products",
        features: ["Pick any 3 for $50", "Mix different categories"],
        icon: CheckCircleIcon,
    },
    CROSS_SELL: {
        id: "CROSS_SELL",
        label: "Cross Sell",
        slug: "cross-sell",
        description: "Frequently Bought Together",
        features: ["Smart product suggestions", "AI-powered recommendations"],
        icon: ColorIcon,
        badge: { text: "AI", tone: "success" },
    },
};