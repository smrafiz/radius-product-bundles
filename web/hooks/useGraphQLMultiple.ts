import { request } from "graphql-request";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";

const url = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

export function useGraphQLMultiple<T1, V1, T2, V2>(
    queries: [
        { document: TypedDocumentNode<T1, V1>; variables: V1; key: string },
        { document: TypedDocumentNode<T2, V2>; variables: V2; key: string }
    ]
): [UseQueryResult<T1>, UseQueryResult<T2>] {
    const results = useQueries({
        queries: queries.map(({ document, variables, key }) => ({
            queryKey: [key, variables],
            queryFn: async () => {
                return request<any, any>(url, document, variables);
            },
        })),
    });

    return results as [UseQueryResult<T1>, UseQueryResult<T2>];
}