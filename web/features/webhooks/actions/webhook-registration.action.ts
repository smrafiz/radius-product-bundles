"use server";

import { handleSessionToken } from "@/lib/shopify";
import { initializeApp, checkInitializationNeeded } from "../services";
import type { InitializationStatus } from "../types";

/**
 * Webhook Registration Actions - Presentation Layer
 *
 * Entry points from UI/API calls
 */

/**
 * Register webhooks and ensure app setup is complete
 *
 * This is called automatically by the session provider on app load
 */
export async function doWebhookRegistration(
    sessionToken: string,
): Promise<void> {
    try {
        const { session, shop } = await handleSessionToken(sessionToken);

        // Step 2: Initialize app
        const result = await initializeApp(sessionToken, session);

        // Step 3: Check result
        if (!result.success) {
            const errorMessage =
                result.errors?.join(", ") || "Initialization failed";
            console.error(
                "[Webhook Action] ❌ Initialization failed:",
                errorMessage,
            );
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error(
            "[Webhook Action] Registration failed:",
            error instanceof Error ? error.message : String(error),
        );
        throw error;
    }
}

/**
 * Check initialization status
 */
export async function checkInitializationStatus(
    sessionToken: string,
): Promise<InitializationStatus> {
    try {
        const { shop } = await handleSessionToken(sessionToken);

        const status = await checkInitializationNeeded(shop);

        return {
            shop,
            setupComplete: !status.setupNeeded,
            webhooksRegistered: !status.webhooksNeeded,
            needsInitialization: status.setupNeeded || status.webhooksNeeded,
        };
    } catch (error) {
        console.error("[Webhook Action] Status check failed:", error);
        return {
            shop: null,
            setupComplete: false,
            webhooksRegistered: false,
            needsInitialization: true,
        };
    }
}
