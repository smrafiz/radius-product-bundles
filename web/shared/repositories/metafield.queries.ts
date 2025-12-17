import {
    SetActiveBundlesMetafieldDocument,
    SetActiveBundlesMetafieldMutation,
    GetShopIdDocument,
    GetShopIdQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";

/**
 * Fetches the shop's GID for metafield ownership.
 *
 * @param sessionToken - Session token for authentication.
 * @returns Shop GID or null if not found.
 */
export async function findShopId(sessionToken: string): Promise<string | null> {
    const result = await executeGraphQLQuery<GetShopIdQuery>({
        query: GetShopIdDocument,
        variables: {},
        sessionToken,
    });

    return result.data?.shop?.id || null;
}

/**
 * Sets the active bundles metafield on the shop.
 *
 * @param sessionToken - Session token for authentication.
 * @param shopId - Shop GID.
 * @param value - JSON string of bundle configurations.
 * @returns Result with success status and any errors.
 */
export async function setActiveBundlesMetafield(
    sessionToken: string,
    shopId: string,
    value: string,
): Promise<{ success: boolean; error?: string }> {
    const result =
        await executeGraphQLMutation<SetActiveBundlesMetafieldMutation>({
            query: SetActiveBundlesMetafieldDocument,
            variables: {
                ownerId: shopId,
                value,
            },
            sessionToken,
        });

    const userErrors = result.data?.metafieldsSet?.userErrors || [];

    if (userErrors.length > 0) {
        return {
            success: false,
            error: userErrors[0].message || "Unknown error",
        };
    }

    return { success: true };
}
