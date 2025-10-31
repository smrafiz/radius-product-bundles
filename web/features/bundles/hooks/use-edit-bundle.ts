"use client";

import {
    GetProductsByIdsDocument,
    GetProductsByIdsQuery,
    GetProductsByIdsQueryVariables,
} from "@/lib/gql/graphql";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGraphQL } from "@/hooks/data/useGraphQL";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    bundlesQueries,
    SelectedItem,
    useBundleStore,
} from "@/features/bundles";

interface ProductNode {
    __typename?: "Product";
    id: string;
    title: string;
    featuredImage?: { url?: string | null } | null;
    variants?: {
        nodes?: Array<{
            id: string;
            image?: {
                url?: string | null;
            } | null;
        }>;
    } | null;
}

const isProductNode = (node: any): node is ProductNode => {
    return (
        node?.__typename === "Product" &&
        typeof node?.id === "string" &&
        typeof node?.title === "string"
    );
}

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

        if (bundleProducts && products && !productsQuery.loading) {
            // Group variant IDs by product ID
            const grouped = bundleProducts.reduce((acc: Record<string, any>, bp: any) => {
                const productId = bp.id;
                const variantId = bp.selectedVariant?.id;

                if (!productId) return acc;

                if (!acc[productId]) {
                    acc[productId] = {
                        ...bp,
                        variantIds: variantId ? [variantId] : [],
                    };
                } else if (variantId && !acc[productId].variantIds.includes(variantId)) {
                    acc[productId].variantIds.push(variantId);
                }

                return acc;
            }, {});

            const selectedItems = Object.values(grouped).map((bp: any, index: number) => {
                const shopifyProduct = products.find((node: any) => node?.id === bp.id);
                return {
                    id: bp.id || `${bp.id}-group-${index}`,
                    productId: bp.id,
                    variantIds: bp.variantIds, // <-- always array
                    quantity: bp.quantity || 1,
                    type: "product" as const,
                    title: shopifyProduct?.title || `Product ${index + 1}`,
                    price:
                        shopifyProduct?.variants?.nodes?.[0]?.price ||
                        "0.00",
                    image: shopifyProduct?.featuredImage?.url || "",
                    sku: "",
                    handle: shopifyProduct?.handle || "",
                    vendor: shopifyProduct?.vendor || "",
                    productType: shopifyProduct?.productType || "",
                    totalVariants: shopifyProduct?.variants?.nodes?.length || 1,
                    displayOrder: bp.displayOrder || 0,
                    isRequired: bp.isRequired !== false,
                    inventoryQuantity:
                        shopifyProduct?.variants?.nodes?.[0]?.inventoryQuantity || 0,
                    availableForSale:
                        shopifyProduct?.variants?.nodes?.[0]?.availableForSale || false,
                    compareAtPrice:
                        shopifyProduct?.variants?.nodes?.[0]?.compareAtPrice || null,
                };
            });

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
        productsQuery
    };
}
