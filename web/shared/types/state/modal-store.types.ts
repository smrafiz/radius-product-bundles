import { ReactNode } from "react";
import { GlobalMessage, MessageType } from "@/shared";
import { BundleListItem, BundleStatus } from "@/features/bundles";

export interface GlobalMessageState {
    messages: GlobalMessage[];
    addMessage: (message: Omit<GlobalMessage, "id" | "timestamp">) => string;
    removeMessage: (id: string) => void;
    removeMessageByKey: (key: string) => void;
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

export type ModalType =
    | "delete"
    | "duplicate"
    | "status"
    | "delete-product"
    | null;

export interface ModalPayload {
    title?: string;
    type: ModalType;
    message?: string | ReactNode;
    bundle?: BundleListItem;
    productTitle?: string;
    newStatus?: BundleStatus;
    onConfirm?: () => Promise<void> | void;
    onError?: (error: string) => void;
    loading?: boolean;
    error?: string;
}
