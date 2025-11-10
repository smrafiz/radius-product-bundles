import { GlobalMessage, MessageType } from "@/shared";
import { BundleListItem, BundleStatus } from "@/features/bundles";

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

export type ModalType = "delete" | "duplicate" | "status" | null;

export interface ModalPayload {
    type: ModalType;
    bundle?: BundleListItem;
    newStatus?: BundleStatus;
    onConfirm?: () => Promise<void> | void;
    onError?: (error: string) => void;
    loading?: boolean;
    error?: string;
}
