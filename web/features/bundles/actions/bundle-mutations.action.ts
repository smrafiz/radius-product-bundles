"use server";

/**
 * Bundle Mutation Actions - Auth Layer
 *
 * Handles authentication and calls service layer.
 * Integrates metafield operations for storefront bundle display.
 */

import {
    addBundleIdToProducts,
    removeBundleIdFromProducts,
    syncAllSettingsToMetafields,
    syncBundleProductMetafields,
} from "@/lib";
import {
    BundleFormData,
    bundleSchema,
    BundleStatus,
    CreateBundleActionInput,
    getShopifyProductStatus,
} from "@/features/bundles";
import {
    bulkActivateBundlesService,
    bulkDraftBundlesService,
    createBundleService,
    deleteMultipleBundles,
    deleteSingleBundleService,
    duplicateBundleService,
    isProductNotFoundError,
    updateBundleService,
    updateBundleStatusService,
} from "@/features/bundles/services";
import { ApiResponse } from "@/shared";
import {
    ProductDeleteDocument,
    ProductDeleteMutation,
    ProductUpdateDocument,
    ProductUpdateMutation,
} from "@/lib/graphql/generated/graphql";
import { revalidatePath } from "next/cache";
import { executeGraphQLMutation } from "@/lib/graphql/client/server-action";
import { handleZodValidationError } from "@/shared/utils/error/error-handlers";
import { ensureBundleDiscount, ensureMetafieldDefinition, handleSessionToken, } from "@/lib/shopify";
import { clearMainProductByGid, findBundleByIdWithAllRelations, } from "@/features/bundles/repositories";

/**
 * Update bundle status
 */
export async function updateBundleStatusAction(
    sessionToken: string,
    bundleId: string,
    status: BundleStatus,
    startDate?: string,
    endDate?: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await updateBundleStatusService({
            bundleId,
            shop,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });

        // Sync Shopify product status
        if (result.bundle?.mainProductId) {
            const updateResult =
                await executeGraphQLMutation<ProductUpdateMutation>({
                    query: ProductUpdateDocument,
                    variables: {
                        id: result.bundle.mainProductId,
                        status: getShopifyProductStatus(status),
                    },
                    sessionToken,
                });
            if (isProductNotFoundError(updateResult)) {
                console.warn(
                    `[updateBundleStatus] Product ${result.bundle.mainProductId} no longer exists, clearing reference`,
                );
                await clearMainProductByGid(shop, result.bundle.mainProductId);
            }
        }

        // Sync metafields so storefront reflects the status change
        await syncAllSettingsToMetafields(sessionToken, shop);

        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);

        return {
            status: "success" as const,
            message: result.message || "Bundle status updated successfully",
            data: result.bundle,
        };
    } catch (error) {
        console.error("[updateBundleStatus] Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return {
            status: "error" as const,
            message: errorMessage || "Failed to update bundle status",
            data: undefined,
            errors: [errorMessage],
        };
    }
}

/**
 * Toggle bundle status (active/draft)
 */
export async function bulkToggleBundleStatusAction(
    sessionToken: string,
    bundleIds: string[],
    currentStatus: "ACTIVE" | "DRAFT",
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result =
            currentStatus === "ACTIVE"
                ? await bulkActivateBundlesService({ bundleIds, shop })
                : await bulkDraftBundlesService({ bundleIds, shop });

        // Sync Shopify product statuses
        const productStatus = getShopifyProductStatus(currentStatus);
        for (const productId of result.mainProductIds ?? []) {
            const updateResult =
                await executeGraphQLMutation<ProductUpdateMutation>({
                    query: ProductUpdateDocument,
                    variables: { id: productId, status: productStatus },
                    sessionToken,
                });
            if (isProductNotFoundError(updateResult)) {
                console.warn(
                    `[bulkToggleStatus] Product ${productId} no longer exists, clearing reference`,
                );
                await clearMainProductByGid(shop, productId);
            }
        }

        // Sync metafields so storefront reflects the status changes
        await syncAllSettingsToMetafields(sessionToken, shop);

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message:
                result.message ||
                `Bundles set to ${currentStatus.toLowerCase()}`,
            data: result,
        };
    } catch (error) {
        console.error("[bulkUpdateBundleStatus] Error:", error);

        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return {
            status: "error",
            message: errorMessage || "Failed to update bundle statuses",
            data: undefined,
            errors: [errorMessage],
        };
    }
}

