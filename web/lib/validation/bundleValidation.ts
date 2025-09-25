import { bundleQueries, shopQueries } from "@/lib/queries";
import { bundleSchema, BundleFormData } from "@/lib/validation";

export async function validateAndCheckBusinessRules(shop: string, data: unknown) {
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

export async function validateBundleData(data: unknown) {
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
        data: validationResult.data as BundleFormData,
    };
}

/**
 * Business rules validation
 */
export async function validateBusinessRules(shop: string, data: BundleFormData) {
    const [recentCount, shopSettings] = await Promise.all([
        bundleQueries.countRecent(shop, 1),
        shopQueries.getSettings(shop),
    ]);

    const errors: Record<string, { _errors: string[] }> = {};

    if (data.type === "VOLUME_DISCOUNT" && (!data.volumeTiers?.length)) {
        errors.volumeTiers = { _errors: ["Volume discount bundles require at least one tier"] };
    }

    if (["BUY_X_GET_Y", "BOGO"].includes(data.type)) {
        if (!data.buyQuantity || !data.getQuantity) {
            errors.buyQuantity = { _errors: ["Buy X Get Y bundles require buy and get quantities"] };
        }

        const triggerProducts = data.products.filter(p => p.role === "TRIGGER");
        const rewardProducts = data.products.filter(p => p.role === "REWARD");

        if (!triggerProducts.length) {
            errors.products = { _errors: ["Buy X Get Y bundles require trigger products"] };
        }
        if (!rewardProducts.length) {
            errors.products = { _errors: ["Buy X Get Y bundles require reward products"] };
        }
    }

    if (data.products.length > 20) {
        errors.products = { _errors: ["Bundle can have maximum 20 products"] };
    }

    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
        errors.discountValue = { _errors: ["Percentage discount cannot exceed 100%"] };
    }

    if (data.discountType === "FIXED_AMOUNT" && data.discountValue > 10000) {
        errors.discountValue = { _errors: ["Fixed discount amount seems too high"] };
    }

    if (recentCount > 5) {
        errors.general = { _errors: ["Too many bundles created recently. Please wait."] };
    }

    if (shopSettings?.maxBundleProducts && data.products.length > shopSettings.maxBundleProducts) {
        errors.products = { _errors: [`Shop limit: max ${shopSettings.maxBundleProducts} products`] };
    }

    return {
        success: Object.keys(errors).length === 0,
        message: Object.keys(errors).length ? "Business validation failed" : "Validation passed",
        errors: Object.keys(errors).length ? errors : null,
    };
}

/**
 * Security validation
 */
export async function validateSecurity(shop: string, data: BundleFormData) {
    const errors: Record<string, { _errors: string[] }> = {};

    // Validate Shopify GIDs
    for (const product of data.products) {
        if (!/^gid:\/\/shopify\/Product\/\d+$/.test(product.productId)) {
            errors.products = { _errors: ["Invalid product ID format"] };
            break;
        }
        if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(product.variantId)) {
            errors.products = { _errors: ["Invalid variant ID format"] };
            break;
        }
    }

    // Duplicates
    const productIds = data.products.map((p) => p.productId);
    if (productIds.length !== new Set(productIds).size) {
        errors.products = { _errors: ["Duplicate products are not allowed"] };
    }

    // Rate limiting
    const recentBundles = await bundleQueries.countRecent(shop, 1);
    if (recentBundles > 5) {
        errors.general = { _errors: ["Too many bundles created recently. Please wait."] };
    }

    return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length ? errors : null,
    };
}