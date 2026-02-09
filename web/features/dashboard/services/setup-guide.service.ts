"use server";

import prisma from "@/shared/repositories/prisma-connect";
import {
    getSetupProgress,
    updateSetupStep,
    dismissSetupGuide,
    showSetupGuide,
} from "../repositories/setup-guide.repository";
import type { SetupGuideData, SetupProgress, SetupStepKey } from "../types/setup-guide.types";

export async function getSetupGuideService({
    shop,
}: {
    shop: string;
}): Promise<SetupGuideData> {
    const persisted = await getSetupProgress(shop);

    const autoDetected = await autoDetectProgress(shop);

    const merged: SetupProgress = {
        appEmbedEnabled: persisted.progress.appEmbedEnabled,
        firstBundleCreated: persisted.progress.firstBundleCreated || autoDetected.firstBundleCreated,
        widgetCustomized: persisted.progress.widgetCustomized || autoDetected.widgetCustomized,
        storefrontPreviewed: persisted.progress.storefrontPreviewed || autoDetected.storefrontPreviewed,
        analyticsViewed: persisted.progress.analyticsViewed,
    };

    if (JSON.stringify(merged) !== JSON.stringify(persisted.progress)) {
        const allComplete = Object.values(merged).every(Boolean);
        await prisma.shop.update({
            where: { domain: shop },
            data: {
                setupProgress: merged as any,
                setupComplete: allComplete,
            },
        });
    }

    return {
        dismissed: persisted.dismissed,
        progress: merged,
        shopDomain: persisted.shopDomain,
        apiKey: process.env.SHOPIFY_API_KEY ?? "",
    };
}

async function autoDetectProgress(shop: string) {
    const [bundleCount, appSettings, viewCount] = await Promise.all([
        prisma.bundle.count({
            where: { shop },
        }),
        prisma.appSettings.findFirst({
            where: { shop: { domain: shop } },
            select: { globalStyles: true },
        }),
        prisma.bundleView.count({
            where: { bundle: { shop } },
        }),
    ]);

    const firstBundleCreated = bundleCount > 0;

    const widgetCustomized = appSettings?.globalStyles != null &&
        JSON.stringify(appSettings.globalStyles) !== "{}";

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
    return updateSetupStep(shop, stepKey, value);
}

export async function dismissSetupGuideService({ shop }: { shop: string }) {
    return dismissSetupGuide(shop);
}

export async function showSetupGuideService({ shop }: { shop: string }) {
    return showSetupGuide(shop);
}
