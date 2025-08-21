import { useCallback, useEffect, useMemo, useState } from "react";

import { request } from 'graphql-request';
import { useQueryBuilder } from './useQueryBuilder';
import { GetProductsDocument } from '@/lib/gql/graphql';
import { LATEST_API_VERSION } from '@shopify/shopify-api';

import { useGraphQL } from '@/hooks/useGraphQL';
import { useProductSelectionStore } from '@/lib/stores/productSelectionStore';

import type {
    Product,
    GetProductsQuery,
    GetProductsQueryVariables,
} from '@/types';

const url = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

export function useProductDataLoader() {
    const {
        isModalOpen,
        debouncedSearch,
        filters,
        first,
        nextCursor,
        isLoadingMore,
        setAllLoadedProducts,
        addLoadedProducts,
        clearLoadedProducts,
        setNextCursor,
        setIsLoadingMore,
    } = useProductSelectionStore();

    const { buildSearchQuery } = useQueryBuilder();

    const [queryKey, setQueryKey] = useState(0);

    useEffect(() => {
        if (isModalOpen) {
            setQueryKey(prev => prev + 1);
        }
    }, [debouncedSearch, filters, isModalOpen]);

    // Memoize query variables to prevent unnecessary re-renders
    const productsVariables = useMemo((): GetProductsQueryVariables => ({
        first,
        query: buildSearchQuery(),
        sortKey: "UPDATED_AT",
        reverse: true,
        ...(queryKey > 0 && { _key: queryKey.toString() })
    }), [first, buildSearchQuery, queryKey]);

    // Initial products query
    const productsQuery = useGraphQL(
        GetProductsDocument as any,
        productsVariables
    ) as {
        data?: GetProductsQuery;
        loading: boolean;
        error?: Error | null;
    };

    // Transform GraphQL data to our Product interface
    const transformProduct = useCallback((node: any): Product => {
        return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            vendor: node.vendor || undefined,
            productType: node.productType || undefined,
            tags: node.tags || [],
            totalInventory: node.totalInventory || 0,
            status: node.status,
            featuredImage: node.featuredImage
                ? {
                    url: node.featuredImage.url,
                    altText: node.featuredImage.altText || undefined,
                }
                : undefined,
            variants: (node.variants?.nodes || []).map((variant: any) => ({
                id: variant.id,
                title: variant.title,
                sku: variant.sku || undefined,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice || undefined,
                availableForSale: variant.availableForSale,
                inventoryQuantity: variant.inventoryQuantity || 0,
                inventoryItem: variant.inventoryItem
                    ? {
                        tracked: variant.inventoryItem.tracked,
                    }
                    : undefined,
                image: variant.image
                    ? {
                        url: variant.image.url,
                        altText: variant.image.altText || undefined,
                    }
                    : undefined,
                selectedOptions: variant.selectedOptions || [],
            })),
            collections: (node.collections?.edges || []).map(
                (collectionEdge: any) => ({
                    id: collectionEdge.node.id,
                    title: collectionEdge.node.title,
                }),
            ),
        };
    }, []);

    // Memoize the request variables for loadMoreProducts
    const memoizedRequestVariables = useMemo(() => ({
        ...productsVariables,
        after: nextCursor,
    }), [productsVariables, nextCursor]);

    const loadMoreProducts = useCallback(async () => {
        if (isLoadingMore || !nextCursor) return;

        setIsLoadingMore(true);
        try {
            const result = await request(url, GetProductsDocument, memoizedRequestVariables) as any;
            const newProducts = result?.products?.edges || [];

            if (newProducts.length > 0) {
                const transformedProducts = newProducts.map((edge: any) =>
                    transformProduct(edge.node),
                );

                addLoadedProducts(transformedProducts);
                setNextCursor(result?.products?.pageInfo?.endCursor || null);
            } else {
                setNextCursor(null);
            }
        } catch (error) {
            console.error("Error loading more products:", error);
            setNextCursor(null);
        } finally {
            setIsLoadingMore(false);
        }
    }, [
        isLoadingMore,
        nextCursor,
        memoizedRequestVariables,
        transformProduct,
        addLoadedProducts,
        setNextCursor,
        setIsLoadingMore,
    ]);

    // Handle initial products data
    useEffect(() => {
        if (!isModalOpen) return;

        // Reset products before a new search/filter
        clearLoadedProducts();
        setNextCursor(null);

        if (productsQuery.data?.products?.edges) {
            const transformedProducts = productsQuery.data.products.edges.map(
                (edge: any) => transformProduct(edge.node),
            );

            setAllLoadedProducts(transformedProducts);
            setNextCursor(productsQuery.data.products.pageInfo?.endCursor || null);
        }
    }, [
        isModalOpen,
        productsQuery.data,
        debouncedSearch,
        filters,
        transformProduct,
        clearLoadedProducts,
        setAllLoadedProducts,
        setNextCursor,
        queryKey
    ]);

    // Clear loaded products when search/filters change
    useEffect(() => {
        clearLoadedProducts();
        setNextCursor(null);
    }, [debouncedSearch, filters, clearLoadedProducts, setNextCursor]);

    return {
        productsQuery,
        loadMoreProducts,
    };
}