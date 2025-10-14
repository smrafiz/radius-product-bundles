import { create } from "zustand";
import { ShopSettings, ShopSettingsState } from "@/shared";

export const useShopSettingsStore = create<ShopSettingsState>()((set) => ({
    settings: null,
    isInitialized: false,

    setSettings: (settings: ShopSettings) => {
        set({ settings });
    },

    markAsInitialized: () => {
        set({ isInitialized: true });
    },

    reset: () => {
        set({
            settings: null,
            isInitialized: false,
        });
    },
}));
