"use client";

import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export const useShopCacheInvalidation = () => {
    const app = useAppBridge();
    const shopDomain = app?.config?.shop;

    useEffect(() => {
        if (!shopDomain) return;

        let pollInterval: NodeJS.Timeout;

        const checkForInvalidation = async () => {
            try {
                const response = await fetch(`/api/cache-status?shop=${shopDomain}`);
                const data = await response.json();

                if (data.invalidated) {
                    console.log("Shop settings invalidated by webhook:", data);

                    // Dispatch event for useShopSettings to listen to
                    window.dispatchEvent(new CustomEvent('shop-cache-invalidated', {
                        detail: data
                    }));
                }
            } catch (error) {
                console.error("Failed to check cache status:", error);
            }
        };

        // Check every 30 seconds when document is visible
        if (!document.hidden) {
            pollInterval = setInterval(checkForInvalidation, 30000);
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(pollInterval);
            } else {
                checkForInvalidation();
                pollInterval = setInterval(checkForInvalidation, 30000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(pollInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [shopDomain]);
};