/**
 * Delete a bundle
 */
export async function deleteBundleAction(
    sessionToken: string,
    bundleId: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Get bundle products before deletion for metafield cleanup
        const bundle = await findBundleByIdWithAllRelations(bundleId, shop);
        const productIds =
            bundle?.bundleProducts?.map((bp) => bp.productId) || [];

        const result = await deleteSingleBundleService({
            bundleId,
            shop,
        });
        // await syncActiveBundlesToMetafield(sessionToken, shop);
        await syncAllSettingsToMetafields(sessionToken, shop);

        // Remove bundle ID from product metafields
        if (productIds.length > 0) {
            const metafieldResult = await removeBundleIdFromProducts(
                sessionToken,
                bundleId,
                productIds,
            );

            if (!metafieldResult.success) {
                console.warn(
                    "[deleteBundle] Metafield cleanup warning:",
                    metafieldResult.error,
                );
            }
        }

        // Delete Shopify standalone product if one was created
        if (bundle?.mainProductId) {
            const deleteResult =
                await executeGraphQLMutation<ProductDeleteMutation>({
                    query: ProductDeleteDocument,
                    variables: { productId: bundle.mainProductId },
                    sessionToken,
                });
            if (deleteResult.errors?.length) {
                console.warn(
                    "[deleteBundle] Shopify product cleanup warning:",
                    deleteResult.errors[0].message,
                );
            }
        }

        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);

        return {
            status: "success",
            message: result.message || "Bundle deleted successfully",
            data: result.bundle,
        };
    } catch (error) {
        console.error("[deleteBundle] Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return {
            status: "error" as const,
            message: errorMessage || "Failed to delete bundle",
            data: undefined,
            errors: [errorMessage],
        };
    }
}

/**
 * Delete multiple bundles
 */
export async function deleteBundlesAction(
    sessionToken: string,
    bundleIds: string[],
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        if (!bundleIds || bundleIds.length === 0) {
            return {
                status: "error",
                message: "No bundle IDs provided",
                data: null,
            };
        }

        // Get all product IDs and mainProductIds from all bundles before deletion
        const bundleProductMap = new Map<string, string[]>();
        const mainProductIds: string[] = [];
        for (const bundleId of bundleIds) {
            const bundle = await findBundleByIdWithAllRelations(bundleId, shop);
            if (bundle?.bundleProducts) {
                bundleProductMap.set(
                    bundleId,
                    bundle.bundleProducts.map((bp) => bp.productId),
                );
            }
            if (bundle?.mainProductId) {
                mainProductIds.push(bundle.mainProductId);
            }
        }

        const result = await deleteMultipleBundles({
            bundleIds,
            shop,
        });
        // await syncActiveBundlesToMetafield(sessionToken, shop);
        await syncAllSettingsToMetafields(sessionToken, shop);

        // Remove bundle IDs from product metafields
        for (const [bundleId, productIds] of bundleProductMap) {
            if (productIds.length > 0) {
                const metafieldResult = await removeBundleIdFromProducts(
                    sessionToken,
                    bundleId,
                    productIds,
                );

                if (!metafieldResult.success) {
                    console.warn(
                        `[deleteBundles] Metafield cleanup warning for ${bundleId}:`,
                        metafieldResult.error,
                    );
                }
            }
        }

        // Delete Shopify standalone products
        for (const productId of mainProductIds) {
            const deleteResult =
                await executeGraphQLMutation<ProductDeleteMutation>({
                    query: ProductDeleteDocument,
                    variables: { productId },
                    sessionToken,
                });
            if (deleteResult.errors?.length) {
                console.warn(
                    `[deleteBundles] Shopify product cleanup warning for ${productId}:`,
                    deleteResult.errors[0].message,
                );
            }
        }

        revalidatePath("/bundles");

        if (bundleIds.length <= 10) {
            bundleIds.forEach((bundleId) => {
                revalidatePath(`/bundles/${bundleId}`);
            });
        }

        return {
            status: "success" as const,
            ...result,
        };
    } catch (error) {
        console.error("[deleteMultipleBundles] Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return {
            status: "error",
            message: errorMessage || "Failed to delete bundles",
            data: null,
            errors: [errorMessage],
        };
    }
}

