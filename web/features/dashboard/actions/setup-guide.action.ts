"use server";

import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import {
    getSetupGuideService,
    updateSetupStepService,
    checkAppEmbedEnabled,
    dismissSetupGuideService,
    showSetupGuideService,
} from "../services/setup-guide.service";
import { updateSetupStep } from "../repositories/setup-guide.repository";
import type { SetupGuideData, SetupProgress, SetupStepKey } from "../types/setup-guide.types";

export async function getSetupGuideAction(
    sessionToken: string,
): Promise<ApiResponse<SetupGuideData>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const data = await getSetupGuideService({ shop, sessionToken });

        return { status: "success", data };
    } catch (error) {
        console.error("[getSetupGuide] Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Failed to fetch setup guide",
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

        return { status: "success", data: progress };
    } catch (error) {
        console.error("[updateSetupStep] Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Failed to update step",
        };
    }
}

export async function verifyAppEmbedAction(
    sessionToken: string,
): Promise<ApiResponse<boolean>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const enabled = await checkAppEmbedEnabled({ sessionToken, shop });

        if (enabled) {
            await updateSetupStep(shop, "appEmbedEnabled", true);
        }

        return { status: "success", data: enabled };
    } catch (error) {
        console.error("[verifyAppEmbed] Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Failed to verify app embed",
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

        return { status: "success", data: null };
    } catch (error) {
        console.error("[dismissSetupGuide] Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Failed to dismiss guide",
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

        return { status: "success", data: null };
    } catch (error) {
        console.error("[showSetupGuide] Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Failed to show guide",
        };
    }
}
