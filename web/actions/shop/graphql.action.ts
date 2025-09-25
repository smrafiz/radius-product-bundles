"use server";

import { GraphQLClient } from "graphql-request";
import { handleSessionToken } from "@/lib/shopify/verify";
import { GraphQLRequest, GraphQLResponse } from "@/types";

export async function executeGraphQLQuery<T = any>(
    request: GraphQLRequest,
): Promise<GraphQLResponse<T>> {
    try {
        const { query, variables = {}, sessionToken } = request;

        if (!sessionToken) {
            throw new Error("Session token is required");
        }

        if (!query) {
            throw new Error("GraphQL query is required");
        }

        const { shop, session } = await handleSessionToken(
            sessionToken,
            false,
            false,
        );

        if (!session?.accessToken) {
            throw new Error("No access token found in session");
        }

        const accessToken = session.accessToken;

        if (!accessToken) {
            throw new Error("Access token is undefined");
        }

        const endpoint = `https://${shop}/admin/api/2025-07/graphql.json`;
        const client = new GraphQLClient(endpoint, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });

        const result = await client.request<T>(query, variables);

        return {
            data: result,
        };
    } catch (error) {
        console.error("GraphQL server action error:", error);

        if (error && typeof error === "object" && "response" in error) {
            const gqlError = error as any;
            if (gqlError.response?.errors) {
                return {
                    errors: gqlError.response.errors,
                };
            }
        }

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown GraphQL error occurred";

        return {
            errors: [
                {
                    message: errorMessage,
                    extensions: {
                        code: "INTERNAL_ERROR",
                        timestamp: new Date().toISOString(),
                    },
                },
            ],
        };
    }
}

export async function executeGraphQLMutation<T = any>(
    request: GraphQLRequest,
): Promise<GraphQLResponse<T>> {
    return executeGraphQLQuery<T>(request);
}
