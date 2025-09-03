"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma-connect";
import { handleSessionToken } from "@/lib/shopify/verify";
import { bundleSchema, BundleFormData } from "@/lib/validation";

/**
 * Get bundles for a shop
 */
export async function getBundles(sessionToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const bundles = await prisma.bundle.findMany({
            where: { shop },
            include: {
                bundleProducts: {
                    orderBy: { displayOrder: "asc" },
                },
                _count: {
                    select: {
                        analytics: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            take: 10, // For the dashboard view.
        });

        const transformedBundles = bundles.map((bundle) => ({
            id: bundle.id,
            name: bundle.name,
            type: bundle.type,
            status: bundle.status,
            views: bundle.views,
            conversions: bundle.conversions,
            revenue: bundle.revenue,
            conversionRate:
                bundle.views > 0
                    ? (bundle.conversions / bundle.views) * 100
                    : 0,
            productCount: bundle.bundleProducts.length,
            createdAt: bundle.createdAt.toISOString(),
        }));

        return {
            status: "success" as const,
            data: transformedBundles,
        };
    } catch (error) {
        console.error("Failed to fetch bundles:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch bundles",
            data: [],
        };
    }
}

/**
 * Get bundle metrics for a shop
 */
export async function getBundleMetrics(sessionToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [currentPeriod, previousPeriod, totalRevenueAllTime, totalBundles, activeBundles] =
            await Promise.all([
                prisma.bundleAnalytics.aggregate({
                    where: {
                        bundle: { shop },
                        date: { gte: thirtyDaysAgo },
                    },
                    _sum: {
                        bundleViews: true,
                        bundlePurchases: true,
                        bundleRevenue: true,
                        bundleAddToCarts: true,
                    },
                }),
                prisma.bundleAnalytics.aggregate({
                    where: {
                        bundle: { shop },
                        date: {
                            gte: sixtyDaysAgo,
                            lt: thirtyDaysAgo,
                        },
                    },
                    _sum: {
                        bundleViews: true,
                        bundlePurchases: true,
                        bundleRevenue: true,
                    },
                }),
                prisma.bundleAnalytics.aggregate({
                    where: {
                        bundle: { shop },
                    },
                    _sum: {
                        bundleRevenue: true,
                    },
                }),
                prisma.bundle.count({
                    where: { shop },
                }),
                prisma.bundle.count({
                    where: { shop, status: "ACTIVE" },
                }),
            ]);

        const currentRevenue = currentPeriod._sum.bundleRevenue || 0;
        const currentViews = currentPeriod._sum.bundleViews || 0;
        const currentPurchases = currentPeriod._sum.bundlePurchases || 0;
        const currentAddToCarts = currentPeriod._sum.bundleAddToCarts || 0;

        const previousRevenue = previousPeriod._sum.bundleRevenue || 0;
        const previousViews = previousPeriod._sum.bundleViews || 0;
        const previousPurchases = previousPeriod._sum.bundlePurchases || 0;

        const revenueGrowth =
            previousRevenue > 0
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
                : currentRevenue > 0
                  ? 100
                  : 0;

        const conversionRate =
            currentViews > 0 ? (currentPurchases / currentViews) * 100 : 0;
        const previousConversionRate =
            previousViews > 0 ? (previousPurchases / previousViews) * 100 : 0;
        const conversionGrowth =
            previousConversionRate > 0
                ? ((conversionRate - previousConversionRate) /
                      previousConversionRate) *
                  100
                : conversionRate > 0
                  ? 100
                  : 0;

        return {
            status: "success" as const,
            data: {
                totals: {
                    totalBundles,
                    activeBundles,
                    revenue: currentRevenue,
                    revenueAllTime: totalRevenueAllTime._sum.bundleRevenue || 0,
                    views: currentViews,
                    purchases: currentPurchases,
                    addToCarts: currentAddToCarts,
                },
                metrics: {
                    conversionRate,
                    avgOrderValue:
                        currentPurchases > 0
                            ? currentRevenue / currentPurchases
                            : 0,
                    cartConversionRate:
                        currentAddToCarts > 0
                            ? (currentPurchases / currentAddToCarts) * 100
                            : 0,
                },
                growth: {
                    revenue: revenueGrowth,
                    conversion: conversionGrowth,
                },
            },
        };
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch metrics",
            data: {
                totals: {
                    totalBundles: 0,
                    activeBundles: 0,
                    revenue: 0,
                    views: 0,
                    purchases: 0,
                    addToCarts: 0,
                },
                metrics: {
                    conversionRate: 0,
                    avgOrderValue: 0,
                    cartConversionRate: 0,
                },
                growth: { revenue: 0, conversion: 0 },
            },
        };
    }
}

