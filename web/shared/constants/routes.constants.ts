/*
 * Routes
 */
export const ROUTES = {
    // Main pages
    HOME: "/",
    DASHBOARD: "/dashboard",
    BUNDLES: "/bundles",
    ANALYTICS: "/analytics",
    SETTINGS: "/settings",
    CUSTOMIZER: "/settings/customizer",

    // Bundle operations
    BUNDLE_CREATE: "/bundles/create",
    CREATE_BUNDLE_TYPE: (type: string) => `/bundles/create/${type}`,
    BUNDLE_EDIT: (id: string) => `/bundles/${id}/edit`,
    BUNDLE_STUDIO: "/bundles/studio",
} as const;
