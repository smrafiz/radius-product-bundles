"use server";

import shopify from "@/lib/shopify/initialize-context";
import { handleSessionToken } from "@/lib/shopify/verify";
import { GetProductsQuery, GetProductsQueryVariables, ProductSortKeys, ProductStatus } from "@/types/admin.generated";

// Use the exact GraphQL query that matches your codegen
const GET_ALL_PRODUCTS = `
    query GetProducts(
        $first: Int!
        $after: String
        $query: String
        $sortKey: ProductSortKeys
        $reverse: Boolean
    ) {
        products(
            first: $first
            after: $after
            query: $query
            sortKey: $sortKey
            reverse: $reverse
        ) {
            edges {
                node {
                    id
                    title
                    handle
                    status
                    vendor
                    productType
                    tags
                    totalInventory
                    createdAt
                    updatedAt
                    priceRangeV2 {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                        maxVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    images(first: 1) {
                        edges {
                            node {
                                id
                                url
                                altText
                                width
                                height
                            }
                        }
                    }
                    variants(first: 250) {
                        edges {
                            node {
                                id
                                title
                                sku
                                barcode
                                inventoryQuantity
                                price
                                compareAtPrice
                                availableForSale
                                inventoryItem {
                                    tracked
                                }
                            }
                        }
                    }
                    collections(first: 10) {
                        edges {
                            node {
                                id
                                title
                                handle
                            }
                        }
                    }
                }
                cursor
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`;

// Extract types from codegen
export type ProductNode = NonNullable<GetProductsQuery['products']['edges'][0]['node']>;
export type ProductEdge = GetProductsQuery['products']['edges'][0];
export type ProductConnection = GetProductsQuery['products'];

export interface ProductFilters {
    query?: string;
    status?: ProductStatus[];
    vendor?: string;
    productType?: string;
    collections?: string[];
    tags?: string[];
    sortKey?: ProductSortKeys;
    reverse?: boolean;
}

export interface GetProductsParams {
    first?: number;
    after?: string;
    filters?: ProductFilters;
}

export async const getProducts = (
    token: string,
    params: GetProductsParams = {}
): Promise
    | {
    status: "success";
    data: GetProductsQuery;
    totalCount?: number;
}
    | { status: "error"; error?: string }
> => {
    try {
        const { session } = await handleSessionToken(token);
        const client = new shopify.clients.Graphql({ session });

        const { first = 50, after, filters = {} } = params;

        // Build query string for filtering
        let queryString = '';
        const queryParts: string[] = [];

        if (filters.query) {
            queryParts.push(`title:*${filters.query}* OR sku:*${filters.query}* OR barcode:*${filters.query}*`);
        }

        if (filters.status && filters.status.length > 0) {
            const statusQuery = filters.status.map(status => `status:${status}`).join(' OR ');
            queryParts.push(`(${statusQuery})`);
        }

        if (filters.vendor) {
            queryParts.push(`vendor:*${filters.vendor}*`);
        }

        if (filters.productType) {
            queryParts.push(`product_type:*${filters.productType}*`);
        }

        if (filters.collections && filters.collections.length > 0) {
            const collectionQuery = filters.collections.map(collection => `collection:${collection}`).join(' OR ');
            queryParts.push(`(${collectionQuery})`);
        }

        if (filters.tags && filters.tags.length > 0) {
            const tagQuery = filters.tags.map(tag => `tag:${tag}`).join(' OR ');
            queryParts.push(`(${tagQuery})`);
        }

        if (queryParts.length > 0) {
            queryString = queryParts.join(' AND ');
        }

        const variables: GetProductsQueryVariables = {
            first,
            after: after || null,
            query: queryString || null,
            sortKey: filters.sortKey || ProductSortKeys.Title,
            reverse: filters.reverse || false,
        };

        const { data, errors } = await client.request<GetProductsQuery>(
            GET_ALL_PRODUCTS,
            { variables }
        );

        if (errors || !data?.products) {
            return { status: "error", error: "Failed to fetch products" };
        }

        return {
            status: "success",
            data,
            totalCount: data.products.edges.length,
        };
    } catch (err) {
        console.error("getProducts error:", err);
        return { status: "error", error: (err as Error).message };
    }
};

// Helper function to transform GraphQL response to our Product interface
export const transformGraphQLProduct = (node: ProductNode): Product => {
    const firstImage = node.images.edges[0]?.node;
    const firstVariant = node.variants.edges[0]?.node;
    const collections = node.collections.edges.map(edge => edge.node.title);

    return {
        id: node.id,
        title: node.title,
        price: parseFloat(node.priceRangeV2.minVariantPrice.amount),
        image: firstImage?.url,
        variants: node.variants.edges.length,
        quantity: 1, // Default quantity
        available: node.totalInventory || 0,
        type: node.productType || undefined,
        status: node.status?.toLowerCase() as 'active' | 'draft' | 'archived',
        vendor: node.vendor || undefined,
        sku: firstVariant?.sku || undefined,
        collection: collections[0] || undefined,
        category: node.productType || undefined,
    };
};

// Interface for our transformed product (keep this for UI compatibility)
export interface Product {
    id: string;
    title: string;
    price: number;
    image?: string;
    variants: number;
    quantity: number;
    available?: number;
    type?: string;
    status?: 'active' | 'draft' | 'archived';
    vendor?: string;
    sku?: string;
    collection?: string;
    category?: string;
}