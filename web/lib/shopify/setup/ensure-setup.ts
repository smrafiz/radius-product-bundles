"use server";

/**
 * Ensure Setup Service
 *
 * Lazily ensures app setup is complete.
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

const BUNDLE_DISCOUNT_TITLE = "Radius Bundle Discounts";
const BUNDLE_DISCOUNT_FUNCTION_HANDLE = "radius-discount-function";

/**
 * Ensures metafield definition exists.
 * Checks database first, only calls Shopify API if needed.
 */
export async function ensureMetafieldDefinition(
    sessionToken: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Check the database flag first
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
            // Definition exists
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

/**
 * Ensures the bundle automatic discount exists.
 * Creates it if missing.
 */
export async function ensureBundleDiscount(
    sessionToken: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if the discount exists
        const checkResult =
            await executeGraphQLQuery<CheckBundleDiscountExistsQuery>({
                query: CheckBundleDiscountExistsDocument,
                variables: {
                    query: `title:${BUNDLE_DISCOUNT_TITLE}`,
                },
                sessionToken,
            });

        const edges = checkResult.data?.discountNodes?.edges || [];

        if (edges.length > 0) {
            return { success: true };
        }

        // Create the discount
        const createResult =
            await executeGraphQLMutation<CreateBundleAutomaticDiscountMutation>(
                {
                    query: CreateBundleAutomaticDiscountDocument,
                    variables: {
                        discount: {
                            title: BUNDLE_DISCOUNT_TITLE,
                            functionHandle: BUNDLE_DISCOUNT_FUNCTION_HANDLE,
                            discountClasses: ["PRODUCT"],
                            startsAt: new Date().toISOString(),
                            combinesWith: {
                                productDiscounts: false,
                                orderDiscounts: false,
                                shippingDiscounts: true,
                            },
                        },
                    },
                    sessionToken,
                },
            );

        const userErrors =
            createResult.data?.discountAutomaticAppCreate?.userErrors || [];

        if (userErrors.length > 0) {
            const alreadyExists = userErrors.some(
                (e) =>
                    e.code === "TAKEN" ||
                    e.message?.includes("already exists") ||
                    e.message?.includes("already been taken"),
            );

            if (alreadyExists) {
                return { success: true };
            }

            return {
                success: false,
                error: userErrors[0].message ?? "Unknown error",
            };
        }

        console.log("[EnsureSetup] Created bundle automatic discount");
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

    // Ensure bundle discount
    const discountResult = await ensureBundleDiscount(sessionToken);
    if (!discountResult.success && discountResult.error) {
        errors.push(`Discount: ${discountResult.error}`);
    }

    return {
        success: errors.length === 0,
        errors,
    };
}
