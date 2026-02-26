import type { PreviewTemplateId } from "@/features/settings";
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
        { label: "Classic Card", value: "CLASSIC_CARD" },
        { label: "Compact Grid", value: "COMPACT_GRID" },
        { label: "Minimalist", value: "MINIMALIST" },
    ],

    BOGO: [
        { label: "Classic Card", value: "CLASSIC_CARD" },
        { label: "Compact Grid", value: "COMPACT_GRID" },
        { label: "Minimalist", value: "MINIMALIST" },
    ],

    VOLUME_DISCOUNT: [{ label: "List", value: "LIST" }],

    MIX_AND_MATCH: [
        { label: "List", value: "LIST" },
        { label: "Grid", value: "GRID" },
    ],

    FREQUENTLY_BOUGHT_TOGETHER: [{ label: "Grid", value: "GRID" }],

    CART_BANNER: [
        { label: "Detailed", value: "LIST" },
        { label: "Minimal", value: "GRID" },
        { label: "Compact", value: "COMPACT" },
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
};
