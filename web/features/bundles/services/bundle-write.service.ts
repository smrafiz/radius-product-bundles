/**
 * Bundle Write Service - Business Logic Layer
 */

import {
    BulkDeleteBundlesInput,
    BulkDeleteBundlesServiceResult,
    BulkUpdateBundleStatusInput,
    BulkUpdateBundleStatusResult,
    BUNDLE_STATUSES,
    CreateBundleServiceInput,
    CreateBundleServiceResponse,
    DeleteBundleInput,
    DeleteBundleServiceResult,
    DuplicateBundleInput,
    DuplicateBundleResult,
    UpdateBundleServiceInput,
    UpdateBundleServiceResponse,
    UpdateBundleStatusInput,
    UpdateBundleStatusResult,
} from "@/features/bundles";
import {
    canCreateBundle,
    checkBundleSecurity,
    fetchOperationContext,
    handleBundleOperationError,
    transformBundle,
    transformBundleForDuplication,
    validateBundleData,
} from "@/features/bundles/services";
import {
    bulkUpdateBundleStatuses,
    checkNameConflict,
    createBundleWithRelations,
    deleteBundlesWithRelations,
    deleteBundleWithRelations,
    findBundleByIdWithAllRelations,
    generateUniqueBundleName,
    updateBundleStatusById,
    updateBundleWithRelations,
} from "@/features/bundles/repositories";
import { formatValidationErrorsAsString } from "@/shared";
// ==========================================
// CREATE Operations
// ==========================================

/**
 * Create a bundle with validation
 */
