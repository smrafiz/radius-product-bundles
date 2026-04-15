import type { PreviewTemplateId, VolumeLayoutTier } from "@/features/settings";
import { BUNDLE_TYPES } from "@/features/bundles/constants/bundle-types.constants";

export const CUSTOMIZER_LAYOUTS_MAPPING: Record<
    PreviewTemplateId,
    ReadonlyArray<{ label: string; value: string }>
> = {
    FIXED_BUNDLE: [
        { label: "List", value: "LIST" },
        { label: "Grid", value: "GRID" },
        { label: "Slider", value: "CAROUSEL" },
        { label: "Compact", value: "COMPACT" },
    ],

    BUY_X_GET_Y: [
        { label: "Compact Grid", value: "COMPACT_GRID" },
        { label: "Minimalist", value: "MINIMALIST" },
        { label: "Sleek", value: "SLEEK" },
        { label: "Checklist", value: "CHECKLIST" },
        { label: "Split Deal", value: "SPLIT_DEAL" },
    ],

    BOGO: [
        { label: "Classic Card", value: "CLASSIC_CARD" },
        { label: "Compact Grid", value: "COMPACT_GRID" },
        { label: "Minimalist", value: "MINIMALIST" },
        { label: "Sleek", value: "SLEEK" },
    ],

    VOLUME_DISCOUNT: [
        { label: "Tier List", value: "VOLUME_TIER_LIST" },
        { label: "Pricing Cards", value: "VOLUME_PRICING_CARDS" },
        { label: "Quantity Slider", value: "VOLUME_SLIDER" },
        { label: "Savings Calculator", value: "VOLUME_CALCULATOR" },
    ],

    MIX_AND_MATCH: [
        { label: "List", value: "LIST" },
        { label: "Grid", value: "GRID" },
    ],

    FREQUENTLY_BOUGHT_TOGETHER: [{ label: "Grid", value: "GRID" }],

    CART_BANNER: [
        { label: "Standard", value: "LIST" },
    ],
} as const;

export const PREVIEW_TEMPLATE_OPTIONS: ReadonlyArray<{
    id: PreviewTemplateId;
    label: string;
}> = [
    ...Object.values(BUNDLE_TYPES).map((t) => ({
        id: t.id as PreviewTemplateId,
        label: t.label,
    })),
    { id: "CART_BANNER", label: "Cart page banner" },
];

export const PLACEHOLDER_IMAGES = {
    1: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    2: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    3: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png",
    4: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png",
    5: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png",
    6: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png",
};

export const DEMO_TIERS: ReadonlyArray<VolumeLayoutTier> = [
    {
        qty: 2,
        discount: 10,
        price: "$27.00",
        comparePrice: "$30.00",
        savings: "Save 10%",
        title: "Starter",
        subtitle: "Buy 2+ units",
    },
    {
        qty: 5,
        discount: 20,
        price: "$24.00",
        comparePrice: "$30.00",
        savings: "Save 20%",
        title: "Value Pack",
        subtitle: "Buy 5+ units",
        badge: { text: "POPULAR", style: "popular" },
        isDefault: true,
    },
    {
        qty: 10,
        discount: 30,
        price: "$21.00",
        comparePrice: "$30.00",
        savings: "Save 30%",
        title: "Bulk Deal",
        subtitle: "Buy 10+ units",
        badge: { text: "BEST VALUE", style: "best-value" },
    },
    {
        qty: 15,
        discount: 40,
        price: "$18.00",
        comparePrice: "$30.00",
        savings: "Save 40%",
        title: "Bulk Deal",
        subtitle: "Buy 15+ units",
    },
];
