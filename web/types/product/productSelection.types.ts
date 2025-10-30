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
