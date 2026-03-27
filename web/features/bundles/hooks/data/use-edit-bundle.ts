"use client";

import {
    bundlesQueries,
    DisplaySettings,
    SelectedItem,
    useBundleStore,
} from "@/features/bundles";
import {
    GetProductsByIdsDocument,
    GetProductsByIdsQuery,
    GetProductsByIdsQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductNode, useGraphQL } from "@/shared";
import { useAppBridge } from "@shopify/app-bridge-react";

const isProductNode = (node: any): node is ProductNode => {
    const hasId = typeof node.id === "string" && node.id.includes("Product");
    const hasTitle = typeof node.title === "string";
    const hasHandle = typeof node.handle === "string";
    const hasCorrectType = !node.__typename || node.__typename === "Product";

    return hasId && hasTitle && hasHandle && hasCorrectType;
};

export function useEditBundle(bundleId: string) {
    const app = useAppBridge();
    const { setDisplaySettings, setSelectedItems, setBundleData, resetBundle } =
        useBundleStore();

    // Reset store when bundleId changes to prevent data bleed from previous bundle
    useEffect(() => {
        resetBundle();
    }, [bundleId, resetBundle]);

    // Bundle detail query
    const {
        data: bundleData,
        isLoading: isBundleLoading,
        isError,
        error,
    } = useQuery(bundlesQueries(app).detail(bundleId));

    // Extract product IDs (deduplicated), including mainProductId for handle resolution
    const productIds = useMemo(() => {
        const products = bundleData?.products || [];
        const ids = products.map((p: any) => p.id);
        if (bundleData?.mainProductId) {
            ids.push(bundleData.mainProductId);
        }
        return Array.from(new Set(ids));
    }, [bundleData?.products, bundleData?.mainProductId]);

    // GraphQL variables for fetching products
    const productsVariables = useMemo(
        (): GetProductsByIdsQueryVariables => ({
            ids: productIds,
        }),
        [productIds],
    );

    // Fetch products via GraphQL
    const productsQuery = useGraphQL(
        GetProductsByIdsDocument,
        productsVariables,
        { enabled: productIds.length > 0 },
    ) as {
        data?: GetProductsByIdsQuery;
        loading: boolean;
        error?: Error | null;
    };

    // Sync display settings to store
    useEffect(() => {
        if (bundleData?.settings) {
            setDisplaySettings(bundleData.settings as DisplaySettings);
        }
    }, [bundleData?.settings, setDisplaySettings]);

    // Sync main product handle to store
    useEffect(() => {
        if (!bundleData?.mainProductId || productsQuery.loading) return;
        const nodes = productsQuery.data?.nodes || [];
        const mainNode = nodes.find(
            (n: any) => isProductNode(n) && n.id === bundleData.mainProductId,
        );
        if (mainNode && isProductNode(mainNode)) {
            setBundleData({ mainProductHandle: mainNode.handle });
        }
    }, [
        bundleData?.mainProductId,
        productsQuery.data,
        productsQuery.loading,
        setBundleData,
    ]);

    // Sync selected items to store once products are resolved
    useEffect(() => {
        const bundleProducts = bundleData?.products || [];
        const products = productsQuery.data?.nodes || [];

        if (
            bundleProducts.length > 0 &&
            products.length > 0 &&
            !productsQuery.loading
        ) {
            // Group variants by product ID + role (role-aware for BOGO/BXGY)
            const grouped = bundleProducts.reduce(
                (acc: Record<string, any>, bp: any) => {
                    const productId = bp.id;
                    const variantId = bp.selectedVariant?.id;
                    const role = bp.role || "INCLUDED";
                    const key = `${productId}:${role}`;

                    if (!productId) return acc;

                    if (!acc[key]) {
                        acc[key] = {
                            ...bp,
                            role,
                            variantIds: variantId ? [variantId] : [],
                        };
                    } else if (
                        variantId &&
                        !acc[key].variantIds.includes(variantId)
                    ) {
                        acc[key].variantIds.push(variantId);
                    }

                    return acc;
                },
                {},
            );

            const productNodes = (products || []).filter(isProductNode);

            const selectedItems: SelectedItem[] = Object.values(grouped).map(
                (bp: any, index: number) => {
                    const shopifyProduct = productNodes.find(
                        (p) => p.id === bp.id,
                    );
                    const allVariants = shopifyProduct?.variants?.nodes || [];
                    const firstVariant = allVariants[0];

                    const selectedVariantId = bp.selectedVariant?.id;
                    const selectedVariant = selectedVariantId
                        ? allVariants.find(
                              (v: any) => v.id === selectedVariantId,
                          )
                        : null;

                    const activeVariant = selectedVariant || firstVariant;
                    const role = bp.role || "INCLUDED";
                    const isReward = role === "REWARD";

                    return {
                        id: isReward ? `reward-${bp.id}` : `product-${bp.id}`,
                        productId: bp.id,
                        variantIds: bp.variantIds || [],
                        variantId: selectedVariantId || firstVariant?.id || "",
                        quantity: bp.quantity || 1,
                        type: "product" as const,
                        title: shopifyProduct?.title || `Product ${index + 1}`,
                        url: shopifyProduct?.handle
                            ? `/products/${shopifyProduct.handle}`
                            : "",
                        price: activeVariant?.price || "0.00",
                        compareAtPrice: activeVariant?.compareAtPrice || null,
                        image:
                            selectedVariant?.image?.url ||
                            shopifyProduct?.featuredMedia?.image?.url ||
                            "",
                        sku: activeVariant?.sku || "",
                        handle: shopifyProduct?.handle || "",
                        vendor: shopifyProduct?.vendor || "",
                        productType: shopifyProduct?.productType || "",
                        totalVariants: allVariants.length || 1,
                        displayOrder: bp.displayOrder || index,
                        isRequired: bp.isRequired !== false,
                        inventoryQuantity:
                            activeVariant?.inventoryQuantity || 0,
                        availableForSale:
                            activeVariant?.availableForSale || false,
                        selectedVariant: selectedVariant
                            ? {
                                  id: selectedVariant.id,
                                  title: selectedVariant.title || "",
                                  price: selectedVariant.price || "0.00",
                                  compareAtPrice:
                                      selectedVariant.compareAtPrice || null,
                                  image: selectedVariant.image || null,
                                  availableForSale:
                                      selectedVariant.availableForSale || false,
                                  sku: selectedVariant.sku || "",
                                  inventoryQuantity:
                                      selectedVariant.inventoryQuantity || 0,
                                  productId: bp.id,
                              }
                            : undefined,
                        role,
                    };
                },
            );

            // For BOGO/BUY_X_GET_Y bundles loaded before role auto-assignment
            // existed, products may have "INCLUDED" as the default DB role.
            // Auto-assign TRIGGER/REWARD so the compact-grid and other BOGO
            // layouts render correctly.
            const isBxgy =
                bundleData?.type === "BOGO" ||
                bundleData?.type === "BUY_X_GET_Y";
            if (isBxgy) {
                const hasExplicitRole = selectedItems.some(
                    (i) => i.role === "TRIGGER" || i.role === "REWARD",
                );
                if (!hasExplicitRole) {
                    selectedItems.forEach((item, index) => {
                        item.role = index === 0 ? "TRIGGER" : "REWARD";
                    });
                }
            }

            setSelectedItems(selectedItems);
        }
    }, [
        bundleData,
        productsQuery.data,
        productsQuery.loading,
        setSelectedItems,
    ]);

    return {
        bundleData,
        isLoading: isBundleLoading || productsQuery.loading,
        isError,
        errorMessage: error?.message || "Failed to load bundle.",
        productsQuery,
    };
}
