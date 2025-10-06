import { Prisma } from '@prisma/client';

/**
 * Base repository providing common CRUD operations
 * All feature repositories should extend this class
 */
export abstract class BaseRepository<
    TModel,
    TCreateInput,
    TUpdateInput,
    TWhereUniqueInput,
    TWhereInput
> {
    constructor(protected readonly model: any) {}

    /**
     * Find a single record by unique identifier
     */
    async findById(where: TWhereUniqueInput, include?: any): Promise<TModel | null> {
        return this.model.findUnique({
            where,
            ...(include && { include }),
        });
    }

    /**
     * Find multiple records with optional filters
     */
    async findMany(
        where?: TWhereInput,
        options?: {
            take?: number;
            skip?: number;
            orderBy?: any;
            include?: any;
            select?: any;
        }
    ): Promise<TModel[]> {
        return this.model.findMany({
            where,
            ...options,
        });
    }

    /**
     * Find first record matching criteria
     */
    async findFirst(where: TWhereInput, include?: any): Promise<TModel | null> {
        return this.model.findFirst({
            where,
            ...(include && { include }),
        });
    }

    /**
     * Create a new record
     */
    async create(data: TCreateInput, include?: any): Promise<TModel> {
        return this.model.create({
            data,
            ...(include && { include }),
        });
    }

    /**
     * Create multiple records
     */
    async createMany(data: TCreateInput[]): Promise<Prisma.BatchPayload> {
        return this.model.createMany({ data });
    }

    /**
     * Update a record
     */
    async update(
        where: TWhereUniqueInput,
        data: TUpdateInput,
        include?: any
    ): Promise<TModel> {
        return this.model.update({
            where,
            data,
            ...(include && { include }),
        });
    }

    /**
     * Update multiple records
     */
    async updateMany(
        where: TWhereInput,
        data: TUpdateInput
    ): Promise<Prisma.BatchPayload> {
        return this.model.updateMany({ where, data });
    }

    /**
     * Delete a record
     */
    async delete(where: TWhereUniqueInput): Promise<TModel> {
        return this.model.delete({ where });
    }

    /**
     * Delete multiple records
     */
    async deleteMany(where: TWhereInput): Promise<Prisma.BatchPayload> {
        return this.model.deleteMany({ where });
    }

    /**
     * Count records matching criteria
     */
    async count(where?: TWhereInput): Promise<number> {
        return this.model.count({ where });
    }

    /**
     * Check if a record exists
     */
    async exists(where: TWhereInput): Promise<boolean> {
        const count = await this.count(where);
        return count > 0;
    }

    /**
     * Upsert - update if exists, create if not
     */
    async upsert(
        where: TWhereUniqueInput,
        create: TCreateInput,
        update: TUpdateInput
    ): Promise<TModel> {
        return this.model.upsert({
            where,
            create,
            update,
        });
    }
}