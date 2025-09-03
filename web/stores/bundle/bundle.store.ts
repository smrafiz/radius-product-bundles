import { create } from "zustand";
import { markDirty } from "@/utils";
import { immer } from "zustand/middleware/immer";

import {
    BundleConfiguration,
    BundleState,
    CreateBundlePayload,
    DiscountType,
    DisplaySettings,
    ProductGroup,
    SelectedItem,
} from "@/types";
import { BundleFormData } from "@/lib/validation";

const initialBundleData: Partial<CreateBundlePayload> = {
    name: "",
    products: [],
    discountType: undefined as DiscountType | undefined,
    discountValue: undefined,
    description: "",
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    startDate: undefined,
    endDate: undefined,
};

const initialDisplaySettings: DisplaySettings = {
    layout: "horizontal",
    position: "above_cart",
    title: "Frequently Bought Together",
    colorTheme: "brand",
    showPrices: true,
    showSavings: true,
    enableQuickSwap: false,
};

const initialConfiguration: BundleConfiguration = {
    discountApplication: "bundle",
};

export const useBundleStore = create(
    immer<BundleState>((set, get) => ({
        // Initial state
        currentStep: 1,
        totalSteps: 4,
        bundleData: initialBundleData,
        selectedItems: [],
        displaySettings: initialDisplaySettings,
        configuration: initialConfiguration,
        isLoading: false,
        isSaving: false,
        validationAttempted: false,
        isDirty: false,

        markDirty: () =>
            set((state) => {
                state.isDirty = true;
            }),
        resetDirty: () =>
            set((state) => {
                state.isDirty = false;
            }),

        // Step management
        setStep: (step) =>
            set((state) => {
                if (step >= 1 && step <= state.totalSteps) {
                    state.currentStep = step;
                }
            }),

        setValidationAttempted: (attempted) =>
            set((state) => {
                state.validationAttempted = attempted;
            }),

        nextStep: () =>
            set((state) => {
                const canProceed = get().canGoNext();
                state.validationAttempted = true;

                if (state.currentStep < state.totalSteps && canProceed) {
                    state.currentStep += 1;
                    state.validationAttempted = false;
                }
            }),

        prevStep: () =>
            set((state) => {
                if (state.currentStep > 1) {
                    state.currentStep -= 1;
                }
            }),

        goToNextStep: () =>
            set((state) => {
                if (state.currentStep < state.totalSteps) {
                    state.currentStep += 1;
                    state.validationAttempted = false;
                }
            }),

        canGoNext: () => {
            const state = get();
            const { currentStep, selectedItems } = state;

            switch (currentStep) {
                case 1: // Products step
                    return selectedItems.length > 0;
                case 2: // Configuration step
                case 3: // Display step
                case 4: // Review step
                default:
                    return true;
            }
        },

        canGoPrevious: () => {
            const state = get();
            return state.currentStep > 1;
        },

        // Bundle data actions
        setBundleData: (data) =>
            set((state) => {
                state.bundleData = {
                    ...state.bundleData,
                    ...data,
                } as Partial<BundleFormData>;
                state.isDirty = false;
            }),

        updateBundleField: (key, value) =>
            set((state) => {
                if (key === "discountType") {
                    (state.bundleData as any)[key] = value;

                    if (value === "CUSTOM_PRICE") {
                        state.bundleData.maxDiscountAmount = undefined;
                    }

                    return;
                }

                if (
                    (key === "discountValue" ||
                        key === "minOrderValue" ||
                        key === "maxDiscountAmount") &&
                    value !== undefined
                ) {
                    if (typeof value === "string") {
                        const trimmed = value.trim();

                        if (trimmed === "") {
                            (state.bundleData as any)[key] = undefined;
                        } else {
                            const numValue = parseFloat(trimmed);
                            (state.bundleData as any)[key] = isNaN(numValue)
                                ? undefined
                                : numValue;
                        }
                    } else {
                        (state.bundleData as any)[key] = value;
                    }
                } else {
                    (state.bundleData as any)[key] = value;
                }

                state.isDirty = false;
            }),

        // Selected items actions
        setSelectedItems: (items) =>
            set((state) => {
                state.selectedItems = items;
                // Update bundle data products
                state.bundleData.products = items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));

                state.isDirty = false;
            }),

        addSelectedItems: (items) =>
            set((state) => {
                const itemsWithQuantity = items.map((item) => ({
                    ...item,
                    quantity: item.quantity || 1,
                }));
                state.selectedItems.push(...itemsWithQuantity);

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));

                state.isDirty = false;
            }),

        removeSelectedItem: (itemId) =>
            set((state) => {
                state.selectedItems = state.selectedItems.filter(
                    (item) => item.id !== itemId,
                );

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));

                state.isDirty = false;
            }),

        removeProductAndAllVariants: (productId) =>
            set((state) => {
                state.selectedItems = state.selectedItems.filter(
                    (item) => item.productId !== productId,
                );

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));

                state.isDirty = false;
            }),

        updateSelectedItemQuantity: (itemId, quantity) =>
            set((state) => {
                const itemIndex = state.selectedItems.findIndex(
                    (item) => item.id === itemId,
                );
                if (itemIndex !== -1) {
                    state.selectedItems[itemIndex].quantity = Math.max(
                        1,
                        quantity,
                    );

                    // Update bundle data products
                    state.bundleData.products = state.selectedItems.map(
                        (item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: item.quantity,
                        }),
                    );
                }

                state.isDirty = false;
            }),

        updateProductVariants: (productId, variants, position) =>
            set((state) => {
                const otherItems = state.selectedItems.filter(
                    (item) => item.productId !== productId,
                );

                if (typeof position === "number") {
                    const result = [...otherItems];
                    result.splice(position, 0, ...variants);
                    state.selectedItems = result;
                } else {
                    state.selectedItems = [...otherItems, ...variants];
                }

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));

                state.isDirty = false;
            }),

        reorderItems: (activeId, overId) =>
            set((state) => {
                const groupedItems = get().getGroupedItems();
                const activeProductIndex = groupedItems.findIndex(
                    (group) => group.product.productId === activeId,
                );
                const overProductIndex = groupedItems.findIndex(
                    (group) => group.product.productId === overId,
                );

                if (activeProductIndex !== -1 && overProductIndex !== -1) {
                    // Helper function to move array items
                    const arrayMove = <T>(
                        array: T[],
                        from: number,
                        to: number,
                    ): T[] => {
                        const newArray = [...array];
                        const [removed] = newArray.splice(from, 1);
                        newArray.splice(to, 0, removed);
                        return newArray;
                    };

                    const newGroupOrder = arrayMove(
                        groupedItems,
                        activeProductIndex,
                        overProductIndex,
                    );

                    // Flatten back to selectedItems array maintaining the new order
                    const reorderedItems: SelectedItem[] = [];
                    newGroupOrder.forEach((group) => {
                        reorderedItems.push(group.product);
                        reorderedItems.push(...group.variants);
                    });

                    state.selectedItems = reorderedItems;

                    // Update bundle data products
                    state.bundleData.products = state.selectedItems.map(
                        (item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: item.quantity,
                        }),
                    );
                }

                state.isDirty = false;
            }),

        // Computed values
        getGroupedItems: () => {
            const state = get();
            const groups: Record<string, ProductGroup> = {};

            state.selectedItems.forEach((item) => {
                if (!groups[item.productId]) {
                    groups[item.productId] = {
                        product: item,
                        variants: [],
                        originalTotalVariants: item.totalVariants || 1,
                    };
                }
                if (item.type === "variant") {
                    groups[item.productId].variants.push(item);
                }
            });

            return Object.values(groups);
        },

        getTotalProducts: () => {
            const state = get();
            const productIds = new Set(
                state.selectedItems.map((item) => item.productId),
            );
            return productIds.size;
        },

        getTotalItems: () => {
            const state = get();
            return state.selectedItems.reduce(
                (total, item) => total + item.quantity,
                0,
            );
        },

        getVariantInfo: (productId) => {
            const state = get();
            const items = state.selectedItems.filter(
                (item) => item.productId === productId,
            );
            const selectedCount = items.length;
            const originalTotal = items[0]?.totalVariants || 1;
            return { selectedCount, originalTotal };
        },

        // Display settings actions
        updateDisplaySettings: (key, value) =>
            set((state) => {
                state.displaySettings[key] = value;
                state.isDirty = false;
            }),

        // Configuration actions
        updateConfiguration: (key, value) =>
            set((state) => {
                state.configuration[key] = value;
                state.isDirty = false;
            }),

        // Loading states
        setLoading: (loading) =>
            set((state) => {
                state.isLoading = loading;
            }),

        setSaving: (saving) =>
            set((state) => {
                state.isSaving = saving;
            }),

        // Reset
        resetBundle: () =>
            set((state) => {
                state.currentStep = 1;
                state.bundleData = { ...initialBundleData };
                state.selectedItems = [];
                state.displaySettings = { ...initialDisplaySettings };
                state.configuration = { ...initialConfiguration };
                state.isLoading = false;
                state.isSaving = false;
                state.validationAttempted = false;
                state.isDirty = false;
            }),
    })),
);
