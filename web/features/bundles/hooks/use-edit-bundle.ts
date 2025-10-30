"use client";

import {
    GetProductsByIdsDocument,
    GetProductsByIdsQuery,
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

function isProductNode(node: any): node is ProductNode {
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
        return Array.from(new Set(products.map((p: any) => p.productId)));
    }, [bundleData?.products]);

    // Fetch products via GraphQL
    const productsQuery = useGraphQL(
        GetProductsByIdsDocument,
        { ids: productIds },
        { enabled: productIds.length > 0 },
    ) as {
        data?: GetProductsByIdsQuery;
        loading: boolean;
    };

    // Sync selected items to store once products are resolved
    useEffect(() => {
        const bundleProducts = bundleData?.products || [];
        const nodes = productsQuery.data?.nodes || [];

        if (bundleProducts.length && nodes.length && !productsQuery.loading) {
            const selectedItems: SelectedItem[] = bundleProducts.map(
                (bp: any, i: number) => {
                    const product = nodes.find(
                        (n: any) => isProductNode(n) && n.id === bp.productId,
                    ) as ProductNode | undefined;
                    const variant = product?.variants?.nodes?.find(
                        (v: { id: string }) => v.id === bp.variantId,
                    );

                    return {
                        id: `${bp.productId}-${bp.variantId ?? "default"}-${i}`,
                        productId: bp.productId,
                        variantId: bp.variantId,
                        quantity: bp.quantity || 1,
                        title: product?.title || `Product ${i + 1}`,
                        image:
                            variant?.image?.url ||
                            product?.featuredImage?.url ||
                            "",
                        type: bp.variantId ? "variant" : "product", // Explicit literal type
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
        productsQuery
    };
}
