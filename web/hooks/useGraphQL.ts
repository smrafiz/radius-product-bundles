import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { request } from "graphql-request";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

import { type TypedDocumentNode } from "@graphql-typed-document-node/core";

const url = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

interface UseGraphQLReturn<TResult> {
    data?: TResult;
    loading: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
}

export function useGraphQL<TResult, TVariables extends object>(
    document: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseGraphQLReturn<TResult> {
    const queryKey = [(document.definitions[0] as any).name?.value ?? "GraphQLQuery", variables];
    const query = useQuery({
        queryKey,
        queryFn: async ({ queryKey }) => {
            const [, vars] = queryKey as [string, TVariables | undefined];

            // Use type assertion and handle variables explicitly
            return request<TResult, TVariables>(
                url,
                document,
                ...(vars !== undefined ? [vars] : []) as any
            );
        },
        staleTime: 1000 * 60 * 5,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });

    const refetch = useCallback(() => {
        void query.refetch();
    }, [query]);

    return {
        data: query.data,
        loading: query.isLoading,
        error: query.error,
        isLoading: query.isLoading,
        refetch,
    };
}