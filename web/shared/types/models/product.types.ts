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
    featuredMedia?: {
        image: { url: string; altText?: string };
    };
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

export interface MediaImage {
    __typename: "MediaImage";
    id: string;
    image: {
        url: string;
        altText?: string;
    };
}

export interface ProductNode {
    __typename: "Product";
    id: string;
    title: string;
    handle: string;
    vendor: string;
    productType: string;
    featuredMedia?: MediaImage;
    variants?: {
        nodes: Array<{
            id: string;
            title?: string;
            price?: string;
            compareAtPrice?: string | null;
            sku?: string;
            availableForSale?: boolean;
            inventoryQuantity?: number;
            image?: { url: string };
        }>;
    };
}
