"use server";

import shopify from "@/lib/shopify/initialize-context";
import { handleSessionToken } from "@/lib/shopify/verify";
import {
    GetProductsQuery,
    GetProductsQueryVariables,
} from "@/types/admin.generated";

type GetProductByIdQuery = {
    product: {
        id: string;
        title: string;
        tags: string[];
    };
};

const GET_PRODUCT_BY_ID = `
    query getProductById($id: ID!) {
        product(id: $id) {
            id
            title
            tags
        }
    }
`;

export const getProductInfo = async (
    token: string,
    productId: string
): Promise<
    | {
          status: "success";
          product: {
              id: string;
              title: string;
              tags: string[];
          };
      }
    | { status: "error", error?: string }
> => {
    try {
        const { session } = await handleSessionToken(token);
        const client = new shopify.clients.Graphql({ session });

        const { data, errors } = await client.request<GetProductByIdQuery>(
            GET_PRODUCT_BY_ID,
            {
                variables: {
                    id: productId,
                } as GetProductsQueryVariables,
            }
        );

        if (errors || !data?.product) {
            return { status: "error" };
        }

        const product = data.product;
        return {
            status: "success",
            product: {
                id: product.id,
                title: product.title,
                tags: product.tags,
            },
        };
    } catch (err) {
        console.error("getProductInfo error:", err);
        return { status: "error", error: (err as Error).message };
    }
};
