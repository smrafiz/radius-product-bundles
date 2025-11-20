"use server";

/**
 * Shopify Product Queries - Auth Layer
 * Handles product queries via GraphQL
 */

import {
    GetProductByIdDocument,
    GetProductByIdQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLQuery } from "@/lib";

/**
 * Fetch product data for bundle edit mode
 */
export async function fetchProductById(
    sessionToken: string,
    productId: string,
) {
    const result = await executeGraphQLQuery<GetProductByIdQuery>({
        query: GetProductByIdDocument,
        variables: { id: productId },
        sessionToken,
    });

    if (!result.data?.product) {
        return null;
    }

    const product = result.data.product;

    return {
        id: product.id,
        title: product.title,
        descriptionHtml: product.descriptionHtml || "",
        handle: product.handle,
        // images:
        //     product.images?.edges?.map((edge) => ({
        //         id: edge.node.id,
        //         url: edge.node.url,
        //         altText: edge.node.altText || "",
        //     })) || [],
        // featuredImage: product.featuredImage
        //     ? {
        //         id: product.featuredImage.id,
        //         url: product.featuredImage.url,
        //         altText: product.featuredImage.altText || "",
        //     }
        //     : null,
    };
}