export async function createBundleService(
    input: CreateBundleServiceInput,
): Promise<CreateBundleServiceResponse> {
    const { shop, data } = input;

    console.log(
        `[createBundleService] Starting bundle creation for shop: ${shop}`,
    );
    try {
        // Perform security checks
        const securityResult = await checkBundleSecurity(shop);

        if (!securityResult.success) {
            return {
                success: false,
                message: securityResult.message || "Security check failed",
                errors: securityResult.errors || null,
                bundle: null,
            };
        }

        // Fetch shop settings for validation context
        const context = await fetchOperationContext(shop);

        // Validate bundle data (security and business rules)
        const validationResult = validateBundleData(data, context);

        if (!validationResult.success) {
            const errors = formatValidationErrorsAsString(
                validationResult.errors || {},
            );
            return {
                success: false,
                message: errors || "Validation failed",
                errors: validationResult.errors,
                bundle: null,
            };
        }

        const quotaCheck = await canCreateBundle(shop);

        if (!quotaCheck.allowed) {
            console.log(
                `[Service] ✗ Bundle limit reached: ${quotaCheck.current}/${quotaCheck.limit}`,
            );

            return {
                success: false,
                message: quotaCheck.reason || "Bundle limit reached",
                errors: {
                    general: {
                        _errors: [quotaCheck.reason || "Bundle limit reached"],
                    },
                },
                bundle: null,
            };
        }

        const nameExists = await checkNameConflict(shop, data.name);

        if (nameExists) {
            console.log(`[Service] ✗ Bundle name already exists: ${data.name}`);

            return {
                success: false,
                message: `A bundle with the name "${data.name}" already exists`,
                errors: {
                    name: {
                        _errors: [
                            `A bundle with the name "${data.name}" already exists`,
                        ],
                    },
                },
                bundle: null,
            };
        }

        const bundle = await createBundleWithRelations({
            shop,
            ...data,
            status: data.status || "DRAFT",
        });

        if (!bundle) {
            console.error("[Service] ✗ Failed to create bundle");

            return {
                success: false,
                message: "Failed to create bundle in database",
                errors: {
                    database: {
                        _errors: ["Failed to create bundle"],
                    },
                },
                bundle: null,
            };
        }

        const transformedBundle = transformBundle(bundle);

        return {
            success: true,
            message: "Bundle created successfully",
            errors: null,
            bundle: transformedBundle,
        };
    } catch (error) {
        return handleBundleOperationError(error);
    }
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
    const { bundleId, shop, status, startDate, endDate } = input;

    if (!BUNDLE_STATUSES[status]) {
        throw new Error("Invalid bundle status");
    }

    if (status === "DELETED") {
        throw new Error("Use the delete action to delete bundles");
    }

    const currentBundle = await findBundleByIdWithAllRelations(bundleId, shop);
    if (currentBundle?.status === "DELETED") {
        throw new Error("Cannot modify a deleted bundle");
    }

    const updatedBundle = await updateBundleStatusById(
        bundleId,
        shop,
        status,
        startDate,
        endDate,
    );

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
        };
    }

    // Validate input
    if (!bundleIds || bundleIds.length === 0) {
        return {
            success: false,
            message: "No bundle IDs provided",
        };
    }

    // Limit bulk operations
    if (bundleIds.length > 100) {
        return {
            success: false,
            message: "Cannot update more than 100 bundles at once",
        };
    }

    const result = await bulkUpdateBundleStatuses(bundleIds, shop, status);

    // Generate message
    const message =
        result.failedCount > 0
            ? `${result.updatedCount} bundle${result.updatedCount > 1 ? "s" : ""} updated to ${status.toLowerCase()} (${result.failedCount} failed)`
            : `${result.updatedCount} bundle${result.updatedCount > 1 ? "s" : ""} updated to ${status.toLowerCase()}`;

    return {
        success: true,
        message,
        mainProductIds: result.mainProductIds,
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

/*
 * Update a bundle with validation
 */
export async function updateBundleService(
    input: UpdateBundleServiceInput,
): Promise<UpdateBundleServiceResponse> {
    const { shop, bundleId, data } = input;

    console.log(`[Update] Updating bundle: ${bundleId} for shop: ${shop}`);
    console.log(`[Update] Bundle name: ${data.name}`);
    console.log(`[Update] Bundle type: ${data.type}`);

    try {
        // Perform security checks
        const securityResult = await checkBundleSecurity(shop);

        if (!securityResult.success) {
            return {
                success: false,
                message: securityResult.message || "Security check failed",
                errors: securityResult.errors || null,
                bundle: null,
            };
        }

        // Verify bundle ownership
        const bundle = await findBundleByIdWithAllRelations(bundleId, shop);

        if (!bundle) {
            console.log(`[Update] ✗ Bundle not found or access denied`);

            return {
                success: false,
                message:
                    "Bundle not found or you don't have permission to edit it",
                errors: {
                    bundleId: {
                        _errors: ["Bundle not found or access denied"],
                    },
                },
                bundle: null,
            };
        }

        console.log("[Update] ✓ Bundle ownership verified");

        // Fetch shop settings for validation context
        const context = await fetchOperationContext(shop);

        // Validate bundle data (security and business rules)
        const validationResult = validateBundleData(data, context);

        if (!validationResult.success) {
            const errors = formatValidationErrorsAsString(
                validationResult.errors || {},
            );
            return {
                success: false,
                message: errors || "Validation failed",
                errors: validationResult.errors,
                bundle: null,
            };
        }

        console.log("[Update] Step 5: Checking for name conflicts...");

        // Check if the new name conflicts with an existing bundle
        if (data.name !== bundle.name) {
            const nameExists = await checkNameConflict(shop, data.name);

            if (nameExists) {
                console.log(
                    `[Update] ✗ Bundle name already exists: ${data.name}`,
                );

                return {
                    success: false,
                    message: `A bundle with the name "${data.name}" already exists`,
                    errors: {
                        name: {
                            _errors: [
                                `A bundle with the name "${data.name}" already exists`,
                            ],
                        },
                    },
                    bundle: null,
                };
            }

            console.log("[Update] ✓ Name is unique");
        } else {
            console.log("[Update] ✓ Name unchanged, skipping conflict check");
        }

        console.log("[Update] Step 6: Updating bundle in database...");
        console.log(`[Update] Updating with ${data.products.length} products`);

        // Update bundle with relations (via repository)
        const updatedBundle = await updateBundleWithRelations({
            bundleId,
            shop,
            ...data,
        });

        if (!updatedBundle) {
            console.error("[Update] ✗ Failed to update bundle");

            return {
                success: false,
                message: "Failed to update bundle in database",
                errors: {
                    database: {
                        _errors: ["Failed to update bundle"],
                    },
                },
                bundle: null,
            };
        }

        console.log(
            `[Update] ✓ Bundle updated successfully: ${updatedBundle.id}`,
        );

        const transformedBundle = transformBundle(updatedBundle);

        return {
            success: true,
            message: "Bundle updated successfully",
            errors: null,
            bundle: transformedBundle,
        };
    } catch (error) {
        return handleBundleOperationError(error);
    }
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
    const newBundle = await createBundleService({
        shop,
        data: duplicateData,
    });

    return {
        success: true,
        data: newBundle,
        message: `Bundle duplicated as "${newName}"`,
    };
}
