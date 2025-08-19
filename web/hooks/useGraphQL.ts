import { request } from "graphql-request";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";

const url = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

export function useGraphQL<TResult, TVariables>(
    document: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
    return useQuery({
        queryKey: [(document.definitions[0] as any).name?.value ?? "GraphQLQuery", variables],
        queryFn: async ({ queryKey }) => {
            const [, vars] = queryKey as [string, TVariables | undefined];
            return request<TResult, TVariables>(url, document, vars);
        },
    });
}