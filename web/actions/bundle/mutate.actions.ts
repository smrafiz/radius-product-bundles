"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma-connect";
import { handleSessionToken } from "@/lib/shopify/verify";
import { validateAndCheckBusinessRules } from "@/lib/validation";
import {
    checkNameConflict,
    handleBundleError,
    normalizeErrors,
    removeNulls,
} from "@/utils";
import { bundleProductGroupQueries, bundleProductQueries, bundleQueries, bundleSettingsQueries, } from "@/lib/queries";

import { ApiResponse, BundleStatus } from "@/types";
import { bundleStatusConfigs } from "@/config";

/**
 * Create a new bundle
 */
export async function createBundle(sessionToken: string, data: unknown): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const validation = await validateAndCheckBusinessRules(shop, data);

        if (!validation || !validation.success) {
            return {
                status: "error",
                message: "Validation failed",
                errors: normalizeErrors(validation?.errors),
                data: undefined,
            };
        }

        const validatedData = validation.data;

        if (!validatedData) {
            return {
                status: "error" as const,
                message: "No validated data returned",
                errors: undefined,
                data: undefined,
            };
        }

        const result = await prisma.$transaction(async () => {
            await checkNameConflict(shop, validatedData.name);

            const bundle = await bundleQueries.create({
                ...validatedData,
                shop,
            });

            await createBundleRelations(bundle.id, validatedData);

            return bundle;
        }, {
            timeout: 10000,
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: "Bundle created successfully",
            data: {
                id: result.id,
                name: result.name,
                status: result.status,
                createdAt: result.createdAt.toISOString(),
            },
            errors: undefined,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Create bundle relations
 */
async function createBundleRelations(bundleId: string, validatedData: any) {
    const operations = [];

    if (validatedData.products?.length > 0) {
        operations.push(
            bundleProductQueries.createManyFromValidatedData(
                bundleId,
                validatedData.products,
            )
        );
    }

    if (validatedData.productGroups?.length > 0) {
        operations.push(
            bundleProductGroupQueries.createManyFromValidatedData(
                bundleId,
                validatedData.productGroups,
            )
        );
    }

    if (validatedData.settings) {
        operations.push(
            bundleSettingsQueries.create({
                bundleId,
                ...validatedData.settings,
            })
        );
    }

    await Promise.all(operations);
}

/**
 * Update an existing bundle
 */
export async function updateBundle(
    sessionToken: string,
    bundleId: string,
    data: unknown,
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const validation = await validateAndCheckBusinessRules(shop, data);

        if (!validation || !validation.success) {
            return validation;
        }

        const validatedData = validation.data;

        if (!validatedData) {
            return {
                status: "error" as const,
                message: "No validated data returned",
                errors: null,
                data: null,
            };
        }

        const result = await prisma.$transaction(async () => {
            // Verify bundle ownership
            const existingBundle = await bundleQueries.findById(bundleId);
            if (!existingBundle || existingBundle.shop !== shop) {
                throw new Error(
                    "Bundle not found or you don't have permission to update it",
                );
            }

            await checkNameConflict(shop, validatedData.name, bundleId);

            const updatedBundle = await bundleQueries.updateById(bundleId, {
                name: validatedData.name,
                description: validatedData.description || null,
                type: validatedData.type,
                mainProductId: validatedData.mainProductId || null,
                buyQuantity: validatedData.buyQuantity || null,
                getQuantity: validatedData.getQuantity || null,
                minimumItems: validatedData.minimumItems || null,
                maximumItems: validatedData.maximumItems || null,
                discountType: validatedData.discountType,
                discountValue: validatedData.discountValue || 0,
                minOrderValue: validatedData.minOrderValue || null,
                maxDiscountAmount: validatedData.maxDiscountAmount || null,
                volumeTiers: validatedData.volumeTiers || null,
                allowMixAndMatch: validatedData.allowMixAndMatch || false,
                mixAndMatchPrice: validatedData.mixAndMatchPrice || null,
                marketingCopy: validatedData.marketingCopy || null,
                seoTitle: validatedData.seoTitle || null,
                seoDescription: validatedData.seoDescription || null,
                images: validatedData.images || [],
                startDate: validatedData.startDate || null,
                endDate: validatedData.endDate || null,
            });

            await updateBundleRelations(bundleId, validatedData);

            return updatedBundle;
        }, {
            timeout: 10000,
        });

        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);

        return {
            status: "success" as const,
            message: "Bundle updated successfully",
            data: {
                id: result.id,
                name: result.name,
                status: result.status,
                updatedAt: result.updatedAt.toISOString(),
            },
            errors: null,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Duplicate a bundle
 */
export async function duplicateBundle(
    sessionToken: string,
    bundleId: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const original = await bundleQueries.findByIdWithAllRelations(
            bundleId,
            shop,
        );

        if (!original) {
            return {
                status: "error",
                message: "Bundle not found or you don't have permission to duplicate it",
                data: null
            };
        }

        const newName = await bundleQueries.generateUniqueName(
            shop,
            original.name,
        );

        // Destructure and exclude fields that should not be duplicated
        const {
            id,
            shop: _,
            createdAt,
            updatedAt,
            views,
            conversions,
            revenue,
            isPublished,
            publishedAt,
            aiOptimized,
            aiScore,
            bundleProducts,
            productGroups,
            settings,
            ...bundleData
        } = original;

        // Transform to createBundle format and remove nulls
        const duplicateData = removeNulls({
            ...bundleData,
            name: newName,
            products: bundleProducts.map(
                ({ id, bundleId, createdAt, updatedAt, ...bp }) => bp,
            ),
            productGroups: productGroups?.map(({ id, bundleId, ...pg }) => pg),
            settings: settings
                ? (() => {
                      const {
                          id,
                          bundleId,
                          createdAt,
                          updatedAt,
                          widget,
                          style,
                          animations,
                          mobileSettings,
                          variant,
                          misc,
                          ...s
                      } = settings;
                      return s;
                  })()
                : undefined,
        });

        const result = await createBundle(sessionToken, duplicateData);

        return result.status === "success"
            ? { ...result, message: `Bundle duplicated as "${newName}"` }
            : result;
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Update bundle relations
 */
async function updateBundleRelations(bundleId: string, validatedData: any) {
    const operations = [];

    // Handle products
    if (validatedData.products !== undefined) {
        operations.push(
            bundleProductQueries.deleteByBundle(bundleId)
                .then(() => {
                    if (validatedData.products.length > 0) {
                        return bundleProductQueries.createManyFromValidatedData(
                            bundleId,
                            validatedData.products,
                        );
                    }
                })
        );
    }

    // Handle product groups
    if (validatedData.productGroups !== undefined) {
        operations.push(
            bundleProductGroupQueries.deleteByBundle(bundleId)
                .then(() => {
                    if (validatedData.productGroups.length > 0) {
                        return bundleProductGroupQueries.createManyFromValidatedData(
                            bundleId,
                            validatedData.productGroups,
                        );
                    }
                })
        );
    }

    // Handle settings
    if (validatedData.settings) {
        operations.push(
            bundleSettingsQueries.updateByBundle(
                bundleId,
                validatedData.settings,
            )
        );
    }

    await Promise.all(operations);
}

/**
 * Update bundle status
 */
export async function updateBundleStatus(
    sessionToken: string,
    bundleId: string,
    status: BundleStatus,
): Promise<ApiResponse> {
    try {
        // Validate status
        if (!bundleStatusConfigs[status]) {
            return {
                status: "error",
                message: "Invalid bundle status",
                data: null
            };
        }

        // Get shop from the session
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Update only the status
        const updatedBundle = await bundleQueries.updateStatusById(
            bundleId,
            shop,
            status,
        );

        // Revalidate affected pages
        revalidatePath("/bundles");
        revalidatePath(`/bundles/${bundleId}`);

        return {
            status: "success" as const,
            message: "Bundle status updated successfully",
            data: updatedBundle,
            errors: undefined,
        };
    } catch (error: any) {
        return {
            status: "error" as const,
            message: error.message || "Failed to update bundle status",
            data: undefined,
            errors: [error],
        };
    }
}

/**
 * Bulk delete bundles
 */
export async function deleteBundles(sessionToken: string, bundleIds: string[]): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        if (bundleIds.length === 0) {
            return {
                status: "error" as const,
                message: "No bundles selected for deletion",
                errors: undefined,
                data: undefined,
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            // Verify all bundles belong to the shop
            const existingBundles = await tx.bundle.findMany({
                where: {
                    id: { in: bundleIds },
                    shop,
                },
                select: { id: true, name: true },
            });

            if (existingBundles.length === 0) {
                throw new Error("No bundles found or you don't have permission to delete them");
            }

            // Get IDs of bundles that actually exist
            const validBundleIds = existingBundles.map(b => b.id);

            // Delete all related records in PARALLEL
            await Promise.all([
                tx.bundleProduct.deleteMany({
                    where: { bundleId: { in: validBundleIds } },
                }),
                tx.bundleProductGroup.deleteMany({
                    where: { bundleId: { in: validBundleIds } },
                }),
                tx.bundleSettings.deleteMany({
                    where: { bundleId: { in: validBundleIds } },
                }),
                tx.bundleAnalytics.deleteMany({
                    where: { bundleId: { in: validBundleIds } },
                }),
            ]);

            // Delete the bundles themselves
            await tx.bundle.deleteMany({
                where: { id: { in: validBundleIds } },
            });

            return existingBundles;
        }, {
            timeout: 15000, // Longer timeout for bulk operations
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: `${result.length} bundle${result.length > 1 ? "s" : ""} deleted successfully`,
            data: {
                deletedCount: result.length,
                deletedBundles: result,
            },
            errors: undefined,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Delete a bundle
 */
export async function deleteBundle(sessionToken: string, bundleId: string): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await prisma.$transaction(async (tx) => {
            // Verify bundle ownership
            const existingBundle = await tx.bundle.findUnique({
                where: { id: bundleId },
                select: { id: true, name: true, shop: true }
            });

            if (!existingBundle || existingBundle.shop !== shop) {
                throw new Error(
                    "Bundle not found or you don't have permission to delete it",
                );
            }

            // Delete all related records in PARALLEL using Promise.all
            await Promise.all([
                tx.bundleProduct.deleteMany({ where: { bundleId } }),
                tx.bundleProductGroup.deleteMany({ where: { bundleId } }),
                tx.bundleSettings.deleteMany({ where: { bundleId } }),
                tx.bundleAnalytics.deleteMany({ where: { bundleId } }),
            ]);

            // Delete the bundle itself
            await tx.bundle.delete({ where: { id: bundleId } });

            return {
                id: existingBundle.id,
                name: existingBundle.name,
            };
        }, {
            timeout: 10000,
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: "Bundle deleted successfully",
            data: result,
            errors: undefined,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Toggle bundle status (activate/pause)
 */
export async function toggleBundleStatus(
    sessionToken: string,
    bundleId: string,
    newStatus: "ACTIVE" | "DRAFT",
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await prisma.$transaction(async () => {
            // Verify bundle ownership
            const existingBundle = await bundleQueries.findById(bundleId);
            if (!existingBundle || existingBundle.shop !== shop) {
                throw new Error(
                    "Bundle not found or you don't have permission to update it",
                );
            }

            // Update using query method
            return await bundleQueries.updateById(bundleId, {
                status: newStatus,
            });
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: `Bundle ${newStatus.toLowerCase()} successfully`,
            data: {
                id: result.id,
                name: result.name,
                status: result.status,
            },
            errors: null,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Bulk toggle bundle status
 */
export async function bulkToggleBundleStatus(
    sessionToken: string,
    bundleIds: string[],
    newStatus: "ACTIVE" | "DRAFT",
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        if (bundleIds.length === 0) {
            return {
                status: "error" as const,
                message: "No bundles selected",
                errors: null,
                data: null,
            };
        }

        const result = await prisma.$transaction(async () => {
            // Verify all bundles belong to the shop
            const existingBundles = await prisma.bundle.findMany({
                where: {
                    id: { in: bundleIds },
                    shop,
                },
                select: { id: true, name: true },
            });

            if (existingBundles.length !== bundleIds.length) {
                throw new Error(
                    "Some bundles not found or you don't have permission to update them",
                );
            }

            // Update all bundles
            await prisma.bundle.updateMany({
                where: { id: { in: bundleIds } },
                data: { status: newStatus },
            });

            return existingBundles;
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: `${result.length} bundle${result.length > 1 ? "s" : ""} ${newStatus.toLowerCase()} successfully`,
            data: {
                updatedCount: result.length,
                updatedBundles: result,
            },
            errors: null,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}
