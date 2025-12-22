/**
 * Metafield Definitions for Radius Product Bundles
 * Defines all metafield structures needed for the bundle system
 */

export const METAFIELD_NAMESPACE = "radius_bundles";

export const METAFIELD_KEYS = {
    ACTIVE_BUNDLES: "active_bundles",
    GLOBAL_SETTINGS: "global_settings",
    BUNDLE_IDS: "bundle_ids",
} as const;

export const METAFIELD_DEFINITIONS = [
    // Product-level metafields
    {
        name: "Bundle IDs",
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEYS["BUNDLE_IDS"],
        type: "list.single_line_text_field",
        ownerType: "PRODUCT" as const,
        description: "List of bundle IDs that include this product",
    },

    // Shop-level metafields
    {
        name: "Active Bundles",
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEYS["ACTIVE_BUNDLES"],
        type: "json",
        ownerType: "SHOP" as const,
        description: "All active bundle configurations for the shop",
    },
    {
        name: "Global Settings",
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEYS["GLOBAL_SETTINGS"],
        type: "json",
        ownerType: "SHOP" as const,
        description: "Global bundle widget settings (styles, labels, defaults)",
    },
] as const;