/**
 * Create a new bundle
 */
export async function createBundle(sessionToken: string, data: unknown) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const validationResult = bundleSchema.safeParse(data);

        if (!validationResult.success) {
            const validationError = z.treeifyError(validationResult.error);

            return {
                status: "error" as const,
                message: "Validation failed",
                errors: validationError,
                data: null,
            };
        }

        const validatedData = validationResult.data;

        const businessValidation = await validateBusinessRules(
            shop,
            validatedData,
        );
        if (!businessValidation.success) {
            return {
                status: "error" as const,
                message: businessValidation.message,
                errors: businessValidation.errors,
                data: null,
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            // Check if the bundle name already exists for this shop
            const existingBundle = await tx.bundle.findUnique({
                where: {
                    shop_name: {
                        shop: shop,
                        name: validatedData.name,
                    },
                },
            });

            if (existingBundle) {
                throw new Error(
                    `Bundle with name "${validatedData.name}" already exists`,
                );
            }

            // Create the bundle
            const bundle = await tx.bundle.create({
                data: {
                    shop,
                    name: validatedData.name,
                    description: validatedData.description || null,
                    type: inferBundleType(validatedData),
                    status: validatedData.status,
                    discountType: validatedData.discountType,
                    discountValue: validatedData.discountValue || 0,
                    minOrderValue: validatedData.minOrderValue || null,
                    maxDiscountAmount: validatedData.maxDiscountAmount || null,
                    startDate: validatedData.startDate || null,
                    endDate: validatedData.endDate || null,
                    // Initialize performance fields
                    images: [],
                    views: 0,
                    conversions: 0,
                    revenue: 0,
                    aiOptimized: false,
                },
            });

            // Create bundle products
            if (validatedData.products && validatedData.products.length > 0) {
                const bundleProducts = validatedData.products.map(
                    (product, index) => ({
                        bundleId: bundle.id,
                        productId: product.productId,
                        variantId: product.variantId || null,
                        quantity: product.quantity,
                        displayOrder: product.displayOrder ?? index,
                        isMain: index === 0, // The first product is the main
                        isRequired: product.isRequired,
                    }),
                );

                await tx.bundleProduct.createMany({
                    data: bundleProducts,
                });
            }

            return bundle;
        });

        // Revalidate relevant pages
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
        console.error("Failed to create bundle:", error);

        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return {
                    status: "error" as const,
                    message: error.message,
                    errors: { name: { _errors: [error.message] } },
                    data: null,
                };
            }
        }

        return {
            status: "error" as const,
            message: "Failed to create bundle. Please try again.",
            errors: null,
            data: null,
        };
    }
}

/**
 * Update an existing bundle
 */
export async function updateBundle(
    sessionToken: string,
    bundleId: string,
    data: unknown
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const validationResult = bundleSchema.safeParse(data);

        if (!validationResult.success) {
            const validationError = z.treeifyError(validationResult.error);

            return {
                status: "error" as const,
                message: "Validation failed",
                errors: validationError,
                data: null,
            };
        }

        const validatedData = validationResult.data;

        const businessValidation = await validateBusinessRules(shop, validatedData);

        if (!businessValidation.success) {
            return {
                status: "error" as const,
                message: businessValidation.message,
                errors: businessValidation.errors,
                data: null,
            };
        }

        // Update bundle in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Verify bundle ownership
            const existingBundle = await tx.bundle.findFirst({
                where: {
                    id: bundleId,
                    shop,
                },
                include: {
                    bundleProducts: true,
                },
            });

            if (!existingBundle) {
                throw new Error("Bundle not found or you don't have permission to update it");
            }

            // Check name uniqueness (excluding current bundle)
            const nameConflict = await tx.bundle.findFirst({
                where: {
                    shop,
                    name: validatedData.name,
                    id: { not: bundleId },
                },
            });

            if (nameConflict) {
                throw new Error(`Bundle with name "${validatedData.name}" already exists`);
            }

            // Update the bundle
            const updatedBundle = await tx.bundle.update({
                where: { id: bundleId },
                data: {
                    name: validatedData.name,
                    description: validatedData.description || null,
                    type: inferBundleType(validatedData),
                    status: validatedData.status,
                    discountType: validatedData.discountType,
                    discountValue: validatedData.discountValue || 0,
                    minOrderValue: validatedData.minOrderValue || null,
                    maxDiscountAmount: validatedData.maxDiscountAmount || null,
                    startDate: validatedData.startDate || null,
                    endDate: validatedData.endDate || null,
                },
            });

            // Update bundle products
            if (validatedData.products) {
                // Remove existing products
                await tx.bundleProduct.deleteMany({
                    where: { bundleId },
                });

                // Add new products
                if (validatedData.products.length > 0) {
                    const bundleProducts = validatedData.products.map((product, index) => ({
                        bundleId: bundleId,
                        productId: product.productId,
                        variantId: product.variantId || null,
                        quantity: product.quantity,
                        displayOrder: product.displayOrder ?? index,
                        isMain: index === 0,
                        isRequired: product.isRequired,
                    }));

                    await tx.bundleProduct.createMany({
                        data: bundleProducts,
                    });
                }
            }

            return updatedBundle;
        });

        revalidatePath('/bundles');
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
        console.error("Failed to update bundle:", error);

        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return {
                    status: "error" as const,
                    message: error.message,
                    errors: { name: { _errors: [error.message] } },
                    data: null,
                };
            }

            if (error.message.includes("not found")) {
                return {
                    status: "error" as const,
                    message: error.message,
                    errors: null,
                    data: null,
                };
            }
        }

        return {
            status: "error" as const,
            message: "Failed to update bundle. Please try again.",
            errors: null,
            data: null,
        };
    }
}

