"use server";

import shopify from '@/lib/shopify/initialize-context';
import { handleSessionToken } from '@/lib/shopify/verify';

interface GraphQLRequest {
    query: string;
    variables?: Record<string, any>;
    sessionToken: string;
}

interface GraphQLResponse<T = any> {
    data?: T;
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
        path?: Array<string | number>;
        extensions?: Record<string, any>;
    }>;
    extensions?: {
        cost?: {
            requestedQueryCost: number;
            actualQueryCost: number;
            throttleStatus: {
                maximumAvailable: number;
                currentlyAvailable: number;
                restoreRate: number;
            };
        };
    };
}

/**
 * Official Shopify GraphQL Server Action
 * Uses your existing shopify instance from initialize-context.ts
 *
 * Create at: /web/actions/graphql.action.ts
 */
export async function executeShopifyGraphQL<T = any>(
    request: GraphQLRequest
): Promise<GraphQLResponse<T>> {
    try {
        console.log("🚀 Official Shopify GraphQL Action started");

        const { query, variables = {}, sessionToken } = request;

        if (!sessionToken) {
            throw new Error("Session token is required");
        }

        if (!query) {
            throw new Error("GraphQL query is required");
        }

        console.log("🔐 Exchanging session token for access token...");

        // Use your existing session token exchange
        const { session } = await handleSessionToken(sessionToken, false, false);

        if (!session) {
            throw new Error("Failed to get valid session from token");
        }

        if (!session.accessToken) {
            throw new Error("No access token found in session");
        }

        console.log("✅ Valid session obtained");
        console.log("🏪 Shop:", session.shop);
        console.log("🔑 Access token available");

        // Create official Shopify GraphQL client using your existing shopify instance
        const client = new shopify.clients.Graphql({ session });

        console.log("📝 Executing GraphQL query with official client...");
        console.log("Query preview:", query.slice(0, 100) + "...");

        // Execute query using official Shopify client
        const response = await client.query({
            data: query,
            variables: variables
        });

        console.log("✅ GraphQL query successful");
        console.log("📊 Response status:", response.status);

        // Handle successful response
        if (response.body) {
            const result = response.body as any;

            // Log query cost information if available
            if (result.extensions?.cost) {
                console.log("💰 Query Cost Info:", {
                    requested: result.extensions.cost.requestedQueryCost,
                    actual: result.extensions.cost.actualQueryCost,
                    available: result.extensions.cost.throttleStatus.currentlyAvailable,
                    maximum: result.extensions.cost.throttleStatus.maximumAvailable
                });
            }

            return {
                data: result.data,
                errors: result.errors,
                extensions: result.extensions
            };
        }

        throw new Error("No response body received from Shopify GraphQL API");

    } catch (error) {
        console.error("❌ Official Shopify GraphQL error:", error);

        // Handle different types of errors
        if (error && typeof error === 'object' && 'response' in error) {
            const shopifyError = error as any;

            // Handle Shopify API errors
            if (shopifyError.response?.status) {
                const status = shopifyError.response.status;
                let errorMessage = `Shopify API Error (${status})`;

                switch (status) {
                    case 401:
                        errorMessage = "Authentication failed - invalid access token";
                        break;
                    case 402:
                        errorMessage = "Shop payment required - store is frozen";
                        break;
                    case 403:
                        errorMessage = "Access forbidden - insufficient permissions";
                        break;
                    case 404:
                        errorMessage = "Resource not found";
                        break;
                    case 423:
                        errorMessage = "Shop locked - rate limit exceeded";
                        break;
                    case 429:
                        errorMessage = "Rate limit exceeded";
                        break;
                    case 502:
                        errorMessage = "Bad Gateway - Shopify server error";
                        break;
                    case 503:
                        errorMessage = "Service Unavailable - Shopify maintenance";
                        break;
                }

                return {
                    errors: [{
                        message: errorMessage,
                        extensions: {
                            code: `HTTP_${status}`,
                            httpStatus: status,
                            timestamp: new Date().toISOString()
                        }
                    }]
                };
            }

            // Handle GraphQL errors from response body
            if (shopifyError.response?.body?.errors) {
                return {
                    errors: shopifyError.response.body.errors
                };
            }
        }

        // Handle session/auth errors
        if (error instanceof Error) {
            if (error.message.includes('Session') || error.message.includes('token')) {
                return {
                    errors: [{
                        message: "Authentication failed - please refresh the app",
                        extensions: {
                            code: 'AUTH_ERROR',
                            type: 'session_error'
                        }
                    }]
                };
            }
        }

        // Generic error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown GraphQL error occurred';

        return {
            errors: [{
                message: errorMessage,
                extensions: {
                    code: 'INTERNAL_ERROR',
                    timestamp: new Date().toISOString()
                }
            }]
        };
    }
}

/**
 * Official Shopify GraphQL Mutation Server Action
 * Optimized for mutations with proper error handling
 */
export async function executeShopifyMutation<T = any>(
    request: GraphQLRequest
): Promise<GraphQLResponse<T>> {
    console.log("🚀 Official Shopify GraphQL Mutation");

    // Mutations use the same official client
    const result = await executeShopifyGraphQL<T>(request);

    // Additional mutation-specific logging
    if (result.data) {
        console.log("✅ Mutation completed successfully");
    }

    if (result.errors) {
        console.error("❌ Mutation failed with errors:", result.errors);
    }

    return result;
}