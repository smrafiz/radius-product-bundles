import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export interface GraphQLRequest<TResult = any, TVariables = any> {
    query: string | TypedDocumentNode<TResult, TVariables>;
    variables?: TVariables;
    sessionToken?: string;
    /** Direct auth: shop domain (e.g. "mystore.myshopify.com") — used by cron/background jobs */
    shop?: string;
    /** Direct auth: offline access token — used by cron/background jobs */
    accessToken?: string;
    /** Internal: prevents infinite retry on 401 */
    _retried?: boolean;
}

export interface GraphQLResponse<T = any> {
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

export interface ProxyGraphQLResponse<T = any> {
    data?: T;
    loading: boolean;
    error: Error | null;
}
