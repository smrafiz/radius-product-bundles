"use server";

import {
    GetProductByIdDocument,
    GetProductByIdQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLQuery } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";
import { sanitizeRichText } from "@/shared";

export async function fetchProductByIdAction(
    sessionToken: string,
    productId: string,
) {
    await handleSessionToken(sessionToken);

    const result = await executeGraphQLQuery<GetProductByIdQuery>({
        query: GetProductByIdDocument,
        variables: { id: productId },
        sessionToken,
    });

    if (!result.data?.product) {
        return null;
    }

    const product = result.data.product;
    const media =
        product.media?.edges
            ?.map((edge) => {
                const node = edge.node;
                if (node.__typename === "MediaImage" && node.image) {
                    const image = node.image as {
                        url: string;
                        altText?: string;
                    };
                    return {
                        id: node.id,
                        url: image.url,
                        alt: image.altText || product.title,
                    };
                }
                return null;
            })
            .filter(
                (item): item is { id: string; url: string; alt: string } =>
                    item !== null,
            ) || [];

    return {
        id: product.id,
        title: product.title,
        descriptionHtml: sanitizeRichText(product.descriptionHtml || ""),
        handle: product.handle,
        media,
    };
}
