import {
    BundleFilters,
    BundleListItem,
    BundleMetrics,
    Pagination,
    Toast,
} from "@/features/bundles";

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
    setStatusFilter: (filter: string[]) => void;
    setTypeFilter: (filter: string[]) => void;
    setSelectedTab: (tab: number) => void;
    setSortSelected: (sort: string[]) => void;
    setPaginationMetadata: (metadata: {
        totalItems: number;
        totalPages: number;
    }) => void;
    clearFilters: () => void;

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