/**
 * Duplicate a single bundle
 */
export async function duplicateBundleAction(
    sessionToken: string,
    bundleId: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await duplicateBundleService({
            bundleId,
            shop,
        });

        // Add metafields for duplicated bundle's products
        if (result.success && result.data?.bundle?.id) {
            const newBundleId = result.data.bundle.id;
            const productIds =
                result.data.bundle.products?.map((p: any) => p.productId) || [];

            if (productIds.length > 0) {
                const metafieldResult = await addBundleIdToProducts(
                    sessionToken,
                    newBundleId,
                    productIds,
                );

                if (!metafieldResult.success) {
                    console.warn(
                        "[duplicateBundle] Metafield warning:",
                        metafieldResult.error,
                    );
                }
            }
        }

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            ...result,
        };
    } catch (error) {
        console.error("[duplicateBundle] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to duplicate bundle",
            data: null,
        };
    }
}

/**
 * Create a new bundle
 */
export async function createBundleAction(
    sessionToken: string,
    bundleData: CreateBundleActionInput,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        console.log(`[createBundleAction] Creating bundle for shop: ${shop}`);

        // Schema Validation (Fail Fast)
        const schemaValidation = bundleSchema.safeParse(bundleData);

        if (!schemaValidation.success) {
            console.log("[Action] Schema validation failed");
            return handleZodValidationError(schemaValidation.error);
        }

        console.log("[Action] Schema validation passed");

        // Ensure metafield definitions exist before creating bundle
        const metafieldSetupResult =
            await ensureMetafieldDefinition(sessionToken);
        if (!metafieldSetupResult.success) {
            console.error(
                "[createBundleAction] Failed to ensure metafield definitions:",
                metafieldSetupResult.error,
            );
            return {
                status: "error",
                message: "Failed to setup required metafield definitions",
                errors: [metafieldSetupResult.error || "Unknown error"],
            };
        }

        // Ensure discount function exists before creating bundle
        const discountSetupResult = await ensureBundleDiscount(sessionToken);
        if (!discountSetupResult.success) {
            console.error(
                "[createBundleAction] Failed to ensure discount function:",
                discountSetupResult.error,
            );
            return {
                status: "error",
                message: "Failed to setup required discount function",
                errors: [discountSetupResult.error || "Unknown error"],
            };
        }

        // Call Service with Clean Data
        const result = await createBundleService({
            shop,
            data: schemaValidation.data,
        });

        if (!result.success) {
            return {
                status: "error",
                message: result.message,
                errors: result.errors
                    ? Object.values(result.errors).flatMap((e) => e._errors)
                    : [],
            };
        }

        // Sync metafields AFTER successful creation
        await syncAllSettingsToMetafields(sessionToken, shop);

        // Add bundle ID to product metafields
        const productIds = schemaValidation.data.products.map(
            (p) => p.productId,
        );
        if (productIds.length > 0 && result.bundle?.id) {
            console.log(
                `[Action] Adding metafields to ${productIds.length} products`,
            );

            const metafieldResult = await addBundleIdToProducts(
                sessionToken,
                result.bundle.id,
                productIds,
            );

            if (!metafieldResult.success) {
                console.warn(
                    "[createBundleAction] Metafield warning:",
                    metafieldResult.error,
                );
            }
        }

        // Attach bundle ID to standalone product metafield
        if (result.bundle?.mainProductId) {
            await addBundleIdToProducts(sessionToken, result.bundle.id, [
                result.bundle.mainProductId,
            ]);
        }

        revalidatePath("/bundles");
        revalidatePath("/dashboard");

        return {
            status: "success",
            message: "Bundle created successfully",
            data: {
                id: result.bundle!.id,
                name: result.bundle!.name,
                status: result.bundle!.status,
                createdAt: result.bundle!.createdAt,
            },
        };
    } catch (error) {
        console.error("[createBundleAction] Error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Failed to create bundle";

        return {
            status: "error",
            message: errorMessage,
            errors: [errorMessage],
        };
    }
}

/**
 * Update an existing bundle
 */
