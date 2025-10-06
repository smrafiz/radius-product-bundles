import { handleSessionToken } from "@/lib/shopify/verify";

declare module "*.graphql" {
    import { DocumentNode } from "graphql";

    const Schema: DocumentNode;
    export default Schema;
}

export interface GraphQLRequest<TResult = any, TVariables = any> {
    query: string | TypedDocumentNode<TResult, TVariables>;
    variables?: TVariables;
    sessionToken: string;
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
