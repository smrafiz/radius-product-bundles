import { bundleRepository } from '@/lib/db/repositories';
import {
    BusinessRuleError,
    NotFoundError,
    ConflictError,
} from '@/lib/errors';
import type { BundleFormData, BundleStatus, BundleType } from '../types';
import type { Bundle } from '@prisma/client';

/**
 * Bundle service - Contains business logic
 */
export class BundleService {
    private readonly MAX_BUNDLES_PER_SHOP = 100;
    private readonly MAX_PRODUCTS_PER_BUNDLE = 50;

    /**
     * Create a new bundle
     */
    async createBundle(shop: string, data: BundleFormData): Promise<Bundle> {
        // Business rule: Check shop limits
        await this.enforceShopLimits(shop);

        // Business rule: Check name uniqueness
        await this.ensureUniqueName(shop, data.name);

        // Business rule: Validate products
        this.validateProducts(data.products);

        // Business rule: Validate discount
        this.validateDiscount(data);

        // Create bundle with products
        const bundle = await bundleRepository.create({
            shop,
            name: data.name,
            description: data.description,
            type: data.type,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderValue: data.minOrderValue,
            maxDiscountAmount: data.maxDiscountAmount,
            startDate: data.startDate,
            endDate: data.endDate,
            // ... other fields with defaults
            views: 0,
            conversions: 0,
            revenue: 0,
            status: 'DRAFT',
            isPublished: false,
            aiOptimized: false,
            allowMixAndMatch: false,
            images: [],
        });

        return bundle;
    }

    /**
     * Update existing bundle
     */
    async updateBundle(
        id: string,
        shop: string,
        data: Partial<BundleFormData>
    ): Promise<Bundle> {
        // Verify bundle exists and belongs to shop
        const existing = await this.getBundleWithOwnershipCheck(id, shop);

        // If name is changing, check uniqueness
        if (data.name && data.name !== existing.name) {
            await this.ensureUniqueName(shop, data.name, id);
        }

        // Validate products if provided
        if (data.products) {
            this.validateProducts(data.products);
        }

        // Validate discount if changing
        if (data.discountType || data.discountValue !== undefined) {
            this.validateDiscount({
                discountType: data.discountType || existing.discountType,
                discountValue: data.discountValue ?? existing.discountValue,
                type: data.type || existing.type,
            } as BundleFormData);
        }

        // Update bundle
        return bundleRepository.update({ id }, data as any);
    }

    /**
     * Delete bundle
     */
    async deleteBundle(id: string, shop: string): Promise<void> {
        await this.getBundleWithOwnershipCheck(id, shop);
        await bundleRepository.delete({ id });
    }

    /**
     * Duplicate bundle
     */
    async duplicateBundle(id: string, shop: string): Promise<Bundle> {
        const original = await bundleRepository.findByIdWithAllRelations(id, shop);

        if (!original) {
            throw new NotFoundError('Bundle', id);
        }

        // Generate unique name
        const newName = await bundleRepository.generateUniqueName(
            shop,
            original.name
        );

        // Create duplicate
        return bundleRepository.create({
            shop,
            name: newName,
            description: original.description,
            type: original.type,
            discountType: original.discountType,
            discountValue: original.discountValue,
            minOrderValue: original.minOrderValue,
            maxDiscountAmount: original.maxDiscountAmount,
            // Reset metrics
            views: 0,
            conversions: 0,
            revenue: 0,
            status: 'DRAFT',
            isPublished: false,
            // ... copy other fields
        } as any);
    }

    /**
     * Update bundle status
     */
    async updateBundleStatus(
        id: string,
        shop: string,
        status: BundleStatus
    ): Promise<Bundle> {
        await this.getBundleWithOwnershipCheck(id, shop);
        return bundleRepository.updateStatus(id, shop, status);
    }

    /**
     * Get bundle with ownership verification
     */
    private async getBundleWithOwnershipCheck(
        id: string,
        shop: string
    ): Promise<Bundle> {
        const bundle = await bundleRepository.findById({ id });

        if (!bundle) {
            throw new NotFoundError('Bundle', id);
        }

        if (bundle.shop !== shop) {
            throw new NotFoundError('Bundle', id);
        }

        return bundle;
    }

    /**
     * Enforce shop bundle limits
     */
    private async enforceShopLimits(shop: string): Promise<void> {
        const count = await bundleRepository.countByShop(shop);

        if (count >= this.MAX_BUNDLES_PER_SHOP) {
            throw new BusinessRuleError(
                `Bundle limit of ${this.MAX_BUNDLES_PER_SHOP} reached for this shop`,
                {
                    currentCount: count,
                    limit: this.MAX_BUNDLES_PER_SHOP,
                }
            );
        }
    }

    /**
     * Ensure bundle name is unique
     */
    private async ensureUniqueName(
        shop: string,
        name: string,
        excludeId?: string
    ): Promise<void> {
        const existing = await bundleRepository.findByName(shop, name, excludeId);

        if (existing) {
            throw new ConflictError('A bundle with this name already exists');
        }
    }

    /**
     * Validate products
     */
    private validateProducts(
        products: Array<{ productId: string; quantity: number }>
    ): void {
        if (!products || products.length === 0) {
            throw new BusinessRuleError('Bundle must have at least one product');
        }

        if (products.length > this.MAX_PRODUCTS_PER_BUNDLE) {
            throw new BusinessRuleError(
                `Bundle cannot have more than ${this.MAX_PRODUCTS_PER_BUNDLE} products`
            );
        }

        products.forEach((product, index) => {
            if (!product.productId) {
                throw new BusinessRuleError(
                    `Product at position ${index + 1} is missing productId`
                );
            }

            if (product.quantity < 1) {
                throw new BusinessRuleError(
                    `Product quantity must be at least 1`
                );
            }
        });
    }

    /**
     * Validate discount rules
     */
    private validateDiscount(data: {
        discountType: string;
        discountValue: number;
        type: BundleType;
    }): void {
        // BOGO bundles must use percentage discounts
        if (data.type === 'BOGO' && data.discountType !== 'PERCENTAGE') {
            throw new BusinessRuleError(
                'BOGO bundles must use percentage discounts'
            );
        }

        // Percentage cannot exceed 100%
        if (data.discountType === 'PERCENTAGE') {
            if (data.discountValue > 100) {
                throw new BusinessRuleError(
                    'Percentage discount cannot exceed 100%'
                );
            }
            if (data.discountValue < 0) {
                throw new BusinessRuleError(
                    'Discount percentage cannot be negative'
                );
            }
        }

        // Fixed amount cannot be negative
        if (data.discountType === 'FIXED_AMOUNT' && data.discountValue < 0) {
            throw new BusinessRuleError('Discount amount cannot be negative');
        }

        // Custom price must be positive
        if (data.discountType === 'CUSTOM_PRICE' && data.discountValue <= 0) {
            throw new BusinessRuleError('Custom price must be greater than zero');
        }
    }
}

// Export singleton instance
export const bundleService = new BundleService();