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
        first: 10,

        // UI Actions
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

        // Selection Actions
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

        // Product Actions
        setAllLoadedProducts: (products) =>
            set({ allLoadedProducts: products }),
        addLoadedProducts: (products) =>
            set((state) => ({
                allLoadedProducts: [...state.allLoadedProducts, ...products],
            })),
        clearLoadedProducts: () => set({ allLoadedProducts: [] }),

        // Filter Actions
        setFilters: (filters) => set({ filters }),
        updateFilter: (key, value) =>
            set((state) => ({
                filters: { ...state.filters, [key]: value },
            })),
        clearFilters: () => set({ filters: initialFilterState }),
        setFilterOptions: (options) => set({ filterOptions: options }),

        // Pagination Actions
        setNextCursor: (cursor) => set({ nextCursor: cursor }),
        setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),

        // Complex Actions - FIXED
        toggleProductSelection: (product) => {
            const state = get();

            // Check how many variants of this product are currently selected
            const selectedVariants = state.selectedItems.filter(
                (item) => item.productId === product.id
            );

            const allVariantsSelected = product.variants &&
                product.variants.length > 0 &&
                selectedVariants.length === product.variants.length;

            if (allVariantsSelected) {
                // If all variants are selected, deselect all variants of this product
                set({
                    selectedItems: state.selectedItems.filter(
                        (item) => item.productId !== product.id
                    )
                });
            } else {
                // If no variants or partial variants are selected, select all variants
                // First remove any existing variants of this product
                const filteredItems = state.selectedItems.filter(
                    (item) => item.productId !== product.id
                );

                if (product.variants && product.variants.length > 0) {
                    const newItems: SelectedItem[] = product.variants.map((variant) => ({
                        type: "variant",
                        productId: product.id,
                        variantId: variant.id,
                        title: `${product.title} - ${variant.title}`,
                        price: variant.price,
                        image: variant.image?.url || product.featuredImage?.url,
                        sku: variant.sku,
                    }));

                    set({
                        selectedItems: [...filteredItems, ...newItems]
                    });
                }
            }
        },

        toggleVariantSelection: (product, variant) => {
            const state = get();
            const variantSelected = state.selectedItems.some(
                (item) =>
                    item.type === "variant" && item.variantId === variant.id,
            );

            if (variantSelected) {
                set({
                    selectedItems: state.selectedItems.filter(
                        (item) => item.variantId !== variant.id,
                    ),
                });
            } else {
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

        // Computed State - FIXED
        isProductSelected: (product) => {
            const state = get();
            if (!product.variants || product.variants.length === 0) return false;

            const selectedVariants = state.selectedItems.filter(
                (item) => item.productId === product.id
            );

            // Return true only if ALL variants are selected
            return selectedVariants.length === product.variants.length;
        },

        // ADD THIS NEW FUNCTION
        isProductIndeterminate: (product) => {
            const state = get();
            if (!product.variants || product.variants.length === 0) return false;

            const selectedVariants = state.selectedItems.filter(
                (item) => item.productId === product.id
            );

            // Return true if some (but not all) variants are selected
            return selectedVariants.length > 0 && selectedVariants.length < product.variants.length;
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

        // Reset Actions
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
            }),
    }),
);