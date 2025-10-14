"use client";

import { useCallback, useEffect, useRef } from "react";
import { GetShopInfoDocument } from "@/lib/gql/graphql";
import { useGraphQL, useShopSettingsStore } from "@/shared";

export const useShopSettings = (options: { enabled?: boolean } = {}) => {
    const hasInitialized = useRef(false);
    const { settings, setSettings, markAsInitialized, reset, isInitialized } =
        useShopSettingsStore();

    const shopQuery = useGraphQL(GetShopInfoDocument, undefined, {
        enabled: options.enabled !== false,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const memoizedSetSettings = useCallback(setSettings, [setSettings]);
    const memoizedMarkAsInitialized = useCallback(markAsInitialized, [
        markAsInitialized,
    ]);

    useEffect(() => {
        if (hasInitialized.current) return;

        if (shopQuery.data?.shop) {
            const shopData = shopQuery.data.shop;

            const newSettings = {
                name: shopData.name || "",
                email: shopData.email,
                myshopifyDomain: shopData.myshopifyDomain,
                currencyCode: shopData.currencyCode || "USD",
                countryCode: shopData.billingAddress?.countryCode ?? undefined,
                planDisplayName: shopData.plan?.displayName,
            };

            memoizedSetSettings(newSettings);
            hasInitialized.current = true;
            memoizedMarkAsInitialized();
        }
    }, [shopQuery.data, memoizedSetSettings, memoizedMarkAsInitialized]);

    // Listen for webhook events and just refetch
    useEffect(() => {
        const handleWebhookRefresh = () => {
            console.log("Webhook triggered, refreshing shop settings");
            shopQuery.refetch();
        };

        window.addEventListener(
            "radius-shop-settings-changed",
            handleWebhookRefresh,
        );

        return () => {
            window.removeEventListener(
                "radius-shop-settings-changed",
                handleWebhookRefresh,
            );
        };
    }, [shopQuery.refetch]);

    const refreshShopSettings = useCallback(() => {
        hasInitialized.current = false;
        reset();
        shopQuery.refetch();
    }, [reset, shopQuery.refetch]);

    return {
        isLoading: shopQuery.loading,
        error: shopQuery.error,
        isInitialized: hasInitialized.current || isInitialized,
        settings,
        currencyCode: settings?.currencyCode,
        countryCode: settings?.countryCode,
        name: settings?.name,
        refreshShopSettings,
    };
};
