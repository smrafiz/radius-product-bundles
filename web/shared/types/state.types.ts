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