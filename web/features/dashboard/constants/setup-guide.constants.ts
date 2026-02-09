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
