"use server";

/**
 * Product Creation Actions - Auth Layer
 * Handles Shopify product creation via GraphQL
 */

import {
    CreateBundleProductInput,
    formatProductForStorage,
    transformBundleToProductVariables,
    UpdateProductInput,
    uploadFileToStaged,
    validateProductInput,
} from "@/features/bundles";
import { ApiResponse } from "@/shared";
import {
    ProductCreateDocument,
    ProductCreateMutation,
    ProductCreateMutationVariables,
    ProductUpdateDocument,
    ProductUpdateMutation,
    ProductVariantsBulkUpdateDocument,
    ProductVariantsBulkUpdateMutation,
    StagedUploadsCreateDocument,
    StagedUploadsCreateMutation,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";

/**
 * Create a Shopify product for a bundle
 */
export async function createBundleProductAction(
    sessionToken: string,
    input: CreateBundleProductInput,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        // Transform bundle data to GraphQL variables
        const variables = transformBundleToProductVariables(
            input.bundleName,
            input.bundleDescription,
            input.bundleType,
        );

        // Validate input
        const validation = validateProductInput(variables);
        if (!validation.valid) {
            return {
                status: "error",
                message: validation.errors.join(", "),
                data: null,
            };
        }

        // Execute GraphQL mutation using codegen document
        const result = await executeGraphQLMutation<ProductCreateMutation>({
            query: ProductCreateDocument,
            variables: variables as ProductCreateMutationVariables,
            sessionToken,
        });

        // Check for GraphQL errors
        if (result.errors && result.errors.length > 0) {
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
                data: null,
            };
        }

        // Check for user errors from Shopify
        if (
            result.data?.productCreate?.userErrors &&
            result.data.productCreate.userErrors.length > 0
        ) {
            return {
                status: "error",
                message: result.data.productCreate.userErrors
                    .map((e) => e.message)
                    .join(", "),
                data: null,
            };
        }

        // Check if the product was created
        if (!result.data?.productCreate?.product) {
            return {
                status: "error",
                message: "Failed to create product",
                data: null,
            };
        }

        const product = result.data.productCreate.product;

        if (input.bundlePrice !== undefined && input.bundlePrice > 0) {
            const defaultVariant = product.variants?.nodes?.[0];

            if (defaultVariant) {
                const priceUpdateResult = await updateVariantPriceAction(
                    sessionToken,
                    product.id,
                    defaultVariant.id,
                    input.bundlePrice,
                    input.originalPrice,
                );

                if (priceUpdateResult.status === "error") {
                    console.warn(
                        "[createBundleProduct] Price update failed:",
                        priceUpdateResult.message,
                    );
                    // Continue anyway - product was created
                }
            }
        }

        const productData = formatProductForStorage(product);

        console.log("Product created successfully:", productData);

        return {
            status: "success",
            message: "Product created successfully",
            data: productData,
        };
    } catch (error) {
        console.error("[createBundleProduct] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create product",
            data: null,
        };
    }
}

/**
 * Update variant price for bundle product
 */
export async function updateVariantPriceAction(
    sessionToken: string,
    productId: string,
    variantId: string,
    price: number,
    compareAtPrice?: number,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        const variants = [
            {
                id: variantId,
                price: price.toFixed(2),
                ...(compareAtPrice && compareAtPrice > price
                    ? { compareAtPrice: compareAtPrice.toFixed(2) }
                    : {}),
            },
        ];

        const result =
            await executeGraphQLMutation<ProductVariantsBulkUpdateMutation>({
                query: ProductVariantsBulkUpdateDocument,
                variables: {
                    productId,
                    variants,
                },
                sessionToken,
            });

        if (result.errors && result.errors.length > 0) {
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
                data: null,
            };
        }

        if (
            result.data?.productVariantsBulkUpdate?.userErrors &&
            result.data.productVariantsBulkUpdate.userErrors.length > 0
        ) {
            return {
                status: "error",
                message: result.data.productVariantsBulkUpdate.userErrors
                    .map((e) => e.message)
                    .join(", "),
                data: null,
            };
        }

        return {
            status: "success",
            message: "Variant price updated successfully",
            data: result.data?.productVariantsBulkUpdate?.productVariants,
        };
    } catch (error) {
        console.error("[updateVariantPrice] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update variant price",
            data: null,
        };
    }
}

/**
 * Update Shopify product from the bundle edit page
 */
export async function updateBundleProductAction(
    sessionToken: string,
    input: UpdateProductInput,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        const variables = {
            id: input.productId,
            title: input.title,
            descriptionHtml: input.description ?? undefined,
        };

        // Execute GraphQL mutation
        const result = await executeGraphQLMutation<ProductUpdateMutation>({
            query: ProductUpdateDocument,
            variables,
            sessionToken,
        });

        // Check for GraphQL errors
        if (result.errors && result.errors.length > 0) {
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
                data: null,
            };
        }

        // Check for user errors
        if (
            result.data?.productUpdate?.userErrors &&
            result.data.productUpdate.userErrors.length > 0
        ) {
            return {
                status: "error",
                message: result.data.productUpdate.userErrors
                    .map((e) => e.message)
                    .join(", "),
                data: null,
            };
        }

        // Check if the product was updated
        if (!result.data?.productUpdate?.product) {
            return {
                status: "error",
                message: "Failed to update product",
                data: null,
            };
        }

        console.log("Product updated successfully:", input);

        // Update variant price if provided
        if (input.bundlePrice !== undefined && input.bundlePrice > 0 && input.variantId) {
            const priceUpdateResult = await updateVariantPriceAction(
                sessionToken,
                input.productId,
                input.variantId,
                input.bundlePrice,
                input.originalPrice,
            );

            if (priceUpdateResult.status === "error") {
                console.warn(
                    "[updateBundleProduct] Price update failed:",
                    priceUpdateResult.message,
                );
                // Continue anyway - product was updated
            }
        }

        return {
            status: "success",
            message: "Product updated successfully",
            data: {
                id: result.data.productUpdate.product.id,
                title: result.data.productUpdate.product.title,
            },
        };
    } catch (error) {
        console.error("[updateProduct] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update product",
            data: null,
        };
    }
}

