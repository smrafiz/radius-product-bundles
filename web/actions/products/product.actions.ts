"use server";

import {
    GetProductsQuery,
    GetProductsQueryVariables,
} from "@/types/admin.generated";
import { print } from "graphql";
import shopify from "@/lib/shopify/initialize-context";
import { GetProductsDocument } from "@/lib/gql/graphql";
import { findSessionsByShop } from "@/lib/db/session-storage";

export async function fetchProducts(
    shop: string,
    variables: GetProductsQueryVariables,
) {
    const sessions = await findSessionsByShop(shop);

    if (!sessions?.[0]) {
        throw new Error("No valid session found for shop");
    }

    const client = new shopify.clients.Graphql({ session: sessions[0] });

    const { data, errors } = await client.request<GetProductsQuery>(
        print(GetProductsDocument),
        { variables },
    );

    if (errors) {
        throw new Error(errors.message ?? "Shopify GraphQL error");
    }

    return data?.products?.edges ?? [];
}
