"use server";

/**
 * Product Creation Actions - Auth Layer
 * Handles Shopify product creation and updates via GraphQL.
 * Syncs product status with bundle status.
 */

import {
    CreateBundleProductInput,
    getShopifyProductStatus,
    UpdateProductInput,
} from "@/features/bundles";
import {
    formatProductForStorage,
    transformBundleToProductVariables,
    validateProductInput,
} from "@/features/bundles/services";
import {
    GetPublicationsDocument,
    GetPublicationsQuery,
    ProductCreateDocument,
    ProductCreateMutation,
    ProductCreateMutationVariables,
    ProductDeleteDocument,
    ProductDeleteMutation,
    ProductUpdateDocument,
    ProductUpdateMutation,
    ProductVariantsBulkUpdateDocument,
    ProductVariantsBulkUpdateMutation,
    PublishablePublishDocument,
    PublishablePublishMutation,
    StagedUploadsCreateDocument,
    StagedUploadsCreateMutation,
    FileCreateDocument,
    FileCreateMutation,
    FileStatusByIdsDocument,
    FileStatusByIdsQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";
import { ApiResponse, sanitizeText, sanitizeRichText } from "@/shared";
import { executeGraphQLQuery } from "@/lib/graphql/client/server-action";

/**
 * Create a Shopify product for a bundle.
 * Product status is synced with bundle status.
 */
export async function createBundleProductAction(
    sessionToken: string,
    input: CreateBundleProductInput,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        // Transform bundle data to GraphQL variables (includes status mapping)
        const variables = transformBundleToProductVariables(
            input.bundleName,
            input.bundleDescription,
            input.bundleType,
            input.bundleStatus,
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

        // Publish to Online Store sales channel
        await publishProductToOnlineStore(sessionToken, product.id);

        const productData = formatProductForStorage(product);

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
 * Update variant price for bundle product.
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
 * Update Shopify product from the bundle edit page.
 * Syncs product status with bundle status.
 */
export async function updateBundleProductAction(
    sessionToken: string,
    input: UpdateProductInput,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        // Map bundle status to Shopify product status if provided
        const productStatus = input.status
            ? getShopifyProductStatus(input.status)
            : undefined;

        const variables = {
            id: input.productId,
            title: input.title ? sanitizeText(input.title) : undefined,
            descriptionHtml: input.description
                ? sanitizeRichText(input.description)
                : undefined,
            status: productStatus,
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

        // Update variant price if provided
        if (
            input.bundlePrice !== undefined &&
            input.bundlePrice > 0 &&
            input.variantId
        ) {
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
                status: result.data.productUpdate.product.status,
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
 * Update only the status of a Shopify product.
 * Used when bundle status changes without other updates.
 */
export async function updateBundleProductStatusAction(
    sessionToken: string,
    productId: string,
    bundleStatus: string,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        const productStatus = getShopifyProductStatus(bundleStatus as any);

        const result = await executeGraphQLMutation<ProductUpdateMutation>({
            query: ProductUpdateDocument,
            variables: {
                id: productId,
                status: productStatus,
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

        return {
            status: "success",
            message: "Product status updated successfully",
            data: {
                id: result.data?.productUpdate?.product?.id,
                status: result.data?.productUpdate?.product?.status,
            },
        };
    } catch (error) {
        console.error("[updateBundleProductStatus] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update product status",
            data: null,
        };
    }
}

/**
 * Create staged uploads for files.
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
 * Ingest staged uploads into Shopify Files and return permanent CDN URLs.
 *
 * Reads `image.url` from fileCreate response when available; for files still
 * processing, polls FileStatusByIds (max ~3s) until READY.
 */
export async function ingestStagedUploadsAction(
    sessionToken: string,
    stagedResourceUrls: string[],
    altText?: string,
): Promise<{ success: boolean; urls: string[]; error?: string }> {
    if (stagedResourceUrls.length === 0) {
        return { success: true, urls: [] };
    }

    try {
        await handleSessionToken(sessionToken);

        const files = stagedResourceUrls.map((url) => ({
            originalSource: url,
            contentType: "IMAGE" as const,
            alt: altText,
        }));

        const result = await executeGraphQLMutation<FileCreateMutation>({
            query: FileCreateDocument,
            variables: { files },
            sessionToken,
        });

        if (result.errors && result.errors.length > 0) {
            console.error("[ingestStagedUploads] Errors:", result.errors);
            return {
                success: false,
                urls: [],
                error: result.errors[0].message,
            };
        }

        const userErrors = result.data?.fileCreate?.userErrors ?? [];
        if (userErrors.length > 0) {
            console.error("[ingestStagedUploads] User errors:", userErrors);
            return { success: false, urls: [], error: userErrors[0].message };
        }

        const created = result.data?.fileCreate?.files ?? [];

        // Resolve URL: prefer image.url from response, otherwise mark for poll
        type Pending = { id: string; index: number };
        const urls: (string | null)[] = new Array(created.length).fill(null);
        const pending: Pending[] = [];

        created.forEach((file, index) => {
            if (!file?.id) return;
            const url =
                "image" in file && file.image?.url ? file.image.url : null;
            if (url) {
                urls[index] = url;
            } else {
                pending.push({ id: file.id, index });
            }
        });

        // Short fallback poll (max 6 attempts × 500ms = 3s)
        const MAX_ATTEMPTS = 6;
        const DELAY_MS = 500;

        for (let attempt = 0; pending.length > 0 && attempt < MAX_ATTEMPTS; attempt++) {
            await new Promise((r) => setTimeout(r, DELAY_MS));

            const pollResult = await executeGraphQLQuery<FileStatusByIdsQuery>({
                query: FileStatusByIdsDocument,
                variables: { ids: pending.map((p) => p.id) },
                sessionToken,
            });

            const nodes = pollResult.data?.nodes ?? [];
            const stillPending: Pending[] = [];

            pending.forEach((p) => {
                const node = nodes.find(
                    (n) => n && "id" in n && n.id === p.id,
                );
                if (
                    node &&
                    "fileStatus" in node &&
                    node.fileStatus === "READY" &&
                    "image" in node &&
                    node.image?.url
                ) {
                    urls[p.index] = node.image.url;
                } else {
                    stillPending.push(p);
                }
            });

            pending.length = 0;
            pending.push(...stillPending);
        }

        // Drop entries that never resolved
        const resolved = urls.filter((u): u is string => Boolean(u));

        return { success: true, urls: resolved };
    } catch (error) {
        console.error("[ingestStagedUploads] Error:", error);
        return {
            success: false,
            urls: [],
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to ingest files",
        };
    }
}

/**
 * Attach already-uploaded media to a product.
 */
export async function attachMediaToProductAction(
    sessionToken: string,
    productId: string,
    resourceUrls: string[],
    altText?: string,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

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

/**
 * Delete a Shopify product.
 */
export async function deleteBundleProductAction(
    sessionToken: string,
    productId: string,
): Promise<ApiResponse> {
    try {
        await handleSessionToken(sessionToken);

        const result = await executeGraphQLMutation<ProductDeleteMutation>({
            query: ProductDeleteDocument,
            variables: {
                productId,
            },
            sessionToken,
        });

        if (result.errors && result.errors.length > 0) {
            console.error("[deleteBundleProduct] Errors:", result.errors);
            return {
                status: "error",
                message: result.errors[0].message,
                data: null,
            };
        }

        if (
            result.data?.productDelete?.userErrors &&
            result.data.productDelete.userErrors.length > 0
        ) {
            console.error(
                "[deleteBundleProduct] User errors:",
                result.data.productDelete.userErrors,
            );
            return {
                status: "error",
                message: result.data.productDelete.userErrors[0].message,
                data: null,
            };
        }

        return {
            status: "success",
            message: "Product deleted successfully",
            data: {
                deletedProductId: result.data?.productDelete?.deletedProductId,
            },
        };
    } catch (error) {
        console.error("[deleteBundleProduct] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete product",
            data: null,
        };
    }
}

async function publishProductToOnlineStore(
    sessionToken: string,
    productId: string,
) {
    try {
        const pubResult = await executeGraphQLQuery<GetPublicationsQuery>({
            query: GetPublicationsDocument,
            variables: { first: 20 },
            sessionToken,
        });

        const publications = pubResult.data?.publications?.nodes ?? [];
        const onlineStore = publications.find(
            (p) => p.supportsFuturePublishing,
        );

        if (!onlineStore) {
            console.warn("[publishProduct] Online Store publication not found");
            return;
        }

        const publishResult =
            await executeGraphQLMutation<PublishablePublishMutation>({
                query: PublishablePublishDocument,
                variables: {
                    id: productId,
                    input: [{ publicationId: onlineStore.id }],
                },
                sessionToken,
            });

        if (publishResult.errors?.length) {
            console.warn(
                "[publishProduct] Publish warning:",
                publishResult.errors[0].message,
            );
        }
    } catch (error) {
        console.warn("[publishProduct] Failed to publish:", error);
    }
}
