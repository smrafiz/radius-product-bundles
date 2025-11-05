"use client";

import { useSessionStore } from "@/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { doWebhookRegistration, storeToken } from "@/shared/actions";

export function useSessionProvider() {
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

    const [isAppBridgeReady, setIsAppBridgeReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const tokenProcessed = useRef(false);

    const isThemeExtension =
        typeof window !== "undefined" &&
        (window.parent !== window ||
            document.referrer.includes("admin.shopify.com") ||
            document.referrer.includes("myshopify.com/admin/themes"));

    /**
     * 🧠 Initialize App Bridge
     */
    useEffect(() => {
        if (isThemeExtension) {
            updateSessionToken("theme-extension-context");
            return;
        }

        const checkAppBridge = () => {
            if (typeof window !== "undefined" && window.shopify && app) {
                setIsAppBridgeReady(true);
                return true;
            }
            return false;
        };

        if (checkAppBridge()) return;

        let attempts = 0;
        const maxAttempts = 40;

        const interval = setInterval(() => {
            attempts++;
            if (checkAppBridge()) {
                clearInterval(interval);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error("❌ App Bridge failed to initialize");
            }
        }, 100);

        return () => clearInterval(interval);
    }, [app, isThemeExtension, updateSessionToken]);

    /**
     * 🔐 Handle session token + webhook registration
     */
    useEffect(() => {
        if (
            // isThemeExtension ||
            !isAppBridgeReady ||
            tokenProcessed.current ||
            hasValidSession
        )
            return;

        const handleSession = async () => {
            if (tokenProcessed.current) {
                return;
            }

            tokenProcessed.current = true;

            try {
                const token = await app.idToken();

                if (!token) {
                    console.error("No token received from App Bridge");
                    clearSession();
                    if (retryCount < 3) {
                        setTimeout(() => {
                            setRetryCount((prev) => prev + 1);
                            tokenProcessed.current = false;
                        }, 3000);
                    }
                    return;
                }

                updateSessionToken(token);

                let stored = false;
                try {
                    await storeToken(token);
                    stored = true;
                } catch (e) {
                    console.error("Token storage failed", e);
                }

                try {
                    await doWebhookRegistration(token);
                } catch (e) {
                    console.error("Webhook registration failed", e);
                }

                if (!stored) {
                    console.error("Token store failed");
                    clearSession();
                    return;
                }
                await validateSession();
            } catch (error) {
                console.error("Session init failed:", error);
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
        isAppBridgeReady,
        isThemeExtension,
        hasValidSession,
        retryCount,
        updateSessionToken,
        clearSession,
        validateSession,
    ]);

    /**
     * 🧭 Handle URL params (shop, host)
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
        if (!isThemeExtension && isAppBridgeReady && app) {
            (window as any).__APP_BRIDGE__ = app;
        }
    }, [app, isAppBridgeReady, isThemeExtension]);

    return {
        isThemeExtension,
        isAppBridgeReady,
        hasValidSession,
        sessionError,
        sessionToken,
        retryCount,
    };
}