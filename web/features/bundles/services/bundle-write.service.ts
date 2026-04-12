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
    fetchBundlePreflight,
    handleBundleOperationError,
    transformBundle,
    transformBundleForDuplication,
    validateBundleData,
} from "@/features/bundles/services";
import {
    bulkUpdateBundleStatuses,
    createBundleWithRelations,
    deleteBundlesWithRelations,
    deleteBundleWithRelations,
    findBundleByIdWithAllRelations,
    findBundleStatusById,
    generateUniqueBundleName,
    updateBundleStatusById,
    updateBundleWithRelations,
} from "@/features/bundles/repositories";
import { formatValidationErrorsAsString } from "@/shared";
import { validateShopPermissions } from "@/features/bundles/services/bundle-security.service";
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

    try {
        // Run all preflight checks in parallel (security + context + quota)
        const preflight = await fetchBundlePreflight(shop);

        if (!preflight.security.success) {
            return {
                success: false,
                message: preflight.security.message || "Security check failed",
                errors: preflight.security.errors || null,
                bundle: null,
            };
        }

        // Plan-gate: check bundle type and status are allowed on the shop's current plan
        const permissionCheck = await validateShopPermissions(
            shop,
            "create",
            data.type,
            data.status,
        );
        if (!permissionCheck.passed) {
            return {
                success: false,
                message: permissionCheck.reason ?? "Bundle type not available on your plan",
                errors: null,
                bundle: null,
            };
        }

        const validationResult = validateBundleData(data, preflight.context);

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

        if (!preflight.quota.allowed) {
            return {
                success: false,
                message: preflight.quota.reason || "Bundle limit reached",
                errors: {
                    general: {
                        _errors: [
                            preflight.quota.reason || "Bundle limit reached",
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

    const currentBundle = await findBundleStatusById(bundleId, shop);
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
    const { shop, bundleId, data, existingBundle: passedBundle } = input;

    try {
        // Run security + context in parallel, reuse existing bundle if passed
        const [preflight, bundle] = await Promise.all([
            fetchBundlePreflight(shop),
            passedBundle
                ? Promise.resolve(
                      passedBundle as Awaited<
                          ReturnType<typeof findBundleByIdWithAllRelations>
                      >,
                  )
                : findBundleByIdWithAllRelations(bundleId, shop),
        ]);

        if (!preflight.security.success) {
            return {
                success: false,
                message: preflight.security.message || "Security check failed",
                errors: preflight.security.errors || null,
                bundle: null,
            };
        }

        // Plan-gate: check status is allowed on the shop's current plan
        const permissionCheck = await validateShopPermissions(
            shop,
            "update",
            undefined,
            data.status,
        );
        if (!permissionCheck.passed) {
            return {
                success: false,
                message: permissionCheck.reason ?? "Status not available on your plan",
                errors: null,
                bundle: null,
            };
        }

        if (!bundle) {
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

        const validationResult = validateBundleData(data, preflight.context);

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

        const updatedBundle = await updateBundleWithRelations({
            bundleId,
            shop,
            ...data,
            nameChanged: data.name !== bundle.name,
        });

        if (!updatedBundle) {
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
    const { data: duplicateData, hadStandaloneProduct } =
        transformBundleForDuplication(original, newName);
    const newBundle = await createBundleService({
        shop,
        data: duplicateData,
    });

    if (!newBundle.success) {
        return {
            success: false,
            data: null,
            message: newBundle.message || "Failed to duplicate bundle",
        };
    }

    return {
        success: true,
        data: { ...newBundle, hadStandaloneProduct },
        message: `Bundle duplicated as "${newName}"`,
    };
}
