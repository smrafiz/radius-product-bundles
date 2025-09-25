"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma-connect";
import { handleSessionToken } from "@/lib/shopify/verify";
import { BundleFormData, bundleSchema } from "@/lib/validation";
import {
    bundleProductGroupQueries,
    bundleProductQueries,
    bundleQueries,
    bundleSettingsQueries,
    shopQueries,
} from "@/lib/queries";

import { BundleStatus } from "@/types";
import { bundleStatusConfigs } from "@/config";

// Helper functions
async function validateBundleData(data: unknown) {
    const validationResult = bundleSchema.safeParse(data);

    if (!validationResult.success) {
        const formattedErrors: Record<string, { _errors: string[] }> = {};

        validationResult.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!formattedErrors[path]) {
                formattedErrors[path] = { _errors: [] };
            }
            formattedErrors[path]._errors.push(issue.message);
        });

        return {
            success: false,
            errors: {
                status: "error" as const,
                message: "Validation failed",
                errors: formattedErrors,
                data: null,
            },
        };
    }

    return {
        success: true,
        data: validationResult.data,
    };
}

async function validateAndCheckBusinessRules(shop: string, data: unknown) {
    // Schema validation
    const validation = await validateBundleData(data);
    if (!validation.success) {
        return validation.errors;
    }

    // Business rules validation
    const businessValidation = await validateBusinessRules(
        shop,
        validation.data,
    );
    if (!businessValidation.success) {
        return {
            status: "error" as const,
            message: businessValidation.message,
            errors: businessValidation.errors,
            data: null,
        };
    }

    return {
        success: true,
        data: validation.data,
    };
}

async function checkNameConflict(
    shop: string,
    name: string,
    excludeId?: string,
) {
    const existingBundle = excludeId
        ? await prisma.bundle.findFirst({
              where: {
                  shop,
                  name,
                  id: { not: excludeId },
              },
          })
        : await bundleQueries.findByName(shop, name);

    if (existingBundle) {
        throw new Error(`Bundle with name "${name}" already exists`);
    }
}





function handleBundleError(error: unknown) {
    console.error("Bundle operation failed:", error);

    if (error instanceof Error) {
        if (error.message.includes("already exists")) {
            return {
                status: "error" as const,
                message: error.message,
                errors: { name: { _errors: [error.message] } },
                data: null,
            };
        }

        if (error.message.includes("not found")) {
            return {
                status: "error" as const,
                message: error.message,
                errors: null,
                data: null,
            };
        }
    }

    return {
        status: "error" as const,
        message: "Operation failed. Please try again.",
        errors: null,
        data: null,
    };
}





/**
 * Helper function to validate business rules
 */
async function validateBusinessRules(shop: string, data: BundleFormData) {
    const [recentCount, shopSettings] = await Promise.all([
        bundleQueries.countRecent(shop, 1),
        shopQueries.getSettings(shop),
    ]);

    const errors: Record<string, { _errors: string[] }> = {};

    try {
        // Bundle-type-specific validations
        if (
            data.type === "VOLUME_DISCOUNT" &&
            (!data.volumeTiers || data.volumeTiers.length === 0)
        ) {
            errors.volumeTiers = {
                _errors: ["Volume discount bundles require at least one tier"],
            };
        }

        if (data.type === "BUY_X_GET_Y" || data.type === "BOGO") {
            if (!data.buyQuantity || !data.getQuantity) {
                errors.buyQuantity = {
                    _errors: [
                        "Buy X Get Y bundles require buy and get quantities",
                    ],
                };
            }

            // Validate trigger and reward products
            const triggerProducts = data.products.filter(
                (p) => p.role === "TRIGGER",
            );
            const rewardProducts = data.products.filter(
                (p) => p.role === "REWARD",
            );

            if (triggerProducts.length === 0) {
                errors.products = {
                    _errors: ["Buy X Get Y bundles require trigger products"],
                };
            }

            if (rewardProducts.length === 0) {
                errors.products = {
                    _errors: ["Buy X Get Y bundles require reward products"],
                };
            }
        }

        // Product limits
        if (data.products.length > 20) {
            errors.products = {
                _errors: ["Bundle can have maximum 20 products"],
            };
        }

        // Discount validation
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            errors.discountValue = {
                _errors: ["Percentage discount cannot exceed 100%"],
            };
        }

        if (
            data.discountType === "FIXED_AMOUNT" &&
            data.discountValue > 10000
        ) {
            errors.discountValue = {
                _errors: ["Fixed discount amount seems too high"],
            };
        }

        // Rate limiting
        if (recentCount > 5) {
            errors.general = {
                _errors: ["Too many bundles created recently. Please wait."],
            };
        }

        // Shop settings validation
        if (
            shopSettings?.maxBundleProducts &&
            data.products.length > shopSettings.maxBundleProducts
        ) {
            errors.products = {
                _errors: [
                    `Shop limit: max ${shopSettings.maxBundleProducts} products`,
                ],
            };
        }

        return {
            success: Object.keys(errors).length === 0,
            message:
                Object.keys(errors).length > 0
                    ? "Business validation failed"
                    : "Validation passed",
            errors: Object.keys(errors).length > 0 ? errors : null,
        };
    } catch (error) {
        console.error("Business validation error:", error);
        return {
            success: false,
            message: "Failed to validate business rules",
            errors: { general: { _errors: ["Internal validation error"] } },
        };
    }
}

