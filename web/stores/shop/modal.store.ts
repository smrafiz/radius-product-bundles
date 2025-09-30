import { create } from "zustand";
import type { ModalState } from "@/types";

export const useModalStore = create<ModalState>((set) => ({
    modal: { type: null },
    openModal: (modal) =>
        set({ modal: { ...modal, loading: false, error: undefined } }),
    closeModal: () =>
        set({ modal: { type: null } }),
    setLoading: (loading) =>
        set((state) => ({
            modal: state.modal.type !== null
                ? { ...state.modal, loading }
                : state.modal,
        })),
    setError: (error) =>
        set((state) => ({
            modal: state.modal.type !== null
                ? { ...state.modal, error: error || undefined }
                : state.modal,
        })),
}));
