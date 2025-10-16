import { bundleQueries } from "@/features/bundles";

/**
 * Validate bundle data
 */
export async function validateBundleData(shop: string, data: unknown) {
    // Basic validation
    if (!data || typeof data !== "object") {
        throw {
            message: "Invalid bundle data",
            errors: [{ path: "data", message: "Data must be an object" }],
        };
    }

    const bundle = data as any;

    // Required fields
    const errors = [];

    if (!bundle.name || typeof bundle.name !== "string") {
        errors.push({ path: "name", message: "Name is required" });
    }

    if (!bundle.type) {
        errors.push({ path: "type", message: "Bundle type is required" });
    }

    if (!bundle.discountType) {
        errors.push({
            path: "discountType",
            message: "Discount type is required",
        });
    }

    if (errors.length > 0) {
        throw { message: "Validation failed", errors };
    }

    // Business rules
    await validateBusinessRules(shop, bundle);

    return bundle;
}

/**
 * Validate business rules
 */
async function validateBusinessRules(shop: string, data: any) {
    // Check active bundles limit
    const activeCount = await bundleQueries.countActiveByShop(shop);
    const MAX_ACTIVE_BUNDLES = 100;

    if (data.status === "ACTIVE" && activeCount >= MAX_ACTIVE_BUNDLES) {
        throw {
            message: "Active bundles limit reached",
            errors: [
                {
                    path: "status",
                    message: `Maximum of ${MAX_ACTIVE_BUNDLES} active bundles allowed`,
                },
            ],
        };
    }

    // Validate discount
    if (data.discountType && data.discountValue !== undefined) {
        validateDiscount(data.discountType, data.discountValue);
    }

    // Validate dates
    if (data.startDate && data.endDate) {
        validateDateRange(data.startDate, data.endDate);
    }

    // Validate products
    if (data.products && data.products.length === 0) {
        throw {
            message: "Bundle must have at least one product",
            errors: [
                { path: "products", message: "At least one product required" },
            ],
        };
    }
}

/**
 * Validate discount values
 */
function validateDiscount(type: string, value: number) {
    if (type === "PERCENTAGE" && (value < 0 || value > 100)) {
        throw {
            message: "Invalid discount percentage",
            errors: [
                {
                    path: "discountValue",
                    message: "Percentage must be between 0 and 100",
                },
            ],
        };
    }

    if (type === "FIXED_AMOUNT" && value < 0) {
        throw {
            message: "Invalid discount amount",
            errors: [
                {
                    path: "discountValue",
                    message: "Amount must be greater than 0",
                },
            ],
        };
    }
}

/**
 * Validate date range
 */
function validateDateRange(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
        throw {
            message: "Invalid date range",
            errors: [
                {
                    path: "endDate",
                    message: "End date must be after start date",
                },
            ],
        };
    }
}
