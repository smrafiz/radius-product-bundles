"use server";

import {
    SetupGuideData,
    SetupProgress,
    SetupStepKey,
} from "@/features/dashboard";
import { ApiResponse } from "@/shared";
import {
    getSetupGuideService,
    updateSetupStepService,
    dismissSetupGuideService,
    showSetupGuideService,
} from "../services/setup-guide.service";
import { handleSessionToken } from "@/lib/shopify";
import { processScheduledBundlesForShop } from "@/features/bundles/services/bundle-scheduler.service";
import { unstable_cache } from "next/cache";
import { cacheTags, cacheDurations, invalidateSetupGuideCache } from "@/lib/cache";

export async function getSetupGuideAction(
    sessionToken: string,
): Promise<ApiResponse<SetupGuideData>> {
    try {
        const { session } = await handleSessionToken(sessionToken);
        const { shop } = session;

        // Scheduler is a side-effect — never cache it
        const schedulerPromise = session.accessToken
            ? processScheduledBundlesForShop(shop, session.accessToken).catch(
                  (err) => {
                      console.error("[Dashboard] Scheduler check failed:", err);
                      return { activated: 0, deactivated: 0 };
                  },
              )
            : Promise.resolve({ activated: 0, deactivated: 0 });

        // Setup guide data is cached (10 min)
        const getCachedGuide = unstable_cache(
            async () => getSetupGuideService({ shop }),
            ["setup-guide", shop],
            {
                revalidate: cacheDurations.long,
                tags: [cacheTags.setupGuide(shop)],
            },
        );

        const [schedulerResult, data] = await Promise.all([
            schedulerPromise,
            getCachedGuide(),
        ]);

        const bundlesTransitioned =
            schedulerResult.activated > 0 || schedulerResult.deactivated > 0;

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

        // Bust the setup guide cache after update
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

        // Bust the setup guide cache after dismiss
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

        // Bust the setup guide cache after show
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
