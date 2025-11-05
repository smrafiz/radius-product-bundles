import { GlobalMessage, MessageType, ModalPayload } from "@/shared";

export interface GlobalMessageState {
    messages: GlobalMessage[];
    addMessage: (message: Omit<GlobalMessage, "id" | "timestamp">) => string;
    removeMessage: (id: string) => void;
    clearAllMessages: () => void;
    getMessagesByType: (type: MessageType) => GlobalMessage[];
}

export interface ModalState {
    modal: ModalPayload | { type: null };
    openModal: (
        modal: Omit<ModalPayload, "loading"> & { loading?: boolean },
    ) => void;
    closeModal: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

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