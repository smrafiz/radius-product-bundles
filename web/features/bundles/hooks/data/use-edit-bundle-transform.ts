import { BundleDetail } from "@/features/bundles";

export function useEditBundleTransform(bundleData?: BundleDetail) {
    if (!bundleData) {
        return undefined;
    }

    return {
        name: bundleData.name,
        description: bundleData.description || "",
        type: bundleData.type,
        mainProductId: bundleData.mainProductId || undefined,

        // Bundle mechanics
        buyQuantity: bundleData.buyQuantity ?? undefined,
        getQuantity: bundleData.getQuantity ?? undefined,
        maximumItems: bundleData.maximumItems ?? undefined,

        discountType: bundleData.discountType,
        discountValue: bundleData.discountValue,
        minOrderValue: bundleData.minOrderValue ?? undefined,
        maxDiscountAmount: bundleData.maxDiscountAmount ?? undefined,

        // Handle volumeTiers type conversion - ensure it's always an array of { quantity: number, discount: number } or undefined
        volumeTiers: (() => {
            try {
                // Handle case where volumeTiers might be a JSON string, null, or already parsed
                const tiers = bundleData.volumeTiers;

                // If it's falsy or not an array, return undefined
                if (!tiers || !Array.isArray(tiers)) {
                    return undefined;
                }

                // Map and validate each tier
                const result = tiers
                    .map((tier) => {
                        // Handle both direct access and potential Prisma.JsonObject access
                        const quantity =
                            tier &&
                            typeof tier === "object" &&
                            "quantity" in tier
                                ? Number(tier.quantity)
                                : undefined;
                        const discount =
                            tier &&
                            typeof tier === "object" &&
                            "discount" in tier
                                ? Number(tier.discount)
                                : undefined;

                        // Only include valid tiers with both quantity and discount as numbers
                        return quantity !== undefined &&
                            discount !== undefined &&
                            !isNaN(quantity) &&
                            !isNaN(discount)
                            ? { quantity, discount }
                            : null;
                    })
                    .filter(
                        (
                            tier,
                        ): tier is { quantity: number; discount: number } =>
                            tier !== null,
                    );

                // Return undefined if no valid tiers were found
                return result.length > 0 ? result : undefined;
            } catch (error) {
                console.error("Error processing volumeTiers:", error);
                return undefined;
            }
        })(),
        allowMixAndMatch: bundleData.allowMixAndMatch ?? undefined,
        // Ensure mixAndMatchPrice is either a number or undefined (not null)
        mixAndMatchPrice: bundleData.mixAndMatchPrice ?? undefined,

        // Marketing
        marketingCopy: bundleData.marketingCopy ?? undefined,
        images: bundleData.images || [],
        // Dates
        startDate: bundleData.startDate
            ? new Date(bundleData.startDate)
            : undefined,
        endDate: bundleData.endDate ? new Date(bundleData.endDate) : undefined,

        // Products
        products: bundleData.products.map((product) => ({
            productId: product.productId,
            variantId: product.variantId || "",
            quantity: product.quantity,
            role: product.role || "INCLUDED",
            groupId: product.groupId,
            customPrice: product.customPrice,
            discountPercent: product.discountPercent,
        })),

        productGroups: (bundleData.productGroups || []).map((group) => ({
            name: group.title || `Group ${group.id}`,
            minSelection: 1,
            displayOrder: 0,
            description: group.product?.title,
            _originalId: group.id,
        })),
        settings: bundleData.settings || {
            layout: "GRID",
            theme: "STORE_DEFAULT",
            position: "ABOVE_ADD_TO_CART",
            showPrices: true,
            showSavings: true,
            showProductImages: true,
            enableQuickAdd: false,
            widget: {
                floating: false,
                autoHide: false,
                showOnMobile: true,
            },
        },
    };
}
