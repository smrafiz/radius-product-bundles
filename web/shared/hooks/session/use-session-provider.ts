"use client";

import { useSessionStore } from "@/shared";
import { storeToken } from "@/shared/actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { doWebhookRegistration } from "@/features/webhooks/actions";

console.log("🔵 [Session Provider Module] File loaded");

/**
 * Custom hook to manage Shopify session initialization and webhook registration
 */
export function useSessionProvider() {
    console.log("🟢 [Session Provider Hook] useSessionProvider() called");

    const app = useAppBridge();
    const searchParams = useSearchParams();

    const {
        updateSessionToken,
        clearSession,
        setParams,
        validateSession,
        hasValidSession,
        sessionToken,
        shop,
        host,
        isInitialized,
        sessionError,
    } = useSessionStore();

    const [retryCount, setRetryCount] = useState(0);
    const tokenProcessed = useRef(false);

    const isThemeExtension =
        typeof window !== "undefined" &&
        (window.parent !== window ||
            document.referrer.includes("admin.shopify.com") ||
            document.referrer.includes("myshopify.com/admin/themes"));

    /**
     * Handle session token retrieval and webhook registration on app load
     */
    useEffect(() => {
        console.log(
            "🟡 [Session Provider Effect] Webhook registration effect triggered",
            {
                tokenProcessed: tokenProcessed.current,
                hasValidSession,
            },
        );

        if (tokenProcessed.current || hasValidSession) {
            console.log(
                "⚪ [Session Provider] Skipping - already processed or has valid session",
            );
            return;
        }

        const handleSession = async () => {
            console.log("🟠 [Session Provider] Starting handleSession()");

            if (tokenProcessed.current) {
                console.log(
                    "⚪ [Session Provider] Token already processed, skipping",
                );
                return;
            }

            tokenProcessed.current = true;

            try {
                if (!app) {
                    console.error(
                        "❌ [Session Provider] App Bridge not available",
                    );
                    tokenProcessed.current = false;
                    return;
                }

                console.log(
                    "🔴 [Session Provider] Getting token from App Bridge...",
                );
                const token = await app.idToken();

                if (!token) {
                    console.error(
                        "❌ [Session Provider] No token received from App Bridge",
                    );
                    clearSession();
                    if (retryCount < 3) {
                        setTimeout(() => {
                            setRetryCount((prev) => prev + 1);
                            tokenProcessed.current = false;
                        }, 3000);
                    }
                    return;
                }

                console.log(
                    "✅ [Session Provider] Token received:",
                    token.substring(0, 30) + "...",
                );
                updateSessionToken(token);

                let stored = false;
                try {
                    console.log("📝 [Session Provider] Storing token...");
                    await storeToken(token);
                    stored = true;
                    console.log("✅ [Session Provider] Token stored");
                } catch (e) {
                    console.error(
                        "❌ [Session Provider] Token storage failed:",
                        e,
                    );
                }

                /*
                                try {
                                    console.log("━".repeat(80));
                                    console.log(
                                        "🎯 [Session Provider] STARTING WEBHOOK REGISTRATION",
                                    );
                                    console.log(
                                        "[Session Provider] Token length:",
                                        token.length,
                                    );
                                    console.log(
                                        "[Session Provider] Token prefix:",
                                        token.substring(0, 30) + "...",
                                    );
                                    console.log("━".repeat(80));
                
                                    await doWebhookRegistration(token);
                
                                    console.log("━".repeat(80));
                                    console.log(
                                        "✅ [Session Provider] WEBHOOK REGISTRATION COMPLETE",
                                    );
                                    console.log("━".repeat(80));
                                } catch (e) {
                                    console.error("━".repeat(80));
                                    console.error(
                                        "❌ [Session Provider] WEBHOOK REGISTRATION FAILED",
                                    );
                                    console.error(
                                        "[Session Provider] Error type:",
                                        e?.constructor?.name,
                                    );
                                    console.error(
                                        "[Session Provider] Error message:",
                                        e instanceof Error ? e.message : String(e),
                                    );
                                    console.error(
                                        "[Session Provider] Error stack:",
                                        e instanceof Error ? e.stack : "No stack",
                                    );
                
                                    if (e && typeof e === "object") {
                                        console.error(
                                            "[Session Provider] Full error details:",
                                            JSON.stringify(e, Object.getOwnPropertyNames(e), 2),
                                        );
                                    }
                                    console.error("━".repeat(80));
                                }
                                */

                if (!stored) {
                    console.error("❌ [Session Provider] Token store failed");
                    clearSession();
                    return;
                }

                console.log("🔍 [Session Provider] Validating session...");
                await validateSession();
                console.log("✅ [Session Provider] Session validated");
            } catch (error) {
                console.error(
                    "❌ [Session Provider] Session init failed:",
                    error,
                );
                clearSession();

                if (retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount((prev) => prev + 1);
                        tokenProcessed.current = false;
                    }, 3000);
                }
            }
        };

        void handleSession();
    }, [
        app,
        isThemeExtension,
        hasValidSession,
        retryCount,
        updateSessionToken,
        clearSession,
        validateSession,
    ]);

    /**
     * Handle URL params (shop, host)
     */
    useEffect(() => {
        if (isThemeExtension) return;

        const shopParam = searchParams.get("shop");
        const hostParam = searchParams.get("host");

        if (!isInitialized && (shopParam || hostParam)) {
            setParams(shopParam ?? shop, hostParam ?? host);
        }
    }, [isInitialized, searchParams, isThemeExtension, setParams, shop, host]);

    /**
     * Store App Bridge globally for validation hook
     */
    useEffect(() => {
        if (!isThemeExtension && app) {
            (window as any).__APP_BRIDGE__ = app;
        }
    }, [app, isThemeExtension]);

    return {
        isThemeExtension,
        hasValidSession,
        sessionError,
        sessionToken,
        retryCount,
    };
}
