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
    const { setDisplaySettings, setSelectedItems } = useBundleStore();

    // Bundle detail query
    const {
        data: bundleData,
        isLoading: isBundleLoading,
        isError,
        error,
    } = useQuery(bundlesQueries(app).detail(bundleId));

    // Extract product IDs (deduplicated)
    const productIds = useMemo(() => {
        const products = bundleData?.products || [];
        return Array.from(new Set(products.map((p: any) => p.id)));
    }, [bundleData?.products]);

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
                    const firstVariant = shopifyProduct?.variants?.nodes?.[0];
                    const role = bp.role || "INCLUDED";
                    const isReward = role === "REWARD";

                    return {
                        id: isReward ? `reward-${bp.id}` : `product-${bp.id}`,
                        productId: bp.id,
                        variantIds: bp.variantIds || [],
                        quantity: bp.quantity || 1,
                        type: "product" as const,
                        title: shopifyProduct?.title || `Product ${index + 1}`,
                        url: shopifyProduct?.handle
                            ? `/products/${shopifyProduct.handle}`
                            : "",
                        price: firstVariant?.price || "0.00",
                        compareAtPrice: firstVariant?.compareAtPrice || null,
                        image: shopifyProduct?.featuredMedia?.image?.url || "",
                        sku: firstVariant?.sku || "",
                        handle: shopifyProduct?.handle || "",
                        vendor: shopifyProduct?.vendor || "",
                        productType: shopifyProduct?.productType || "",
                        totalVariants:
                            shopifyProduct?.variants?.nodes?.length || 1,
                        displayOrder: bp.displayOrder || index,
                        isRequired: bp.isRequired !== false,
                        inventoryQuantity: firstVariant?.inventoryQuantity || 0,
                        availableForSale:
                            firstVariant?.availableForSale || false,
                        role,
                    };
                },
            );

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
