/**
 * Bundle Write Service - Business Logic Layer
 */

import {
    BulkDeleteBundlesInput,
    BulkDeleteBundlesServiceResult,
    BulkUpdateBundleStatusInput,
    BulkUpdateBundleStatusResult,
    BUNDLE_STATUSES,
    createBundle,
    createBundleProducts,
    CreateBundleWithValidationInput,
    DeleteBundleInput,
    DeleteBundleServiceResult,
    deleteBundlesWithRelations,
    deleteBundleWithRelations,
    DuplicateBundleInput,
    DuplicateBundleResult,
    findBundleByIdWithAllRelations,
    findBundlesByIds,
    generateUniqueBundleName,
    transformBundleForDuplication,
    updateBundlesStatusByIds,
    updateBundleStatusById,
    UpdateBundleStatusInput,
    UpdateBundleStatusResult,
} from "@/features/bundles";
import prisma from "@/lib/db/prisma-connect";

// ==========================================
// CREATE Operations
// ==========================================

/**
 * Create bundle with validation
 */
export async function createBundleWithValidation(
    input: CreateBundleWithValidationInput,
): Promise<any> {
    const { shop, data } = input;

    // Validate required fields
    if (!data.name) {
        throw new Error("Bundle name is required");
    }

    if (!data.discountType || !data.discountValue) {
        throw new Error("Discount information is required");
    }

    // Create bundle with products in transaction
    return await prisma.$transaction(async (tx) => {
        // Create bundle
        const bundle = await createBundle(tx, {
            ...data,
            shop,
        });

        // Create bundle products if provided
        if (data.products && data.products.length > 0) {
            await createBundleProducts(tx, bundle.id, data.products);
        }

        return bundle;
    });
}

// ==========================================
// UPDATE Operations
// ==========================================

/**
 * Update bundle status with validation
 */
export async function updateBundleStatusService(
    input: UpdateBundleStatusInput,
): Promise<UpdateBundleStatusResult> {
    const { bundleId, shop, status } = input;

    // Validate status
    if (!BUNDLE_STATUSES[status]) {
        throw new Error("Invalid bundle status");
    }

    const updatedBundle = await updateBundleStatusById(bundleId, shop, status);

    if (!updatedBundle) {
        throw new Error("Bundle not found");
    }

    return {
        success: true,
        bundle: updatedBundle,
        message: "Bundle status updated successfully",
    };
}

/**
 * Update multiple bundle statuses
 */
export async function bulkUpdateBundleStatusService(
    input: BulkUpdateBundleStatusInput,
): Promise<BulkUpdateBundleStatusResult> {
    const { bundleIds, shop, status } = input;

    // Validate status
    if (!BUNDLE_STATUSES[status]) {
        return {
            success: false,
            message: `Invalid bundle status: ${status}`,
        }
    }

    // Validate input
    if (!bundleIds || bundleIds.length === 0) {
        return {
            success: false,
            message: "No bundle IDs provided",
        }
    }

    // Limit bulk operations
    if (bundleIds.length > 100) {
        return {
            success: false,
            message: "Cannot update more than 100 bundles at once",
        }
    }

    // Single atomic transaction for all updates
    const result = await prisma.$transaction(
        async (tx) => {
            // Verify all bundles belong to the shop
            const existingBundles = await findBundlesByIds(bundleIds, shop, tx);

            // Check if all bundles were found
            if (existingBundles.length === 0) {
                return {
                    updatedBundles: [],
                    updatedCount: 0,
                    failedCount: bundleIds.length,
                };
            }

            const foundIds = existingBundles.map((b) => b.id);
            const notFoundIds = bundleIds.filter((id) => !foundIds.includes(id));

            // Update all found bundles
            await updateBundlesStatusByIds(tx, foundIds, status);

            // Fetch updated bundles
            const updatedBundles = await findBundlesByIds(foundIds, shop, tx)

            return {
                updatedBundles,
                updatedCount: updatedBundles.length,
                failedCount: notFoundIds.length,
            };
        },
        {
            timeout: 15000, // 15 seconds for bulk operations
        }
    );

    // Generate message
    const message =
        result.failedCount > 0
            ? `${result.updatedCount} bundle${result.updatedCount > 1 ? "s" : ""} updated to ${status.toLowerCase()} (${result.failedCount} failed)`
            : `${result.updatedCount} bundle${result.updatedCount > 1 ? "s" : ""} updated to ${status.toLowerCase()}`;

    return {
        success: true,
        message,
    };
}

/**
 * Bulk activate bundles (set to ACTIVE)
 */
export async function bulkActivateBundlesService(input: {
    bundleIds: string[];
    shop: string;
}): Promise<BulkUpdateBundleStatusResult> {
    return bulkUpdateBundleStatusService({
        ...input,
        status: "ACTIVE",
    });
}

/**
 * Bulk draft bundles (set to DRAFT)
 */
export async function bulkDraftBundlesService(input: {
    bundleIds: string[];
    shop: string;
}): Promise<BulkUpdateBundleStatusResult> {
    return bulkUpdateBundleStatusService({
        ...input,
        status: "DRAFT",
    });
}

// ==========================================
// DELETE Operations
// ==========================================

/**
 * Delete a single bundle
 */
export async function deleteSingleBundleService(
    input: DeleteBundleInput,
): Promise<DeleteBundleServiceResult> {
    const { bundleId, shop } = input;

    // Delete bundle with relations (via repository)
    const deletedBundle = await deleteBundleWithRelations(bundleId, shop);

    return {
        success: true,
        bundle: deletedBundle,
        message: `Bundle "${deletedBundle.name}" deleted successfully`,
    };
}

/**
 * Delete multiple bundles (bulk delete)
 */
export async function deleteMultipleBundles(
    input: BulkDeleteBundlesInput,
): Promise<BulkDeleteBundlesServiceResult> {
    const { bundleIds, shop } = input;

    // Validate input
    if (!bundleIds || bundleIds.length === 0) {
        throw new Error("No bundle IDs provided");
    }

    if (bundleIds.length > 100) {
        throw new Error("Cannot delete more than 100 bundles at once");
    }

    // Delete bundles (via repository)
    const deletedBundles = await deleteBundlesWithRelations(bundleIds, shop);

    return {
        success: true,
        bundles: deletedBundles,
        deletedCount: deletedBundles.length,
        message: `${deletedBundles.length} bundle(s) deleted successfully`,
    };
}

// ==========================================
// DUPLICATE Operations
// ==========================================

/**
 * Duplicate a bundle
 */
export async function duplicateBundleService(
    input: DuplicateBundleInput,
): Promise<DuplicateBundleResult> {
    const { bundleId, shop } = input;

    const original = await findBundleByIdWithAllRelations(bundleId, shop);

    if (!original) {
        throw new Error(
            "Bundle not found or you don't have permission to duplicate it",
        );
    }

    const newName = await generateUniqueBundleName(shop, original.name);
    const duplicateData = transformBundleForDuplication(original, newName);
    const newBundle = await createBundleWithValidation({
        shop,
        data: duplicateData,
    });

    return {
        success: true,
        data: newBundle,
        message: `Bundle duplicated as "${newName}"`,
    };
}