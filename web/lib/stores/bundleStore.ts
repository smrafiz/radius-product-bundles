import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CreateBundlePayload } from "@/types";

interface SelectedItem {
    type: 'product' | 'variant';
    productId: string;
    variantId?: string;
    title: string;
    price: string;
    image?: string;
    sku?: string;
    quantity: number;
}

interface BundleState {
    currentStep: number;
    bundleData: Partial<CreateBundlePayload>;
    selectedItems: SelectedItem[];
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setBundleData: (data: Partial<CreateBundlePayload>) => void;
    updateBundleField: <K extends keyof CreateBundlePayload>(
        key: K,
        value: CreateBundlePayload[K],
    ) => void;
    setSelectedItems: (items: SelectedItem[]) => void;
    addSelectedItems: (items: SelectedItem[]) => void;
    removeSelectedItem: (index: number) => void;
    updateSelectedItemQuantity: (index: number, quantity: number) => void;
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
        selectedItems: [],

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

        setSelectedItems: (items) =>
            set((state) => {
                state.selectedItems = items;
            }),

        addSelectedItems: (items) =>
            set((state) => {
                const itemsWithQuantity = items.map(item => ({ ...item, quantity: 1 }));
                state.selectedItems.push(...itemsWithQuantity);
            }),

        removeSelectedItem: (index) =>
            set((state) => {
                state.selectedItems.splice(index, 1);
            }),

        updateSelectedItemQuantity: (index, quantity) =>
            set((state) => {
                if (state.selectedItems[index]) {
                    state.selectedItems[index].quantity = quantity;
                }
            }),

        removeProductAndAllVariants: (productId: string) =>
            set((state) => ({
                selectedItems: state.selectedItems.filter(item => item.productId !== productId)
            })),

        updateProductVariants: (productId: string, variants: SelectedItem[], position?: number) =>
            set((state) => {
                const otherItems = state.selectedItems.filter(item => item.productId !== productId);

                if (typeof position === 'number') {
                    // Insert at specific position to maintain order
                    const result = [...otherItems];
                    result.splice(position, 0, ...variants);
                    return { selectedItems: result };
                } else {
                    // Default behavior - add at end
                    return { selectedItems: [...otherItems, ...variants] };
                }
            }),

        resetBundle: () =>
            set(() => ({
                currentStep: 1,
                bundleData: { ...initialBundleData },
                selectedItems: [],
            })),
    })),
);