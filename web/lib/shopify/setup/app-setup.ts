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
    CheckMetafieldDefinitionDocument,
    CheckMetafieldDefinitionQuery,
    MetafieldDefinitionCreateDocument,
    MetafieldDefinitionCreateMutation,
    CreateBundleAutomaticDiscountDocument,
    CreateBundleAutomaticDiscountMutation,
    CheckBundleDiscountExistsDocument,
    CheckBundleDiscountExistsQuery,
} from "@/lib/graphql/generated/graphql";
import { print, DocumentNode } from "graphql";

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
    const endpoint = `https://${shop}/admin/api/2025-10/graphql.json`;
    const query = typeof document === 'string' ? document : print(document);

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
 * Creates the bundle_ids metafield definition for products.
 * This allows the metafield to be visible in Shopify admin.
 *
 * @param accessToken - Shopify access token.
 * @param shop - Shop domain.
 * @returns Result indicating success or failure.
 */
export async function createBundleMetafieldDefinition(
    accessToken: string,
    shop: string,
): Promise<SetupResult> {
    try {
        // First check if definition already exists
        const checkResult =
            await executeGraphQLWithToken<CheckMetafieldDefinitionQuery>(
                CheckMetafieldDefinitionDocument,
                {},
                accessToken,
                shop,
            );

        const existingDefinitions =
            checkResult.data?.metafieldDefinitions?.edges || [];

        if (existingDefinitions.length > 0) {
            console.log(
                `[Setup] Metafield definition already exists for ${shop}`,
            );
            return {
                success: true,
                message: "Metafield definition already exists",
            };
        }

        // Create the metafield definition
        const createResult =
            await executeGraphQLWithToken<MetafieldDefinitionCreateMutation>(
                MetafieldDefinitionCreateDocument,
                {
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
                accessToken,
                shop,
            );

        const userErrors =
            createResult.data?.metafieldDefinitionCreate?.userErrors || [];

        if (userErrors.length > 0) {
            const alreadyExists = userErrors.some(
                (e) =>
                    e.code === "TAKEN" || e.message?.includes("already exists"),
            );

            if (alreadyExists) {
                console.log(
                    `[Setup] Metafield definition already exists (race condition) for ${shop}`,
                );
                return {
                    success: true,
                    message: "Metafield definition already exists",
                };
            }

            console.error(
                "[Setup] Failed to create metafield definition:",
                userErrors,
            );
            return {
                success: false,
                message: "Failed to create metafield definition",
                error: userErrors[0].message ?? undefined,
            };
        }

        const createdDef =
            createResult.data?.metafieldDefinitionCreate?.createdDefinition;
        console.log(
            `[Setup] Created metafield definition for ${shop}:`,
            createdDef?.id,
        );

        return {
            success: true,
            message: "Metafield definition created successfully",
        };
    } catch (error) {
        console.error("[Setup] Error creating metafield definition:", error);
        return {
            success: false,
            message: "Error during setup",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Creates a single automatic discount that handles both product and shipping discounts.
 *
 * Per Shopify's Discount Function API documentation:
 * "A single Function processes one discount (either code-based or automatic),
 * but can apply savings across three discount classes: product, order, and shipping."
 *
 * The function extension has two targets that share this single discount:
 * - cart.lines.discounts.generate.run → handles PRODUCT discounts
 * - cart.delivery-options.discounts.generate.run → handles SHIPPING discounts
 *
 * Shopify automatically invokes both targets when the discount has multiple classes.
 * Each target receives discount.discountClasses in its input to know which classes apply.
 *
 * @param accessToken - Shopify access token.
 * @param shop - Shop domain.
 * @returns Result indicating success or failure.
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
            console.log(
                `[Setup] Bundle discount already exists for ${shop}:`,
                existingDiscount.id,
            );
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
                "[Setup] Failed to create bundle discount:",
                realErrors,
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

        console.log(
            `[Setup] Created bundle discount for ${shop}: ${discountId}`,
        );

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
    console.log(`[Setup] Running app setup for ${shop}`);

    // Task 1: Create metafield definition
    const metafieldResult = await createBundleMetafieldDefinition(
        accessToken,
        shop,
    );

    if (!metafieldResult.success) {
        console.warn(
            `[Setup] Metafield setup warning: ${metafieldResult.error}`,
        );
    }

    // Task 2: Create bundle automatic discount (handles both product and shipping)
    const discountResult = await createBundleAutomaticDiscount(
        accessToken,
        shop,
    );

    if (!discountResult.success) {
        console.warn(
            `[Setup] Bundle discount setup warning: ${discountResult.error}`,
        );
    }

    return {
        success: true,
        message: "App setup completed",
    };
}
