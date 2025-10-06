import type { BundleListItem, BundleStatus } from "@/types";

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

export interface ModalState {
    modal: ModalPayload | { type: null };
    openModal: (
        modal: Omit<ModalPayload, "loading"> & { loading?: boolean },
    ) => void;
    closeModal: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}
