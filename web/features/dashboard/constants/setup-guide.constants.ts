import type { SetupProgress } from "@/features/dashboard";

export const SETUP_STEP_KEYS = {
    APP_EMBED: "appEmbedEnabled",
    FIRST_BUNDLE: "firstBundleCreated",
    WIDGET_BLOCK_ADDED: "widgetBlockAdded",
    WIDGET_CUSTOMIZED: "widgetCustomized",
    STOREFRONT_PREVIEW: "storefrontPreviewed",
    ANALYTICS_VIEWED: "analyticsViewed",
} as const;

export const DEFAULT_SETUP_PROGRESS: SetupProgress = {
    appEmbedEnabled: false,
    firstBundleCreated: false,
    widgetBlockAdded: false,
    widgetCustomized: false,
    storefrontPreviewed: false,
    analyticsViewed: false,
};

export const AUTO_DETECTED_STEPS: Set<string> = new Set([
    SETUP_STEP_KEYS.APP_EMBED,
    SETUP_STEP_KEYS.FIRST_BUNDLE,
    SETUP_STEP_KEYS.WIDGET_BLOCK_ADDED,
    SETUP_STEP_KEYS.WIDGET_CUSTOMIZED,
]);
