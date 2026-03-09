declare global {
    interface Window {
        Shopify?: {
            formatMoney?: (cents: number) => string;
            currency?: {
                active?: string;
                rate?: string;
            };
            locale?: string;
            routes?: {
                root?: string;
            };
        };
    }
}

export interface BundleProduct {
    id: string;
    variantId: string;
    quantity: number;
    role: "INCLUDED" | "OPTIONAL" | "TRIGGER" | "REWARD";
    displayOrder: number;
    isRequired: boolean;
    title: string;
    price: number;
    compareAtPrice: number;
    featuredImage: string | null;
    handle: string;
    available: boolean;
}

export interface BundleStructure {
    id: string;
    status: string;
    name: string;
    subtitle?: string;
    discountType:
        | "PERCENTAGE"
        | "FIXED_AMOUNT"
        | "CUSTOM_PRICE"
        | "NO_DISCOUNT";
    discountValue: number;
    freeShipping: boolean;
    minOrderValue: number;
    maxDiscountAmount: number;
    discountApplication: "bundle" | "products";
    discountedProductIds: string[];
    productCount: number;
    productIds: string[];
    productQuantities?: number[];
    mainProductId?: string;
    bundleType?: string;
    buyQuantity?: number;
    getQuantity?: number;
    usesPerOrderLimit?: number;
    productRoles?: string[];
    layout: string;
    labels: {
        buttonText: string;
        regularPriceLabel: string;
        bundlePriceLabel: string;
        youSaveLabel: string;
        freeShippingLabel: string;
        quantityLabel: string;
        savingsBadgeText: string;
        addingText: string;
        addedText: string;
        outOfStockText: string;
        maxBundlesReachedText: string;
        bogoYouPayLabel?: string;
        bogoYouSaveLabel?: string;
        bogoTriggerBadgeText?: string;
        bogoRewardBadgeText?: string;
        bogoBadgeText?: string;
        bogoFreeText?: string;
        bogoTotalLabel?: string;
        bogoSaveText?: string;
        checklistProgressText?: string;
        checklistHintText?: string;
        checklistCompletedText?: string;
        checklistLockedLabel?: string;
        checklistUnlockedLabel?: string;
        checklistPricingLockedText?: string;
    };
}

export interface Bundle extends BundleStructure {
    products: BundleProduct[];
}

export interface BundleResponse {
    success: boolean;
    bundles: Bundle[];
    count: number;
}

export interface ProductDetailsResponse {
    success: boolean;
    products: Array<{
        id: string;
        title: string;
        price: number;
        compareAtPrice: number;
        image: string | null;
        handle: string;
        variantId: string;
        available: boolean;
    }>;
}

export interface CartAddItem {
    id: string;
    quantity: number;
    properties?: Record<string, string>;
}

export interface DiscountConfig {
    bundleId: string;
    bundleName: string;
    discountType: string;
    discountValue: number;
    requiredLineCount: number;
    minOrderValue: number;
    maxDiscountAmount: number;
    discountApplication: string;
    discountedProductIds: string[];
    freeShipping: boolean;
}

export interface SliderState {
    currentIndex: number;
    totalSlides: number;
    slidesPerView: number;
    maxIndex: number;
    autoplayInterval: number | null;
    isDragging: boolean;
    startX: number;
    scrollStart: number;
}

export interface BaseRenderContext {
    container: HTMLElement;
    bundleStructure: BundleStructure | null;
    showImages: boolean;
    showPrices: boolean;
    showComparePrices: boolean;
    showQuantity: boolean;
    lazyLoadImages: boolean;
    enableHyperLink: boolean;
}
