import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
    BundleListItem,
    BundleState,
    DiscountType,
    ExistingMedia,
    getDefaultLayout,
    initialBundleData,
    initialConfiguration,
    initialDisplaySettings,
    PendingMediaItem,
    ProductGroup,
    SelectedItem,
} from "@/features/bundles";
import { generateMediaId, getImageBasePath, TRIGGER_SAVE_BAR } from "@/shared";

// Flag to prevent save bar during initialization
let isInitializing = false;

/**
 * Sets initialization mode to prevent save bar triggers.
 */
export const setStoreInitializing = (value: boolean) => {
    isInitializing = value;
};

/**
 * Triggers the save bar by dispatching a custom event.
 */
const callTriggerSaveBar = () => {
    if (isInitializing) {
        return;
    }

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(TRIGGER_SAVE_BAR));
    }
};

export const useBundleStore = create(
    immer<BundleState>((set, get) => ({
        // Initial state
        currentStep: 1,
        previousStep: 1,
        totalSteps: 4,
        bundleData: initialBundleData,
        selectedItems: [],
        pendingMedia: [],
        existingMedia: [],
        removedMediaIds: [],
        selectedProductMediaUrls: [],
        displaySettings: initialDisplaySettings,
        configuration: initialConfiguration,
        isLoading: false,
        isSaving: false,
        validationAttempted: false,
        touchedFields: {},
        pendingProductDeletion: false,
        hasLoadedProduct: false,
        hasManuallyEditedTitle: false,
        isDirty: false,
        savedProductSnapshot: null,

        markDirty: () =>
            set((state) => {
                state.isDirty = true;
            }),
        resetDirty: () =>
            set((state) => {
                state.isDirty = false;
            }),

        // Step management
        setStep: (step) =>
            set((state) => {
                if (step >= 1 && step <= state.totalSteps) {
                    state.previousStep = state.currentStep;
                    state.currentStep = step;
                }
            }),

        setValidationAttempted: (attempted) =>
            set((state) => {
                state.validationAttempted = attempted;
            }),

        // Touched field tracking (blur validation)
        markFieldTouched: (fieldName) =>
            set((state) => {
                state.touchedFields[fieldName] = true;
            }),
        clearTouchedFields: () =>
            set((state) => {
                state.touchedFields = {};
            }),
        isFieldTouched: (fieldName) => {
            return !!get().touchedFields[fieldName];
        },

        nextStep: () =>
            set((state) => {
                const canProceed = get().canGoNext();
                state.validationAttempted = true;

                if (state.currentStep < state.totalSteps && canProceed) {
                    state.previousStep = state.currentStep;
                    state.currentStep += 1;
                    state.validationAttempted = false;
                }
            }),

        prevStep: () =>
            set((state) => {
                if (state.currentStep > 1) {
                    state.previousStep = state.currentStep;
                    state.currentStep -= 1;
                }
            }),

        goToNextStep: () =>
            set((state) => {
                if (state.currentStep < state.totalSteps) {
                    state.previousStep = state.currentStep;
                    state.currentStep += 1;
                    state.validationAttempted = false;
                }
            }),

        canGoNext: () => {
            const state = get();
            const { currentStep, selectedItems } = state;

            switch (currentStep) {
                case 1: // Products step
                    return selectedItems.length > 0;
                case 2: // Configuration step
                case 3: // Display step
                case 4: // Review step
                default:
                    return true;
            }
        },

        canGoPrevious: () => {
            const state = get();
            return state.currentStep > 1;
        },

        // Bundle data actions - Updated types
        setBundleData: (data) => {
            set((state) => {
                state.bundleData = {
                    ...state.bundleData,
                    ...data,
                };
            });
        },

        updateBundleField: (key, value) => {
            set((state) => {
                if (key === "discountType") {
                    state.bundleData.discountType = value as DiscountType;

                    if (value === "CUSTOM_PRICE") {
                        state.bundleData.maxDiscountAmount = undefined;
                    }
                    return;
                }

                if (
                    (key === "discountValue" ||
                        key === "minOrderValue" ||
                        key === "maxDiscountAmount") &&
                    value !== undefined
                ) {
                    if (typeof value === "string") {
                        const trimmed = value.trim();
                        if (trimmed === "") {
                            (state.bundleData as any)[key] = undefined;
                        } else {
                            const numValue = parseFloat(trimmed);
                            (state.bundleData as any)[key] = isNaN(numValue)
                                ? undefined
                                : numValue;
                        }
                    } else {
                        (state.bundleData as any)[key] = value;
                    }
                } else {
                    (state.bundleData as any)[key] = value;
                }
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        setSelectedItems: (items) => {
            set((state) => {
                state.selectedItems = items;
                // Update bundle data products
                state.bundleData.products = items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || item.variantIds?.[0] || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        addSelectedItems: (items) => {
            set((state) => {
                const itemsWithQuantity = items.map((item) => ({
                    ...item,
                    quantity: item.quantity || 1,
                }));
                state.selectedItems.push(...itemsWithQuantity);

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || item.variantIds?.[0] || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        removeSelectedItem: (itemId) => {
            set((state) => {
                state.selectedItems = state.selectedItems.filter(
                    (item) => item.id !== itemId,
                );

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        removeProductAndAllVariants: (productId) => {
            set((state) => {
                state.selectedItems = state.selectedItems.filter(
                    (item) => item.productId !== productId,
                );

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        removeItemById: (itemId: string) => {
            set((state) => {
                state.selectedItems = state.selectedItems.filter(
                    (item) => item.id !== itemId,
                );
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        updateSelectedItemQuantity: (itemId, quantity) => {
            set((state) => {
                const itemIndex = state.selectedItems.findIndex(
                    (item) => item.id === itemId,
                );
                if (itemIndex !== -1) {
                    state.selectedItems[itemIndex].quantity = Math.max(
                        1,
                        quantity,
                    );

                    // Update bundle data products
                    state.bundleData.products = state.selectedItems.map(
                        (item) => ({
                            productId: item.productId,
                            variantId: item.variantId || null,
                            quantity: item.quantity,
                            role: item.role || "INCLUDED",
                        }),
                    );
                }
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        updateProductVariants: (productId, variants, position) => {
            set((state) => {
                const incomingRole = variants[0]?.role;
                const otherItems = state.selectedItems.filter((item) => {
                    if (item.productId !== productId) return true;
                    if (incomingRole !== undefined) return item.role !== incomingRole;
                    return false;
                });

                if (typeof position === "number") {
                    const result = [...otherItems];
                    result.splice(position, 0, ...variants);
                    state.selectedItems = result;
                } else {
                    state.selectedItems = [...otherItems, ...variants];
                }

                // Update bundle data products
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        reorderItems: (activeId, overId) => {
            set((state) => {
                const groupedItems = get().getGroupedItems();
                const activeProductIndex = groupedItems.findIndex(
                    (group) => group.product.productId === activeId,
                );
                const overProductIndex = groupedItems.findIndex(
                    (group) => group.product.productId === overId,
                );

                if (activeProductIndex !== -1 && overProductIndex !== -1) {
                    // Helper function to move array items
                    const arrayMove = <T>(
                        array: T[],
                        from: number,
                        to: number,
                    ): T[] => {
                        const newArray = [...array];
                        const [removed] = newArray.splice(from, 1);
                        newArray.splice(to, 0, removed);
                        return newArray;
                    };

                    const newGroupOrder = arrayMove(
                        groupedItems,
                        activeProductIndex,
                        overProductIndex,
                    );

                    // Flatten back to the selectedItems array maintaining the new order
                    const reorderedItems: SelectedItem[] = [];
                    newGroupOrder.forEach((group) => {
                        reorderedItems.push(group.product);
                        reorderedItems.push(...group.variants);
                    });

                    state.selectedItems = reorderedItems;

                    // Update bundle data products
                    state.bundleData.products = state.selectedItems.map(
                        (item) => ({
                            productId: item.productId,
                            variantId: item.variantId || null,
                            quantity: item.quantity,
                            role: item.role || "INCLUDED",
                        }),
                    );
                }
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        // Computed values
        getGroupedItems: () => {
            const state = get();
            const groups: Record<string, ProductGroup> = {};

            state.selectedItems.forEach((item) => {
                if (!groups[item.productId]) {
                    groups[item.productId] = {
                        id: item.id,
                        title: item.title,
                        product: item,
                        variants: [],
                        originalTotalVariants: item.totalVariants || 1,
                        quantity: item.quantity || 1,
                    };
                }
                if (item.type === "variant") {
                    groups[item.productId].variants.push(item);
                }
            });

            return Object.values(groups);
        },

        setPendingProductDeletion: (pending: boolean) => {
            set((state) => {
                state.pendingProductDeletion = pending;
            });
        },

        setSavedProductSnapshot: (snapshot) => {
            set((state) => {
                state.savedProductSnapshot = snapshot;
            });
        },

        setHasLoadedProduct: (loaded: boolean) => {
            set((state) => {
                state.hasLoadedProduct = loaded;
            });
        },

        setHasManuallyEditedTitle: (edited: boolean) => {
            set((state) => {
                state.hasManuallyEditedTitle = edited;
            });
        },

        setExistingMedia: (media: ExistingMedia[]) => {
            set((state) => {
                state.existingMedia = media;
            });
        },

        clearExistingMedia: () => {
            set((state) => {
                state.existingMedia = [];
            });
        },

        removeExistingMedia: (id: string) => {
            set((state) => {
                // Add to the removed list for deletion on save
                if (!state.removedMediaIds.includes(id)) {
                    state.removedMediaIds.push(id);
                }
                // Remove from display
                state.existingMedia = state.existingMedia.filter(
                    (m) => m.id !== id,
                );
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        clearRemovedMediaIds: () => {
            set((state) => {
                state.removedMediaIds = [];
            });
        },

        addPendingFiles: (files: File[]) => {
            set((state) => {
                const existingKeys = new Set(
                    state.pendingMedia
                        .filter(
                            (
                                item,
                            ): item is PendingMediaItem & { type: "file" } =>
                                item.type === "file",
                        )
                        .map(
                            (item) =>
                                `${item.file.name}_${item.file.size}_${item.file.lastModified}`,
                        ),
                );
                const newItems: PendingMediaItem[] = files
                    .filter(
                        (file) =>
                            !existingKeys.has(
                                `${file.name}_${file.size}_${file.lastModified}`,
                            ),
                    )
                    .map((file) => ({
                        type: "file" as const,
                        file,
                        id: generateMediaId(),
                    }));
                state.pendingMedia.push(...newItems);
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        addPendingUrls: (urls: string[]) => {
            set((state) => {
                // Get existing paths (from existingMedia and already pending URLs)
                const existingPaths = new Set<string>();

                state.existingMedia.forEach((m) => {
                    existingPaths.add(getImageBasePath(m.url));
                });

                state.pendingMedia.forEach((item) => {
                    if (item.type === "url") {
                        existingPaths.add(getImageBasePath(item.url));
                    }
                });

                // Only add URLs that don't already exist
                const newUrls = urls.filter(
                    (url) => !existingPaths.has(getImageBasePath(url)),
                );

                const newItems: PendingMediaItem[] = newUrls.map((url) => ({
                    type: "url" as const,
                    url,
                    id: generateMediaId(),
                }));

                state.pendingMedia.push(...newItems);
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        removePendingMedia: (id: string) => {
            set((state) => {
                state.pendingMedia = state.pendingMedia.filter(
                    (item) => item.id !== id,
                );
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        clearPendingMedia: () => {
            set((state) => {
                state.pendingMedia = [];
            });
        },

        getRemovedMediaIds: () => {
            return get().removedMediaIds;
        },

        getTotalProducts: () => {
            const state = get();
            const productIds = new Set(
                state.selectedItems.map((item) => item.productId),
            );
            return productIds.size;
        },

        getTotalItems: () => {
            const state = get();
            return state.selectedItems.reduce(
                (total, item) => total + item.quantity,
                0,
            );
        },

        getVariantInfo: (productId, role) => {
            const state = get();
            const items = state.selectedItems.filter(
                (item) =>
                    item.productId === productId &&
                    (role === undefined || item.role === role),
            );

            const selectedCount = items.reduce(
                (count, item) => count + (item.variantIds?.length || 0),
                0,
            );

            const originalTotal = items[0]?.totalVariants || 1;
            return { selectedCount, originalTotal };
        },

        // BOGO/BXGY: Role management
        setProductRole: (productId: string, role: SelectedItem["role"]) => {
            set((state) => {
                state.selectedItems.forEach((item) => {
                    if (item.productId === productId) {
                        item.role = role;
                    }
                });
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        setItemRole: (itemId: string, role: SelectedItem["role"]) => {
            set((state) => {
                const item = state.selectedItems.find((i) => i.id === itemId);
                if (item) {
                    item.role = role;
                }
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        getTriggerProducts: () => {
            return get().selectedItems.filter(
                (item) => item.role === "TRIGGER",
            );
        },

        getRewardProducts: () => {
            return get().selectedItems.filter((item) => item.role === "REWARD");
        },

        setSameProductMode: (enabled: boolean) => {
            set((state) => {
                state.bundleData.sameProductMode = enabled;
                if (enabled) {
                    state.selectedItems.forEach((item) => {
                        if (item.role === "TRIGGER") {
                            item.role = "TRIGGER";
                        } else if (!item.role || item.role === "INCLUDED") {
                            item.role = "TRIGGER";
                        }
                    });
                    const triggerItems = state.selectedItems.filter(
                        (item) => item.role === "TRIGGER",
                    );
                    triggerItems.forEach((item) => {
                        const alreadyReward = state.selectedItems.some(
                            (s) =>
                                s.productId === item.productId &&
                                s.role === "REWARD",
                        );
                        if (!alreadyReward) {
                            item.role = "TRIGGER";
                        }
                    });
                }
                state.bundleData.products = state.selectedItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    role: item.role || "INCLUDED",
                }));
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        setDisplaySettings: (settings) => {
            set((state) => {
                state.displaySettings = {
                    ...initialDisplaySettings,
                    ...settings,
                };
            });
        },

        // Display settings actions
        updateDisplaySettings: (key, value) => {
            set((state) => {
                state.displaySettings[key] = value;
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        // Configuration actions
        updateConfiguration: (key, value) => {
            set((state) => {
                state.configuration[key] = value;
            });
            get().markDirty();
            callTriggerSaveBar();
        },

        // Loading states
        setLoading: (loading) =>
            set((state) => {
                state.isLoading = loading;
            }),

        setSaving: (saving) =>
            set((state) => {
                state.isSaving = saving;
            }),

        // Reset
        resetBundle: (bundleType?) => {
            set((state) => {
                state.currentStep = 1;
                state.bundleData = { ...initialBundleData };
                state.selectedItems = [];
                state.pendingMedia = [];
                state.existingMedia = [];
                state.removedMediaIds = [];
                state.selectedProductMediaUrls = [];
                state.displaySettings = {
                    ...initialDisplaySettings,
                    layout: getDefaultLayout(bundleType),
                };
                state.configuration = { ...initialConfiguration };
                state.isLoading = false;
                state.isSaving = false;
                state.validationAttempted = false;
                state.touchedFields = {};
                state.pendingProductDeletion = false;
                state.hasLoadedProduct = false;
                state.hasManuallyEditedTitle = false;
                state.isDirty = false;
                state.savedProductSnapshot = null;

                if (bundleType === "VOLUME_DISCOUNT") {
                    state.bundleData.discountType = "QUANTITY_BREAKS";
                    state.bundleData.discountValue = 0;
                    state.bundleData.openEnded = true;
                    state.bundleData.volumeTiers = {
                        discountType: "PERCENTAGE",
                        openEnded: true,
                        tiers: [
                            { minQuantity: 1, discount: 5,  title: "Buy {quantity}, get {discount} off" },
                            { minQuantity: 2, discount: 10, title: "Buy {quantity}, get {discount} off", isDefault: true },
                            { minQuantity: 3, discount: 15, title: "Buy {quantity}, get {discount} off" },
                        ],
                    };
                }
            });
        },

        handleActiveBundleDeletion: (allBundles: BundleListItem[]) => {
            const currentBundleId = get().bundleData.id;

            if (currentBundleId) {
                const bundleStillExists = allBundles.some(
                    (bundle) => bundle.id === currentBundleId,
                );

                if (!bundleStillExists) {
                    get().resetBundle();
                    return true;
                }
            }
            return false;
        },
    })),
);
