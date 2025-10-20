import {
    BundleFilters,
    bundleQueries,
    transformBundles,
} from "@/features/bundles";
import { fetchProductsFromShopify } from "@/lib/shopify";

export const bundleReadService = {
    async getBundles(
        shop: string,
        sessionToken: string,
        {
            page,
            itemsPerPage,
            filters,
        }: {
            page: number;
            itemsPerPage: number;
            filters?: BundleFilters;
        },
    ) {
        const bundles = await bundleQueries.findByShop(shop, {
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
            search: filters?.search,
            status: filters?.status,
            type: filters?.type,
            orderBy: filters?.sortBy || "createdAt",
            orderDirection: filters?.sortDirection || "desc",
        });

        const totalCount = await bundleQueries.countByShop(shop, {
            search: filters?.search,
            status: filters?.status,
            type: filters?.type,
        });

        if (!bundles.length) {
            return {
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
                bundles.flatMap((bundle) => bundle.bundleProducts.map((bp) => bp.productId)),
            ),
        );

        const { productMap, variantMap } = await fetchProductsFromShopify(sessionToken, allProductIds);
        const transformedBundles = transformBundles(bundles, productMap, variantMap);

        return {
            data: transformedBundles,
            pagination: {
                page,
                itemsPerPage,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / itemsPerPage),
            },
        };
    },
};