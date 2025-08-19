import { request } from "graphql-request";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { useQuery } from "@tanstack/react-query";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useCallback } from "react";

const url = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

interface UseGraphQLReturn<TResult> {
    data?: TResult;
    loading: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
}

export function useGraphQL<TResult, TVariables>(
    document: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseGraphQLReturn<TResult> {
    const queryKey = [(document.definitions[0] as any).name?.value ?? "GraphQLQuery", variables];

    const query = useQuery({
        queryKey,
        queryFn: async ({ queryKey }) => {
            const [, vars] = queryKey as [string, TVariables | undefined];
            return request<TResult, TVariables>(url, document, vars);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const refetch = useCallback(() => {
        query.refetch();
    }, [query]);

    return {
        data: query.data,
        loading: query.isLoading,
        error: query.error,
        isLoading: query.isLoading,
        refetch,
    };
}