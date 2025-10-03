import { CreateBundlePayload } from "@/types";

export interface SelectedItem {
    id: string;
    type: "product" | "variant";
    productId: string;
    variantId?: string | null;
    title: string;
    price: string;
    image?: string;
    sku?: string;
    quantity: number;
    handle?: string;
    vendor?: string;
    productType?: string;
    totalVariants?: number;
}

export interface ProductGroup {
    id: string;
    title: string;
    featuredImage?: string;
    product?: SelectedItem;
    variants?: SelectedItem[];
    originalTotalVariants?: number;
}

export interface DisplaySettings {
    layout: "horizontal" | "vertical" | "grid";
    position: "above_cart" | "below_cart" | "description" | "custom";
    title: string;
    colorTheme: "brand" | "success" | "warning" | "critical";
    showPrices: boolean;
    showSavings: boolean;
    enableQuickSwap: boolean;
}

export interface BundleConfiguration {
    discountApplication: "bundle" | "products" | "shipping";
}
