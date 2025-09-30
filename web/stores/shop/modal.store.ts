import { create } from "zustand";
import { ModalState } from "@/types";

export const useModalStore = create<ModalState>((set) => ({
    type: null,
    open: false,
    payload: undefined,
    openModal: (type, payload) => set({ type, open: true, payload }),
    closeModal: () => set({ open: false, type: null, payload: undefined }),
}));