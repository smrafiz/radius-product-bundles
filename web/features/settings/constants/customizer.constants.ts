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
        { label: "List", value: "LIST" },
        { label: "Grid", value: "GRID" },
    ],

    BOGO: [
        { label: "List", value: "LIST" },
        { label: "Grid", value: "GRID" },
    ],

    VOLUME_DISCOUNT: [
        { label: "List", value: "LIST" },
    ],

    MIX_AND_MATCH: [
        { label: "List", value: "LIST" },
        { label: "Grid", value: "GRID" },
    ],

    FREQUENTLY_BOUGHT_TOGETHER: [
        { label: "Grid", value: "GRID" },
    ],

    CART_BANNER: [
        { label: "Detailed", value: "LIST" },
        { label: "Minimal", value: "GRID" },
        { label: "Compact", value: "COMPACT" },
    ],
} as const;

export const PREVIEW_TEMPLATE_OPTIONS: ReadonlyArray<{ id: PreviewTemplateId; label: string }> = [
    ...Object.values(BUNDLE_TYPES).map((t) => ({ id: t.id as PreviewTemplateId, label: t.label })),
    { id: "CART_BANNER", label: "Cart page banner" },
];