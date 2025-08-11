"use client";

import React, { useEffect, useState, useRef } from "react";
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
    const hasValidSession = useSessionStore((state) => state.hasValidSession);
    const [isAppBridgeReady, setIsAppBridgeReady] = useState(false);
    const [authRedirectAttempted, setAuthRedirectAttempted] = useState(false);
    const tokenProcessed = useRef(false);

    // App Bridge readiness check
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
        const maxAttempts = 30;

        const checkInterval = setInterval(() => {
            attempts++;

            if (checkAppBridge()) {
                clearInterval(checkInterval);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);

                if (!authRedirectAttempted) {
                    setAuthRedirectAttempted(true);

                    const shop = searchParams.get("shop");
                    const hasMinimalParams =
                        shop ||
                        searchParams.get("host") ||
                        searchParams.get("embedded");

                    if (!hasMinimalParams) {
                        const returnTo =
                            window.location.pathname !== "/"
                                ? window.location.pathname
                                : "/dashboard";
                        window.location.href = `/api/auth?returnTo=${encodeURIComponent(returnTo)}`;
                    } else {
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

    // Token handling
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

                    const [tokenResult, webhookResult] =
                        await Promise.allSettled([
                            storeToken(token),
                            doWebhookRegistration(token),
                        ]);

                    if (tokenResult.status === "rejected") {
                        console.error("Error processing token:", tokenResult.reason);
                    }

                    if (webhookResult.status === "rejected") {
                        console.error("Error registering webhooks:", webhookResult.reason);
                    }

                    dispatch({
                        type: "SESSION_VALIDATION_SUCCESS",
                        payload: { token },
                    });
                } else {
                    throw new Error("No session token received");
                }
            } catch (error) {
                tokenProcessed.current = false;
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
    }, [app, dispatch, isAppBridgeReady, hasValidSession]);

    // URL parameter handling
    useEffect(() => {
        const shop = searchParams.get("shop");
        const host = searchParams.get("host");

        if (!isInitialized && shop && host) {
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
