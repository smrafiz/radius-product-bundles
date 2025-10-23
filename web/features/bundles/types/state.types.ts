import {
    BundleFilters,
    BundleListItem,
    BundleMetrics,
    BundleStatus,
    BundleType,
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
    setTypeFilter: (filter: BundleType[]) => void;
    setSelectedTab: (tab: number) => void;
    setSortSelected: (sort: string[]) => void;
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