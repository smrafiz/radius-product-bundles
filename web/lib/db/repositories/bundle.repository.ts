import { Prisma, Bundle, BundleStatus } from "@prisma/client";
import prisma from "../prisma";
import { BaseRepository } from "@/lib/db";

/**
 * Bundle repository for database operations
 */
export class BundleRepository extends BaseRepository<
    Bundle,
    Prisma.BundleCreateInput,
    Prisma.BundleUpdateInput,
    Prisma.BundleWhereUniqueInput,
    Prisma.BundleWhereInput
> {
    constructor() {
        super(prisma.bundle);
    }

    /**
     * Find bundles by shop with filters and pagination
     */
    async findByShop(
        shop: string,
        options?: {
            limit?: number;
            offset?: number;
            search?: string;
            status?: string[];
            type?: string[];
            orderBy?: string;
            orderDirection?: "asc" | "desc";
        },
    ): Promise<Bundle[]> {
        const where: Prisma.BundleWhereInput = {
            shop,
            ...(options?.search && {
                name: {
                    contains: options.search,
                    mode: "insensitive" as Prisma.QueryMode,
                },
            }),
            ...(options?.status?.length && {
                status: { in: options.status as BundleStatus[] },
            }),
            ...(options?.type?.length && {
                type: { in: options.type as any },
            }),
        };

        return this.findMany(where, {
            take: options?.limit,
            skip: options?.offset,
            orderBy: {
                [options?.orderBy || "createdAt"]:
                    options?.orderDirection || "desc",
            },
            include: {
                bundleProducts: {
                    select: {
                        productId: true,
                        variantId: true,
                        quantity: true,
                    },
                },
            },
        });
    }

    /**
     * Find bundle by ID with all relations
     */
    async findByIdWithAllRelations(id: string, shop: string) {
        return prisma.bundle.findFirst({
            where: { id, shop },
            include: {
                bundleProducts: true,
                productGroups: true,
                settings: true,
            },
        });
    }

    /**
     * Find bundle by ID with products
     */
    async findByIdWithProducts(id: string, shop: string) {
        return prisma.bundle.findFirst({
            where: { id, shop },
            include: {
                bundleProducts: {
                    select: {
                        id: true,
                        productId: true,
                        variantId: true,
                        quantity: true,
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Count bundles by shop with filters
     */
    async countByShop(
        shop: string,
        filters?: {
            search?: string;
            status?: string[];
            type?: string[];
        },
    ): Promise<number> {
        return this.count({
            shop,
            ...(filters?.search && {
                name: {
                    contains: filters.search,
                    mode: "insensitive" as Prisma.QueryMode,
                },
            }),
            ...(filters?.status?.length && {
                status: { in: filters.status as BundleStatus[] },
            }),
            ...(filters?.type?.length && {
                type: { in: filters.type as any },
            }),
        });
    }

    /**
     * Find bundle by name
     */
    async findByName(
        shop: string,
        name: string,
        excludeId?: string,
    ): Promise<Bundle | null> {
        return this.findFirst({
            shop,
            name,
            ...(excludeId && { id: { not: excludeId } }),
        });
    }

    /**
     * Update bundle status
     */
    async updateStatus(
        id: string,
        shop: string,
        status: BundleStatus,
    ): Promise<Bundle> {
        // Verify ownership first
        const bundle = await this.findFirst({ id, shop });
        if (!bundle) {
            throw new Error("Bundle not found or access denied");
        }

        return this.update({ id }, { status });
    }

    /**
     * Delete bundles by IDs (bulk delete)
     */
    async deleteManyByIds(ids: string[], shop: string): Promise<number> {
        const result = await this.deleteMany({
            id: { in: ids },
            shop,
        });
        return result.count;
    }

    /**
     * Generate unique name
     */
    async generateUniqueName(shop: string, baseName: string): Promise<string> {
        let counter = 1;
        let newName = `${baseName} (Copy)`;

        while (await this.exists({ shop, name: newName })) {
            counter++;
            newName = `${baseName} (Copy ${counter})`;
        }

        return newName;
    }

    /**
     * Get active bundles count
     */
    async countActiveBundles(shop: string): Promise<number> {
        return this.count({
            shop,
            status: "ACTIVE",
        });
    }

    /**
     * Get bundles created in date range
     */
    async findByDateRange(
        shop: string,
        startDate: Date,
        endDate: Date,
    ): Promise<Bundle[]> {
        return this.findMany({
            shop,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        });
    }
}

// Export singleton instance
export const bundleRepository = new BundleRepository();
