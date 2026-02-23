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
import { getSetupGuideService } from "@/features/dashboard/services/setup-guide.service";
import { invalidateSetupGuideCache } from "@/lib/cache";

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

        // Setup guide data cached via `use cache` (10 min)
        const [schedulerResult, data] = await Promise.all([
            schedulerPromise,
            getSetupGuideService({ shop }),
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
