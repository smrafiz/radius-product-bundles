import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CreateBundlePayload } from "@/types";

interface BundleState {
    currentStep: number;
    bundleData: Partial<CreateBundlePayload>;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setBundleData: (data: Partial<CreateBundlePayload>) => void;
    updateBundleField: <K extends keyof CreateBundlePayload>(
        key: K,
        value: CreateBundlePayload[K],
    ) => void;
    resetBundle: () => void;
}

const initialBundleData: Partial<CreateBundlePayload> = {
    name: '',
    products: [],
    discountType: undefined,
    discountValue: 0,
    description: '',
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    startDate: undefined,
    endDate: undefined,
};

export const useBundleStore = create(
    immer<BundleState>((set, get) => ({
        currentStep: 1,
        bundleData: initialBundleData,

        setStep: (step) => set(() => ({ currentStep: step })),

        nextStep: () =>
            set((state) => {
                if (state.currentStep < 4) {
                    state.currentStep += 1;
                }
            }),

        prevStep: () =>
            set((state) => {
                if (state.currentStep > 1) {
                    state.currentStep -= 1;
                }
            }),

        setBundleData: (data) => set(() => ({ bundleData: { ...data } })),

        updateBundleField: (key, value) =>
            set((state) => {
                state.bundleData[key] = value;
            }),

        resetBundle: () =>
            set(() => ({
                currentStep: 1,
                bundleData: { ...initialBundleData },
            })),
    })),
);