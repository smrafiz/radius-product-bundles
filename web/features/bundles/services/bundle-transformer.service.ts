/**
 * Transform bundles for listing
 */
export async function transformBundles(bundles: any[]): Promise<any[]> {
    // Collect all product IDs
    const allProductIds = Array.from(
        new Set(
            bundles.flatMap((bundle) =>
                bundle.bundleProducts.map((bp: any) => bp.productId)
            )
        )
    );

    // Fetch product data
    const { productMap, variantMap } = await fetchProductData(allProductIds);

    // Transform each bundle
    return bundles.map((bundle) =>
        transformBundleForListing(bundle, productMap, variantMap)
    );
}

/**
 * Transform single bundle for listing
 */
function transformBundleForListing(
    bundle: any,
    productMap: Map<string, any>,
    variantMap: Map<string, any>
) {
    return {
        id: bundle.id,
        name: bundle.name,
        type: bundle.type,
        status: bundle.status,
        discountType: bundle.discountType,
        discountValue: bundle.discountValue,
        products:
            bundle.bundleProducts?.map((bp: any) => ({
                productId: bp.productId,
                variantId: bp.variantId,
                quantity: bp.quantity,
                product: productMap.get(bp.productId),
                variant: variantMap.get(bp.variantId),
            })) || [],
        views: bundle.views,
        conversions: bundle.conversions,
        revenue: bundle.revenue,
        createdAt: bundle.createdAt?.toISOString(),
        updatedAt: bundle.updatedAt?.toISOString(),
    };
}

/**
 * Transform single bundle for detail view
 */
export function transformBundle(bundle: any) {
    return {
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        type: bundle.type,
        status: bundle.status,
        mainProductId: bundle.mainProductId,
        discountType: bundle.discountType,
        discountValue: bundle.discountValue,
        minOrderValue: bundle.minOrderValue,
        maxDiscountAmount: bundle.maxDiscountAmount,
        products:
            bundle.bundleProducts?.map((bp: any) => ({
                productId: bp.productId,
                variantId: bp.variantId,
                quantity: bp.quantity,
                displayOrder: bp.displayOrder,
            })) || [],
        settings: bundle.settings || null,
        images: bundle.images || [],
        startDate: bundle.startDate,
        endDate: bundle.endDate,
        views: bundle.views,
        conversions: bundle.conversions,
        revenue: bundle.revenue,
        createdAt: bundle.createdAt?.toISOString(),
        updatedAt: bundle.updatedAt?.toISOString(),
    };
}

/**
 * Transform metrics
 */
export function transformMetrics(rawMetrics: any) {
    return {
        totalBundles: rawMetrics.totalBundles || 0,
        activeBundles: rawMetrics.activeBundles || 0,
        totalViews: rawMetrics.totalViews || 0,
        totalConversions: rawMetrics.totalConversions || 0,
        totalRevenue: rawMetrics.totalRevenue || 0,
        conversionRate: calculateConversionRate(
            rawMetrics.totalConversions,
            rawMetrics.totalViews
        ),
        averageOrderValue: calculateAOV(
            rawMetrics.totalRevenue,
            rawMetrics.totalConversions
        ),
    };
}