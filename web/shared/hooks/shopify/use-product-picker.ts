import {
    createSelectedItem,
    SelectedItem,
    useBundleStore,
} from "@/features/bundles";
import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useSettingsStore } from "@/features/settings";

export function useProductPicker() {
    const app = useAppBridge();
    const {
        selectedItems,
        getGroupedItems,
        setSelectedItems,
        updateProductVariants,
        setLoading,
    } = useBundleStore();

    const openProductPicker = useCallback(async () => {
        if (!app) {
            return;
        }

        setLoading(true);
        try {
            const groupedItems = getGroupedItems();

            const existingSelections = groupedItems
                .map((group) => {
                    const selectedVariantIds = [
                        ...(group.product.variantIds || []),
                        ...group.variants
                            .map((v) => v.variantId)
                            .filter(Boolean),
                    ].filter(
                        (id): id is string =>
                            typeof id === "string" && id.length > 0,
                    );

                    return {
                        id: group.product.productId,
                        variants:
                            selectedVariantIds.length > 0
                                ? selectedVariantIds.map((id) => ({ id }))
                                : undefined,
                    };
                })
                .filter(
                    (
                        selection,
                    ): selection is {
                        id: string;
                        variants: { id: string }[] | undefined;
                    } => selection.id.length > 0,
                );

            const result = await app.resourcePicker({
                type: "product",
                multiple: true,
                selectionIds: existingSelections,
                filter: {
                    hidden: true,
                    variants: true,
                    draft: false,
                    archived: false,
                },
            });

            if (!result || result.length === 0) {
                return;
            }

            const state = useSettingsStore.getState();
            const settingsData = state.localData ?? state.serverData;
            const maxProducts = (settingsData?.maxBundleProducts as number) ?? 10;
            const limitedResult = result.slice(0, maxProducts);

            const normalizedItems = limitedResult.map((p: any, index: number) =>
                createSelectedItem(p, { displayOrder: index }),
            );

            setSelectedItems(normalizedItems);
        } catch (err) {
            console.error("Product picker error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [app, getGroupedItems, setSelectedItems, setLoading]);

    const editProductVariants = useCallback(
        async (product: SelectedItem) => {
            if (!app) {
                return;
            }

            try {
                const currentPosition = selectedItems.findIndex(
                    (item) => item.productId === product.productId,
                );

                const currentItem = selectedItems.find(
                    (item) => item.productId === product.productId,
                );
                const currentVariantIds = currentItem?.variantIds || [];

                const selectionIds = [
                    {
                        id: product.productId,
                        variants:
                            currentVariantIds.length > 0
                                ? currentVariantIds.map((id) => ({ id }))
                                : undefined,
                    },
                ];

                const result = await app.resourcePicker({
                    type: "product",
                    multiple: false,
                    query: product.title,
                    selectionIds: selectionIds,
                });

                if (result?.[0]) {
                    const selectedProduct = result[0];

                    const normalizedItem = createSelectedItem(selectedProduct, {
                        quantity: currentItem?.quantity,
                        displayOrder:
                            currentItem?.displayOrder ?? currentPosition,
                        isRequired: currentItem?.isRequired,
                    });

                    updateProductVariants(
                        product.productId,
                        [normalizedItem],
                        currentPosition,
                    );
                }
            } catch (err) {
                console.error("Edit variants error:", err);
                throw err;
            }
        },
        [app, selectedItems, updateProductVariants],
    );

    return {
        openProductPicker,
        editProductVariants,
        isLoading: useBundleStore((state) => state.isLoading),
    };
}
