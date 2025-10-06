import type { Bundle, BundleProduct } from "@prisma/client";
import type {
    BundleStatus,
    BundleType,
    DiscountType,
    TransformedBundle,
    TransformedBundleBase,
    TransformedBundleListing,
} from "@/types";

/**
 * Core bundle transformation
 */
export function transformBundleCore(
    bundle: Bundle & { bundleProducts: BundleProduct[] },
    productMap?: Map<string, any>,
    variantMap?: Map<string, any>,
): TransformedBundleBase {
    return {
        id: bundle.id,
        name: bundle.name,
        type: bundle.type as BundleType,
        status: bundle.status as BundleStatus,
        views: bundle.views,
        conversions: bundle.conversions,
        revenue: bundle.revenue,
        revenueAllTime: bundle.revenue,
        conversionRate:
            bundle.views > 0 ? (bundle.conversions / bundle.views) * 100 : 0,
        productCount: bundle.bundleProducts.length,
        createdAt: bundle.createdAt.toISOString(),
        discountType: bundle.discountType as DiscountType,
        discountValue: bundle.discountValue,
        products: bundle.bundleProducts
            .map((bp) => {
                const product = productMap?.get(bp.productId);
                const selectedVariant = bp.variantId
                    ? variantMap?.get(bp.variantId)
                    : null;

                if (!product) {
                    return null;
                }

                return {
                    ...product,
                    selectedVariant,
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
    variantMap?: Map<string, any>,
): TransformedBundleListing {
    return bundles.map((bundle) =>
        transformBundleCore(bundle, productMap, variantMap),
    );
}

/**
 * Single bundle transformation
 */
export function transformBundle(
    bundle: Bundle & { bundleProducts: BundleProduct[] },
    productMap?: Map<string, any>,
    variantMap?: Map<string, any>,
): TransformedBundle {
    const core = transformBundleCore(bundle, productMap, variantMap);

    return {
        ...core,
        description: bundle.description,
        minOrderValue: bundle.minOrderValue,
        maxDiscountAmount: bundle.maxDiscountAmount,
        startDate: bundle.startDate?.toISOString() || null,
        endDate: bundle.endDate?.toISOString() || null,
        updatedAt: bundle.updatedAt.toISOString(),
        products: core.products.map((p, i) => ({
            ...p,
            id: bundle.bundleProducts[i].id,
            isRequired: bundle.bundleProducts[i].isRequired,
        })),
    };
}
