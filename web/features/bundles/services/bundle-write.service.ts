/**
 * Bundle Write Service - Business Logic Layer
 */

import {
    BulkDeleteBundlesInput,
    BulkDeleteBundlesServiceResult,
    BulkUpdateBundleStatusInput,
    BulkUpdateBundleStatusResult,
    BUNDLE_STATUSES,
    canCreateBundle,
    checkNameConflict,
    createBundle,
    CreateBundleServiceInput,
    CreateBundleServiceResponse,
    createBundleWithRelations,
    DeleteBundleInput,
    DeleteBundleServiceResult,
    deleteBundlesWithRelations,
    deleteBundleWithRelations,
    DuplicateBundleInput,
    DuplicateBundleResult,
    findBundleByIdWithAllRelations,
    findBundlesByIds,
    generateUniqueBundleName,
    performSecurityChecks,
    transformBundle,
    transformBundleForDuplication,
    updateBundlesStatusByIds,
    updateBundleStatusById,
    UpdateBundleStatusInput,
    UpdateBundleStatusResult,
    validateBusinessRules,
    validateSecurity,
} from "@/features/bundles";
import prisma from "@/lib/db/prisma-connect";
import { getShop } from "@/shared"; // ==========================================

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
        const securityCheck = await performSecurityChecks(shop);

        if (!securityCheck.passed) {
            console.log(
                `[Service] Security check failed: ${securityCheck.reason}`,
            );

            return {
                success: false,
                message: securityCheck.reason || "Security check failed",
                errors: {
                    security: {
                        _errors: [
                            securityCheck.reason || "Security check failed",
                        ],
                    },
                },
                bundle: null,
            };
        }

        const shopSettings = await getShop(shop);

        if (shopSettings) {
            console.log(
                `[Service] Shop settings loaded: maxProducts=${shopSettings.maxBundleProducts}`,
            );
        } else {
            console.log("[Service] No shop settings found, using defaults");
        }

        const securityValidation = validateSecurity(data);

        if (!securityValidation.success) {
            console.log("[Service] ✗ Security validation failed");

            return {
                success: false,
                message: "Security validation failed",
                errors: securityValidation.errors,
                bundle: null,
            };
        }

        const businessValidation = validateBusinessRules(data, {
            maxBundleProducts: shopSettings?.maxBundleProducts,
            maxBundlesPerShop: shopSettings?.maxBundlesPerShop,
            betaFeatures: shopSettings?.betaFeatures,
        });

        if (!businessValidation.success) {
            console.log("[Service] ✗ Business validation failed");
            console.log(
                `[Service] Errors: ${JSON.stringify(businessValidation.errors)}`,
            );

            return {
                success: false,
                message: "Business validation failed",
                errors: businessValidation.errors,
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
            status: "DRAFT",
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
        console.error("[Service] Unexpected error:", error);

        // Handle specific error types
        if (error instanceof Error) {
            // Prisma unique constraint error
            if (error.message.includes("Unique constraint")) {
                return {
                    success: false,
                    message: "A bundle with this name already exists",
                    errors: {
                        name: {
                            _errors: ["A bundle with this name already exists"],
                        },
                    },
                    bundle: null,
                };
            }

            // Transaction timeout
            if (error.message.includes("timeout")) {
                return {
                    success: false,
                    message:
                        "Operation timed out. Please try again with fewer products.",
                    errors: {
                        timeout: {
                            _errors: ["Operation timed out"],
                        },
                    },
                    bundle: null,
                };
            }

            // Generic error
            return {
                success: false,
                message: error.message,
                errors: {
                    server: {
                        _errors: [error.message],
                    },
                },
                bundle: null,
            };
        }

        // Unknown error
        return {
            success: false,
            message: "An unexpected error occurred",
            errors: {
                server: {
                    _errors: ["An unexpected error occurred"],
                },
            },
            bundle: null,
        };
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
            const notFoundIds = bundleIds.filter(
                (id) => !foundIds.includes(id),
            );

            // Update all found bundles
            await updateBundlesStatusByIds(tx, foundIds, status);

            // Fetch updated bundles
            const updatedBundles = await findBundlesByIds(foundIds, shop, tx);

            return {
                updatedBundles,
                updatedCount: updatedBundles.length,
                failedCount: notFoundIds.length,
            };
        },
        {
            timeout: 15000, // 15 seconds for bulk operations
        },
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
