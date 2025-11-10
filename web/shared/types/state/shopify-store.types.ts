/*
 * Shopify state
 */
export type ShopifyState = {
    shop: string | null;
    host: string | null;
    isInitialized: boolean;
    sessionToken: string | null;
    isValidating: boolean;
    hasValidSession: boolean;
    sessionError: string | null;
    lastValidated: Date | null;
};

/*
 * Shopify store
 */
export type ShopifyStore = ShopifyState & {
    setParams: (shop: string | null, host: string | null) => void;
    reset: () => void;
    startSessionValidation: () => void;
    sessionValidationSuccess: (token: string, shop?: string) => void;
    sessionValidationFailed: (error: string) => void;
    updateSessionToken: (token: string) => void;
    clearSession: () => void;
    validateSession: () => Promise<void>;
    isSessionExpired: () => boolean;
    retryValidation: () => Promise<void>;
};
