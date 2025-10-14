import {
    BundleListItem,
    BundleStatus,
    ProductGroup,
    ProductPreviewGroup,
} from "@/features/bundles";

/**
 * Bundles component prop types
 */
export interface BundleProductsPreviewProps {
    bundle: BundleListItem;
}

export interface ProductAvatarStackProps {
    products: ProductGroup[];
    remainingCount: number;
}

export interface ProductListPopoverProps {
    products: ProductPreviewGroup[];
}

export interface BundleTableEmptyStatesProps {
    totalBundles: number;
    filteredBundlesCount: number;
}

export interface BundleTableRowProps {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

export interface BundleActionsGroupProps {
    bundle: BundleListItem;
    onAction: {
        edit: () => void;
        view: () => void;
        duplicate: () => Promise<void>;
        delete: () => Promise<void>;
    };
}

export interface StatusPopoverProps {
    bundle: BundleListItem;
    onStatusUpdate?: (status: BundleStatus) => Promise<void>;
}
