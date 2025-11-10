import { BundleDetail } from "@/features/bundles";

export function useEditBundleTransform(bundleData?: BundleDetail) {
    if (!bundleData) {
        return undefined;
    }

    return {
        name: bundleData.name,
        description: bundleData.description || "",
        type: bundleData.type,
        mainProductId: bundleData.mainProductId,

        // Bundle mechanics
        buyQuantity: bundleData.buyQuantity,
        getQuantity: bundleData.getQuantity,
        minimumItems: bundleData.minimumItems,
        maximumItems: bundleData.maximumItems,

        // Pricing
        discountType: bundleData.discountType,
        discountValue: bundleData.discountValue,
        minOrderValue: bundleData.minOrderValue,
        maxDiscountAmount: bundleData.maxDiscountAmount || undefined,

        // Volume tiers
        volumeTiers: bundleData.volumeTiers,

        // Mix & Match
        allowMixAndMatch: bundleData.allowMixAndMatch,
        mixAndMatchPrice: bundleData.mixAndMatchPrice,

        // Marketing
        marketingCopy: bundleData.marketingCopy,
        seoTitle: bundleData.seoTitle,
        seoDescription: bundleData.seoDescription,
        images: bundleData.images || [],

        // Dates
        startDate: bundleData.startDate
            ? new Date(bundleData.startDate)
            : undefined,
        endDate: bundleData.endDate ? new Date(bundleData.endDate) : undefined,

        // Products
        products: bundleData.products.map((product) => ({
            productId: product.productId,
            variantId: product.variantId,
            quantity: product.quantity,
            role: product.role || "INCLUDED",
            groupId: product.groupId,
            customPrice: product.customPrice,
            discountPercent: product.discountPercent,
        })),

        productGroups: bundleData.productGroups || [],
        settings: bundleData.settings || {
            layout: "GRID",
            theme: "STORE_DEFAULT",
            position: "ABOVE_ADD_TO_CART",
            showPrices: true,
            showSavings: true,
            showProductImages: true,
            enableQuickAdd: false,
        },
    };
}
