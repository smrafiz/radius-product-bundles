import type { BundleStatus, BundleType } from "@/types";

export interface BundleListItem {
    id: string;
    name: string;
    type: BundleType;
    status: BundleStatus;
    views: number;
    conversions: number;
    revenue: number;
    revenueAllTime: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;
    products: Array<{
        id: string;
        title: string;
        featuredImage?: string;
        handle: string;
    }>;
}

export interface BundleMetrics {
    totals: {
        revenue: number;
        views: number;
        purchases: number;
        addToCarts: number;
    };
    metrics: {
        conversionRate: number;
        avgOrderValue: number;
        cartConversionRate: number;
    };
    growth: {
        revenue: number;
        conversion: number;
    };
}

export interface BundleFilters {
    search: string;
    statusFilter: string[];
    typeFilter: string[];
    selectedTab: number;
    sortSelected: string[];
}

export interface Toast {
    active: boolean;
    message: string;
}

export interface Pagination {
    currentPage: number;
    itemsPerPage: number;
}

export interface BundleListingState {
    // Data
    bundles: BundleListItem[];
    metrics: BundleMetrics | null;
    refreshBundles: (page?: number, itemsPerPage?: number) => Promise<void>;
    updateBundleInStore: (bundleId: string, data: Partial<BundleListItem>) => void;

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