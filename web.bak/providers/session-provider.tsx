"use client";

import { useSearchParams } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import { doWebhookRegistration, storeToken } from "@/actions";
import { ReactNode, useEffect, useState, useRef } from "react";

import { useSessionStore } from "@/stores";

export default function SessionProvider({ children }: { children: ReactNode }) {
    const app = useAppBridge();
    const searchParams = useSearchParams();
    const dispatch = useSessionStore((state) => state.dispatch);
    const isInitialized = useSessionStore((state) => state.isInitialized);
    const hasValidSession = useSessionStore((state) => state.hasValidSession);
    const [isAppBridgeReady, setIsAppBridgeReady] = useState(false);
    const [authRedirectAttempted, setAuthRedirectAttempted] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const tokenProcessed = useRef(false);

    // Check if we're in a theme extension context
    const isThemeExtension =
        typeof window !== "undefined" &&
        (window.parent !== window ||
            document.referrer.includes("admin.shopify.com") ||
            document.referrer.includes("myshopify.com/admin/themes"));

    // Skip App Bridge initialization for theme extensions
    useEffect(() => {
        if (isThemeExtension) {
            // For theme extensions, just mark as initialized without App Bridge
            dispatch({
                type: "SESSION_VALIDATION_SUCCESS",
                payload: { token: "theme-extension-context" },
            });
            return;
        }

        const checkAppBridge = () => {
            if (typeof window !== "undefined" && window.shopify && app) {
                setIsAppBridgeReady(true);
                return true;
            }
            return false;
        };

        if (checkAppBridge()) {
            return;
        }

        let attempts = 0;
        const maxAttempts = 50;

        const checkInterval = setInterval(() => {
            attempts++;

            if (checkAppBridge()) {
                clearInterval(checkInterval);
                setRetryCount(0);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error("❌ App Bridge failed to initialize");

                if (!authRedirectAttempted && retryCount < 3) {
                    setAuthRedirectAttempted(true);

                    const shop = searchParams.get("shop");
                    const hasMinimalParams =
                        shop ||
                        searchParams.get("host") ||
                        searchParams.get("embedded");

                    if (!hasMinimalParams) {
                        const currentUrl = window.location.href;
                        const shopMatch = currentUrl.match(/[?&]shop=([^&]+)/);

                        if (shopMatch) {
                            const detectedShop = shopMatch[1];
                            window.location.href = `/api/auth?shop=${detectedShop}&returnTo=${encodeURIComponent(window.location.pathname)}`;
                        } else {
                            const returnTo =
                                window.location.pathname !== "/"
                                    ? window.location.pathname
                                    : "/dashboard";
                            window.location.href = `/api/auth?returnTo=${encodeURIComponent(returnTo)}`;
                        }
                    } else {
                        setTimeout(() => {
                            setRetryCount((prev) => prev + 1);
                            setAuthRedirectAttempted(false);
                        }, 2000);

                        dispatch({
                            type: "SESSION_VALIDATION_FAILED",
                            payload: {
                                error: "App Bridge initialization failed, retrying...",
                            },
                        });
                    }
                }
            }
        }, 100);

        return () => clearInterval(checkInterval);
    }, [
        app,
        searchParams,
        authRedirectAttempted,
        dispatch,
        retryCount,
        isThemeExtension,
    ]);

    // Rest of your existing code for non-theme-extension contexts...
    useEffect(() => {
        if (
            isThemeExtension ||
            !isAppBridgeReady ||
            tokenProcessed.current ||
            hasValidSession
        ) {
            return;
        }

        const handleTokenAndWebhooks = async () => {
            if (tokenProcessed.current) return;

            tokenProcessed.current = true;

            try {
                const token = await app.idToken();

                if (token) {
                    dispatch({
                        type: "UPDATE_SESSION_TOKEN",
                        payload: { token },
                    });

                    let tokenSuccess = false;

                    try {
                        await storeToken(token);
                        tokenSuccess = true;
                    } catch (tokenError) {
                        console.error("❌ Token storage failed:", tokenError);
                    }

                    try {
                        await doWebhookRegistration(token);
                    } catch (webhookError) {
                        console.error(
                            "❌ Webhook registration failed:",
                            webhookError,
                        );
                    }

                    if (tokenSuccess) {
                        dispatch({
                            type: "SESSION_VALIDATION_SUCCESS",
                            payload: { token },
                        });
                    } else {
                        throw new Error("Token storage failed");
                    }
                } else {
                    throw new Error(
                        "No session token received from App Bridge",
                    );
                }
            } catch (error) {
                console.error("❌ Session initialization error:", error);
                tokenProcessed.current = false;

                let errorMessage = "Session initialization failed";
                if (error instanceof Error) {
                    if (error.message.includes("Token")) {
                        errorMessage =
                            "Authentication token error - please refresh the page";
                    } else if (error.message.includes("Network")) {
                        errorMessage =
                            "Network error - please check your connection";
                    }
                }

                dispatch({
                    type: "SESSION_VALIDATION_FAILED",
                    payload: { error: errorMessage },
                });

                if (isAppBridgeReady && retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount((prev) => prev + 1);
                        tokenProcessed.current = false;
                    }, 3000);
                }
            }
        };

        void handleTokenAndWebhooks();
    }, [
        app,
        dispatch,
        isAppBridgeReady,
        hasValidSession,
        retryCount,
        isThemeExtension,
    ]);

    // URL parameter handling (skip for theme extensions)
    useEffect(() => {
        if (isThemeExtension) return;

        const shop = searchParams.get("shop");
        const host = searchParams.get("host");

        if (!isInitialized && shop && host) {
            dispatch({ type: "SET_PARAMS", payload: { shop, host } });
        }
    }, [dispatch, isInitialized, searchParams, isThemeExtension]);

    // Store App Bridge globally (skip for theme extensions)
    useEffect(() => {
        if (!isThemeExtension && isAppBridgeReady && app) {
            try {
                (window as any).__APP_BRIDGE__ = app;
            } catch (error) {
                console.error("❌ Failed to store App Bridge globally:", error);
            }
        }
    }, [app, isAppBridgeReady, isThemeExtension]);

    return <>{children}</>;
}
