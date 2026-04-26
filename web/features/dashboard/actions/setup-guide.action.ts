"use server";

import { after } from "next/server";

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

        const data = await getCachedSetupGuide(shop);

        // Defer scheduler work until after the response is sent. The cron job
        // is the source of truth for transitions; this is a best-effort
        // dashboard-mount catch-up that should never block the initial paint.
        if (session.accessToken) {
            const accessToken = session.accessToken;
            after(async () => {
                try {
                    const [toActivate, toDeactivate] = await Promise.all([
                        findBundlesReadyToActivate(shop),
                        findBundlesReadyToDeactivate(shop),
                    ]);
                    if (
                        toActivate.length === 0 &&
                        toDeactivate.length === 0
                    ) {
                        return;
                    }
                    const result = await processScheduledBundlesForShop(
                        shop,
                        accessToken,
                    );
                    if (result.activated > 0 || result.deactivated > 0) {
                        invalidateSetupGuideCache(shop);
                    }
                } catch (err) {
                    console.error("[Dashboard] Deferred scheduler failed:", err);
                }
            });
        }

        return {
            status: "success",
            data: { ...data, bundlesTransitioned: false },
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
