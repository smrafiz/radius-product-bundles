"use server";

/**
 * App Setup Service
 *
 * Handles one-time setup tasks during app installation.
 * - Creates metafield definitions for bundle-product relationships.
 * - Creates automatic discount for bundle discount function.
 */

import { print } from "graphql";
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

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";

const BUNDLE_DISCOUNT_TITLE = "Radius Bundle Discounts";
const BUNDLE_DISCOUNT_FUNCTION_HANDLE = "radius-discount-function";

interface SetupResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * Execute a GraphQL request with a direct access token.
 * Used during OAuth callback before the session is established.
 */
async function executeGraphQLWithToken<T = any>(
    document: any,
    variables: Record<string, any>,
    accessToken: string,
    shop: string,
): Promise<{ data?: T; errors?: any[] }> {
    const endpoint = `https://${shop}/admin/api/2025-10/graphql.json`;
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
 * Creates the bundle_ids metafield definition for products.
 * This allows the metafield to be visible in Shopify admin.
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
            // Check if it's an "already exists" error (race condition)
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
 * Checks if the bundle automatic discount already exists.
 */
async function checkBundleDiscountExists(
    accessToken: string,
    shop: string,
): Promise<boolean> {
    try {
        const result =
            await executeGraphQLWithToken<CheckBundleDiscountExistsQuery>(
                CheckBundleDiscountExistsDocument,
                {
                    query: `title:${BUNDLE_DISCOUNT_TITLE}`,
                },
                accessToken,
                shop,
            );

        const edges = result.data?.discountNodes?.edges || [];
        return edges.length > 0;
    } catch (error) {
        console.error("[Setup] Error checking discount exists:", error);
        return false;
    }
}

/**
 * Creates the automatic discount that triggers the bundle discount function.
 * This discount is required for the Shopify Function to run.
 */
export async function createBundleAutomaticDiscount(
    accessToken: string,
    shop: string,
): Promise<SetupResult> {
    try {
        // Check if discount already exists
        const exists = await checkBundleDiscountExists(accessToken, shop);

        if (exists) {
            console.log(
                `[Setup] Bundle automatic discount already exists for ${shop}`,
            );
            return {
                success: true,
                message: "Bundle discount already exists",
            };
        }

        // Create the automatic discount
        const result =
            await executeGraphQLWithToken<CreateBundleAutomaticDiscountMutation>(
                CreateBundleAutomaticDiscountDocument,
                {
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
                accessToken,
                shop,
            );

        const userErrors =
            result.data?.discountAutomaticAppCreate?.userErrors || [];

        if (userErrors.length > 0) {
            // Check for "already exists" type errors
            const alreadyExists = userErrors.some(
                (e) =>
                    e.code === "TAKEN" ||
                    e.message?.includes("already exists") ||
                    e.message?.includes("already been taken"),
            );

            if (alreadyExists) {
                console.log(
                    `[Setup] Bundle discount already exists (race condition) for ${shop}`,
                );
                return {
                    success: true,
                    message: "Bundle discount already exists",
                };
            }

            console.error(
                "[Setup] Failed to create bundle discount:",
                userErrors,
            );
            return {
                success: false,
                message: "Failed to create bundle discount",
                error: userErrors[0].message ?? undefined,
            };
        }

        const discountId =
            result.data?.discountAutomaticAppCreate?.automaticAppDiscount
                ?.discountId;
        console.log(
            `[Setup] Created bundle automatic discount for ${shop}:`,
            discountId,
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
        // Don't fail the entire setup for metafield issues
    }

    // Task 2: Create the bundle automatic discount
    const discountResult = await createBundleAutomaticDiscount(
        accessToken,
        shop,
    );

    if (!discountResult.success) {
        console.warn(
            `[Setup] Bundle discount setup warning: ${discountResult.error}`,
        );
        // Don't fail the entire setup - function may still work if created manually
    }

    return {
        success: true,
        message: "App setup completed",
    };
}
