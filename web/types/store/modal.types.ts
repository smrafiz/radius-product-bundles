import type { BundleListItem, BundleStatus } from "@/types";

export type ModalType = "delete" | "duplicate" | "status" | null;

export interface ModalPayload {
    bundle?: BundleListItem;
    newStatus?: BundleStatus;
    onConfirm?: () => Promise<void> | void;
    onError?: (error: string) => void;
}

export interface ModalState {
    type: ModalType;
    open: boolean;
    payload?: ModalPayload;
    openModal: (type: ModalType, payload?: ModalPayload) => void;
    closeModal: () => void;
}