export async function updateBundleAction(
    sessionToken: string,
    bundleId: string,
    bundleData: BundleFormData,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        console.log(
            `[updateBundleAction] Updating bundle: ${bundleId} for shop: ${shop}`,
        );

        if (!bundleId) {
            console.log("[updateBundleAction] Invalid bundle ID");

            return {
                status: "error",
                message: "Invalid bundle ID",
                errors: ["Bundle ID is required and must be a string"],
            };
        }

        console.log(`[updateBundleAction] Bundle ID validated: ${bundleId}`);

        const sanitizedData = {
            ...bundleData,
            settings: sanitizeSettings(bundleData.settings),
        };

        const schemaValidation = bundleSchema.safeParse(sanitizedData);

        if (!schemaValidation.success) {
            console.log("[updateBundleAction] Schema validation failed");
            return handleZodValidationError(schemaValidation.error);
        }

        console.log("[updateBundleAction] Schema validation passed");

        // Get old product IDs before update for metafield sync
        const existingBundle = await findBundleByIdWithAllRelations(
            bundleId,
            shop,
        );
        const oldProductIds =
            existingBundle?.bundleProducts?.map((bp) => bp.productId) || [];

        // Ensure metafield definitions exist before updating bundle
        const metafieldSetupResult =
            await ensureMetafieldDefinition(sessionToken);
        if (!metafieldSetupResult.success) {
            console.error(
                "[updateBundleAction] Failed to ensure metafield definitions:",
                metafieldSetupResult.error,
            );
            return {
                status: "error",
                message: "Failed to setup required metafield definitions",
                errors: [metafieldSetupResult.error || "Unknown error"],
            };
        }

        // Ensure discount function exists before updating bundle
        const discountSetupResult = await ensureBundleDiscount(sessionToken);
        if (!discountSetupResult.success) {
            console.error(
                "[updateBundleAction] Failed to ensure discount function:",
                discountSetupResult.error,
            );
            return {
                status: "error",
                message: "Failed to setup required discount function",
                errors: [discountSetupResult.error || "Unknown error"],
            };
        }

        const result = await updateBundleService({
            shop,
            bundleId,
            data: schemaValidation.data,
        });

        if (!result.success) {
            console.log(
                `[updateBundleAction] Service failed: ${result.message}`,
            );

            return {
                status: "error",
                message: result.message,
                errors: result.errors
                    ? Object.values(result.errors).flatMap((e) => e._errors)
                    : [],
            };
        }

        console.log(
            `[updateBundleAction] Bundle updated successfully: ${result.bundle!.id}`,
        );

        // Sync metafields AFTER successful update
        await syncAllSettingsToMetafields(sessionToken, shop);

        // Sync metafields for changed products
        const newProductIds = schemaValidation.data.products.map(
            (p) => p.productId,
        );
        const metafieldResult = await syncBundleProductMetafields(
            sessionToken,
            bundleId,
            oldProductIds,
            newProductIds,
        );

        if (!metafieldResult.success) {
            console.warn(
                "[updateBundleAction] Metafield sync warning:",
                metafieldResult.error,
            );
        }

        // Attach bundle ID to standalone product metafield
        if (result.bundle?.mainProductId) {
            await addBundleIdToProducts(sessionToken, bundleId, [
                result.bundle.mainProductId,
            ]);
        }

        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);
        revalidatePath("/dashboard");

        console.log("[updateBundleAction] Cache revalidated");

        return {
            status: "success",
            message: "Bundle updated successfully",
            data: {
                id: result.bundle!.id,
                name: result.bundle!.name,
                status: result.bundle!.status,
                type: result.bundle!.type,
                updatedAt: result.bundle!.updatedAt,
                productCount: result.bundle!.productCount,
                discountType: result.bundle!.discountType,
                discountValue: result.bundle!.discountValue,
                bundle: result.bundle,
            },
        };
    } catch (error) {
        console.error("[updateBundleAction] Unexpected error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Failed to update bundle";

        return {
            status: "error",
            message: errorMessage,
            errors: [errorMessage],
        };
    }
}

/**
 * Sanitizes settings by converting null values to undefined.
 *
 * @param settings - Raw settings object from form
 * @returns Sanitized settings object
 */
function sanitizeSettings(settings: any) {
    if (!settings) return undefined;

    return {
        ...settings,
        style: settings.style ?? undefined,
        widget: settings.widget ?? undefined,
    };
}
