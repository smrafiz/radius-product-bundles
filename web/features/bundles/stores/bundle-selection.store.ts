import { create } from "zustand";
import { BundleSelectionStore } from "@/features/bundles";

export const useBundleSelectionStore = create<BundleSelectionStore>()(
    (set, get) => ({
        selectingBundleId: null,

        setSelectingBundleId: (id) => {
            set({ selectingBundleId: id });
        },

        isAnyBundleSelecting: () => {
            return get().selectingBundleId !== null;
        },
    })
);