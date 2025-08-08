"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useSessionStore } from "@/lib/stores/sessionStore";
import { doWebhookRegistration, storeToken } from "@/app/actions";

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const app = useAppBridge();
    const searchParams = useSearchParams();
    const dispatch = useSessionStore((state) => state.dispatch);
    const isInitialized = useSessionStore((state) => state.isInitialized);
    const [isAppBridgeReady, setIsAppBridgeReady] = useState(false);
    const [authRedirectAttempted, setAuthRedirectAttempted] = useState(false);

    // Enhanced App Bridge readiness check
    useEffect(() => {
        const checkAppBridge = () => {
            if (typeof window !== "undefined" && window.shopify && app) {
                console.log("✅ App Bridge is ready");
                setIsAppBridgeReady(true);
                return true;
            }
            return false;
        };

        if (checkAppBridge()) {
            return;
        }

        // Poll for App Bridge readiness
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max (reduced from 5)

        const checkInterval = setInterval(() => {
            attempts++;

            if (checkAppBridge()) {
                clearInterval(checkInterval);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error(
                    "❌ App Bridge failed to initialize after 3 seconds",
                );

                // Only redirect if middleware hasn't already handled this
                // and we haven't already attempted a redirect
                if (!authRedirectAttempted) {
                    setAuthRedirectAttempted(true);

                    const shop = searchParams.get("shop");
                    const hasMinimalParams =
                        shop ||
                        searchParams.get("host") ||
                        searchParams.get("embedded");

                    // Only redirect if we don't have any Shopify parameters
                    // (if we have them, the issue might be temporary)
                    if (!hasMinimalParams) {
                        console.log(
                            "🔄 No Shopify parameters and App Bridge failed, redirecting to auth",
                        );
                        const returnTo =
                            window.location.pathname !== "/"
                                ? window.location.pathname
                                : "/dashboard";
                        window.location.href = `/api/auth?returnTo=${encodeURIComponent(returnTo)}`;
                    } else {
                        console.log(
                            "⚠️ App Bridge failed but Shopify parameters present, not redirecting",
                        );
                        // Dispatch an error state but don't redirect
                        dispatch({
                            type: "SESSION_VALIDATION_FAILED",
                            payload: {
                                error: "App Bridge initialization failed",
                            },
                        });
                    }
                }
            }
        }, 100);

        return () => clearInterval(checkInterval);
    }, [app, searchParams, authRedirectAttempted, dispatch]);

    // Token handling with better error management
    useEffect(() => {
        if (!isAppBridgeReady) return;

        const handleTokenAndWebhooks = async () => {
            try {
                console.log("🔑 Getting session token...");
                const token = await app.idToken();

                if (token) {
                    console.log("✅ Session token received");

                    dispatch({
                        type: "UPDATE_SESSION_TOKEN",
                        payload: { token },
                    });

                    // Store token and register webhooks
                    const [tokenResult, webhookResult] =
                        await Promise.allSettled([
                            storeToken(token),
                            doWebhookRegistration(token),
                        ]);

                    if (tokenResult.status === "fulfilled") {
                        console.log("✅ Token stored successfully");
                    } else {
                        console.error(
                            "❌ Error storing token:",
                            tokenResult.reason,
                        );
                    }

                    if (webhookResult.status === "fulfilled") {
                        console.log("✅ Webhooks registered successfully");
                    } else {
                        console.error(
                            "❌ Error registering webhooks:",
                            webhookResult.reason,
                        );
                    }

                    // Always mark as success if we got a token
                    dispatch({
                        type: "SESSION_VALIDATION_SUCCESS",
                        payload: { token },
                    });
                } else {
                    throw new Error("No session token received");
                }
            } catch (error) {
                console.error("❌ Session token error:", error);
                dispatch({
                    type: "SESSION_VALIDATION_FAILED",
                    payload: {
                        error:
                            error instanceof Error
                                ? error.message
                                : "Session initialization failed",
                    },
                });
            }
        };

        void handleTokenAndWebhooks();
    }, [app, dispatch, isAppBridgeReady]);

    // URL parameter handling
    useEffect(() => {
        const shop = searchParams.get("shop");
        const host = searchParams.get("host");

        if (!isInitialized && shop && host) {
            console.log("✅ Setting shop parameters:", { shop, host });
            dispatch({ type: "SET_PARAMS", payload: { shop, host } });
        }
    }, [dispatch, isInitialized, searchParams]);

    // Store App Bridge globally
    useEffect(() => {
        if (isAppBridgeReady && app) {
            (window as any).__APP_BRIDGE__ = app;
        }
    }, [app, isAppBridgeReady]);

    return <>{children}</>;
}
