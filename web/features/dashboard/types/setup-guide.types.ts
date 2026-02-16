import type { SETUP_STEP_KEYS } from "../constants/setup-guide.constants";

export type SetupStepKey =
    (typeof SETUP_STEP_KEYS)[keyof typeof SETUP_STEP_KEYS];

export interface SetupProgress {
    appEmbedEnabled: boolean;
    firstBundleCreated: boolean;
    widgetCustomized: boolean;
    storefrontPreviewed: boolean;
    analyticsViewed: boolean;
}

export interface SetupGuideData {
    dismissed: boolean;
    progress: SetupProgress;
    shopDomain: string;
    apiKey: string;
    bundlesTransitioned?: boolean;
}
