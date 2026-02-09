import type { SetupProgress } from "../types/setup-guide.types";

export const SETUP_STEP_KEYS = {
    APP_EMBED: "appEmbedEnabled",
    FIRST_BUNDLE: "firstBundleCreated",
    WIDGET_CUSTOMIZED: "widgetCustomized",
    STOREFRONT_PREVIEW: "storefrontPreviewed",
    ANALYTICS_VIEWED: "analyticsViewed",
} as const;

export const DEFAULT_SETUP_PROGRESS: SetupProgress = {
    appEmbedEnabled: false,
    firstBundleCreated: false,
    widgetCustomized: false,
    storefrontPreviewed: false,
    analyticsViewed: false,
};

export const APP_EXTENSION_UID = "b54c4e5c-e85a-34dc-e9e2-a7c9e951e8dc75e66ac3";
