"use client";

import request from "graphql-request";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { findSessionsByShop } from "@/lib/db/session-storage";

let cachedSession: {
    shop: string;
    accessToken: string;
    apiVersion: string;
} | null = null;

async function getSession(shop: string) {
    if (cachedSession?.shop === shop) return cachedSession;

    const sessions = await findSessionsByShop(shop);
    if (!sessions?.[0] || !sessions[0].accessToken)
        throw new Error("No active session found");

    const session = {
        shop,
        accessToken: sessions[0].accessToken!,
        apiVersion: LATEST_API_VERSION,
    };

    cachedSession = session;
    return session;
}

async function graphqlRequest<TResult, TVariables>(
    url: string,
    document: TypedDocumentNode<TResult, TVariables>,
    variables: TVariables,
    headers: Record<string, string>
) {
    // @ts-ignore graphql-request v5 typing issue workaround
    return await request(url, document, variables, headers) as Promise<TResult>;
}

export function useGraphQL<TResult, TVariables extends Record<string, any> = Record<string, any>>(
    document: TypedDocumentNode<TResult, TVariables>,
    shop: string,
    variables?: TVariables
): UseQueryResult<TResult, Error> {
    return useQuery<TResult, Error>({
        queryKey: [(document.definitions[0] as any).name.value, shop, variables],
        queryFn: async () => {
            const { shop: domain, accessToken, apiVersion } = await getSession(shop);
            const url = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

            return graphqlRequest(url, document, variables ?? ({} as TVariables), {
                "X-Shopify-Access-Token": accessToken,
            });
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!shop,
    });
}
