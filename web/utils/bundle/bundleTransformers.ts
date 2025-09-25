import type { Bundle, BundleProduct } from "@prisma/client";
import type { TransformedBundle, TransformedBundleListing, TransformedBundle } from "@/types";

/**
 * Core bundle transformation
 */
export function transformBundleCore(
    bundle: Bundle & { bundleProducts: BundleProduct[] },
    productMap?: Map<string, any>,
    variantMap?: Map<string, any>
): TransformedBundle {
    return {
        id: bundle.id,
        name: bundle.name,
        type: bundle.type,
        status: bundle.status,
        views: bundle.views,
        conversions: bundle.conversions,
        revenue: bundle.revenue,
        conversionRate: bundle.views > 0 ? (bundle.conversions / bundle.views) * 100 : 0,
        productCount: bundle.bundleProducts.length,
        createdAt: bundle.createdAt.toISOString(),
        discountType: bundle.discountType,
        discountValue: bundle.discountValue,
        products: bundle.bundleProducts
            .map(bp => {
                const product = productMap?.get(bp.productId);
                const selectedVariant = variantMap?.get(bp.variantId);

                if (!product) return null;

                return {
                    ...product,
                    selectedVariant: selectedVariant || null,
                    quantity: bp.quantity,
                    role: bp.role,
                    displayOrder: bp.displayOrder,
                };
            })
            .filter(Boolean),
    };
}

/**
 * Listing transformation
 */
export function transformBundles(
    bundles: (Bundle & { bundleProducts: BundleProduct[] })[],
    productMap?: Map<string, any>,
    variantMap?: Map<string, any>
): TransformedBundleListing {
    return bundles.map(bundle => transformBundleCore(bundle, productMap, variantMap));
}

/**
 * Single bundle transformation
 */
export function transformBundle(
    bundle: Bundle & { bundleProducts: BundleProduct[] }
): TransformedBundle {
    return {
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        type: bundle.type,
        status: bundle.status,
        discountType: bundle.discountType,
        discountValue: bundle.discountValue,
        minOrderValue: bundle.minOrderValue,
        maxDiscountAmount: bundle.maxDiscountAmount,
        startDate: bundle.startDate?.toISOString() || null,
        endDate: bundle.endDate?.toISOString() || null,
        createdAt: bundle.createdAt.toISOString(),
        updatedAt: bundle.updatedAt.toISOString(),
        products: bundle.bundleProducts.map(bp => ({
            id: bp.id,
            productId: bp.productId,
            variantId: bp.variantId,
            quantity: bp.quantity,
            displayOrder: bp.displayOrder,
            isMain: bp.isMain,
            isRequired: bp.isRequired,
        })),
    };
}