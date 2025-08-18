import { useState, useEffect, useCallback } from 'react';
import {
    getProducts,
    type Product,
    type ProductFilters,
    transformGraphQLProduct,
    type ProductConnection
} from '@/actions/products.actions';
import { GetProductsQuery, ProductSortKeys } from '@/types/admin.generated';

interface UseProductsParams {
    token: string;
    filters?: ProductFilters;
    first?: number;
}

interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    error: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    loadMore: () => void;
    refetch: (newFilters?: ProductFilters) => void;
    totalCount: number;
    rawData?: GetProductsQuery; // Access to raw GraphQL data if needed
}

export const useProducts = ({ token, filters = {}, first = 50 }: UseProductsParams): UseProductsReturn => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageInfo, setPageInfo] = useState<ProductConnection['pageInfo']>({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
    });
    const [totalCount, setTotalCount] = useState(0);
    const [rawData, setRawData] = useState<GetProductsQuery>();

    const fetchProducts = useCallback(async (
        loadMore = false,
        newFilters?: ProductFilters
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getProducts(token, {
                first,
                after: loadMore ? pageInfo.endCursor : undefined,
                filters: newFilters || filters,
            });

            if (response.status === 'success') {
                const transformedProducts = response.data.products.edges.map(
                    edge => transformGraphQLProduct(edge.node)
                );

                if (loadMore) {
                    setProducts(prev => [...prev, ...transformedProducts]);
                } else {
                    setProducts(transformedProducts);
                }

                setPageInfo(response.data.products.pageInfo);
                setTotalCount(response.data.products.edges.length);
                setRawData(response.data);
            } else {
                setError(response.error || 'Failed to fetch products');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [token, filters, first, pageInfo.endCursor]);

    const loadMore = useCallback(() => {
        if (pageInfo.hasNextPage && !loading) {
            fetchProducts(true);
        }
    }, [pageInfo.hasNextPage, loading, fetchProducts]);

    const refetch = useCallback((newFilters?: ProductFilters) => {
        setPageInfo(prev => ({ ...prev, endCursor: null }));
        fetchProducts(false, newFilters);
    }, [fetchProducts]);

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token, fetchProducts]);

    return {
        products,
        loading,
        error,
        hasNextPage: pageInfo.hasNextPage,
        hasPreviousPage: pageInfo.hasPreviousPage,
        loadMore,
        refetch,
        totalCount,
        rawData,
    };
};