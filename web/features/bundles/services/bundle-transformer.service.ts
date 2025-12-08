import {
    BundleStatus,
    BundleType,
    DiscountType,
    TransformedBundle,
    TransformedBundleBase,
    TransformedBundleListing,
} from "@/features/bundles";
import { removeNulls } from "@/shared";
import type { Bundle, BundleProduct } from "@prisma/client";

/**
 * Core bundle transformation.
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
                    id: product.id,
                    title: product.title,
                    handle: product.handle,
                    featuredImage: product.featuredImage,
                    selectedVariant: selectedVariant
                        ? {
                            ...selectedVariant,
                            productId: product.id,
                        }
                        : null,
                    quantity: bp.quantity,
                    role: bp.role,
                    displayOrder: bp.displayOrder,
                };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null),
    };
}

/**
 * Listing transformation.
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
 * Single bundle transformation.
 */
export function transformBundle(
    bundle: Bundle & { bundleProducts: BundleProduct[], settings?: any },
    productMap?: Map<string, any>,
    variantMap?: Map<string, any>,
): TransformedBundle {
    const core = transformBundleCore(bundle, productMap, variantMap);
    return {
        ...core,
        description: bundle.description ?? undefined,
        mainProductId: bundle.mainProductId ?? undefined,
        mainVariantId: bundle.mainVariantId ?? undefined,
        createProduct: !!bundle.mainProductId,
        productTitle: bundle.name,
        productDescription: bundle.description || "",
        minOrderValue: bundle.minOrderValue ?? undefined,
        maxDiscountAmount: bundle.maxDiscountAmount ?? undefined,
        startDate: bundle.startDate?.toISOString() ?? undefined,
        endDate: bundle.endDate?.toISOString() ?? undefined,
        updatedAt: bundle.updatedAt.toISOString(),
        discountApplication: bundle.discountApplication ?? "bundle",
        discountedProductIds: bundle.discountedProductIds ?? [],
        freeShipping: bundle.freeShipping ?? false,
        settings: bundle.settings ?? undefined,
    };
}

/**
 * Transform bundle for duplication.
 */
export function transformBundleForDuplication(
    original: any,
    newName: string,
): any {
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
        status,
        startDate,
        endDate,
        ...bundleData
    } = original;

    const transformedProducts =
        bundleProducts?.map(
            ({ id, bundleId, createdAt, updatedAt, ...bp }: any) => bp,
        ) || [];

    const transformedProductGroups =
        productGroups?.map(({ id, bundleId, ...pg }: any) => pg) || [];

    const transformedSettings = settings
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
        : undefined;

    // Combine all data
    const duplicateData = {
        ...bundleData,
        name: newName,
        products: transformedProducts,
        productGroups: transformedProductGroups,
        settings: transformedSettings,
        status: "DRAFT",
        startDate: undefined,
        endDate: undefined,
        isPublished: false,
        publishedAt: null,
    };

    // Remove null values
    return removeNulls(duplicateData);
}