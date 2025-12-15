"use server";

/**
 * App Setup Service
 *
 * Handles one-time setup tasks during app installation.
 * - Creates metafield definitions for bundle-product relationships.
 * - Creates automatic discounts for bundle functions (Product + Shipping).
 */

import { print } from "graphql";
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

const METAFIELD_NAMESPACE = "radius_bundles";
const METAFIELD_KEY = "bundle_ids";

const BUNDLE_PRODUCT_DISCOUNT_TITLE = "Radius Bundle Discounts";
const BUNDLE_SHIPPING_DISCOUNT_TITLE = "Radius Bundle Free Shipping";
const BUNDLE_DISCOUNT_FUNCTION_HANDLE = "radius-discount-function";

interface SetupResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * Executes a GraphQL request with a direct access token.
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
 * Checks which bundle discounts already exist.
 */
async function checkBundleDiscountsExist(
    accessToken: string,
    shop: string,
): Promise<{ productExists: boolean; shippingExists: boolean }> {
    try {
        const result =
            await executeGraphQLWithToken<CheckBundleDiscountsExistQuery>(
                CheckBundleDiscountsExistDocument,
                {
                    productQuery: `title:"${BUNDLE_PRODUCT_DISCOUNT_TITLE}"`,
                    shippingQuery: `title:"${BUNDLE_SHIPPING_DISCOUNT_TITLE}"`,
                },
                accessToken,
                shop,
            );

        return {
            productExists:
                (result.data?.productDiscount?.edges?.length ?? 0) > 0,
            shippingExists:
                (result.data?.shippingDiscount?.edges?.length ?? 0) > 0,
        };
    } catch (error) {
        console.error("[Setup] Error checking discounts exist:", error);
        return { productExists: false, shippingExists: false };
    }
}

/**
 * Creates both automatic discounts (Product + Shipping) in a single API call.
 * These discounts are required for the Shopify Functions to run.
 */
export async function createBundleAutomaticDiscounts(
    accessToken: string,
    shop: string,
): Promise<SetupResult> {
    try {
        // Check which discounts already exist
        const { productExists, shippingExists } =
            await checkBundleDiscountsExist(accessToken, shop);

        if (productExists && shippingExists) {
            console.log(
                `[Setup] Both bundle discounts already exist for ${shop}`,
            );
            return {
                success: true,
                message: "Bundle discounts already exist",
            };
        }

        // Create both discounts in a single mutation
        const result =
            await executeGraphQLWithToken<CreateBundleDiscountsMutation>(
                CreateBundleDiscountsDocument,
                {
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
                accessToken,
                shop,
            );

        // Check product discount errors
        const productErrors = result.data?.productDiscount?.userErrors || [];
        const shippingErrors = result.data?.shippingDiscount?.userErrors || [];

        const allErrors = [...productErrors, ...shippingErrors];
        const realErrors = allErrors.filter(
            (e) =>
                e.code !== "TAKEN" &&
                !e.message?.includes("already exists") &&
                !e.message?.includes("already been taken"),
        );

        if (realErrors.length > 0) {
            console.error(
                "[Setup] Failed to create bundle discounts:",
                realErrors,
            );
            return {
                success: false,
                message: "Failed to create bundle discounts",
                error: realErrors[0].message ?? undefined,
            };
        }

        const productId =
            result.data?.productDiscount?.automaticAppDiscount?.discountId;
        const shippingId =
            result.data?.shippingDiscount?.automaticAppDiscount?.discountId;

        console.log(
            `[Setup] Created bundle discounts for ${shop}: Product=${productId}, Shipping=${shippingId}`,
        );

        return {
            success: true,
            message: "Bundle discounts created successfully",
        };
    } catch (error) {
        console.error("[Setup] Error creating bundle discounts:", error);
        return {
            success: false,
            message: "Error creating bundle discounts",
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
    }

    // Task 2: Create both bundle automatic discounts (Product + Shipping)
    const discountResult = await createBundleAutomaticDiscounts(
        accessToken,
        shop,
    );

    if (!discountResult.success) {
        console.warn(
            `[Setup] Bundle discounts setup warning: ${discountResult.error}`,
        );
    }

    return {
        success: true,
        message: "App setup completed",
    };
}
