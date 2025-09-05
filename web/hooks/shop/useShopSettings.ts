// /web/hooks/shop/useShopSettings.ts
"use client";

import { useGraphQL } from "@/hooks";
import { useEffect, useRef, useCallback } from "react";
import { convertShopifyLocale } from "@/utils";
import { useShopSettingsStore } from "@/stores";
import { GetShopInfoDocument } from "@/lib/gql/graphql";
import { useShopCacheInvalidation } from "@/hooks/shop/useShopCacheInvalidation";

interface UseShopSettingsOptions {
    enabled?: boolean;
    forceRefresh?: boolean;
    enablePolling?: boolean;
    pollingInterval?: number;
}

export const useShopSettings = (options: UseShopSettingsOptions = {}) => {
    const store = useShopSettingsStore();
    const hasInitialized = useRef(false);

    // Destructure store methods OUTSIDE of any conditions
    const {
        setSettings,
        markAsInitialized,
        shouldRefresh,
        hasValidCache,
        reset
    } = store;

    // Calculate if we should fetch data
    const shouldFetchShopData = (() => {
        if (options.enabled === false) return false;
        if (options.forceRefresh) return true;
        if (hasValidCache()) return false;
        return !store.isInitialized || shouldRefresh();
    })();

    // ALWAYS call useGraphQL - never conditionally
    const shopQuery = useGraphQL(GetShopInfoDocument, undefined, {
        // Pass enabled option to react-query to control when the query runs
        enabled: shouldFetchShopData
    });

    // Fix: Memoize dependencies to prevent array size changes
    const memoizedSetSettings = useCallback(setSettings, [setSettings]);
    const memoizedMarkAsInitialized = useCallback(markAsInitialized, [markAsInitialized]);

    useEffect(() => {
        if (hasInitialized.current) return;

        if (shopQuery.data?.shop) {
            const { currencyCode, billingAddress } = shopQuery.data.shop;
            const newLocale = convertShopifyLocale(
                billingAddress?.countryCode || "US",
            );

            const currentStore = useShopSettingsStore.getState();

            if (
                currentStore.currencyCode !== currencyCode ||
                currentStore.locale !== newLocale
            ) {
                memoizedSetSettings({
                    currencyCode: currencyCode || "USD",
                    locale: newLocale,
                });
            }

            hasInitialized.current = true;
            memoizedMarkAsInitialized();
        }
    }, [shopQuery.data, memoizedSetSettings, memoizedMarkAsInitialized]);

    // Memoize the refresh function
    const refreshShopSettings = useCallback(() => {
        hasInitialized.current = false;
        reset();
        if (shopQuery.refetch) {
            shopQuery.refetch();
        }
    }, [reset, shopQuery.refetch]);

    useShopCacheInvalidation();

    // Listen for webhook invalidation events
    useEffect(() => {
        const handleInvalidation = (event: CustomEvent) => {
            console.log("Webhook invalidation received:", event.detail);
            store.reset();
            // Trigger fresh fetch
        };

        window.addEventListener('shop-cache-invalidated', handleInvalidation as EventListener);

        return () => {
            window.removeEventListener('shop-cache-invalidated', handleInvalidation as EventListener);
        };
    }, [store]);

    return {
        isLoading: shopQuery.loading,
        error: shopQuery.error,
        isInitialized: hasInitialized.current || store.isInitialized,
        currencyCode: store.currencyCode,
        locale: store.locale,
        refreshShopSettings,
        hasValidCache: hasValidCache(),
        lastFetched: store.lastFetched,
    };
};