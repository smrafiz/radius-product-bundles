export interface ProductVariant {
    id: string;
    title: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
    availableForSale: boolean;
    inventoryQuantity: number;
    image?: {
        url: string;
        altText?: string;
    };
    selectedOptions: Array<{
        name: string;
        value: string;
    }>;
    inventoryItem: {
        tracked: boolean;
    };
}

export interface Product {
    id: string;
    title: string;
    handle: string;
    vendor?: string;
    productType?: string;
    tags: string[];
    totalInventory?: number;
    status?: string;
    featuredImage?: {
        url: string;
        altText?: string;
    };
    variants: ProductVariant[];
    collections: Array<{
        id: string;
        title: string;
    }>;
}
