import { create } from "zustand";

type BundleSelectionStore = {
    selectingBundleId: string | null;
    setSelectingBundleId: (id: string | null) => void;
    isAnyBundleSelecting: () => boolean;
};

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