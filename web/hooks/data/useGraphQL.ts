"use client";

import { print } from "graphql";
import { useCallback } from "react";
import { queryKey } from "@/utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { executeGraphQLQuery, executeGraphQLMutation } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

interface UseGraphQLReturn<TResult> {
    data?: TResult;
    loading: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
}

interface UseGraphQLOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean | "always";
    refetchOnWindowFocus?: boolean;
}

/**
 * Generic GraphQL query hook using Server Actions
 */
export function useGraphQL<TResult = any, TVariables extends object = any>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables?: TVariables,
    options?: UseGraphQLOptions,
): UseGraphQLReturn<TResult> {
    const app = useAppBridge();
    const key = queryKey(
        document,
        variables as [string, TVariables | undefined],
    );

    const query = useQuery<TResult, Error>({
        queryKey: key,
        enabled: options?.enabled !== false,
        queryFn: async () => {
            if (!app) {
                throw new Error("App Bridge instance not found");
            }

            const sessionToken = await app.idToken();
            const gqlString = print(document);

            if (!gqlString) {
                throw new Error("GraphQL document string is empty");
            }

            const result = await executeGraphQLQuery<TResult>({
                query: gqlString,
                variables: variables || {},
                sessionToken,
            });

            if (result.errors && result.errors.length > 0) {
                throw new Error(
                    `GraphQL Error: ${result.errors.map((e) => e.message).join(", ")}`,
                );
            }

            if (!result.data) {
                throw new Error("No data returned from GraphQL query");
            }

            return result.data;
        },
        staleTime: options?.staleTime ?? 1000 * 60 * 5,
        refetchOnMount: options?.refetchOnMount ?? "always",
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
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
 * Generic GraphQL mutation hook using Server Actions
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
        onError?: (error: Error) => void;
    },
) {
    const app = useAppBridge();
    const queryClient = useQueryClient();

    return useMutation<TResult, Error, TVariables>({
        mutationFn: async (variables: TVariables) => {
            if (!app) {
                throw new Error("App Bridge instance not found");
            }

            const sessionToken = await app.idToken();
            const gqlString = print(document);

            if (!gqlString) {
                throw new Error("GraphQL document string is empty");
            }

            const result = await executeGraphQLMutation<TResult>({
                query: gqlString,
                variables: variables || {},
                sessionToken,
            });

            if (result.errors && result.errors.length > 0) {
                throw new Error(
                    `GraphQL Mutation Error: ${result.errors.map((e) => e.message).join(", ")}`,
                );
            }

            if (!result.data) {
                throw new Error("No data returned from GraphQL mutation");
            }

            return result.data;
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
        onError: options?.onError,
    });
}
