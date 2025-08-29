'use client';

import { useEffect, useRef } from "react";
import { convertShopifyLocale } from "@/utils";
import { useGraphQL } from "@/hooks/useGraphQL";
import { GetShopInfoDocument } from "@/lib/gql/graphql";
import { useShopSettingsStore } from "@/stores";

export const useInitializeShopSettings = () => {
    const { setSettings, markAsInitialized } = useShopSettingsStore();
    const hasInitialized = useRef(false);

    const shopQuery = useGraphQL(GetShopInfoDocument);

    useEffect(() => {
        if (hasInitialized.current) return;

        if (shopQuery.data?.shop) {
            const { currencyCode, billingAddress } = shopQuery.data.shop;
            const newLocale = convertShopifyLocale(billingAddress?.countryCode || "US");

            const currentStore = useShopSettingsStore.getState();

            if (
                currentStore.currencyCode !== currencyCode ||
                currentStore.locale !== newLocale
            ) {
                setSettings({
                    currencyCode: currencyCode || "USD",
                    locale: newLocale,
                });
            }

            hasInitialized.current = true;
            markAsInitialized();
        }
    }, [shopQuery.data, setSettings, markAsInitialized]);

    return {
        isLoading: shopQuery.loading,
        error: shopQuery.error,
        isInitialized: hasInitialized.current,
    };
};