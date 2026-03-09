"use server";

import { print } from "graphql";
import { GraphQLClient } from "graphql-request";
import { handleSessionToken } from "@/lib/shopify";
import { GraphQLRequest, GraphQLResponse } from "@/shared";
import { SHOPIFY_API_VERSION } from "@/shared/constants";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

/**
 * Execute GraphQL query against Shopify Admin API
 */
export async function executeGraphQLQuery<T = any>(
    request: GraphQLRequest,
): Promise<GraphQLResponse<T>> {
    try {
        const { query, variables = {} } = request;

        if (!query) {
            return {
                errors: [
                    {
                        message: "GraphQL query is required",
                        extensions: {
                            code: "MISSING_QUERY",
                            timestamp: new Date().toISOString(),
                        },
                    },
                ],
            } as GraphQLResponse<T>;
        }

        let shop: string;
        let accessToken: string;

        // Direct auth path: shop + accessToken provided (cron/background jobs)
        if (request.shop && request.accessToken) {
            shop = request.shop;
            accessToken = request.accessToken;
        }
        // JWT session token path (existing flow)
        else if (request.sessionToken) {
            const sessionResult = await handleSessionToken(
                request.sessionToken,
                false,
                false,
            );

            if (!sessionResult.session?.accessToken) {
                return {
                    errors: [
                        {
                            message: "No access token found in session",
                            extensions: {
                                code: "MISSING_ACCESS_TOKEN",
                                timestamp: new Date().toISOString(),
                            },
                        },
                    ],
                } as GraphQLResponse<T>;
            }

            shop = sessionResult.shop;
            accessToken = sessionResult.session.accessToken;
        } else {
            return {
                errors: [
                    {
                        message:
                            "Authentication required: provide sessionToken or shop + accessToken",
                        extensions: {
                            code: "MISSING_AUTH",
                            timestamp: new Date().toISOString(),
                        },
                    },
                ],
            } as GraphQLResponse<T>;
        }

        const endpoint = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
        const client = new GraphQLClient(endpoint, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });

        // Handle both string queries and TypedDocumentNode from codegen
        const queryString =
            typeof query === "string"
                ? query
                : (query as TypedDocumentNode)?.loc?.source?.body ||
                  print(query as any);

        const result = await client.request<T>(queryString, variables);

        return {
            data: result,
        } as GraphQLResponse<T>;
    } catch (error) {
        // 401: stale token — force token exchange and retry once
        if (
            request.sessionToken &&
            !request._retried &&
            error &&
            typeof error === "object" &&
            "response" in error &&
            (error as any).response?.status === 401
        ) {
            try {
                console.warn(
                    "[GraphQL] 401 — forcing token refresh and retrying",
                );
                const refreshed = await handleSessionToken(
                    request.sessionToken,
                    false,
                    true,
                    true,
                );

                if (refreshed.session?.accessToken) {
                    return executeGraphQLQuery<T>({
                        ...request,
                        shop: refreshed.shop,
                        accessToken: refreshed.session.accessToken,
                        _retried: true,
                    } as GraphQLRequest);
                }
            } catch (retryError) {
                console.warn(
                    "[GraphQL] Token refresh failed, returning original error:",
                    retryError instanceof Error
                        ? retryError.message
                        : retryError,
                );
            }
        }

        console.error("GraphQL server action error:", error);

        if (error && typeof error === "object" && "response" in error) {
            const gqlError = error as any;
            if (gqlError.response?.errors) {
                return {
                    errors: gqlError.response.errors.map((err: any) => ({
                        ...err,
                        extensions: {
                            ...(err.extensions || {}),
                            timestamp: new Date().toISOString(),
                        },
                    })),
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

/**
 * Execute GraphQL mutation against Shopify Admin API
 * (Mutations use the same protocol as queries in GraphQL)
 */
export async function executeGraphQLMutation<T = any>(
    request: GraphQLRequest,
): Promise<GraphQLResponse<T>> {
    return executeGraphQLQuery<T>(request);
}
