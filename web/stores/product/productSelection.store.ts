import { create } from "zustand";
import {
    FilterOptions,
    FilterState,
    ProductSelectionState,
    SelectedItem,
} from "@/types";

const initialFilterState: FilterState = {
    status: "",
    productType: "",
    vendor: "",
    collection: "",
    tags: [],
};

const initialFilterOptions: FilterOptions = {
    types: [],
    vendors: [],
    tags: [],
    statuses: [],
};

// Define types for the GraphQL response
type ProductEdge = {
    node: {
        productType?: string | null;
        status?: string | null;
    };
};

type ProductsData = {
    edges?: ProductEdge[] | null;
};

export const useProductSelectionStore = create<ProductSelectionState>()(
    (set, get) => ({
        // Initial State
        isModalOpen: false,
        searchInput: "",
        searchBy: "all",
        debouncedSearch: "",
        filterPopoverActive: false,
        expandedProducts: new Set(),
        selectedItems: [],
        allLoadedProducts: [],
        filters: initialFilterState,
        filterOptions: initialFilterOptions,
        nextCursor: null,
        isLoadingMore: false,
        first: 100,

        // Collection filtering states
        collectionQuery: "",
        collections: [],
        collectionsPageInfo: null,
        selectedCollectionTitle: null,
        collectionVariables: {
            query: "",
            first: 25,
            after: null,
        },

        // Existing actions
        setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
        setSearchInput: (search) => set({ searchInput: search }),
        setDebouncedSearch: (search) => set({ debouncedSearch: search }),
        setSearchBy: (searchBy) => set({ searchBy }),
        setFilterPopoverActive: (active) =>
            set({ filterPopoverActive: active }),
        toggleProductExpansion: (productId) =>
            set((state) => {
                const newSet = new Set(state.expandedProducts);
                if (newSet.has(productId)) {
                    newSet.delete(productId);
                } else {
                    newSet.add(productId);
                }
                return { expandedProducts: newSet };
            }),
        setSelectedItems: (items) => set({ selectedItems: items }),
        addSelectedItem: (item) =>
            set((state) => ({
                selectedItems: [...state.selectedItems, item],
            })),
        removeSelectedItem: (itemId, type) =>
            set((state) => ({
                selectedItems: state.selectedItems.filter((item) => {
                    if (type === "product") {
                        return item.productId !== itemId;
                    } else {
                        return item.variantId !== itemId;
                    }
                }),
            })),
        clearSelectedItems: () => set({ selectedItems: [] }),
        setAllLoadedProducts: (products) =>
            set({ allLoadedProducts: products }),
        addLoadedProducts: (products) =>
            set((state) => ({
                allLoadedProducts: [...state.allLoadedProducts, ...products],
            })),
        clearLoadedProducts: () => set({ allLoadedProducts: [] }),
        setFilters: (filters) => set({ filters }),
        updateFilter: (key, value) =>
            set((state) => ({
                filters: { ...state.filters, [key]: value },
            })),
        clearFilters: () => set({ filters: initialFilterState }),
        setFilterOptions: (options) => set({ filterOptions: options }),
        setNextCursor: (cursor) => set({ nextCursor: cursor }),
        setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),

        // Collection filtering actions
        setCollectionQuery: (query) => set({ collectionQuery: query }),
        setCollections: (collections) => set({ collections }),
        setCollectionsPageInfo: (pageInfo) =>
            set({ collectionsPageInfo: pageInfo }),
        setSelectedCollectionTitle: (title) =>
            set({ selectedCollectionTitle: title }),
        setCollectionVariables: (variables) =>
            set({ collectionVariables: variables }),
        clearCollectionStates: () =>
            set({
                collectionQuery: "",
                collections: [],
                collectionsPageInfo: null,
                selectedCollectionTitle: null,
                collectionVariables: {
                    query: "",
                    first: 25,
                    after: null,
                },
            }),

        // Update product types and status from GraphQL response
        updateFilterOptionsFromProducts: (products: ProductsData) => {
            if (!products?.edges) return;

            // Extract unique product types
            const types = Array.from(
                new Set(
                    products.edges
                        .map((edge) => edge.node.productType)
                        .filter(Boolean),
                ),
            ) as string[];

            // Extract unique statuses
            const statuses = Array.from(
                new Set(
                    products.edges
                        .map((edge) => edge.node.status)
                        .filter(Boolean),
                ),
            ) as string[];

            set((state) => ({
                filterOptions: {
                    ...state.filterOptions,
                    types,
                    statuses,
                },
            }));
        },

        // Existing product selection actions
        toggleProductSelection: (product) => {
            const state = get();
            const selectedVariants = state.selectedItems.filter(
                (item) => item.productId === product.id,
            );
            const allVariantsSelected =
                product.variants &&
                product.variants.length > 0 &&
                selectedVariants.length === product.variants.length;
            if (allVariantsSelected) {
                // Deselect all variants
                set({
                    selectedItems: state.selectedItems.filter(
                        (item) => item.productId !== product.id,
                    ),
                });
            } else {
                // Replace existing selection for this product with all variants
                const filteredItems = state.selectedItems.filter(
                    (item) => item.productId !== product.id,
                );
                const newItems: SelectedItem[] = (product.variants || []).map(
                    (variant) => ({
                        type: "variant",
                        productId: product.id,
                        variantId: variant.id,
                        title: `${product.title} - ${variant.title}`,
                        price: variant.price,
                        image: variant.image?.url || product.featuredImage?.url,
                        sku: variant.sku,
                    }),
                );
                set({
                    selectedItems: [...filteredItems, ...newItems],
                });
            }
        },
        toggleVariantSelection: (product, variant) => {
            const state = get();
            const variantSelected = state.selectedItems.some(
                (item) =>
                    item.type === "variant" && item.variantId === variant.id,
            );
            if (variantSelected) {
                // Remove only this variant
                set({
                    selectedItems: state.selectedItems.filter(
                        (item) => item.variantId !== variant.id,
                    ),
                });
            } else {
                // Add this variant
                const newItem: SelectedItem = {
                    type: "variant",
                    productId: product.id,
                    variantId: variant.id,
                    title: `${product.title} - ${variant.title}`,
                    price: variant.price,
                    image: variant.image?.url || product.featuredImage?.url,
                    sku: variant.sku,
                };
                set({
                    selectedItems: [...state.selectedItems, newItem],
                });
            }
        },
        selectAllProducts: (products, selectedProductIds) => {
            const availableItems: SelectedItem[] = [];
            products.forEach((product) => {
                if (
                    !selectedProductIds.includes(product.id) &&
                    product.variants &&
                    product.variants.length > 0
                ) {
                    product.variants.forEach((variant) => {
                        availableItems.push({
                            type: "variant",
                            productId: product.id,
                            variantId: variant.id,
                            title: `${product.title} - ${variant.title}`,
                            price: variant.price,
                            image:
                                variant.image?.url ||
                                product.featuredImage?.url,
                            sku: variant.sku,
                        });
                    });
                }
            });
            set({ selectedItems: availableItems });
        },
        deselectAllProducts: () => set({ selectedItems: [] }),
        isProductSelected: (product) => {
            const state = get();
            if (!product.variants || product.variants.length === 0)
                return false;
            const selectedVariants = state.selectedItems.filter(
                (item) => item.productId === product.id,
            );
            return selectedVariants.length === product.variants.length;
        },
        isProductIndeterminate: (product) => {
            const state = get();
            if (!product.variants || product.variants.length === 0)
                return false;
            const selectedVariants = state.selectedItems.filter(
                (item) => item.productId === product.id,
            );
            return (
                selectedVariants.length > 0 &&
                selectedVariants.length < product.variants.length
            );
        },
        isVariantSelected: (variant) => {
            const state = get();
            return state.selectedItems.some(
                (item) => item.variantId === variant.id,
            );
        },
        hasActiveFilters: () => {
            const state = get();
            return Object.entries(state.filters).some(([key, value]) =>
                key !== "tags" ? value !== "" : (value as string[]).length > 0,
            );
        },
        activeFilterCount: () => {
            const state = get();
            return Object.entries(state.filters).filter(([key, value]) =>
                key !== "tags" ? value !== "" : (value as string[]).length > 0,
            ).length;
        },
        resetState: () =>
            set({
                searchInput: "",
                debouncedSearch: "",
                searchBy: "all",
                filterPopoverActive: false,
                expandedProducts: new Set(),
                selectedItems: [],
                allLoadedProducts: [],
                filters: initialFilterState,
                nextCursor: null,
                isLoadingMore: false,
                // Reset collection states
                collectionQuery: "",
                collections: [],
                collectionsPageInfo: null,
                selectedCollectionTitle: null,
                collectionVariables: {
                    query: "",
                    first: 25,
                    after: null,
                },
            }),
    }),
);
