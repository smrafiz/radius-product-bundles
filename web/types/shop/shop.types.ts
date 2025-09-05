export interface ShopSettings {
    currencyCode: string;
    locale: string;
    lastFetched: number | null;
    isInitialized: boolean;
}

export interface ShopSettingsStore {
    currencyCode: string;
    locale: string;
    lastFetched: number | null;
    isInitialized: boolean;

    setSettings: (newSettings: Partial<Pick<ShopSettingsStore, 'currencyCode' | 'locale'>>) => void;
    getCurrencyCode: () => string;
    getLocale: () => string;
    shouldRefresh: () => boolean;
    markAsInitialized: () => void;

    reset: () => void;
    hasValidCache: () => boolean;
}
