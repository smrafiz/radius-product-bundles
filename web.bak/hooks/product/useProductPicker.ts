import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useBundleStore } from "@/stores";
import { SelectedItem } from "@/types";

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
        if (!app) return;

        setLoading(true);
        try {
            const groupedItems = getGroupedItems();

            // Format existing selections
            const existingSelections = groupedItems.map((group) => {
                const selectedVariantIds = [group.product, ...group.variants]
                    .map((item) => item.variantId)
                    .filter(Boolean);

                return {
                    id: group.product.productId,
                    variants:
                        selectedVariantIds.length > 0
                            ? selectedVariantIds.map((id) => ({ id }))
                            : undefined,
                };
            });

            const result = await app.resourcePicker({
                type: "product",
                multiple: true,
                selectionIds: existingSelections,
            });

            if (!result?.selection || result.selection.length === 0) {
                return;
            }

            const selected: SelectedItem[] = [];

            for (const p of result.selection) {
                if (p.variants && p.variants.length > 1) {
                    // Multi-variant product - add all selected variants
                    p.variants.forEach((variant: any, index: number) => {
                        selected.push({
                            id: `variant-${variant.id}`,
                            productId: p.id,
                            variantId: variant.id,
                            title:
                                index === 0
                                    ? p.title
                                    : `${p.title} - ${variant.title}`,
                            type: index === 0 ? "product" : "variant",
                            quantity: 1,
                            image:
                                variant.image?.originalSrc ||
                                p.images?.[0]?.originalSrc,
                            price: variant.price || "0.00",
                            sku: variant.sku || undefined,
                            handle: p.handle,
                            vendor: p.vendor,
                            productType: p.productType,
                            totalVariants: p.totalVariants || p.variants.length,
                        });
                    });
                } else {
                    // Single variant product
                    const defaultVariant = p.variants?.[0];
                    selected.push({
                        id: `product-${p.id}`,
                        productId: p.id,
                        variantId: defaultVariant?.id || null,
                        title: p.title,
                        type: "product",
                        quantity: 1,
                        image: p.images?.[0]?.originalSrc,
                        price: defaultVariant?.price || "0.00",
                        sku: defaultVariant?.sku || undefined,
                        handle: p.handle,
                        vendor: p.vendor,
                        productType: p.productType,
                        totalVariants: p.totalVariants,
                    });
                }
            }

            setSelectedItems(selected);
        } catch (err) {
            console.error("Product picker error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [app, getGroupedItems, setSelectedItems, setLoading]);

    const editProductVariants = useCallback(
        async (product: SelectedItem) => {
            if (!app) return;

            try {
                // Get current position of this product in the list to maintain order
                const currentPosition = selectedItems.findIndex(
                    (item) => item.productId === product.productId,
                );

                const currentVariants = selectedItems
                    .filter(
                        (item) =>
                            item.productId === product.productId &&
                            item.variantId,
                    )
                    .map((item) => ({ id: item.variantId }))
                    .filter((v) => v.id);

                const selectionIds = [
                    {
                        id: product.productId,
                        variants:
                            currentVariants.length > 0
                                ? currentVariants
                                : undefined,
                    },
                ];

                const result = await app.resourcePicker({
                    type: "product",
                    multiple: false,
                    query: product.title,
                    selectionIds: selectionIds,
                });

                if (result?.selection?.[0]) {
                    const selectedProduct = result.selection[0];
                    const updatedVariants: SelectedItem[] = [];

                    if (
                        selectedProduct.variants &&
                        selectedProduct.variants.length > 1
                    ) {
                        selectedProduct.variants.forEach(
                            (variant: any, index: number) => {
                                updatedVariants.push({
                                    id: `variant-${variant.id}`,
                                    productId: selectedProduct.id,
                                    variantId: variant.id,
                                    title:
                                        index === 0
                                            ? selectedProduct.title
                                            : `${selectedProduct.title} - ${variant.title}`,
                                    type: index === 0 ? "product" : "variant",
                                    quantity: 1,
                                    image:
                                        variant.image?.originalSrc ||
                                        selectedProduct.images?.[0]
                                            ?.originalSrc,
                                    price: variant.price || "0.00",
                                    sku: variant.sku || undefined,
                                    handle: selectedProduct.handle,
                                    vendor: selectedProduct.vendor,
                                    productType: selectedProduct.productType,
                                    totalVariants:
                                        selectedProduct.totalVariants ||
                                        selectedProduct.variantsCount ||
                                        selectedProduct.variants.length,
                                });
                            },
                        );
                    } else {
                        const defaultVariant = selectedProduct.variants?.[0];
                        updatedVariants.push({
                            id: `product-${selectedProduct.id}`,
                            productId: selectedProduct.id,
                            variantId: defaultVariant?.id || null,
                            title: selectedProduct.title,
                            type: "product",
                            quantity: 1,
                            image: selectedProduct.images?.[0]?.originalSrc,
                            price: defaultVariant?.price || "0.00",
                            sku: defaultVariant?.sku || undefined,
                            handle: selectedProduct.handle,
                            vendor: selectedProduct.vendor,
                            productType: selectedProduct.productType,
                            totalVariants: selectedProduct.totalVariants,
                        });
                    }

                    // Maintain position when updating variants
                    updateProductVariants(
                        product.productId,
                        updatedVariants,
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
