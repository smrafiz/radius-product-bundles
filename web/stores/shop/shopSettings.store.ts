import { create } from 'zustand';

interface ShopSettings {
    name: string;
    email?: string;
    myshopifyDomain?: string;
    currencyCode: string;
    countryCode?: string;
    planDisplayName?: string;
}

interface ShopSettingsState {
    settings: ShopSettings | null;
    isInitialized: boolean;

    setSettings: (settings: ShopSettings) => void;
    markAsInitialized: () => void;
    reset: () => void;
}

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