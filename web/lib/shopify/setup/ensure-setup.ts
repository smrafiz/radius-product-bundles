"use server";

/**
 * Ensure Setup Service
 *
 * Lazily ensures app setup is complete.
 */

import {
    CheckMetafieldDefinitionDocument,
    CheckMetafieldDefinitionQuery,
    MetafieldDefinitionCreateDocument,
    MetafieldDefinitionCreateMutation,
} from "@/lib/graphql/generated/graphql";
import { handleSessionToken } from "@/lib/shopify";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";
import { isMetafieldSetupDone, markMetafieldSetupDone } from "@/shared";

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";

/**
 * Ensures metafield definition exists
 * Checks database first, only calls Shopify API if needed
 */
export async function ensureMetafieldDefinition(
    sessionToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { session: { shop } } = await handleSessionToken(sessionToken);

        // Check the database flag first
        if (await isMetafieldSetupDone(shop)) {
            return { success: true };
        }

        // Flag not set - check Shopify API
        const checkResult = await executeGraphQLQuery<CheckMetafieldDefinitionQuery>({
            query: CheckMetafieldDefinitionDocument,
            variables: {},
            sessionToken,
        });

        if (checkResult.data?.metafieldDefinitions?.edges?.length) {
            // Definition exists
            await markMetafieldSetupDone(shop);
            return { success: true };
        }

        // Create the metafield definition
        const createResult = await executeGraphQLMutation<MetafieldDefinitionCreateMutation>({
            query: MetafieldDefinitionCreateDocument,
            variables: {
                definition: {
                    name: "Bundle IDs",
                    namespace: METAFIELD_NAMESPACE,
                    key: METAFIELD_KEY,
                    type: "list.single_line_text_field",
                    ownerType: "PRODUCT",
                    description: "List of bundle IDs that include this product",
                    pin: false,
                },
            },
            sessionToken,
        });

        const userErrors = createResult.data?.metafieldDefinitionCreate?.userErrors || [];

        if (userErrors.length > 0) {
            const alreadyExists = userErrors.some(
                (e) => e.code === "TAKEN" || e.message?.includes("already exists")
            );

            if (alreadyExists) {
                await markMetafieldSetupDone(shop);
                return { success: true };
            }

            return { success: false, error: userErrors[0].message ?? "Unknown error" };
        }

        // Success - save flag
        console.log("[EnsureSetup] Created metafield definition for", shop);
        await markMetafieldSetupDone(shop);
        return { success: true };
    } catch (error) {
        console.error("[EnsureSetup] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}