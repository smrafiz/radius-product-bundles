import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CreateBundlePayload } from "@/types";

export interface SelectedItem {
    id: string;
    type: 'product' | 'variant';
    productId: string;
    variantId?: string | null;
    title: string;
    price: string;
    image?: string;
    sku?: string;
    quantity: number;
    handle?: string;
    vendor?: string;
    productType?: string;
    totalVariants?: number;
}

export interface ProductGroup {
    product: SelectedItem;
    variants: SelectedItem[];
    originalTotalVariants: number;
}

export interface DisplaySettings {
    layout: 'horizontal' | 'vertical' | 'grid';
    position: 'above_cart' | 'below_cart' | 'description' | 'custom';
    title: string;
    colorTheme: 'brand' | 'success' | 'warning' | 'critical';
    showPrices: boolean;
    showSavings: boolean;
    enableQuickSwap: boolean;
}

export interface BundleConfiguration {
    discountApplication: 'bundle' | 'products' | 'shipping';
}

interface BundleState {
    // Step management
    currentStep: number;
    totalSteps: number;

    // Bundle data
    bundleData: Partial<CreateBundlePayload>;
    selectedItems: SelectedItem[];

    // Display settings
    displaySettings: DisplaySettings;

    // Configuration
    configuration: BundleConfiguration;

    // Loading states
    isLoading: boolean;
    isSaving: boolean;

    // Step actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;

    // Bundle data actions
    setBundleData: (data: Partial<CreateBundlePayload>) => void;
    updateBundleField: <K extends keyof CreateBundlePayload>(
        key: K,
        value: CreateBundlePayload[K],
    ) => void;

    // Selected items actions
    setSelectedItems: (items: SelectedItem[]) => void;
    addSelectedItems: (items: SelectedItem[]) => void;
    removeSelectedItem: (itemId: string) => void;
    removeProductAndAllVariants: (productId: string) => void;
    updateSelectedItemQuantity: (itemId: string, quantity: number) => void;
    updateProductVariants: (productId: string, variants: SelectedItem[], position?: number) => void;
    reorderItems: (activeId: string, overId: string) => void;

    // Computed values
    getGroupedItems: () => ProductGroup[];
    getTotalProducts: () => number;
    getTotalItems: () => number;
    getVariantInfo: (productId: string) => { selectedCount: number; originalTotal: number };

    // Display settings actions
    updateDisplaySettings: <K extends keyof DisplaySettings>(
        key: K,
        value: DisplaySettings[K],
    ) => void;

    // Configuration actions
    updateConfiguration: <K extends keyof BundleConfiguration>(
        key: K,
        value: BundleConfiguration[K],
    ) => void;

    // Loading states
    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;

    // Reset
    resetBundle: () => void;
}

const initialBundleData: Partial<CreateBundlePayload> = {
    name: '',
    products: [],
    discountType: 'PERCENTAGE',
    discountValue: 0,
    description: '',
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    startDate: undefined,
    endDate: undefined,
};

const initialDisplaySettings: DisplaySettings = {
    layout: 'horizontal',
    position: 'above_cart',
    title: 'Frequently Bought Together',
    colorTheme: 'brand',
    showPrices: true,
    showSavings: true,
    enableQuickSwap: false,
};

