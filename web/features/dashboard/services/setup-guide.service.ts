"use server";

import {
    SetupGuideData,
    SetupProgress,
    SetupStepKey,
} from "@/features/dashboard";
import {
    getSetupProgress,
    getAutoDetectData,
    updateSetupProgress,
    dismissSetupGuide,
    showSetupGuide,
} from "@/features/dashboard/repositories/setup-guide.repository";

export async function getSetupGuideService({
    shop,
}: {
    shop: string;
}): Promise<SetupGuideData> {
    const persisted = await getSetupProgress(shop);

    // Skip auto-detection when guide is dismissed or all steps already complete
    const allPersistedComplete = Object.values(persisted.progress).every(
        Boolean,
    );
    if (persisted.dismissed || allPersistedComplete) {
        return {
            dismissed: persisted.dismissed,
            progress: persisted.progress,
            shopDomain: persisted.shopDomain,
            apiKey: process.env.SHOPIFY_API_KEY ?? "",
        };
    }

    const autoDetected = await autoDetectProgress(shop);

    const merged: SetupProgress = {
        appEmbedEnabled: persisted.progress.appEmbedEnabled,
        firstBundleCreated:
            persisted.progress.firstBundleCreated ||
            autoDetected.firstBundleCreated,
        widgetBlockAdded: persisted.progress.widgetBlockAdded,
        widgetCustomized:
            persisted.progress.widgetCustomized ||
            autoDetected.widgetCustomized,
        storefrontPreviewed:
            persisted.progress.storefrontPreviewed ||
            autoDetected.storefrontPreviewed,
        analyticsViewed: persisted.progress.analyticsViewed,
    };

    if (JSON.stringify(merged) !== JSON.stringify(persisted.progress)) {
        const allComplete = Object.values(merged).every(Boolean);
        await updateSetupProgress(shop, merged, allComplete);
    }

    return {
        dismissed: persisted.dismissed,
        progress: merged,
        shopDomain: persisted.shopDomain,
        apiKey: process.env.SHOPIFY_API_KEY ?? "",
    };
}

async function autoDetectProgress(shop: string) {
    const { bundleCount, settingsExist, viewCount } =
        await getAutoDetectData(shop);

    const firstBundleCreated = bundleCount > 0;
    const widgetCustomized = settingsExist;
    const storefrontPreviewed = viewCount > 0;

    return { firstBundleCreated, widgetCustomized, storefrontPreviewed };
}

export async function updateSetupStepService({
    shop,
    stepKey,
    value,
}: {
    shop: string;
    stepKey: SetupStepKey;
    value: boolean;
}) {
    const { progress } = await getSetupProgress(shop);
    const updated: SetupProgress = { ...progress, [stepKey]: value };
    const allComplete = Object.values(updated).every(Boolean);
    await updateSetupProgress(shop, updated, allComplete);
    return updated;
}

export async function dismissSetupGuideService({ shop }: { shop: string }) {
    return dismissSetupGuide(shop);
}

export async function showSetupGuideService({ shop }: { shop: string }) {
    return showSetupGuide(shop);
}
