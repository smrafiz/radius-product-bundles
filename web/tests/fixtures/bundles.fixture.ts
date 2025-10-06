import { Bundle, BundleType, BundleStatus, DiscountType } from '@prisma/client';

/**
 * Create a mock bundle with default values
 */
export function createMockBundle(overrides?: Partial<Bundle>): Bundle {
    return {
        id: 'bundle-test-1',
        shop: 'test-shop.myshopify.com',
        name: 'Test Bundle',
        description: 'A test bundle for unit testing',
        type: 'FIXED_BUNDLE' as BundleType,
        status: 'ACTIVE' as BundleStatus,
        discountType: 'PERCENTAGE' as DiscountType,
        discountValue: 10,
        minOrderValue: null,
        maxDiscountAmount: null,
        mainProductId: null,
        buyQuantity: null,
        getQuantity: null,
        minimumItems: null,
        maximumItems: null,
        volumeTiers: null,
        allowMixAndMatch: false,
        mixAndMatchPrice: null,
        images: [],
        marketingCopy: null,
        seoTitle: null,
        seoDescription: null,
        views: 100,
        conversions: 10,
        revenue: 500,
        isPublished: true,
        publishedAt: new Date('2024-01-01'),
        startDate: null,
        endDate: null,
        aiOptimized: false,
        aiScore: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides,
    };
}

/**
 * Create multiple mock bundles
 */
export function createMockBundles(count: number): Bundle[] {
    return Array.from({ length: count }, (_, i) =>
        createMockBundle({
            id: `bundle-test-${i + 1}`,
            name: `Test Bundle ${i + 1}`,
        })
    );
}

/**
 * Mock bundle data
 */
export const mockBundle = createMockBundle();
export const mockBundles = createMockBundles(5);