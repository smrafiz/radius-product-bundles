"use server";

import { DocumentNode, print } from "graphql";
import {
    DeleteBundleAutomaticDiscountDocument,
    DeleteBundleAutomaticDiscountMutation,
    GetBundleDiscountIdDocument,
    GetBundleDiscountIdQuery,
    GetProductsWithBundleMetafieldDocument,
    GetProductsWithBundleMetafieldQuery,
    GetShopMetafieldsDocument,
    GetShopMetafieldsQuery,
    MetafieldsDeleteDocument,
    MetafieldsDeleteMutation,
} from "@/lib/graphql/generated/graphql";
import {
    BUNDLE_DISCOUNT_TITLE,
    METAFIELD_KEYS,
    METAFIELD_NAMESPACE,
} from "@/shared/constants/metafields.constants";
import { SHOPIFY_API_VERSION } from "@/shared/constants";

async function gql<T>(
    document: DocumentNode,
    variables: Record<string, unknown>,
    accessToken: string,
    shop: string,
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
    const endpoint = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query: print(document), variables }),
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
    }

    return response.json();
}

export async function cleanupShopifyResources(
    accessToken: string,
    shop: string,
): Promise<void> {
    console.log(`[Shopify Cleanup] Starting stale data cleanup for ${shop}`);

    const results = await Promise.allSettled([
        deleteShopMetafields(accessToken, shop),
        deleteAllProductBundleMetafields(accessToken, shop),
        deleteStaleDiscount(accessToken, shop),
    ]);

    for (const r of results) {
        if (r.status === "rejected") {
            console.error(`[Shopify Cleanup] Partial failure:`, r.reason);
        }
    }

    console.log(`[Shopify Cleanup] Cleanup finished for ${shop}`);
}

async function deleteShopMetafields(
    accessToken: string,
    shop: string,
): Promise<void> {
    const result = await gql<GetShopMetafieldsQuery>(
        GetShopMetafieldsDocument,
        {},
        accessToken,
        shop,
    );

    const shopData = result.data?.shop;
    if (!shopData) return;

    const metafieldsToDelete: {
        ownerId: string;
        namespace: string;
        key: string;
    }[] = [];

    if (shopData.activeBundles?.id) {
        metafieldsToDelete.push({
            ownerId: shopData.id,
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEYS["ACTIVE_BUNDLES"],
        });
    }

    if (shopData.globalSettings?.id) {
        metafieldsToDelete.push({
            ownerId: shopData.id,
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEYS["GLOBAL_SETTINGS"],
        });
    }

    if (metafieldsToDelete.length === 0) return;

    const deleteResult = await gql<MetafieldsDeleteMutation>(
        MetafieldsDeleteDocument,
        { metafields: metafieldsToDelete },
        accessToken,
        shop,
    );

    const errors = deleteResult.data?.metafieldsDelete?.userErrors || [];
    if (errors.length > 0) {
        console.error("[Shopify Cleanup] Shop metafield delete errors:", errors);
    } else {
        console.log(
            `[Shopify Cleanup] Deleted ${metafieldsToDelete.length} shop metafields`,
        );
    }
}

async function deleteAllProductBundleMetafields(
    accessToken: string,
    shop: string,
): Promise<void> {
    let cursor: string | null = null;
    let totalDeleted = 0;
    let hasNextPage = true;

    while (hasNextPage) {
        const result: { data?: GetProductsWithBundleMetafieldQuery; errors?: Array<{ message: string }> } = await gql<GetProductsWithBundleMetafieldQuery>(
            GetProductsWithBundleMetafieldDocument,
            { cursor },
            accessToken,
            shop,
        );

        const edges = result.data?.products?.edges || [];
        const pageInfo = result.data?.products?.pageInfo;

        const metafieldsToDelete = edges
            .filter((e) => e.node.metafield?.id)
            .map((e) => ({
                ownerId: e.node.id,
                namespace: METAFIELD_NAMESPACE,
                key: METAFIELD_KEYS["BUNDLE_IDS"],
            }));

        if (metafieldsToDelete.length > 0) {
            const deleteResult = await gql<MetafieldsDeleteMutation>(
                MetafieldsDeleteDocument,
                { metafields: metafieldsToDelete },
                accessToken,
                shop,
            );

            const errors =
                deleteResult.data?.metafieldsDelete?.userErrors || [];
            if (errors.length > 0) {
                console.error(
                    "[Shopify Cleanup] Product metafield delete errors:",
                    errors,
                );
            }
            totalDeleted += metafieldsToDelete.length;
        }

        hasNextPage = pageInfo?.hasNextPage ?? false;
        cursor = pageInfo?.endCursor ?? null;
    }

    console.log(
        `[Shopify Cleanup] Deleted bundle_ids metafield from ${totalDeleted} products`,
    );
}

async function deleteStaleDiscount(
    accessToken: string,
    shop: string,
): Promise<void> {
    const result = await gql<GetBundleDiscountIdQuery>(
        GetBundleDiscountIdDocument,
        { query: `title:"${BUNDLE_DISCOUNT_TITLE}"` },
        accessToken,
        shop,
    );

    const discountId = result.data?.discountNodes?.edges?.[0]?.node?.id;
    if (!discountId) {
        console.log("[Shopify Cleanup] No stale discount found");
        return;
    }

    const deleteResult = await gql<DeleteBundleAutomaticDiscountMutation>(
        DeleteBundleAutomaticDiscountDocument,
        { id: discountId },
        accessToken,
        shop,
    );

    const errors = deleteResult.data?.discountAutomaticDelete?.userErrors || [];
    if (errors.length > 0) {
        console.error("[Shopify Cleanup] Discount delete errors:", errors);
    } else {
        console.log(`[Shopify Cleanup] Deleted stale discount: ${discountId}`);
    }
}
