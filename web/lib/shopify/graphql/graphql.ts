"use server";

import { GraphQLClient } from "graphql-request";
import { handleSessionToken } from "@/lib/shopify/verify";
import { GraphQLRequest, GraphQLResponse } from "@/shared";

export async function executeGraphQLQuery<T = any>(
    request: GraphQLRequest,
): Promise<GraphQLResponse<T>> {
    try {
        const { query, variables = {}, sessionToken } = request;

        if (!sessionToken) {
            return {
                errors: [{
                    message: "Session token is required",
                    extensions: {
                        code: "MISSING_SESSION_TOKEN",
                        timestamp: new Date().toISOString()
                    }
                }]
            } as GraphQLResponse<T>;
        }

        if (!query) {
            return {
                errors: [{
                    message: "GraphQL query is required",
                    extensions: {
                        code: "MISSING_QUERY",
                        timestamp: new Date().toISOString()
                    }
                }]
            } as GraphQLResponse<T>;
        }

        const { shop, session } = await handleSessionToken(
            sessionToken,
            false,
            false,
        );

        if (!session?.accessToken) {
            return {
                errors: [{
                    message: "No access token found in session",
                    extensions: {
                        code: "MISSING_ACCESS_TOKEN",
                        timestamp: new Date().toISOString()
                    }
                }]
            } as GraphQLResponse<T>;
        }

        const accessToken = session.accessToken;

        if (!accessToken) {
            return {
                errors: [{
                    message: "Access token is undefined",
                    extensions: {
                        code: "INVALID_ACCESS_TOKEN",
                        timestamp: new Date().toISOString()
                    }
                }]
            } as GraphQLResponse<T>;
        }

        const endpoint = `https://${shop}/admin/api/2025-10/graphql.json`;
        const client = new GraphQLClient(endpoint, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });

        const result = await client.request<T>(query, variables);

        return {
            data: result,
        } as GraphQLResponse<T>;
    } catch (error) {
        console.error("GraphQL server action error:", error);

        if (error && typeof error === "object" && "response" in error) {
            const gqlError = error as any;
            if (gqlError.response?.errors) {
                return {
                    errors: gqlError.response.errors.map((err: any) => ({
                        ...err,
                        extensions: {
                            ...(err.extensions || {}),
                            timestamp: new Date().toISOString()
                        }
                    }))
                } as GraphQLResponse<T>;
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
        } as GraphQLResponse<T>;
    }
}

export async function executeGraphQLMutation<T = any>(
    request: GraphQLRequest,
): Promise<GraphQLResponse<T>> {
    return executeGraphQLQuery<T>(request);
}
