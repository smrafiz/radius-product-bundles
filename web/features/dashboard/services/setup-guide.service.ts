"use server";

import prisma from "@/shared/repositories/prisma-connect";
import { handleSessionToken } from "@/lib/shopify";
import { APP_EXTENSION_UID } from "../constants/setup-guide.constants";
import {
    getSetupProgress,
    updateSetupStep,
    dismissSetupGuide,
    showSetupGuide,
} from "../repositories/setup-guide.repository";
import type { SetupGuideData, SetupProgress, SetupStepKey } from "../types/setup-guide.types";

export async function getSetupGuideService({
    shop,
    sessionToken,
}: {
    shop: string;
    sessionToken: string;
}): Promise<SetupGuideData> {
    const persisted = await getSetupProgress(shop);

    const autoDetected = await autoDetectProgress(shop);

    const merged: SetupProgress = {
        appEmbedEnabled: persisted.progress.appEmbedEnabled,
        firstBundleCreated: persisted.progress.firstBundleCreated || autoDetected.firstBundleCreated,
        widgetCustomized: persisted.progress.widgetCustomized || autoDetected.widgetCustomized,
        storefrontPreviewed: persisted.progress.storefrontPreviewed,
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
    };
}

async function autoDetectProgress(shop: string) {
    const [bundleCount, appSettings] = await Promise.all([
        prisma.bundle.count({
            where: { shop },
        }),
        prisma.appSettings.findFirst({
            where: { shop: { domain: shop } },
            select: { globalStyles: true },
        }),
    ]);

    const firstBundleCreated = bundleCount > 0;

    const widgetCustomized = appSettings?.globalStyles != null &&
        JSON.stringify(appSettings.globalStyles) !== "{}";

    return { firstBundleCreated, widgetCustomized };
}

export async function checkAppEmbedEnabled({
    sessionToken,
    shop,
}: {
    sessionToken: string;
    shop: string;
}): Promise<boolean> {
    try {
        const { session } = await handleSessionToken(sessionToken, false, false);
        if (!session?.accessToken) return false;

        const accessToken = session.accessToken;
        const apiVersion = "2025-10";

        const themesRes = await fetch(
            `https://${shop}/admin/api/${apiVersion}/themes.json?role=main`,
            {
                headers: {
                    "X-Shopify-Access-Token": accessToken,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!themesRes.ok) return false;

        const themesData = await themesRes.json();
        const mainTheme = themesData.themes?.[0];
        if (!mainTheme?.id) return false;

        const assetRes = await fetch(
            `https://${shop}/admin/api/${apiVersion}/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
            {
                headers: {
                    "X-Shopify-Access-Token": accessToken,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!assetRes.ok) return false;

        const assetData = await assetRes.json();
        const settingsJson = JSON.parse(assetData.asset?.value ?? "{}");

        const blocks = settingsJson?.current?.blocks ?? {};
        for (const block of Object.values(blocks) as any[]) {
            if (
                block?.type?.includes(APP_EXTENSION_UID) &&
                block?.disabled !== true
            ) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("[checkAppEmbedEnabled] Error:", error);
        return false;
    }
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
