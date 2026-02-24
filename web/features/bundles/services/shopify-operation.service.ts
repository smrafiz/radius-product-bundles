/**
 * Product Creation Service - Business Logic Layer
 * Handles Shopify product creation for bundles
 */

import {
    BundleStatus,
    BundleType,
    getShopifyProductStatus,
} from "@/features/bundles";
import { BUNDLE_TYPES } from "@/features/bundles/constants";

/**
 * Transform bundle data to Shopify product mutation variables.
 * Sets product status based on bundle status.
 */
export function transformBundleToProductVariables(
    bundleName: string,
    bundleDescription?: string,
    bundleType?: string,
    bundleStatus?: BundleStatus,
) {
    const productStatus: "ACTIVE" | "DRAFT" | "ARCHIVED" = bundleStatus
        ? getShopifyProductStatus(bundleStatus)
        : "DRAFT";

    const typeConfig = bundleType
        ? BUNDLE_TYPES[bundleType as BundleType]
        : undefined;
    const productTypeLabel = typeConfig?.label || "Bundle";

    return {
        title: bundleName,
        descriptionHtml: bundleDescription ?? undefined,
        vendor: "Radius Bundles",
        productType: productTypeLabel,
        tags: ["bundle", productTypeLabel.toLowerCase()].filter(Boolean),
        status: productStatus,
    };
}

/**
 * Validate product creation input.
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
 * Extract product ID from Shopify GID.
 */
export function extractProductId(gid: string): string {
    const match = gid.match(/\/Product\/(\d+)$/);
    return match ? match[1] : gid;
}

/**
 * Format product for storage in the database.
 */
export function formatProductForStorage(product: {
    id: string;
    title: string;
    handle: string;
    variants?: { nodes?: Array<{ id: string; price: string }> };
}): {
    mainProductId: string;
    productTitle: string;
    productHandle: string;
    mainVariantId: string | null;
} {
    const variantId = product.variants?.nodes?.[0]?.id ?? null;

    return {
        mainProductId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        mainVariantId: variantId,
    };
}

/**
 * Upload file to staged URL.
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
 * Prepare media input for product creation.
 */
export function prepareMediaInput(
    resourceUrls: string[],
): Array<{ originalSource: string; mediaContentType: string }> {
    return resourceUrls.map((url) => ({
        originalSource: url,
        mediaContentType: "IMAGE",
    }));
}

/**
 * Detect if a GraphQL response indicates the target product no longer exists.
 */
export function isProductNotFoundError<T>(result: {
    data?: T;
    errors?: Array<{ message: string }>;
}): boolean {
    const patterns = [
        "product does not exist",
        "product not found",
        "could not find",
    ];
    const matches = (msg: string) =>
        patterns.some((p) => msg.toLowerCase().includes(p));

    if (result.errors?.some((e) => matches(e.message))) return true;

    const userErrors =
        (result.data as any)?.productUpdate?.userErrors ??
        (result.data as any)?.productDelete?.userErrors ??
        [];

    return userErrors.some((e: { message: string }) => matches(e.message));
}
