import { print } from "graphql";
import { GraphQLClient } from "graphql-request";
import { findOfflineSessionByShop } from "@/lib/db/session-storage";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

interface ProxyGraphQLResponse<T = any> {
    data?: T;
    loading: boolean;
    error: Error | null;
}

/**
 * Server-side GraphQL executor for proxy routes
 */
export async function executeProxyGraphQL<TResult = any, TVariables extends object = any>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables: TVariables,
    shop: string,
): Promise<ProxyGraphQLResponse<TResult>> {
    try {
        // Get stored access token
        const session = await findOfflineSessionByShop(shop);
        const accessToken = session?.accessToken;

        if (!accessToken) {
            return {
                data: undefined,
                loading: false,
                error: new Error("No access token found for shop")
            };
        }

        // Convert document to string (same as your useGraphQL)
        const query = print(document);

        if (!query) {
            return {
                data: undefined,
                loading: false,
                error: new Error("GraphQL document string is empty")
            };
        }

        // Make GraphQL request
        const endpoint = `https://${shop}/admin/api/2025-07/graphql.json`;
        const client = new GraphQLClient(endpoint, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });

        const result = await client.request<TResult>(query, variables || {});

        return {
            data: result,
            loading: false,
            error: null
        };

    } catch (error) {
        console.error("Proxy GraphQL error:", error);
        return {
            data: undefined,
            loading: false,
            error: error as Error
        };
    }
}

/**
 * Convenience wrapper for common GraphQL patterns
 */
export async function queryProxyGraphQL<TResult = any, TVariables extends object = any>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables: TVariables,
    shop: string,
): Promise<TResult | null> {
    const result = await executeProxyGraphQL(document, variables, shop);

    if (result.error) {
        console.error(`GraphQL query failed for shop ${shop}:`, result.error);
        return null;
    }

    return result.data || null;
}