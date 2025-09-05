"use client";

import { print } from "graphql";
import { useCallback } from "react";
import { queryKey } from "@/utils";
import { GraphQLClient } from "graphql-request";
import { useAppBridge } from "@shopify/app-bridge-react";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SHOPIFY_GRAPHQL_URL = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

interface UseGraphQLReturn<TResult> {
    data?: TResult;
    loading: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
}

/**
 * Generic GraphQL query hook using App Bridge
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
            if (!app) {
                throw new Error("App Bridge instance not found");
            }

            const gqlString = print(document);
            if (!gqlString) {
                throw new Error("GraphQL document string is empty");
            }

            // ✅ Use app.fetch instead of GraphQLClient for shopify: URLs
            const response = await app.fetch(`shopify:admin/api/${LATEST_API_VERSION}/graphql.json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: gqlString,
                    variables: variables || {},
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GraphQL Error (${response.status}): ${errorText}`);
            }

            const result = await response.json();

            // Check for GraphQL errors
            if (result.errors && result.errors.length > 0) {
                throw new Error(`GraphQL Errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
            }

            return result.data;
        },
        staleTime: 1000 * 60 * 5,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });

    const refetch = useCallback(() => void query.refetch(), [query]);

    return {
        data: query.data,
        loading: query.isLoading,
        error: query.error,
        isLoading: query.isLoading,
        refetch,
    };
}

/**
 * Generic GraphQL mutation hook using App Bridge
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
        onSuccess?: (data: TResult) => void;
    },
) {
    const app = useAppBridge();
    const queryClient = useQueryClient();

    return useMutation<TResult, Error, TVariables>({
        mutationFn: async (variables: TVariables) => {
            if (!app) {
                throw new Error("App Bridge instance not found");
            }

            const token = await app.idToken();
            const headers = { Authorization: `Bearer ${token}` };
            const gqlString = print(document);

            if (!gqlString) {
                throw new Error("GraphQL document string is empty");
            }

            const client = new GraphQLClient(SHOPIFY_GRAPHQL_URL, { headers });

            return (client.request as any)(gqlString, variables);
        },
        onSuccess: (data) => {
            if (options?.invalidate) {
                for (const { document, variables } of options.invalidate) {
                    const key = queryKey(document, variables);
                    void queryClient.invalidateQueries({ queryKey: key });
                }
            }
            options?.onSuccess?.(data);
        },
    });
}
