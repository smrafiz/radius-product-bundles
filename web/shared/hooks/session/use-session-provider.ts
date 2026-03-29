"use client";

import { useSessionStore, useShopStore } from "@/shared";
import { storeToken } from "@/shared/actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

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

    const { setShop, clearShop } = useShopStore();

    const [retryCount, setRetryCount] = useState(0);
    const tokenProcessed = useRef(false);

    const isThemeExtension =
        typeof window !== "undefined" &&
        (window.parent !== window ||
            document.referrer.includes("admin.shopify.com") ||
            document.referrer.includes("myshopify.com/admin/themes"));

    useEffect(() => {
        if (tokenProcessed.current || hasValidSession) return;

        const handleSession = async () => {
            if (tokenProcessed.current) return;
            tokenProcessed.current = true;

            try {
                if (!app) {
                    tokenProcessed.current = false;
                    return;
                }

                const token = await app.idToken();

                if (!token) {
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
                    console.error("[Session] Token storage failed:", e);
                }

                if (!stored) {
                    clearSession();
                    return;
                }

                await validateSession();
            } catch (error) {
                console.error("[Session] Init failed:", error);
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

    useEffect(() => {
        if (isThemeExtension) return;

        const shopParam = searchParams.get("shop");
        const hostParam = searchParams.get("host");

        if (!isInitialized && (shopParam || hostParam)) {
            setParams(shopParam ?? shop, hostParam ?? host);
        }
    }, [isInitialized, searchParams, isThemeExtension, setParams, shop, host]);

    useEffect(() => {
        if (!isThemeExtension && app) {
            (window as any).__APP_BRIDGE__ = app;
        }
    }, [app, isThemeExtension]);

    // Sync shop store with session store
    useEffect(() => {
        if (shop) {
            setShop(shop);
        } else {
            clearShop();
        }
    }, [shop, setShop, clearShop]);

    return {
        isThemeExtension,
        hasValidSession,
        sessionError,
        sessionToken,
        retryCount,
    };
}
