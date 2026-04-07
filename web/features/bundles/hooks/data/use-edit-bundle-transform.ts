import {
    BundleDetail,
    BundleStatus,
    DiscountApplication,
    initialDisplaySettings,
} from "@/features/bundles";
import { BOGO_LAYOUT_VALUES } from "@/features/bundles/constants/bundle-details.constants";

/**
 * Transforms bundle data from the database format to the form format.
 *
 * Used when loading an existing bundle for editing.
 */
export function useEditBundleTransform(bundleData?: BundleDetail) {
    if (!bundleData) {
        return undefined;
    }

    const discountApplication: DiscountApplication =
        bundleData.discountApplication === "bundle" ||
        bundleData.discountApplication === "products"
            ? bundleData.discountApplication
            : "bundle";

    return {
        name: bundleData.name,
        description: bundleData.description || "",
        type: bundleData.type,
        status: bundleData.status as BundleStatus,
        mainProductId: bundleData.mainProductId || undefined,
        mainVariantId: bundleData.mainVariantId || undefined,

        // Bundle mechanics
        buyQuantity: bundleData.buyQuantity ?? undefined,
        getQuantity: bundleData.getQuantity ?? undefined,
        usesPerOrderLimit: bundleData.usesPerOrderLimit ?? null,
        maximumItems: bundleData.maximumItems ?? undefined,

        discountType: bundleData.discountType,
        discountValue: bundleData.discountValue,
        minOrderValue: bundleData.minOrderValue ?? undefined,
        maxDiscountAmount: bundleData.maxDiscountAmount ?? undefined,

        discountApplication: discountApplication,
        discountedProductIds: bundleData.discountedProductIds || [],
        freeShipping: bundleData.freeShipping ?? false,
        priority: bundleData.priority ?? 0,

        // Handle volumeTiers: stored as VolumeDiscountConfig JSON { discountType, openEnded, tiers[] }
        volumeTiers: (() => {
            try {
                const raw = bundleData.volumeTiers;
                if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
                    return undefined;
                }
                const obj = raw as Record<string, unknown>;
                if (!obj.tiers || !Array.isArray(obj.tiers) || obj.tiers.length === 0) {
                    return undefined;
                }
                return {
                    discountType: (obj.discountType as "PERCENTAGE" | "FIXED_AMOUNT") ?? "PERCENTAGE",
                    openEnded: typeof obj.openEnded === "boolean" ? obj.openEnded : true,
                    tiers: obj.tiers.map((t: unknown) => {
                        const tier = t as Record<string, unknown>;
                        return {
                            minQuantity: Number(tier.minQuantity ?? tier.quantity ?? 1),
                            discount: Number(tier.discount ?? 0),
                            title: String(tier.title ?? "Buy {quantity}, get {discount} off"),
                            subtitle: tier.subtitle ? String(tier.subtitle) : undefined,
                            badge: tier.badge ? tier.badge as { style: "none" | "popular" | "best-value" | "custom"; text?: string } : undefined,
                            isDefault: typeof tier.isDefault === "boolean" ? tier.isDefault : undefined,
                        };
                    }),
                };
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

        // Scheduling dates
        startDate: bundleData.startDate
            ? new Date(bundleData.startDate)
            : undefined,
        endDate: bundleData.endDate ? new Date(bundleData.endDate) : undefined,

        // Products
        products: bundleData.products.map((product) => ({
            productId: product.id,
            variantId: product.selectedVariant?.id || "",
            quantity: product.quantity,
            role: product.role || "INCLUDED",
        })),

        productGroups: (bundleData.productGroups || []).map((group) => ({
            name: group.title || `Group ${group.id}`,
            minSelection: 1,
            displayOrder: 0,
            description: group.product?.title,
            _originalId: group.id,
        })),
        displaySettings: (() => {
            const settings = bundleData.settings || initialDisplaySettings;
            const isBxgy =
                bundleData.type === "BOGO" || bundleData.type === "BUY_X_GET_Y";
            if (isBxgy && !BOGO_LAYOUT_VALUES.includes(settings.layout)) {
                return { ...settings, layout: "CLASSIC_CARD" as const };
            }
            return settings;
        })(),
    };
}
