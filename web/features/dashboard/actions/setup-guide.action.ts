"use server";

import {
    SetupGuideData,
    SetupProgress,
    SetupStepKey,
} from "@/features/dashboard";
import { ApiResponse } from "@/shared";
import {
    updateSetupStepService,
    dismissSetupGuideService,
    showSetupGuideService,
} from "../services/setup-guide.service";
import { handleSessionToken } from "@/lib/shopify";
import { processScheduledBundlesForShop } from "@/features/bundles/services/bundle-scheduler.service";
import { getCachedSetupGuide } from "@/features/dashboard/services/setup-guide.cached";
import { invalidateSetupGuideCache } from "@/lib/cache";
import {
    findBundlesReadyToActivate,
    findBundlesReadyToDeactivate,
} from "@/features/bundles/repositories";

export async function getSetupGuideAction(
    sessionToken: string,
): Promise<ApiResponse<SetupGuideData>> {
    try {
        const { session } = await handleSessionToken(sessionToken);
        const { shop } = session;

        // Scheduler: only run if there are actually scheduled bundles pending.
        // Checking counts first is cheap (indexed queries) — only pay the full
        // scheduler cost when there is real work to do.
        let bundlesTransitioned = false;
        if (session.accessToken) {
            const [toActivate, toDeactivate] = await Promise.all([
                findBundlesReadyToActivate(shop),
                findBundlesReadyToDeactivate(shop),
            ]);

            if (toActivate.length > 0 || toDeactivate.length > 0) {
                const schedulerResult = await processScheduledBundlesForShop(
                    shop,
                    session.accessToken,
                ).catch((err) => {
                    console.error("[Dashboard] Scheduler check failed:", err);
                    return { activated: 0, deactivated: 0 };
                });
                bundlesTransitioned =
                    schedulerResult.activated > 0 ||
                    schedulerResult.deactivated > 0;

                // Bust setup guide cache if bundles transitioned — their
                // auto-detected step statuses may have changed.
                if (bundlesTransitioned) {
                    invalidateSetupGuideCache(shop);
                }
            }
        }

        // Use the cached version — 10 min TTL, busted on step updates/dismiss
        const data = await getCachedSetupGuide(shop);

        return {
            status: "success",
            data: { ...data, bundlesTransitioned },
        };
    } catch (error) {
        console.error("[getSetupGuide] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch setup guide",
        };
    }
}

export async function updateSetupStepAction(
    sessionToken: string,
    stepKey: SetupStepKey,
    value: boolean,
): Promise<ApiResponse<SetupProgress>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const progress = await updateSetupStepService({ shop, stepKey, value });

        invalidateSetupGuideCache(shop);

        return { status: "success", data: progress };
    } catch (error) {
        console.error("[updateSetupStep] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update step",
        };
    }
}

export async function dismissSetupGuideAction(
    sessionToken: string,
): Promise<ApiResponse<null>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        await dismissSetupGuideService({ shop });
        invalidateSetupGuideCache(shop);

        return { status: "success", data: null };
    } catch (error) {
        console.error("[dismissSetupGuide] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to dismiss guide",
        };
    }
}

export async function showSetupGuideAction(
    sessionToken: string,
): Promise<ApiResponse<null>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        await showSetupGuideService({ shop });
        invalidateSetupGuideCache(shop);

        return { status: "success", data: null };
    } catch (error) {
        console.error("[showSetupGuide] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error ? error.message : "Failed to show guide",
        };
    }
}
