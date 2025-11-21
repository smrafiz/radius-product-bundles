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
        descriptionHtml: bundleDescription ?? undefined,
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

/**
 * Upload file to staged URL
 */
export async function uploadFileToStaged(
    file: File,
    stagedTarget: any,
): Promise<string> {
    const formData = new FormData();

    // Add parameters from a staged target
    stagedTarget.parameters.forEach((param: any) => {
        formData.append(param.name, param.value);
    });

    // Add the file
    formData.append("file", file);

    // Upload to staged URL
    const response = await fetch(stagedTarget.url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return stagedTarget.resourceUrl;
}

/**
 * Prepare media input for product creation
 */
export function prepareMediaInput(
    resourceUrls: string[],
): Array<{ originalSource: string; mediaContentType: string }> {
    return resourceUrls.map((url) => ({
        originalSource: url,
        mediaContentType: "IMAGE",
    }));
}