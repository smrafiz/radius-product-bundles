import { Product, ProductVariant } from "@/types";

export interface SelectedItem {
    type: "product" | "variant";
    productId: string;
    variantId?: string;
    title: string;
    price: string;
    image?: string;
    sku?: string;
    quantity?: number;
    totalVariants?: number;
}

export interface FilterState {
    status: string;
    productType: string;
    vendor: string;
    collection: string;
    tags: string[];
}

export interface FilterOptions {
    types: string[];
    vendors: string[];
    tags: string[];
    statuses: string[];
}

export interface ProductSelectionState {
    // UI State
    isModalOpen: boolean;
    searchInput: string;
    searchBy: string;
    debouncedSearch: string;
    filterPopoverActive: boolean;
    expandedProducts: Set<string>;

    // Data State
    selectedItems: SelectedItem[];
    allLoadedProducts: Product[];
    filters: FilterState;
    filterOptions: FilterOptions;

    // Collection State
    collectionQuery: string;
    collections: any[];
    collectionsPageInfo: any;
    selectedCollectionTitle: string | null;
    collectionVariables: {
        query: string;
        first: number;
        after: any;
    };

    // Pagination State
    nextCursor: string | null;
    isLoadingMore: boolean;
    first: number;

    // Actions
    setModalOpen: (isOpen: boolean) => void;
    setSearchInput: (search: string) => void;
    setDebouncedSearch: (search: string) => void;
    setSearchBy: (searchBy: string) => void;
    setFilterPopoverActive: (active: boolean) => void;
    toggleProductExpansion: (productId: string) => void;

    // Collection Actions
    setCollectionQuery: (query: string) => void;
    setCollections: (collections: any[]) => void;
    setCollectionsPageInfo: (pageInfo: any) => void;
    setSelectedCollectionTitle: (title: string | null) => void;
    setCollectionVariables: (variables: {
        query: string;
        first: number;
        after: any;
    }) => void;
    clearCollectionStates: () => void;
    updateFilterOptionsFromProducts: (products: any) => void;

    // Selection Actions
    isProductIndeterminate: (product: Product) => boolean;
    setSelectedItems: (items: SelectedItem[]) => void;
    addSelectedItem: (item: SelectedItem) => void;
    removeSelectedItem: (itemId: string, type: 'product' | 'variant') => void;
    clearSelectedItems: () => void;

    // Product Actions
    setAllLoadedProducts: (products: Product[]) => void;
    addLoadedProducts: (products: Product[]) => void;
    clearLoadedProducts: () => void;

    // Filter Actions
    setFilters: (filters: FilterState) => void;
    updateFilter: (key: keyof FilterState, value: string | string[]) => void;
    clearFilters: () => void;
    setFilterOptions: (options: FilterOptions) => void;

    // Pagination Actions
    setNextCursor: (cursor: string | null) => void;
    setIsLoadingMore: (loading: boolean) => void;

    // Complex Actions
    toggleProductSelection: (product: Product, selectedProductIds: string[]) => void;
    toggleVariantSelection: (product: Product, variant: ProductVariant) => void;
    selectAllProducts: (products: Product[], selectedProductIds: string[]) => void;
    deselectAllProducts: () => void;

    // Computed State
    isProductSelected: (product: Product) => boolean;
    isVariantSelected: (variant: ProductVariant) => boolean;
    hasActiveFilters: () => boolean;
    activeFilterCount: () => number;

    // Reset Actions
    resetState: () => void;
}

export interface FilterState {
    status: string;
    productType: string;
    vendor: string;
    collection: string;
    tags: string[];
}