const initialConfiguration: BundleConfiguration = {
    discountApplication: 'bundle',
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

        // Step management
        setStep: (step) => set((state) => {
            if (step >= 1 && step <= state.totalSteps) {
                state.currentStep = step;
            }
        }),

        nextStep: () => set((state) => {
            if (state.currentStep < state.totalSteps) {
                state.currentStep += 1;
            }
        }),

        prevStep: () => set((state) => {
            if (state.currentStep > 1) {
                state.currentStep -= 1;
            }
        }),

        canGoNext: () => {
            const state = get();
            const { currentStep, selectedItems, bundleData } = state;

            switch (currentStep) {
                case 1: // Products step
                    return selectedItems.length > 0;
                case 2: // Configuration step
                    return !!(bundleData.name && bundleData.discountType && bundleData.discountValue);
                case 3: // Display step
                    return true; // Always can proceed from display
                case 4: // Review step
                    return false; // Can't go next from review
                default:
                    return false;
            }
        },

        canGoPrevious: () => {
            const state = get();
            return state.currentStep > 1;
        },

        // Bundle data actions
        setBundleData: (data) => set((state) => {
            state.bundleData = { ...state.bundleData, ...data };
        }),

        updateBundleField: (key, value) => set((state) => {
            state.bundleData[key] = value;
        }),

        // Selected items actions
        setSelectedItems: (items) => set((state) => {
            state.selectedItems = items;
            // Update bundle data products
            state.bundleData.products = items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }));
        }),

        addSelectedItems: (items) => set((state) => {
            const itemsWithQuantity = items.map(item => ({ ...item, quantity: item.quantity || 1 }));
            state.selectedItems.push(...itemsWithQuantity);

            // Update bundle data products
            state.bundleData.products = state.selectedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }));
        }),

        removeSelectedItem: (itemId) => set((state) => {
            state.selectedItems = state.selectedItems.filter(item => item.id !== itemId);

            // Update bundle data products
            state.bundleData.products = state.selectedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }));
        }),

        removeProductAndAllVariants: (productId) => set((state) => {
            state.selectedItems = state.selectedItems.filter(item => item.productId !== productId);

            // Update bundle data products
            state.bundleData.products = state.selectedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }));
        }),

        updateSelectedItemQuantity: (itemId, quantity) => set((state) => {
            const itemIndex = state.selectedItems.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                state.selectedItems[itemIndex].quantity = Math.max(1, quantity);

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));
            }
        }),

        updateProductVariants: (productId, variants, position) => set((state) => {
            const otherItems = state.selectedItems.filter(item => item.productId !== productId);

            if (typeof position === 'number') {
                const result = [...otherItems];
                result.splice(position, 0, ...variants);
                state.selectedItems = result;
            } else {
                state.selectedItems = [...otherItems, ...variants];
            }

            // Update bundle data products
            state.bundleData.products = state.selectedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }));
        }),

        reorderItems: (activeId, overId) => set((state) => {
            const groupedItems = get().getGroupedItems();
            const activeProductIndex = groupedItems.findIndex(group => group.product.productId === activeId);
            const overProductIndex = groupedItems.findIndex(group => group.product.productId === overId);

            if (activeProductIndex !== -1 && overProductIndex !== -1) {
                // Helper function to move array items
                const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
                    const newArray = [...array];
                    const [removed] = newArray.splice(from, 1);
                    newArray.splice(to, 0, removed);
                    return newArray;
                };

                const newGroupOrder = arrayMove(groupedItems, activeProductIndex, overProductIndex);

                // Flatten back to selectedItems array maintaining the new order
                const reorderedItems: SelectedItem[] = [];
                newGroupOrder.forEach(group => {
                    reorderedItems.push(group.product);
                    reorderedItems.push(...group.variants);
                });

                state.selectedItems = reorderedItems;

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                }));
            }
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
                        originalTotalVariants: item.totalVariants || 1
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
            const productIds = new Set(state.selectedItems.map(item => item.productId));
            return productIds.size;
        },

        getTotalItems: () => {
            const state = get();
            return state.selectedItems.reduce((total, item) => total + item.quantity, 0);
        },

        getVariantInfo: (productId) => {
            const state = get();
            const items = state.selectedItems.filter(item => item.productId === productId);
            const selectedCount = items.length;
            const originalTotal = items[0]?.totalVariants || 1;
            return { selectedCount, originalTotal };
        },

        // Display settings actions
        updateDisplaySettings: (key, value) => set((state) => {
            state.displaySettings[key] = value;
        }),

        // Configuration actions
        updateConfiguration: (key, value) => set((state) => {
            state.configuration[key] = value;
        }),

        // Loading states
        setLoading: (loading) => set((state) => {
            state.isLoading = loading;
        }),

        setSaving: (saving) => set((state) => {
            state.isSaving = saving;
        }),

        // Reset
        resetBundle: () => set((state) => {
            state.currentStep = 1;
            state.bundleData = { ...initialBundleData };
            state.selectedItems = [];
            state.displaySettings = { ...initialDisplaySettings };
            state.configuration = { ...initialConfiguration };
            state.isLoading = false;
            state.isSaving = false;
        }),
    })),
);