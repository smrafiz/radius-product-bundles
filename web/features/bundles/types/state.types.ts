/*
 * Bundle listing state types
 */

import {
    BundleConfiguration,
    BundleFilters,
    BundleListItem,
    BundleMetrics,
    BundleStatus,
    BundleType,
    DiscountType,
    DisplaySettings,
    ExistingMedia,
    ExtendedBundleFormData,
    Pagination,
    PendingMediaItem,
    ProductGroup,
    SelectedItem,
    Toast,
} from "@/features/bundles";

/*
 * Bundle listing state types
 */
export interface BundleListingState {
    // Data
    bundles: BundleListItem[];
    metrics: BundleMetrics | null;
    refreshBundles: (page?: number, itemsPerPage?: number) => Promise<void>;
    updateBundleInStore: (
        bundleId: string,
        data: Partial<BundleListItem>,
    ) => void;
    removeBundleFromStore: (bundleId: string) => void;
    queryValue: string;

    // UI State
    loading: boolean;
    error: string | null;
    filters: BundleFilters;
    pagination: Pagination;
    toast: Toast;

    // Actions
    setBundles: (bundles: BundleListItem[]) => void;
    setMetrics: (metrics: BundleMetrics | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Filter actions
    setSearch: (search: string) => void;
    setStatusFilter: (filter: BundleStatus[]) => void;
    setSelectedTab: (tab: number) => void;
    setSortSelected: (sort: string) => void;
    setPaginationMetadata: (metadata: {
        totalItems: number;
        totalPages: number;
    }) => void;
    clearFilters: () => void;
    setQueryValue: (value: string) => void;

    // Pagination actions
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;

    // Toast actions
    showToast: (message: string) => void;
    hideToast: () => void;

    // Computed getters
    getFilteredBundles: () => BundleListItem[];
    getPaginatedBundles: () => BundleListItem[];
    getActiveBundlesCount: () => number;
    getTotalBundlesCount: () => number;
    getTotalPages: () => number;
    getPaginationInfo: () => {
        startIndex: number;
        endIndex: number;
        hasNext: boolean;
        hasPrevious: boolean;
        label: string;
    };
}

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

    // Pending media - not yet on Shopify
    pendingMedia: PendingMediaItem[];
    addPendingFiles: (files: File[]) => void;
    addPendingUrls: (urls: string[]) => void;
    removePendingMedia: (id: string) => void;
    clearPendingMedia: () => void;

    // Existing media - already on Shopify
    existingMedia: ExistingMedia[];
    setExistingMedia: (files: ExistingMedia[]) => void;
    clearExistingMedia: (file: File) => void;
    removeExistingMedia: (id: string) => void;

    removedMediaIds: string[];
    clearRemovedMediaIds: () => void;
    getRemovedMediaIds: () => string[];

    // Computed values
    getGroupedItems: () => ProductGroup[];
    getTotalProducts: () => number;
    getTotalItems: () => number;
    getVariantInfo: (productId: string) => {
        selectedCount: number;
        originalTotal: number;
    };

    // Product deletion
    pendingProductDeletion: boolean;
    setPendingProductDeletion: (pending: boolean) => void;

    // Display settings
    setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
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

export type BundleSelectionStore = {
    selectingBundleId: string | null;
    setSelectingBundleId: (id: string | null) => void;
    isAnyBundleSelecting: () => boolean;
    reset: () => void;
};

export const initialDisplaySettings: DisplaySettings = {
    layout: "GRID",
    position: "ABOVE_ADD_TO_CART",
    theme: "STORE_DEFAULT",
    title: "Bundle Offers",
    cartButtonText: "Add bundle to cart",
    // colorTheme: "brand",
    showPrices: true,
    showSavings: true,
    enableHyperLink: false,
    widget: {
        showOnMobile: true,
    },
    style: {
        primaryColor: "",
        font: "",
        borderRadius: "",
        buttonStyle: "",
    },
};

export const initialBundleData: Partial<ExtendedBundleFormData> = {
    name: "",
    type: undefined as BundleType | undefined,
    products: [],
    discountType: undefined as DiscountType | undefined,
    discountValue: undefined,
    description: "",
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    startDate: undefined,
    endDate: undefined,
    createProduct: false,
    productTitle: "",
    productDescription: "",
    mainProductId: undefined,
    mainVariantId: undefined,
};

export const initialConfiguration: BundleConfiguration = {
    discountApplication: "bundle",
};
