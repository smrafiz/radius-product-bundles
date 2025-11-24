/*
 * Bundle listing state types
 */

import {
    BundleConfiguration,
    BundleFilters,
    BundleListItem,
    BundleMetrics,
    BundleStatus,
    DisplaySettings,
    ExistingMedia,
    ExtendedBundleFormData,
    Pagination,
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

    // Media files - new uploads
    mediaFiles?: File[];
    setMediaFiles: (files: File[]) => void;

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

export type BundleSelectionStore = {
    selectingBundleId: string | null;
    setSelectingBundleId: (id: string | null) => void;
    isAnyBundleSelecting: () => boolean;
};
