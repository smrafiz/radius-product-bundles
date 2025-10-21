/**
 * Bundle Write Service - Business Logic Layer
 *
 * Handles bundle mutations with business rules.
 * NO direct database access - uses repository layer.
 * NO auth handling - used by action layer.
 */

import {
    createBundle,
    createBundleProducts,
    deleteBundlesWithRelations,
    deleteBundleWithRelations,
    findBundleByIdWithAllRelations,
    generateUniqueBundleName,
    updateBundleStatusById,
} from "../repositories";
import {
    BulkDeleteBundlesInput,
    BulkDeleteBundlesServiceResult,
    BUNDLE_STATUSES,
    BundleStatus,
    CreateBundleWithValidationInput,
    DeleteBundleInput,
    DeleteBundleServiceResult,
    DuplicateBundleInput,
    DuplicateBundleResult,
    transformBundleForDuplication,
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

    // Business logic: Validate required fields
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

    // Business logic: Validate status
    if (!BUNDLE_STATUSES[status]) {
        throw new Error("Invalid bundle status");
    }

    // Update status (via repository)
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
 * Toggle bundle status (ACTIVE ↔ DRAFT)
 */
export async function toggleBundleStatus(
    input: UpdateBundleStatusInput & { currentStatus: BundleStatus },
): Promise<UpdateBundleStatusResult> {
    const { bundleId, shop, currentStatus } = input;

    // Business logic: Determine new status
    const newStatus: BundleStatus =
        currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";

    return await updateBundleStatusService({
        bundleId,
        shop,
        status: newStatus,
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

    // Business logic: Validate input
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
        bundle: newBundle,
        message: `Bundle duplicated as "${newName}"`,
    };
}

/**
 * Duplicate multiple bundles (bulk duplicate)
 */
export async function duplicateMultipleBundles(input: {
    bundleIds: string[];
    shop: string;
}): Promise<{
    success: boolean;
    bundles: any[];
    duplicatedCount: number;
    message: string;
}> {
    const { bundleIds, shop } = input;

    // Validate input
    if (!bundleIds || bundleIds.length === 0) {
        throw new Error("No bundle IDs provided");
    }

    if (bundleIds.length > 50) {
        throw new Error("Cannot duplicate more than 50 bundles at once");
    }

    // Duplicate each bundle
    const results = await Promise.all(
        bundleIds.map((bundleId) => duplicateBundle({ bundleId, shop })),
    );

    return {
        success: true,
        bundles: results.map((r) => r.bundle),
        duplicatedCount: results.length,
        message: `${results.length} bundle(s) duplicated successfully`,
    };
}
