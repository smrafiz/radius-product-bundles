export const METAFIELD_NAMESPACE = "$app";

export const METAFIELD_KEYS = {
    ACTIVE_BUNDLES: "active_bundles",
    GLOBAL_SETTINGS: "global_settings",
    BUNDLE_IDS: "bundle_ids",
} as const;

export const METAFIELD_DEFINITIONS = [
    // Shop-level metafields (PRODUCT metafield is now declared in shopify.app.toml)
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
