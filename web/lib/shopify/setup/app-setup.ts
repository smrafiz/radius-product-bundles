"use server";

/**
 * App Setup Service
 *
 * Handles one-time setup tasks during app installation.
 * - Creates metafield definitions for bundle-product relationships.
 * - Creates a single automatic discount that handles both product and shipping discounts.
 *
 * Based on Shopify's unified Discount Function API:
 * "A single Function processes one discount (either code-based or automatic),
 * but can apply savings across three discount classes: product, order, and shipping."
 *
 * @see https://shopify.dev/docs/api/functions/latest/discount
 */

import {
    CheckBundleDiscountExistsDocument,
    CheckBundleDiscountExistsQuery,
    CreateBundleAutomaticDiscountDocument,
    CreateBundleAutomaticDiscountMutation,
    MetafieldDefinitionCreateDocument,
    MetafieldDefinitionCreateMutation,
} from "@/lib/graphql/generated/graphql";
import { DocumentNode, print } from "graphql";
import { SHOPIFY_API_VERSION } from "@/shared/constants";
import {
    BUNDLE_DISCOUNT_TITLE,
    METAFIELD_DEFINITIONS,
} from "@/shared/constants/metafields.constants";
import {
    markMetafieldSetupDone,
    markDiscountSetupDone,
} from "@/shared/repositories/shop.queries";

/**
 * Function handle defined in shopify.extension.toml.
 */
const BUNDLE_DISCOUNT_FUNCTION_HANDLE = "radius-discount-function";

interface SetupResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * Executes a GraphQL request with a direct access token.
 * Used during OAuth callback before the session is established.
 *
 * @param document - GraphQL document to execute.
 * @param variables - Variables for the GraphQL operation.
 * @param accessToken - Shopify access token.
 * @param shop - Shop domain.
 * @returns GraphQL response with data and/or errors.
 */
async function executeGraphQLWithToken<T = unknown>(
    document: string | DocumentNode,
    variables: Record<string, unknown>,
    accessToken: string,
    shop: string,
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
    const endpoint = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    const query = typeof document === "string" ? document : print(document);

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Creates all required metafield definitions
 */
export async function createMetafieldDefinitions(
    accessToken: string,
    shop: string,
): Promise<SetupResult> {
    try {
        const results: { key: string; success: boolean }[] = [];

        for (const definition of METAFIELD_DEFINITIONS) {

            const createResult =
                await executeGraphQLWithToken<MetafieldDefinitionCreateMutation>(
                    MetafieldDefinitionCreateDocument,
                    { definition },
                    accessToken,
                    shop,
                );

            const userErrors =
                createResult.data?.metafieldDefinitionCreate?.userErrors || [];

            if (userErrors.length > 0) {
                const alreadyExists = userErrors.some(
                    (e) =>
                        e.code === "TAKEN" ||
                        e.message?.includes("already exists") ||
                        e.message?.includes("taken"),
                );

                if (alreadyExists) {
                    results.push({ key: definition.key, success: true });
                    continue;
                }

                console.error(
                    `[Setup] ✗ Failed to create ${definition.key}:`,
                    userErrors[0]?.message,
                );
                results.push({ key: definition.key, success: false });
                continue;
            }

            results.push({ key: definition.key, success: true });

            // Rate limiting: small delay between requests
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const successCount = results.filter((r) => r.success).length;
        const failedCount = results.length - successCount;

        if (failedCount > 0) {
            console.warn(
                `[Setup] Metafield setup: ${successCount} succeeded, ${failedCount} failed`,
            );
        }

        return {
            success: successCount > 0, // Success if at least one was created/exists
            message: `Metafield setup: ${successCount}/${results.length} definitions ready`,
        };
    } catch (error) {
        console.error("[Setup] Error creating metafield definitions:", error);
        return {
            success: false,
            message: "Error during metafield setup",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Creates a single automatic discount that handles both product and shipping discounts.
 */
export async function createBundleAutomaticDiscount(
    accessToken: string,
    shop: string,
): Promise<SetupResult> {
    try {
        // Check if discount already exists
        const checkResult =
            await executeGraphQLWithToken<CheckBundleDiscountExistsQuery>(
                CheckBundleDiscountExistsDocument,
                {
                    query: `title:"${BUNDLE_DISCOUNT_TITLE}"`,
                },
                accessToken,
                shop,
            );

        const existingDiscount =
            checkResult.data?.discountNodes?.edges?.[0]?.node;

        if (existingDiscount) {
            return {
                success: true,
                message: "Bundle discount already exists",
            };
        }

        // Create single discount with both PRODUCT and SHIPPING classes
        const result =
            await executeGraphQLWithToken<CreateBundleAutomaticDiscountMutation>(
                CreateBundleAutomaticDiscountDocument,
                {
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
                accessToken,
                shop,
            );

        const userErrors =
            result.data?.discountAutomaticAppCreate?.userErrors || [];

        // Filter out "already exists" errors (race condition handling)
        const realErrors = userErrors.filter(
            (e) =>
                e.code !== "TAKEN" &&
                !e.message?.includes("already exists") &&
                !e.message?.includes("already been taken"),
        );

        if (realErrors.length > 0) {
            console.error(
                "[Setup] ✗ Failed to create bundle discount:",
                realErrors[0]?.message,
            );
            return {
                success: false,
                message: "Failed to create bundle discount",
                error: realErrors[0].message ?? undefined,
            };
        }

        const discountId =
            result.data?.discountAutomaticAppCreate?.automaticAppDiscount
                ?.discountId;

        return {
            success: true,
            message: "Bundle discount created successfully",
        };
    } catch (error) {
        console.error("[Setup] Error creating bundle discount:", error);
        return {
            success: false,
            message: "Error creating bundle discount",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Runs all app setup tasks.
 * Called during app installation/authentication.
 *
 * @param accessToken - Shopify access token.
 * @param shop - Shop domain.
 * @returns Result indicating overall success and any warnings.
 */
export async function runAppSetup(
    accessToken: string,
    shop: string,
): Promise<SetupResult> {
    // Task 0: Clean up stale Shopify resources from previous install
    // Safe: claimSetupLock only succeeds on fresh install or reinstall
    try {
        const { cleanupShopifyResources } =
            await import("@/features/webhooks/services/shopify-cleanup.service");
        await cleanupShopifyResources(accessToken, shop);
    } catch (error) {
        console.warn(
            "[Setup] Stale data cleanup failed (non-blocking):",
            error,
        );
    }

    // Task 1: Create ALL metafield definitions
    const metafieldResult = await createMetafieldDefinitions(accessToken, shop);

    if (metafieldResult.success) {
        await markMetafieldSetupDone(shop);
    } else {
        console.warn(
            `[Setup] ⚠️  Metafield setup warning: ${metafieldResult.error}`,
        );
    }

    // Task 2: Create bundle automatic discount (handles both product and shipping)
    const discountResult = await createBundleAutomaticDiscount(
        accessToken,
        shop,
    );

    if (discountResult.success) {
        await markDiscountSetupDone(shop);
    } else {
        console.warn(
            `[Setup] ⚠️  Bundle discount setup warning: ${discountResult.error}`,
        );
    }

    return {
        success: true,
        message: "App setup completed",
    };
}
