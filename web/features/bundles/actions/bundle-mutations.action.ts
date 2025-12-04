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
    syncBundleProductMetafields,
} from "@/lib";
import {
    bulkActivateBundlesService,
    bulkDraftBundlesService,
    BundleFormData,
    bundleSchema,
    BundleStatus,
    CreateBundleActionInput,
    createBundleService,
    deleteMultipleBundles,
    deleteSingleBundleService,
    duplicateBundleService,
    findBundleByIdWithAllRelations,
    updateBundleService,
    updateBundleStatusService,
} from "@/features/bundles";
import { ApiResponse } from "@/shared";
import { revalidatePath } from "next/cache";
import { ensureMetafieldDefinition, handleSessionToken } from "@/lib/shopify";

/**
 * Update bundle status
 */
export async function updateBundleStatusAction(
    sessionToken: string,
    bundleId: string,
    status: BundleStatus,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await updateBundleStatusService({
            bundleId,
            shop,
            status,
        });

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
        const productIds = bundle?.bundleProducts?.map((bp) => bp.productId) || [];

        const result = await deleteSingleBundleService({
            bundleId,
            shop,
        });

        // Remove bundle ID from product metafields
        if (productIds.length > 0) {
            const metafieldResult = await removeBundleIdFromProducts(
                sessionToken,
                bundleId,
                productIds,
            );

            if (!metafieldResult.success) {
                console.warn("[deleteBundle] Metafield cleanup warning:", metafieldResult.error);
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

        // Get all product IDs from all bundles before deletion
        const bundleProductMap = new Map<string, string[]>();
        for (const bundleId of bundleIds) {
            const bundle = await findBundleByIdWithAllRelations(bundleId, shop);
            if (bundle?.bundleProducts) {
                bundleProductMap.set(
                    bundleId,
                    bundle.bundleProducts.map((bp) => bp.productId),
                );
            }
        }

        const result = await deleteMultipleBundles({
            bundleIds,
            shop,
        });

        // Remove bundle IDs from product metafields
        for (const [bundleId, productIds] of bundleProductMap) {
            if (productIds.length > 0) {
                const metafieldResult = await removeBundleIdFromProducts(
                    sessionToken,
                    bundleId,
                    productIds,
                );

                if (!metafieldResult.success) {
                    console.warn(`[deleteBundles] Metafield cleanup warning for ${bundleId}:`, metafieldResult.error);
                }
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
            const productIds = result.data.bundle.products?.map((p: any) => p.productId) || [];

            if (productIds.length > 0) {
                const metafieldResult = await addBundleIdToProducts(
                    sessionToken,
                    newBundleId,
                    productIds,
                );

                if (!metafieldResult.success) {
                    console.warn("[duplicateBundle] Metafield warning:", metafieldResult.error);
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

            // Format Zod errors
            const formattedErrors: Record<string, { _errors: string[] }> = {};

            schemaValidation.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                if (!formattedErrors[path]) {
                    formattedErrors[path] = { _errors: [] };
                }
                formattedErrors[path]._errors.push(issue.message);
            });

            return {
                status: "error",
                message: "Invalid bundle data format",
                errors: Object.values(formattedErrors).flatMap(
                    (e) => e._errors,
                ),
            };
        }

        console.log("[Action] Schema validation passed");

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

        // Add bundle ID to product metafields
        const productIds = schemaValidation.data.products.map((p) => p.productId);
        if (productIds.length > 0 && result.bundle?.id) {
            await ensureMetafieldDefinition(sessionToken);

            console.log(`[Action] Adding metafields to ${productIds.length} products`);

            const metafieldResult = await addBundleIdToProducts(
                sessionToken,
                result.bundle.id,
                productIds,
            );

            if (!metafieldResult.success) {
                console.warn("[createBundleAction] Metafield warning:", metafieldResult.error);
                // Don't fail the whole operation, just log warning
            }
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

        const schemaValidation = bundleSchema.safeParse(bundleData);

        if (!schemaValidation.success) {
            console.log("[updateBundleAction] Schema validation failed");

            // Format Zod errors for client
            const formattedErrors: Record<string, { _errors: string[] }> = {};

            schemaValidation.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                if (!formattedErrors[path]) {
                    formattedErrors[path] = { _errors: [] };
                }
                formattedErrors[path]._errors.push(issue.message);
            });

            return {
                status: "error",
                message: "Invalid bundle data format",
                errors: Object.values(formattedErrors).flatMap(
                    (e) => e._errors,
                ),
            };
        }

        console.log("[updateBundleAction] Schema validation passed");

        // Get old product IDs before update for metafield sync
        const existingBundle = await findBundleByIdWithAllRelations(bundleId, shop);
        const oldProductIds = existingBundle?.bundleProducts?.map((bp) => bp.productId) || [];

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

        // Sync metafields for changed products
        const newProductIds = schemaValidation.data.products.map((p) => p.productId);
        const metafieldResult = await syncBundleProductMetafields(
            sessionToken,
            bundleId,
            oldProductIds,
            newProductIds,
        );

        if (!metafieldResult.success) {
            console.warn("[updateBundleAction] Metafield sync warning:", metafieldResult.error);
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