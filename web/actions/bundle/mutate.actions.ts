"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma-connect";
import { handleSessionToken } from "@/lib/shopify/verify";
import { validateAndCheckBusinessRules } from "@/lib/validation";
import { checkNameConflict, handleBundleError, removeNulls } from "@/utils";
import { bundleProductGroupQueries, bundleProductQueries, bundleQueries, bundleSettingsQueries, } from "@/lib/queries";

import { BundleStatus } from "@/types";
import { bundleStatusConfigs } from "@/config";

/**
 * Create a new bundle
 */
export async function createBundle(sessionToken: string, data: unknown) {
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
            await checkNameConflict(shop, validatedData.name);

            const bundle = await bundleQueries.create({
                ...validatedData,
                shop,
            });

            await createBundleRelations(bundle.id, validatedData);

            return bundle;
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
            errors: null,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

async function createBundleRelations(bundleId: string, validatedData: any) {
    // Create bundle products
    if (validatedData.products.length > 0) {
        await bundleProductQueries.createManyFromValidatedData(
            bundleId,
            validatedData.products,
        );
    }

    // Create product groups
    if (validatedData.productGroups?.length > 0) {
        await bundleProductGroupQueries.createManyFromValidatedData(
            bundleId,
            validatedData.productGroups,
        );
    }

    // Create bundle settings
    if (validatedData.settings) {
        await bundleSettingsQueries.create({
            bundleId,
            ...validatedData.settings,
        });
    }
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
        console.log(data);
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
 * Duplicate a bundle by fetching original data and calling createBundle
 */
/**
 * Duplicate a bundle by fetching original data and calling createBundle
 */
export async function duplicateBundle(sessionToken: string, bundleId: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const original = await bundleQueries.findByIdWithAllRelations(
            bundleId,
            shop,
        );

        if (!original) {
            throw new Error(
                "Bundle not found or you don't have permission to duplicate it",
            );
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

async function updateBundleRelations(bundleId: string, validatedData: any) {
    // Update bundle products
    if (validatedData.products !== undefined) {
        await bundleProductQueries.deleteByBundle(bundleId);
        if (validatedData.products.length > 0) {
            await bundleProductQueries.createManyFromValidatedData(
                bundleId,
                validatedData.products,
            );
        }
    }

    // Update product groups
    if (validatedData.productGroups !== undefined) {
        await bundleProductGroupQueries.deleteByBundle(bundleId);
        if (validatedData.productGroups.length > 0) {
            await bundleProductGroupQueries.createManyFromValidatedData(
                bundleId,
                validatedData.productGroups,
            );
        }
    }

    // Update bundle settings
    if (validatedData.settings) {
        await bundleSettingsQueries.updateByBundle(
            bundleId,
            validatedData.settings,
        );
    }
}

/**
 * Update bundle status
 */
export async function updateBundleStatus(
    sessionToken: string,
    bundleId: string,
    status: BundleStatus,
) {
    try {
        // Validate status
        if (!bundleStatusConfigs[status]) {
            throw new Error("Invalid bundle status");
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
            errors: null,
        };
    } catch (error: any) {
        return {
            status: "error" as const,
            message: error.message || "Failed to update bundle status",
            data: null,
            errors: [error],
        };
    }
}

/**
 * Bulk delete bundles
 */
export async function deleteBundles(sessionToken: string, bundleIds: string[]) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        if (bundleIds.length === 0) {
            return {
                status: "error" as const,
                message: "No bundles selected for deletion",
                errors: null,
                data: null,
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            // Verify all bundles belong to the shop using query method
            const existingBundles = await bundleQueries.deleteManyWithOwnership(
                bundleIds,
                shop,
            );

            // Delete related records for all bundles
            await tx.bundleProduct.deleteMany({
                where: { bundleId: { in: bundleIds } },
            });

            await tx.bundleProductGroup.deleteMany({
                where: { bundleId: { in: bundleIds } },
            });

            await tx.bundleSettings.deleteMany({
                where: { bundleId: { in: bundleIds } },
            });

            await tx.bundleAnalytics.deleteMany({
                where: { bundleId: { in: bundleIds } },
            });

            return existingBundles;
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: `${result.length} bundle${result.length > 1 ? "s" : ""} deleted successfully`,
            data: {
                deletedCount: result.length,
                deletedBundles: result,
            },
            errors: null,
        };
    } catch (error) {
        return handleBundleError(error);
    }
}

/**
 * Delete a bundle
 */
export async function deleteBundle(sessionToken: string, bundleId: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await prisma.$transaction(async (tx) => {
            // Verify bundle ownership and get bundle info
            const existingBundle = await bundleQueries.findById(bundleId);
            console.log(existingBundle);

            if (!existingBundle || existingBundle.shop !== shop) {
                throw new Error(
                    "Bundle not found or you don't have permission to delete it",
                );
            }

            // Delete related records first
            await bundleProductQueries.deleteByBundle(bundleId);
            await bundleProductGroupQueries.deleteByBundle(bundleId);

            // Delete settings if they exist
            try {
                await tx.bundleSettings.deleteMany({
                    where: { bundleId },
                });
            } catch (error) {
                // Settings might not exist, continue
            }

            // Delete analytics
            await tx.bundleAnalytics.deleteMany({
                where: { bundleId },
            });

            // Delete the bundle using query method
            const deletedBundle = await bundleQueries.deleteById(bundleId);

            return {
                id: deletedBundle.id,
                name: deletedBundle.name,
            };
        });

        revalidatePath("/bundles");

        return {
            status: "success" as const,
            message: "Bundle deleted successfully",
            data: result,
            errors: null,
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
    newStatus: "ACTIVE" | "PAUSED",
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
    newStatus: "ACTIVE" | "PAUSED",
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
