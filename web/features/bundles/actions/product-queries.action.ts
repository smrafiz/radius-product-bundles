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
export async function fetchProductByIdAction(
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
    const media = product.media?.edges?.map((edge) => {
        const node = edge.node;
        console.log(node);
        if (node.__typename === 'MediaImage' && node.image) {
            const image = node.image as { url: string; altText?: string };
            return {
                id: node.id,
                url: image.url,
                alt: image.altText || product.title,
            };
        }
        return null;
    }).filter((item): item is { id: string; url: string; alt: string } => item !== null) || [];

    return {
        id: product.id,
        title: product.title,
        descriptionHtml: product.descriptionHtml || "",
        handle: product.handle,
        media,
    };
}
