import {
    BundleFormData,
    ValidationContext,
    ValidationResult,
} from "@/features/bundles";

/**
 * Validate bundle rules
 * - Security validation (GID formats, duplicate products)
 * - Business rules validation (volume discount, buy X get Y, mix & match)
 */
export function validateBundleRules(
    data: BundleFormData,
    context?: ValidationContext,
): ValidationResult {
    // 1. Security validation
    const securityValidation = validateSecurity(data);
    if (!securityValidation.success) {
        return securityValidation;
    }

    // 2. Business rules validation
    const businessValidation = validateBusinessRules(data, context);
    if (!businessValidation.success) {
        return businessValidation;
    }

    return { success: true, errors: null };
}

/**
 * Validate business rules (pure function - no DB calls)
 * Context data is passed in, not fetched
 */
export function validateBusinessRules(
    data: BundleFormData,
    context?: ValidationContext,
): ValidationResult {
    const errors: Record<string, { _errors: string[] }> = {};

    // 1. Volume discount validation
    if (data.type === "VOLUME_DISCOUNT") {
        const vConfig = data.volumeTiers as { tiers?: unknown[] } | undefined;
        if (!vConfig || !vConfig.tiers || vConfig.tiers.length === 0) {
            errors.volumeTiers = {
                _errors: ["Volume discount bundles require at least one tier"],
            };
        }
    }

    // 2. Buy X Get Y validation
    if (data.type === "BUY_X_GET_Y" || data.type === "BOGO") {
        if (!data.buyQuantity || !data.getQuantity) {
            errors.buyQuantity = {
                _errors: ["Buy X Get Y bundles require buy and get quantities"],
            };
        }

        const triggerProducts = data.products.filter(
            (p) => p.role === "TRIGGER",
        );
        const rewardProducts = data.products.filter((p) => p.role === "REWARD");

        if (triggerProducts.length === 0) {
            if (!errors.products) {
                errors.products = { _errors: [] };
            }
            errors.products._errors.push(
                "Buy X Get Y bundles require at least one trigger product",
            );
        }

        if (rewardProducts.length === 0) {
            if (!errors.products) {
                errors.products = { _errors: [] };
            }
            errors.products._errors.push(
                "Buy X Get Y bundles require at least one reward product",
            );
        }
    }

    // 3. Mix & Match validation
    if (data.type === "MIX_AND_MATCH") {
        if (!data.allowMixAndMatch) {
            errors.allowMixAndMatch = {
                _errors: ["Mix and Match must be enabled for this bundle type"],
            };
        }

        if (!data.mixAndMatchPrice && !data.discountValue) {
            errors.mixAndMatchPrice = {
                _errors: [
                    "Mix and Match bundles require pricing configuration",
                ],
            };
        }

        if (data.productGroups && data.productGroups.length === 0) {
            errors.productGroups = {
                _errors: [
                    "Mix and Match bundles require at least one product group",
                ],
            };
        }
    }

    // 4. Product count validation
    const hardLimit = 20; // From your schema max
    if (data.products.length > hardLimit) {
        errors.products = {
            _errors: [`Bundle cannot have more than ${hardLimit} products`],
        };
    }

    // 5. Shop-specific product limit (from context)
    if (
        context?.maxBundleProducts &&
        data.products.length > context.maxBundleProducts
    ) {
        errors.products = {
            _errors: [
                `Shop limit: maximum ${context.maxBundleProducts} products per bundle`,
            ],
        };
    }

    // 6. Discount validation
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
        errors.discountValue = {
            _errors: ["Percentage discount cannot exceed 100%"],
        };
    }

    if (data.discountType === "FIXED_AMOUNT" && data.discountValue > 10000) {
        errors.discountValue = {
            _errors: [
                "Fixed discount amount seems unreasonably high (max $10,000)",
            ],
        };
    }

    // 7. Date validation
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        errors.endDate = {
            _errors: ["End date must be after start date"],
        };
    }

    // 8. Product groups validation
    if (data.productGroups && data.productGroups.length > 0) {
        data.productGroups.forEach((group, index) => {
            if (
                group.maxSelection &&
                group.minSelection &&
                group.maxSelection < group.minSelection
            ) {
                if (!errors[`productGroups.${index}`]) {
                    errors[`productGroups.${index}`] = { _errors: [] };
                }
                errors[`productGroups.${index}`]._errors.push(
                    "Maximum selection cannot be less than minimum selection",
                );
            }
        });
    }

    // 9. Images validation
    if (data.images && data.images.length > 5) {
        errors.images = {
            _errors: ["Maximum 5 images allowed per bundle"],
        };
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : null,
    };
}

/**
 * Security validation (pure function - no DB calls)
 * Validates GID formats and checks for duplicates
 */
export function validateSecurity(data: BundleFormData): ValidationResult {
    const errors: Record<string, { _errors: string[] }> = {};

    // 1. Validate Shopify GIDs (belt-and-suspenders with Zod)
    for (const product of data.products) {
        if (!/^gid:\/\/shopify\/Product\/\d+$/.test(product.productId)) {
            errors.products = {
                _errors: ["Invalid Shopify Product GID format"],
            };
            break;
        }

        if (product.variantId && !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(product.variantId)) {
            errors.products = {
                _errors: ["Invalid Shopify ProductVariant GID format"],
            };
            break;
        }
    }

    // 2. Check for duplicate products (skip for BOGO/BXGY — same product allowed as buy+get)
    // Use variantId when present so multi-variant selections of the same product are allowed
    const allowsDuplicates =
        data.type === "BOGO" || data.type === "BUY_X_GET_Y";
    if (!allowsDuplicates) {
        const dedupeKeys = data.products.map((p) => p.variantId || p.productId);
        if (dedupeKeys.length !== new Set(dedupeKeys).size) {
            errors.products = {
                _errors: ["Duplicate products are not allowed"],
            };
        }
    }

    // 3. Validate image URLs (if present)
    if (data.images && data.images.length > 0) {
        const invalidImages = data.images.filter((url) => {
            try {
                new URL(url);
                return false;
            } catch {
                return true;
            }
        });

        if (invalidImages.length > 0) {
            errors.images = {
                _errors: ["Invalid image URLs detected"],
            };
        }
    }

    // 4. Validate name length (additional check beyond Zod)
    if (data.name.length > 200) {
        errors.name = {
            _errors: ["Bundle name is too long (max 200 characters)"],
        };
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : null,
    };
}
