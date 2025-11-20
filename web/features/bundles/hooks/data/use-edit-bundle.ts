"use client";

import {
    bundlesQueries,
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
    const { setSelectedItems } = useBundleStore();

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

    // Sync selected items to store once products are resolved
    useEffect(() => {
        const bundleProducts = bundleData?.products || [];
        const products = productsQuery.data?.nodes || [];

        if (
            bundleProducts.length > 0 &&
            products.length > 0 &&
            !productsQuery.loading
        ) {
            // Group variants by product ID
            const grouped = bundleProducts.reduce(
                (acc: Record<string, any>, bp: any) => {
                    const productId = bp.id;
                    const variantId = bp.selectedVariant?.id;

                    if (!productId) return acc;

                    if (!acc[productId]) {
                        acc[productId] = {
                            ...bp,
                            variantIds: variantId ? [variantId] : [],
                        };
                    } else if (
                        variantId &&
                        !acc[productId].variantIds.includes(variantId)
                    ) {
                        acc[productId].variantIds.push(variantId);
                    }

                    return acc;
                },
                {},
            );

            const selectedItems: SelectedItem[] = Object.values(grouped).map(
                (bp: any, index: number) => {
                    const productNodes = (products || []).filter(isProductNode);
                    const shopifyProduct = productNodes.find(
                        (p) => p.id === bp.id,
                    );
                    const firstVariant = shopifyProduct?.variants?.nodes?.[0];

                    return {
                        id: `product-${bp.id}`,
                        productId: bp.id,
                        variantIds: bp.variantIds || [],
                        quantity: bp.quantity || 1,
                        type: "product" as const,
                        title: shopifyProduct?.title || `Product ${index + 1}`,
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
