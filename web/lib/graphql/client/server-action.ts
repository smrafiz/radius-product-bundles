"use server";

import { print } from "graphql";
import { GraphQLClient } from "graphql-request";
import { handleSessionToken } from "@/lib/shopify";
import { GraphQLRequest, GraphQLResponse } from "@/shared";
import { SHOPIFY_API_VERSION } from "@/shared/constants";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

const RETRYABLE_STATUS_CODES = [429, 502, 503, 504];
const MAX_RETRIES = 3;
const BACKOFF_MS = [0, 1000, 3000];

function getRetryDelay(retryCount: number): number {
    return BACKOFF_MS[retryCount] ?? 3000;
}

function isRetryableError(error: unknown): number | null {
    if (error && typeof error === "object" && "response" in error) {
        const status = (error as any).response?.status;
        if (RETRYABLE_STATUS_CODES.includes(status)) return status;
    }
    return null;
}

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

        const retryableStatus = isRetryableError(error);
        const retryCount = request._retryCount ?? 0;

        if (retryableStatus && retryCount < MAX_RETRIES) {
            const delay = getRetryDelay(retryCount);
            if (delay > 0) {
                await new Promise((r) => setTimeout(r, delay));
            }
            console.warn(
                `[GraphQL] ${retryableStatus} — retry ${retryCount + 1}/${MAX_RETRIES}`,
            );
            return executeGraphQLQuery<T>({
                ...request,
                _retryCount: retryCount + 1,
            });
        }

        if (retryableStatus && retryCount >= MAX_RETRIES) {
            console.error(
                `[GraphQL] Shopify API unavailable (${retryableStatus}) after ${MAX_RETRIES} retries`,
            );
            return {
                errors: [
                    {
                        message: `Shopify API is temporarily unavailable (HTTP ${retryableStatus}). Please try again later.`,
                        extensions: {
                            code: "SHOPIFY_UNAVAILABLE",
                            statusCode: retryableStatus,
                            timestamp: new Date().toISOString(),
                        },
                    },
                ],
            } as GraphQLResponse<T>;
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
