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
    console.log("━".repeat(80));
    console.log("🎯 [Webhook Action] STARTING WEBHOOK REGISTRATION");
    console.log("[Webhook Action] Timestamp:", new Date().toISOString());
    console.log(
        "[Webhook Action] Token prefix:",
        sessionToken.substring(0, 30) + "...",
    );
    console.log("━".repeat(80));

    try {
        // Step 1: Handle session token
        console.log("[Webhook Action] Step 1: Getting session from token...");
        const { session, shop } = await handleSessionToken(sessionToken);

        console.log("[Webhook Action] ✅ Session obtained:", {
            shop: session.shop,
            hasAccessToken: !!session.accessToken,
            accessTokenPrefix: session.accessToken?.substring(0, 15) + "...",
            isOnline: session.isOnline,
            scope: session.scope,
        });

        // Step 2: Initialize app
        console.log("[Webhook Action] Step 2: Calling initializeApp...");
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

        console.log("━".repeat(80));
        console.log("✅ [Webhook Action] WEBHOOK REGISTRATION COMPLETE");
        console.log("━".repeat(80));
    } catch (error) {
        console.error("━".repeat(80));
        console.error("❌ [Webhook Action] WEBHOOK REGISTRATION FAILED");
        console.error("[Webhook Action] Error type:", error?.constructor?.name);
        console.error(
            "[Webhook Action] Error message:",
            error instanceof Error ? error.message : String(error),
        );
        console.error(
            "[Webhook Action] Error stack:",
            error instanceof Error ? error.stack : "No stack trace",
        );

        if (error && typeof error === "object") {
            console.error(
                "[Webhook Action] Full error object:",
                JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
            );
        }
        console.error("━".repeat(80));

        // Re-throw to let session provider know it failed
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