/**
 * Get a single bundle with full details
 */
export async function getBundle(sessionToken: string, bundleId: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const bundle = await prisma.bundle.findFirst({
            where: {
                id: bundleId,
                shop,
            },
            include: {
                bundleProducts: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });

        if (!bundle) {
            return {
                status: "error" as const,
                message: "Bundle not found",
                data: null,
            };
        }

        return {
            status: "success" as const,
            data: {
                id: bundle.id,
                name: bundle.name,
                description: bundle.description,
                type: bundle.type,
                status: bundle.status,
                discountType: bundle.discountType,
                discountValue: bundle.discountValue,
                minOrderValue: bundle.minOrderValue,
                maxDiscountAmount: bundle.maxDiscountAmount,
                startDate: bundle.startDate?.toISOString(),
                endDate: bundle.endDate?.toISOString(),
                products: bundle.bundleProducts.map(bp => ({
                    id: bp.id,
                    productId: bp.productId,
                    variantId: bp.variantId,
                    quantity: bp.quantity,
                    displayOrder: bp.displayOrder,
                    isMain: bp.isMain,
                    isRequired: bp.isRequired,
                })),
                createdAt: bundle.createdAt.toISOString(),
                updatedAt: bundle.updatedAt.toISOString(),
            },
        };

    } catch (error) {
        console.error("Failed to fetch bundle:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch bundle",
            data: null,
        };
    }
}

/**
 * Helper function to validate business rules
 */
async function validateBusinessRules(shop: string, data: BundleFormData) {
    const errors: Record<string, any> = {};

    try {
        // Get app settings for this shop (if you have app settings table)
        // const appSettings = await prisma.appSettings.findUnique({
        //     where: { shop },
        // });

        // Check maximum bundle products limit
        const maxProducts = 10; // appSettings?.maxBundleProducts || 10;
        if (data.products && data.products.length > maxProducts) {
            errors.products = {
                _errors: [`Bundle can have maximum ${maxProducts} products`],
            };
        }

        // Validate discount value based on type
        if (data.discountType === "PERCENTAGE" && data.discountValue) {
            if (data.discountValue > 100) {
                errors.discountValue = {
                    _errors: ["Percentage discount cannot exceed 100%"],
                };
            }
        }

        // Check if a discount value is reasonable for fixed amounts
        if (data.discountType === "FIXED_AMOUNT" && data.discountValue) {
            if (data.discountValue > 10000) { // Business rule
                errors.discountValue = {
                    _errors: ["Fixed discount amount seems too high"],
                };
            }
        }

        // Validate date ranges
        if (data.startDate && data.startDate < new Date()) {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            if (data.startDate < oneDayAgo) {
                errors.startDate = {
                    _errors: ["Start date is more than a day in the past"],
                };
            }
        }

        return {
            success: Object.keys(errors).length === 0,
            message: Object.keys(errors).length > 0 ? "Business validation failed" : "Validation passed",
            errors: Object.keys(errors).length > 0 ? errors : null,
        };

    } catch (error) {
        console.error("Business validation error:", error);
        return {
            success: false,
            message: "Failed to validate business rules",
            errors: { general: { _errors: ["Internal validation error"] } },
        };
    }
}

/**
 * Helper function to infer a bundle type from form data
 */
function inferBundleType(data: BundleFormData) {
    if (data.discountType === "NO_DISCOUNT") {
        return "CROSS_SELL";
    }

    if (data.discountType === "FREE_SHIPPING") {
        return "FIXED_BUNDLE";
    }

    // Default to fixed bundle
    return "FIXED_BUNDLE";
}