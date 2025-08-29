"use client";

import { useSearchParams } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import React, { useEffect, useState, useRef } from "react";
import { useSessionStore } from "@/stores";
import { doWebhookRegistration, storeToken } from "@/actions";

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const app = useAppBridge();
    const searchParams = useSearchParams();
    const dispatch = useSessionStore((state) => state.dispatch);
    const isInitialized = useSessionStore((state) => state.isInitialized);
    const hasValidSession = useSessionStore((state) => state.hasValidSession);
    const [isAppBridgeReady, setIsAppBridgeReady] = useState(false);
    const [authRedirectAttempted, setAuthRedirectAttempted] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const tokenProcessed = useRef(false);

    // Enhanced App Bridge readiness check with fallback mechanisms
    useEffect(() => {
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
        const maxAttempts = 50; // Increased for better reliability

        const checkInterval = setInterval(() => {
            attempts++;

            if (checkAppBridge()) {
                clearInterval(checkInterval);
                setRetryCount(0); // Reset retry count on success
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error("❌ App Bridge failed to initialize");

                // Enhanced fallback logic
                if (!authRedirectAttempted && retryCount < 3) {
                    setAuthRedirectAttempted(true);

                    const shop = searchParams.get("shop");
                    const hasMinimalParams =
                        shop ||
                        searchParams.get("host") ||
                        searchParams.get("embedded");

                    if (!hasMinimalParams) {
                        // Fallback: Try to get shop from URL or redirect to install
                        const currentUrl = window.location.href;
                        const shopMatch = currentUrl.match(/[?&]shop=([^&]+)/);
                        
                        if (shopMatch) {
                            const detectedShop = shopMatch[1];
                            window.location.href = `/api/auth?shop=${detectedShop}&returnTo=${encodeURIComponent(window.location.pathname)}`;
                        } else {
                            // Last resort: Redirect to auth without shop (will show error)
                            const returnTo = window.location.pathname !== "/" ? window.location.pathname : "/dashboard";
                            window.location.href = `/api/auth?returnTo=${encodeURIComponent(returnTo)}`;
                        }
                    } else {
                        // Retry App Bridge initialization
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
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
    }, [app, searchParams, authRedirectAttempted, dispatch, retryCount]);

    // Enhanced token handling with retry mechanisms
    useEffect(() => {
        if (!isAppBridgeReady || tokenProcessed.current || hasValidSession) {
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

                    // Enhanced error handling with individual try-catch
                    let tokenSuccess = false;
                    let webhookSuccess = false;

                    // Store token with retry
                    try {
                        await storeToken(token);
                        tokenSuccess = true;
                    } catch (tokenError) {
                        console.error("❌ Token storage failed:", tokenError);
                        // Continue anyway - webhook registration might still work
                    }

                    // Register webhooks with retry
                    try {
                        await doWebhookRegistration(token);
                        webhookSuccess = true;
                    } catch (webhookError) {
                        console.error("❌ Webhook registration failed:", webhookError);
                        // Non-critical - app can still function
                    }

                    // Mark the session as valid if at least token storage succeeded
                    if (tokenSuccess) {
                        dispatch({
                            type: "SESSION_VALIDATION_SUCCESS",
                            payload: { token },
                        });
                    } else {
                        throw new Error("Token storage failed");
                    }
                } else {
                    throw new Error("No session token received from App Bridge");
                }
            } catch (error) {
                console.error("❌ Session initialization error:", error);
                tokenProcessed.current = false; // Allow retry
                
                // Enhanced error handling based on error type
                let errorMessage = "Session initialization failed";
                if (error instanceof Error) {
                    if (error.message.includes("Token")) {
                        errorMessage = "Authentication token error - please refresh the page";
                    } else if (error.message.includes("Network")) {
                        errorMessage = "Network error - please check your connection";
                    }
                }
                
                dispatch({
                    type: "SESSION_VALIDATION_FAILED",
                    payload: { error: errorMessage },
                });

                // Retry after delay if App Bridge is still ready
                if (isAppBridgeReady && retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        tokenProcessed.current = false;
                    }, 3000);
                }
            }
        };

        void handleTokenAndWebhooks();
    }, [app, dispatch, isAppBridgeReady, hasValidSession, retryCount]);

    // URL parameter handling
    useEffect(() => {
        const shop = searchParams.get("shop");
        const host = searchParams.get("host");

        if (!isInitialized && shop && host) {
            dispatch({ type: "SET_PARAMS", payload: { shop, host } });
        }
    }, [dispatch, isInitialized, searchParams]);

    // Store App Bridge globally with error handling
    useEffect(() => {
        if (isAppBridgeReady && app) {
            try {
                (window as any).__APP_BRIDGE__ = app;
            } catch (error) {
                console.error("❌ Failed to store App Bridge globally:", error);
            }
        }
    }, [app, isAppBridgeReady]);

    return <>{children}</>;
}
