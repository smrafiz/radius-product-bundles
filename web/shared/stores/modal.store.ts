import { create } from "zustand";
import { ModalState, showModalElement } from "@/shared";

export const useModalStore = create<ModalState>((set) => ({
    modal: { type: null },
    openModal: (modal) => {
        set({ modal: { ...modal, loading: false, error: undefined } });

        // Show modal element
        showModalElement();
    },
    closeModal: () => set({ modal: { type: null } }),
    setLoading: (loading) =>
        set((state) => ({
            modal:
                state.modal.type !== null
                    ? { ...state.modal, loading }
                    : state.modal,
        })),
    setError: (error) =>
        set((state) => ({
            modal:
                state.modal.type !== null
                    ? { ...state.modal, error: error || undefined }
                    : state.modal,
        })),
}));
