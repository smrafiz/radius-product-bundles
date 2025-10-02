"use server";

import { GetBundleProductsDocument, GetBundleProductsQuery, } from "@/lib/gql/graphql";
import { handleSessionToken } from "@/lib/shopify/verify";

import { executeGraphQLQuery } from "@/actions";
import { analyticsQueries, bundleQueries } from "@/lib/queries";
import { transformBundle, transformBundleMetrics, transformBundles, } from "@/utils";
import { Product, ProductVariant } from "@/types";

/**
 * Get bundles for a shop
 */
export async function getBundles(
    sessionToken: string,
    page: number = 1,
    itemsPerPage: number = 10,
    filters?: {
        search?: string;
        status?: string[];
        type?: string[];
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
    }
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const bundles = await bundleQueries.findByShop(shop, {
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
            search: filters?.search,
            status: filters?.status,
            type: filters?.type,
            orderBy: filters?.sortBy || 'createdAt',
            orderDirection: filters?.sortDirection || 'desc',
        });

        const totalCount = await bundleQueries.countByShop(shop, {
            search: filters?.search,
            status: filters?.status,
            type: filters?.type,
        });

        if (!bundles.length) {
            return {
                status: "success" as const,
                data: [],
                pagination: {
                    page,
                    itemsPerPage,
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / itemsPerPage),
                },
            };
        }

        // Collect all product IDs
        const allProductIds = Array.from(
            new Set(
                bundles.flatMap((bundle) =>
                    bundle.bundleProducts.map((bp) => bp.productId),
                ),
            ),
        );

        let productMap = new Map();
        let variantMap = new Map();

        if (allProductIds.length > 0) {
            const productsResult =
                await executeGraphQLQuery<GetBundleProductsQuery>({
                    query: GetBundleProductsDocument,
                    variables: { ids: allProductIds },
                    sessionToken,
                });

            if (productsResult.data?.nodes) {
                productsResult.data.nodes.filter(Boolean).forEach((product) => {
                    const prod = product as Product;

                    productMap.set(prod.id, {
                        id: prod.id,
                        title: prod.title,
                        featuredImage: prod.featuredImage?.url || null,
                        handle: prod.handle,
                    });

                    const variants = (prod as any).variants?.nodes || prod.variants || [];

                    variants.forEach((variant: any) => {
                        const var_ = variant as ProductVariant;

                        variantMap.set(var_.id, {
                            id: var_.id,
                            title: var_.title,
                            price: parseFloat(var_.price || "0"),
                            compareAtPrice: parseFloat(var_.compareAtPrice || "0"),
                        });
                    });
                });
            }
        }

        const transformedBundles = transformBundles(
            bundles,
            productMap,
            variantMap,
        );

        return {
            status: "success" as const,
            data: transformedBundles,
            pagination: {
                page,
                itemsPerPage,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / itemsPerPage),
            },
        };
    } catch (error) {
        console.error("Failed to fetch bundles:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch bundles",
            data: [],
            pagination: {
                page,
                itemsPerPage,
                totalItems: 0,
                totalPages: 0,
            },
        };
    }
}

/**
 * Get a single bundle with full details
 */
export async function getBundle(sessionToken: string, bundleId: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const bundle = await bundleQueries.findByIdWithProducts(bundleId, shop);

        if (!bundle) {
            return {
                status: "error" as const,
                message: "Bundle not found",
                data: null,
            };
        }

        return {
            status: "success" as const,
            data: transformBundle(bundle),
        };
    } catch (error) {
        console.error("Failed to fetch bundle:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch bundle",
            data: null,
        };
    }
}

/**
 * Get bundle metrics for a shop
 */

export async function getBundleMetrics(sessionToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const rawMetrics = await analyticsQueries.aggregateMetrics(
            shop,
            thirtyDaysAgo,
            sixtyDaysAgo,
        );

        const metrics = transformBundleMetrics(rawMetrics);

        return { status: "success" as const, data: metrics };
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch metrics",
            data: null,
        };
    }
}
