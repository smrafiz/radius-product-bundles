/**
 * Product Creation Service - Business Logic Layer
 * Handles Shopify product creation for bundles
 */

/**
 * Transform bundle data to Shopify product mutation variables
 */
export function transformBundleToProductVariables(
    bundleName: string,
    bundleDescription?: string,
    bundleType?: string,
) {
    return {
        title: bundleName,
        descriptionHtml: bundleDescription
            ? `<p>${bundleDescription}</p>`
            : undefined,
        vendor: "Bundle",
        productType: bundleType || "Bundle",
        tags: ["bundle", bundleType?.toLowerCase() || ""].filter(Boolean),
        status: "ACTIVE" as const,
    };
}

/**
 * Validate product creation input
 */
export function validateProductInput(input: {
    title: string;
    descriptionHtml?: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
    status?: string;
}): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
        errors.push("Product title is required");
    }

    if (input.title && input.title.length > 255) {
        errors.push("Product title cannot exceed 255 characters");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Extract product ID from Shopify GID
 */
export function extractProductId(gid: string): string {
    const match = gid.match(/\/Product\/(\d+)$/);
    return match ? match[1] : gid;
}

/**
 * Format product for storage in the database
 */
export function formatProductForStorage(product: any): {
    mainProductId: string;
    productTitle: string;
    productHandle: string;
} {
    return {
        mainProductId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
    };
}