/**
 * Helper: Stage and upload files, return resource URLs
 */
async function stageAndUploadFiles(
    sessionToken: string,
    files: File[],
): Promise<string[]> {
    console.log(`[stageAndUploadFiles] Processing ${files.length} files...`);

    // Prepare file metadata for staging
    const fileMetadata = files.map((file) => ({
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
    }));

    console.log("File metadata:", fileMetadata);

    // Create staged uploads
    const stagedResult = await createStagedUploadsAction(
        sessionToken,
        fileMetadata,
    );

    if (!stagedResult.success || !stagedResult.stagedTargets) {
        console.error("Failed to stage uploads:", stagedResult.error);
        return [];
    }

    console.log(`✅ Staged ${stagedResult.stagedTargets.length} uploads`);

    // Upload files to staged URLs
    const resourceUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stagedTarget = stagedResult.stagedTargets[i];

        try {
            console.log(
                `Uploading file ${i + 1}/${files.length}: ${file.name}`,
            );
            const resourceUrl = await uploadFileToStaged(file, stagedTarget);
            resourceUrls.push(resourceUrl);
            console.log(`✅ Uploaded: ${file.name}`);
        } catch (error) {
            console.error(`❌ Failed to upload file ${file.name}:`, error);
        }
    }

    console.log(`✅ All uploads complete. ${resourceUrls.length} successful.`);
    return resourceUrls;
}

/**
 * Create staged uploads for files
 */
export async function createStagedUploadsAction(
    sessionToken: string,
    files: Array<{ filename: string; mimeType: string; fileSize: number }>,
) {
    try {
        await handleSessionToken(sessionToken);

        const input = files.map((file) => ({
            filename: file.filename,
            mimeType: file.mimeType,
            resource: "IMAGE" as const,
            fileSize: file.fileSize.toString(),
        }));

        console.log("[createStagedUploads] Input:", input);

        const result =
            await executeGraphQLMutation<StagedUploadsCreateMutation>({
                query: StagedUploadsCreateDocument,
                variables: { input },
                sessionToken,
            });

        if (result.errors && result.errors.length > 0) {
            console.error("[createStagedUploads] Errors:", result.errors);
            return {
                success: false,
                error: result.errors[0].message,
                stagedTargets: null,
            };
        }

        if (
            result.data?.stagedUploadsCreate?.userErrors &&
            result.data.stagedUploadsCreate.userErrors.length > 0
        ) {
            console.error(
                "[createStagedUploads] User errors:",
                result.data.stagedUploadsCreate.userErrors,
            );
            return {
                success: false,
                error: result.data.stagedUploadsCreate.userErrors[0].message,
                stagedTargets: null,
            };
        }

        console.log(
            "[createStagedUploads] Success, targets:",
            result.data?.stagedUploadsCreate?.stagedTargets?.length,
        );

        return {
            success: true,
            stagedTargets:
                result.data?.stagedUploadsCreate?.stagedTargets || [],
        };
    } catch (error) {
        console.error("[createStagedUploads] Error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to stage uploads",
            stagedTargets: null,
        };
    }
}

/**
 * Attach already-uploaded media to a product
 */
export async function attachMediaToProductAction(
    sessionToken: string,
    productId: string,
    resourceUrls: string[],
    altText?: string,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        console.log("[attachMediaToProduct] Product:", productId);
        console.log("[attachMediaToProduct] URLs:", resourceUrls);

        const media = resourceUrls.map((url) => ({
            originalSource: url,
            mediaContentType: "IMAGE" as const,
            alt: altText || "Bundle product image",
        }));

        const result = await executeGraphQLMutation<ProductUpdateMutation>({
            query: ProductUpdateDocument,
            variables: {
                id: productId,
                media,
            },
            sessionToken,
        });

        if (result.errors && result.errors.length > 0) {
            console.error("[attachMediaToProduct] Errors:", result.errors);
            return {
                status: "error",
                message: result.errors[0].message,
                data: null,
            };
        }

        if (
            result.data?.productUpdate?.userErrors &&
            result.data.productUpdate.userErrors.length > 0
        ) {
            console.error(
                "[attachMediaToProduct] User errors:",
                result.data.productUpdate.userErrors,
            );
            return {
                status: "error",
                message: result.data.productUpdate.userErrors[0].message,
                data: null,
            };
        }

        console.log("[attachMediaToProduct] ✅ Success");

        return {
            status: "success",
            message: "Media attached successfully",
            data: result.data?.productUpdate?.product,
        };
    } catch (error) {
        console.error("[attachMediaToProduct] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to attach media",
            data: null,
        };
    }
}
