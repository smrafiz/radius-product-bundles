// store/bundleStore.ts
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

export const useBundleStore = create(
    immer<BundleState>((set, get) => ({
        currentStep: 1,
        bundleData: {} as Partial<CreateBundlePayload>,

        setStep: (step) => set(() => ({ currentStep: step })),
        nextStep: () =>
            set((state) => {
                state.currentStep += 1;
            }),
        prevStep: () =>
            set((state) => {
                if (state.currentStep > 1) state.currentStep -= 1;
            }),

        setBundleData: (data) => set(() => ({ bundleData: data })),
        updateBundleField: (key, value) =>
            set((state) => {
                state.bundleData[key] = value;
            }),

        resetBundle: () =>
            set(() => ({
                currentStep: 1,
                bundleData: {} as Partial<CreateBundlePayload>,
            })),
    })),
);
