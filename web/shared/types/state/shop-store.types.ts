export interface ShopSettings {
    name: string;
    email?: string;
    myshopifyDomain?: string;
    currencyCode: string;
    countryCode?: string;
    planDisplayName?: string;
}

export interface ShopSettingsState {
    settings: ShopSettings | null;
    isInitialized: boolean;
    setSettings: (settings: ShopSettings) => void;
    markAsInitialized: () => void;
    reset: () => void;
}