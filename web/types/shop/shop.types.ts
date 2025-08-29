export interface ShopSettings {
    currencyCode: string;
    locale: string;
    lastFetched: number | null;
    isInitialized: boolean;
}

export interface ShopSettingsStore extends ShopSettings {
    setSettings: (settings: Partial<ShopSettings>) => void;
    getCurrencyCode: () => string;
    getLocale: () => string;
    shouldRefresh: () => boolean;
    markAsInitialized: () => void;
}