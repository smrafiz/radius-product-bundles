"use server";

/**
 * Ensure Setup Service
 *
 * Lazily ensures app setup is complete when the app loads.
 * This provides a safety net in case installation-time setup fails.
 *
 * Uses database flags to avoid unnecessary API calls on subsequent loads.
 */

import {
    isMetafieldSetupDone,
    markMetafieldSetupDone,
} from "@/shared/repositories";
import {
    CheckMetafieldDefinitionDocument,
    CheckMetafieldDefinitionQuery,
    MetafieldDefinitionCreateDocument,
    MetafieldDefinitionCreateMutation,
    CreateBundleAutomaticDiscountDocument,
    CreateBundleAutomaticDiscountMutation,
    CheckBundleDiscountExistsDocument,
    CheckBundleDiscountExistsQuery,
} from "@/lib/graphql/generated/graphql";
import { handleSessionToken } from "@/lib/shopify";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";

/**
 * Title for the single automatic discount.
 * This discount handles both PRODUCT and SHIPPING classes.
 */
const BUNDLE_DISCOUNT_TITLE = "Radius Bundle Discounts";

/**
 * Function handle defined in shopify.extension.toml.
 */
const BUNDLE_DISCOUNT_FUNCTION_HANDLE = "radius-discount-function";

/**
 * Ensures metafield definition exists.
 * Checks database flag first to avoid unnecessary API calls.
 *
 * @param sessionToken - Session token for authentication.
 * @returns Result indicating success or failure.
 */
export async function ensureMetafieldDefinition(
    sessionToken: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Check the database flag first (fast path)
        if (await isMetafieldSetupDone(shop)) {
            return { success: true };
        }

        // Flag not set - check Shopify API
        const checkResult =
            await executeGraphQLQuery<CheckMetafieldDefinitionQuery>({
                query: CheckMetafieldDefinitionDocument,
                variables: {},
                sessionToken,
            });

        if (checkResult.data?.metafieldDefinitions?.edges?.length) {
            // Definition exists - update database flag
            await markMetafieldSetupDone(shop);
            return { success: true };
        }

        // Create the metafield definition
        const createResult =
            await executeGraphQLMutation<MetafieldDefinitionCreateMutation>({
                query: MetafieldDefinitionCreateDocument,
                variables: {
                    definition: {
                        name: "Bundle IDs",
                        namespace: METAFIELD_NAMESPACE,
                        key: METAFIELD_KEY,
                        type: "list.single_line_text_field",
                        ownerType: "PRODUCT",
                        description:
                            "List of bundle IDs that include this product",
                        pin: false,
                    },
                },
                sessionToken,
            });

        const userErrors =
            createResult.data?.metafieldDefinitionCreate?.userErrors || [];

        if (userErrors.length > 0) {
            const alreadyExists = userErrors.some(
                (e) =>
                    e.code === "TAKEN" || e.message?.includes("already exists"),
            );

            if (alreadyExists) {
                await markMetafieldSetupDone(shop);
                return { success: true };
            }

            return {
                success: false,
                error: userErrors[0].message ?? "Unknown error",
            };
        }

        console.log("[EnsureSetup] Created metafield definition for", shop);
        await markMetafieldSetupDone(shop);
        return { success: true };
    } catch (error) {
        console.error("[EnsureSetup] Error ensuring metafield:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Ensures the bundle automatic discount exists.
 * Creates it if missing.
 *
 * Per Shopify's Discount Function API documentation:
 * "A single Function processes one discount (either code-based or automatic),
 * but can apply savings across three discount classes: product, order, and shipping."
 *
 * @param sessionToken - Session token for authentication.
 * @returns Result indicating success or failure.
 */
export async function ensureBundleDiscount(
    sessionToken: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if discount already exists
        const checkResult =
            await executeGraphQLQuery<CheckBundleDiscountExistsQuery>({
                query: CheckBundleDiscountExistsDocument,
                variables: {
                    query: `title:"${BUNDLE_DISCOUNT_TITLE}"`,
                },
                sessionToken,
            });

        const existingDiscount =
            checkResult.data?.discountNodes?.edges?.[0]?.node;

        if (existingDiscount) {
            // Discount already exists
            return { success: true };
        }

        // Create single discount with both PRODUCT and SHIPPING classes
        const createResult =
            await executeGraphQLMutation<CreateBundleAutomaticDiscountMutation>(
                {
                    query: CreateBundleAutomaticDiscountDocument,
                    variables: {
                        discount: {
                            title: BUNDLE_DISCOUNT_TITLE,
                            functionHandle: BUNDLE_DISCOUNT_FUNCTION_HANDLE,
                            discountClasses: ["PRODUCT", "SHIPPING"],
                            startsAt: new Date().toISOString(),
                            combinesWith: {
                                productDiscounts: false,
                                orderDiscounts: false,
                                shippingDiscounts: false,
                            },
                        },
                    },
                    sessionToken,
                },
            );

        const userErrors =
            createResult.data?.discountAutomaticAppCreate?.userErrors || [];

        // Filter out "already exists" errors (race condition handling)
        const realErrors = userErrors.filter(
            (e) =>
                e.code !== "TAKEN" &&
                !e.message?.includes("already exists") &&
                !e.message?.includes("already been taken"),
        );

        if (realErrors.length > 0) {
            return {
                success: false,
                error: realErrors[0].message ?? "Unknown error",
            };
        }

        console.log("[EnsureSetup] Created bundle discount");
        return { success: true };
    } catch (error) {
        console.error("[EnsureSetup] Error ensuring bundle discount:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Ensures all app setup is complete.
 * Call this on app load to guarantee everything is ready.
 *
 * @param sessionToken - Session token for authentication.
 * @returns Result with overall success and any errors encountered.
 */
export async function ensureAppSetup(
    sessionToken: string,
): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Ensure metafield definition
    const metafieldResult = await ensureMetafieldDefinition(sessionToken);
    if (!metafieldResult.success && metafieldResult.error) {
        errors.push(`Metafield: ${metafieldResult.error}`);
    }

    // Ensure bundle discount (single discount for both product and shipping)
    const discountResult = await ensureBundleDiscount(sessionToken);
    if (!discountResult.success && discountResult.error) {
        errors.push(`Discount: ${discountResult.error}`);
    }

    return {
        success: errors.length === 0,
        errors,
    };
}
