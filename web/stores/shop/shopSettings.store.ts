import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ShopSettingsStore } from "@/types";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useShopSettingsStore = create<ShopSettingsStore>()(
    persist(
        (set, get) => ({
            // Default values
            currencyCode: "USD",
            locale: "en-US",
            lastFetched: null,
            isInitialized: false,

            setSettings: (newSettings) => {
                set((state) => ({
                    ...state,
                    ...newSettings,
                    lastFetched: Date.now(),
                    isInitialized: true,
                }));
            },

            getCurrencyCode: () => get().currencyCode,
            getLocale: () => get().locale,

            shouldRefresh: () => {
                const state = get();
                if (!state.lastFetched) return true;
                return Date.now() - state.lastFetched > CACHE_DURATION;
            },

            markAsInitialized: () => set({ isInitialized: true }),
        }),
        {
            name: "rt-shopify-shop-settings",
            partialize: (state) => ({
                currencyCode: state.currencyCode,
                locale: state.locale,
                lastFetched: state.lastFetched,
                isInitialized: state.isInitialized,
            }),
        },
    ),
);
