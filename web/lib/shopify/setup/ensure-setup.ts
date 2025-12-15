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
    CreateBundleDiscountsDocument,
    CreateBundleDiscountsMutation,
    CheckBundleDiscountsExistDocument,
    CheckBundleDiscountsExistQuery,
} from "@/lib/graphql/generated/graphql";
import { handleSessionToken } from "@/lib/shopify";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";

const BUNDLE_PRODUCT_DISCOUNT_TITLE = "Radius Bundle Discounts";
const BUNDLE_SHIPPING_DISCOUNT_TITLE = "Radius Bundle Free Shipping";
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
        console.error("[EnsureSetup] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Ensures both bundle automatic discounts exist (Product + Shipping).
 * Creates missing ones in a single API call.
 */
export async function ensureBundleDiscounts(
    sessionToken: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check which discounts exist
        const checkResult =
            await executeGraphQLQuery<CheckBundleDiscountsExistQuery>({
                query: CheckBundleDiscountsExistDocument,
                variables: {
                    productQuery: `title:"${BUNDLE_PRODUCT_DISCOUNT_TITLE}"`,
                    shippingQuery: `title:"${BUNDLE_SHIPPING_DISCOUNT_TITLE}"`,
                },
                sessionToken,
            });

        const productExists =
            (checkResult.data?.productDiscount?.edges?.length ?? 0) > 0;
        const shippingExists =
            (checkResult.data?.shippingDiscount?.edges?.length ?? 0) > 0;

        if (productExists && shippingExists) {
            return { success: true };
        }

        // Create both discounts
        const createResult =
            await executeGraphQLMutation<CreateBundleDiscountsMutation>({
                query: CreateBundleDiscountsDocument,
                variables: {
                    productDiscount: {
                        title: BUNDLE_PRODUCT_DISCOUNT_TITLE,
                        functionHandle: BUNDLE_DISCOUNT_FUNCTION_HANDLE,
                        discountClasses: ["PRODUCT"],
                        startsAt: new Date().toISOString(),
                        combinesWith: {
                            productDiscounts: false,
                            orderDiscounts: false,
                            shippingDiscounts: true,
                        },
                    },
                    shippingDiscount: {
                        title: BUNDLE_SHIPPING_DISCOUNT_TITLE,
                        functionHandle: BUNDLE_DISCOUNT_FUNCTION_HANDLE,
                        discountClasses: ["SHIPPING"],
                        startsAt: new Date().toISOString(),
                        combinesWith: {
                            productDiscounts: true,
                            orderDiscounts: false,
                            shippingDiscounts: false,
                        },
                    },
                },
                sessionToken,
            });

        const productErrors =
            createResult.data?.productDiscount?.userErrors || [];
        const shippingErrors =
            createResult.data?.shippingDiscount?.userErrors || [];

        const realErrors = [...productErrors, ...shippingErrors].filter(
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

        console.log("[EnsureSetup] Created bundle discounts");
        return { success: true };
    } catch (error) {
        console.error("[EnsureSetup] Error ensuring bundle discounts:", error);
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

    // Ensure bundle discounts (Product + Shipping)
    const discountResult = await ensureBundleDiscounts(sessionToken);
    if (!discountResult.success && discountResult.error) {
        errors.push(`Discount: ${discountResult.error}`);
    }

    return {
        success: errors.length === 0,
        errors,
    };
}