/**
 * Helper function to infer a bundle type from form data
 */
function inferBundleType(data: BundleFormData) {
    if (data.discountType === "NO_DISCOUNT") {
        return "FREQUENTLY_BOUGHT_TOGETHER";
    }

    if (data.discountType === "FREE_SHIPPING") {
        return "FIXED_BUNDLE";
    }

    // Default to fixed bundle
    return "FIXED_BUNDLE";
}

function isValidShopifyGid(
    gid: string,
    type: "Product" | "ProductVariant",
): boolean {
    const pattern = new RegExp(`^gid://shopify/${type}/\\d+$`);
    return pattern.test(gid);
}

async function validateSecurity(shop: string, data: BundleFormData) {
    const errors: Record<string, { _errors: string[] }> = {};

    try {
        // Validate all Shopify GIDs
        if (data.products) {
            for (const product of data.products) {
                // Validate product GID format
                if (!isValidShopifyGid(product.productId, "Product")) {
                    errors.products = {
                        _errors: ["Invalid product ID format"],
                    };
                    break;
                }

                // Validate variant GID format
                if (!isValidShopifyGid(product.variantId, "ProductVariant")) {
                    errors.products = {
                        _errors: ["Invalid variant ID format"],
                    };
                    break;
                }

                // Extract numeric IDs for additional validation
                const productNumericId = product.productId.split("/").pop();
                const variantNumericId = product.variantId.split("/").pop();

                // Check if numeric IDs are valid numbers
                if (!productNumericId || isNaN(Number(productNumericId))) {
                    errors.products = { _errors: ["Invalid product ID"] };
                    break;
                }

                if (!variantNumericId || isNaN(Number(variantNumericId))) {
                    errors.products = { _errors: ["Invalid variant ID"] };
                    break;
                }
            }
        }

        // Check for duplicate products
        if (data.products) {
            const productIds = data.products.map((p) => p.productId);
            const uniqueProductIds = new Set(productIds);
            if (productIds.length !== uniqueProductIds.size) {
                errors.products = {
                    _errors: ["Duplicate products are not allowed"],
                };
            }
        }

        // Rate limiting check
        const recentBundles = await prisma.bundle.count({
            where: {
                shop,
                createdAt: {
                    gte: new Date(Date.now() - 60 * 1000), // Last minute
                },
            },
        });

        if (recentBundles > 5) {
            errors.general = {
                _errors: ["Too many bundles created recently. Please wait."],
            };
        }

        return {
            success: Object.keys(errors).length === 0,
            errors: Object.keys(errors).length > 0 ? errors : null,
        };
    } catch (error) {
        console.error("Security validation error:", error);
        return {
            success: false,
            errors: { general: { _errors: ["Security validation failed"] } },
        };
    }
}
