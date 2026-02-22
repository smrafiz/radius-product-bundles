"use server";

/**
 * Ensure Setup Service
 *
 * Lazily ensures app setup is complete when the app loads.
 * This provides a safety net in case installation-time setup fails.
 */

import {
    isMetafieldSetupDone,
    markMetafieldSetupDone,
    isDiscountSetupDone,
    markDiscountSetupDone,
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
import { METAFIELD_DEFINITIONS } from "@/shared/constants/metafields.constants";

const BUNDLE_DISCOUNT_TITLE = "Radius Bundle Discounts";
const BUNDLE_DISCOUNT_FUNCTION_HANDLE = "radius-discount-function";

/**
 * Ensures metafield definitions exist.
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

        // Create missing metafield definitions
        // This is a fallback - normally done during app setup
        console.log("[EnsureSetup] Creating missing metafield definitions...");

        for (const definition of METAFIELD_DEFINITIONS) {
            const createResult =
                await executeGraphQLMutation<MetafieldDefinitionCreateMutation>(
                    {
                        query: MetafieldDefinitionCreateDocument,
                        variables: { definition },
                        sessionToken,
                    },
                );

            const userErrors =
                createResult.data?.metafieldDefinitionCreate?.userErrors || [];

            if (userErrors.length > 0) {
                const alreadyExists = userErrors.some(
                    (e) =>
                        e.code === "TAKEN" ||
                        e.message?.includes("already exists"),
                );

                if (!alreadyExists) {
                    console.error(
                        `[EnsureSetup] Failed to create ${definition.key}:`,
                        userErrors[0]?.message,
                    );
                }
            } else {
                console.log(`[EnsureSetup] ✓ Created ${definition.key}`);
            }

            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        console.log("[EnsureSetup] Created metafield definitions for", shop);
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
 */
export async function ensureBundleDiscount(
    sessionToken: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        if (await isDiscountSetupDone(shop)) {
            return { success: true };
        }

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
            await markDiscountSetupDone(shop);
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
        await markDiscountSetupDone(shop);
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
    const [metafieldResult, discountResult] = await Promise.all([
        ensureMetafieldDefinition(sessionToken),
        ensureBundleDiscount(sessionToken),
    ]);

    const errors: string[] = [];
    if (!metafieldResult.success && metafieldResult.error) {
        errors.push(`Metafield: ${metafieldResult.error}`);
    }
    if (!discountResult.success && discountResult.error) {
        errors.push(`Discount: ${discountResult.error}`);
    }

    return {
        success: errors.length === 0,
        errors,
    };
}
