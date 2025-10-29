import {
    BundleConfiguration,
    DisplaySettings,
    ExtendedBundleFormData,
    ProductGroup,
    SelectedItem,
} from "@/types";

export interface BundleState {
    totalSteps: number;
    currentStep: number;
    bundleData: Partial<ExtendedBundleFormData>;
    selectedItems: SelectedItem[];
    displaySettings: DisplaySettings;
    configuration: BundleConfiguration;
    isLoading: boolean;
    isSaving: boolean;
    validationAttempted: boolean;

    // Dirty tracking
    isDirty: boolean;
    markDirty: () => void;
    resetDirty: () => void;

    // Step management
    setStep: (step: number) => void;
    setValidationAttempted: (attempted: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToNextStep: () => void;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;

    // Bundle data actions
    setBundleData: (data: Partial<ExtendedBundleFormData>) => void;
    updateBundleField: <K extends keyof ExtendedBundleFormData>(
        key: K,
        value: ExtendedBundleFormData[K],
    ) => void;

    // Selected items actions
    setSelectedItems: (items: SelectedItem[]) => void;
    addSelectedItems: (items: SelectedItem[]) => void;
    removeSelectedItem: (itemId: string) => void;
    removeProductAndAllVariants: (productId: string) => void;
    updateSelectedItemQuantity: (itemId: string, quantity: number) => void;
    updateProductVariants: (
        productId: string,
        variants: SelectedItem[],
        position?: number,
    ) => void;
    reorderItems: (activeId: string, overId: string) => void;

    // Computed values
    getGroupedItems: () => ProductGroup[];
    getTotalProducts: () => number;
    getTotalItems: () => number;
    getVariantInfo: (productId: string) => {
        selectedCount: number;
        originalTotal: number;
    };

    // Display settings
    updateDisplaySettings: <K extends keyof DisplaySettings>(
        key: K,
        value: DisplaySettings[K],
    ) => void;

    // Configuration
    updateConfiguration: <K extends keyof BundleConfiguration>(
        key: K,
        value: BundleConfiguration[K],
    ) => void;

    // Loading states
    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;

    // Reset
    resetBundle: () => void;
    handleActiveBundleDeletion: (bundles: any[]) => boolean;
}

export interface DisplaySettings {
    layout: "horizontal" | "vertical" | "grid";
    position: "above_cart" | "below_cart" | "description" | "custom";
    title: string;
    colorTheme: "brand" | "success" | "warning" | "critical";
    showPrices: boolean;
    showSavings: boolean;
    enableQuickSwap: boolean;
}

export interface BundleConfiguration {
    discountApplication: "bundle" | "products" | "shipping";
}