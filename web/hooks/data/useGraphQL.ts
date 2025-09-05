"use client";

import { print } from "graphql";
import { queryKey } from "@/utils";
import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { executeShopifyGraphQL, executeShopifyMutation } from "@/actions/graphql.action";

interface UseGraphQLReturn<TResult> {
    data?: TResult;
    loading: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
    queryStatus: 'pending' | 'error' | 'success';
}

interface GraphQLError {
    message: string;
    extensions?: {
        code?: string;
        httpStatus?: number;
        cost?: any;
    };
}

/**
 * Official Shopify GraphQL Query Hook
 * Uses the official @shopify/shopify-api client via server actions
 *
 * Features:
 * ✅ Official Shopify GraphQL client
 * ✅ App Bridge v4 integration
 * ✅ TanStack Query caching & background updates
 * ✅ TypeScript support with generated types
 * ✅ Comprehensive error handling
 * ✅ Query cost monitoring
 * ✅ Automatic retries with exponential backoff
 */
export function useGraphQL<TResult = any, TVariables extends object = any>(
    document: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseGraphQLReturn<TResult> {
    const app = useAppBridge();
    const key = queryKey(
        document,
        variables as [string, TVariables | undefined],
    );

    const query = useQuery<TResult, Error>({
        queryKey: key,
        queryFn: async () => {
            console.log("🚀 Shopify GraphQL Query (Official Client)");

            if (!app) {
                throw new Error("App Bridge instance not found - ensure app is properly embedded");
            }

            // Get session token from App Bridge
            const sessionToken = await app.idToken();
            if (!sessionToken) {
                throw new Error("No session token available from App Bridge");
            }

            console.log("🎫 Session token obtained from App Bridge");

            // Convert GraphQL document to string
            const queryString = print(document);
            if (!queryString) {
                throw new Error("GraphQL document string is empty");
            }

            console.log("📝 Executing official Shopify GraphQL query...");

            // Execute via server action using official Shopify client
            const result = await executeShopifyGraphQL<TResult>({
                query: queryString,
                variables: variables || {},
                sessionToken,
            });

            // Handle GraphQL errors
            if (result.errors && result.errors.length > 0) {
                console.error("❌ GraphQL Errors:", result.errors);

                // Create comprehensive error message
                const errorMessages = result.errors.map(error => {
                    let msg = error.message;

                    // Add error code if available
                    if (error.extensions?.code) {
                        msg += ` (${error.extensions.code})`;
                    }

                    return msg;
                }).join('; ');

                // Check for specific error types
                const authError = result.errors.some(e =>
                    e.extensions?.code?.includes('AUTH') ||
                    e.message.includes('Authentication')
                );

                const rateLimit = result.errors.some(e =>
                    e.extensions?.code === 'THROTTLED' ||
                    e.message.includes('rate limit')
                );

                if (authError) {
                    throw new Error(`Authentication Error: ${errorMessages}`);
                } else if (rateLimit) {
                    throw new Error(`Rate Limit Error: ${errorMessages}`);
                } else {
                    throw new Error(`GraphQL Error: ${errorMessages}`);
                }
            }

            if (!result.data) {
                throw new Error("No data returned from GraphQL query");
            }

            // Log query cost information if available
            if (result.extensions?.cost) {
                console.log("💰 Query Cost:", {
                    requested: result.extensions.cost.requestedQueryCost,
                    actual: result.extensions.cost.actualQueryCost,
                    remaining: result.extensions.cost.throttleStatus.currentlyAvailable,
                    restoreRate: result.extensions.cost.throttleStatus.restoreRate
                });
            }

            console.log("✅ GraphQL query successful");
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            console.log(`🔄 Retry attempt ${failureCount} for:`, error.message);

            // Don't retry on authentication errors
            if (error.message.includes('Authentication') ||
                error.message.includes('Access forbidden') ||
                error.message.includes('invalid access token')) {
                console.log("❌ Not retrying - authentication error");
                return false;
            }

            // Don't retry on client errors (4xx)
            if (error.message.includes('Bad Request') ||
                error.message.includes('Not Found')) {
                console.log("❌ Not retrying - client error");
                return false;
            }

            // Retry up to 3 times for server errors and rate limits
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
            console.log(`⏳ Retrying in ${delay}ms...`);
            return delay;
        },
        // Enable background refetch for stale data
        refetchOnReconnect: true,
    });

    const refetch = useCallback(() => {
        console.log("🔄 Manual refetch triggered");
        return void query.refetch();
    }, [query]);

    return {
        data: query.data,
        loading: query.isLoading,
        error: query.error,
        isLoading: query.isLoading,
        refetch,
        queryStatus: query.status,
    };
}

/**
 * Official Shopify GraphQL Mutation Hook
 * Optimized for mutations with proper invalidation and success handling
 */
export function useGraphQLMutation<
    TResult = any,
    TVariables extends object = any,
>(
    document: TypedDocumentNode<TResult, TVariables>,
    options?: {
        invalidate?: Array<{
            document: TypedDocumentNode<any, any>;
            variables?: object;
        }>;
        onSuccess?: (data: TResult, variables: TVariables) => void;
        onError?: (error: Error, variables: TVariables) => void;
        onMutate?: (variables: TVariables) => void;
    },
) {
    const app = useAppBridge();
    const queryClient = useQueryClient();

    return useMutation<TResult, Error, TVariables>({
        mutationFn: async (variables: TVariables) => {
            console.log("🚀 Shopify GraphQL Mutation (Official Client)");

            if (!app) {
                throw new Error("App Bridge instance not found");
            }

            // Get session token from App Bridge
            const sessionToken = await app.idToken();
            if (!sessionToken) {
                throw new Error("No session token available for mutation");
            }

            // Convert GraphQL document to string
            const mutationString = print(document);
            if (!mutationString) {
                throw new Error("GraphQL mutation string is empty");
            }

            console.log("📝 Executing official Shopify GraphQL mutation...");

            // Execute via server action using official Shopify client
            const result = await executeShopifyMutation<TResult>({
                query: mutationString,
                variables: variables || {},
                sessionToken,
            });

            // Handle GraphQL errors
            if (result.errors && result.errors.length > 0) {
                console.error("❌ GraphQL Mutation Errors:", result.errors);

                const errorMessages = result.errors.map(error => error.message).join('; ');
                throw new Error(`GraphQL Mutation Error: ${errorMessages}`);
            }

            if (!result.data) {
                throw new Error("No data returned from GraphQL mutation");
            }

            console.log("✅ GraphQL mutation successful");
            return result.data;
        },
        onMutate: (variables) => {
            console.log("🔄 Mutation starting...");
            options?.onMutate?.(variables);
        },
        onSuccess: (data, variables) => {
            console.log("🎉 Mutation success");

            // Show success toast via App Bridge
            if (app) {
                app.toast?.show?.("Operation completed successfully");
            }

            // Invalidate related queries for fresh data
            if (options?.invalidate) {
                console.log("🔄 Invalidating related queries...");
                for (const { document, variables: queryVars } of options.invalidate) {
                    const key = queryKey(document, queryVars);
                    void queryClient.invalidateQueries({ queryKey: key });
                }
            }

            // Call user success callback
            options?.onSuccess?.(data, variables);
        },
        onError: (error, variables) => {
            console.error("💥 Mutation error:", error);

            // Show error toast via App Bridge
            if (app) {
                app.toast?.show?.(error.message, { isError: true });
            }

            // Call user error callback
            options?.onError?.(error, variables);
        },
        // Optimistic update settings
        useErrorBoundary: false,
    });
}