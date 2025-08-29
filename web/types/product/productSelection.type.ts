import { CreateBundlePayload } from "@/types";

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