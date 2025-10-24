/**
 * Bundles component types
 */
import {
    BundleListItem,
    BundleStatus,
    ProductGroup,
} from "@/features/bundles";

/*
 * Bundle listing components
 */
export interface ProductAvatarStackProps {
    products: ProductGroup[];
    remainingCount: number;
}

/*
 * Bundle detail components
 */
export interface ProductListPopoverProps {
    products: ProductGroup[];
}

/*
 * Bundle table components
 */
export interface BundleTableEmptyStatesProps {
    totalBundles: number;
    filteredBundlesCount: number;
}

/*
 * Bundle table row components
 */
export interface BundleTableRowProps {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

/*
 * Bundle table actions components
 */
export interface BundleActionsGroupProps {
    bundle: BundleListItem;
    onAction: {
        edit: () => void;
        view: () => void;
        duplicate: () => Promise<void>;
        delete: () => Promise<void>;
    };
}

/*
 * Bundle status popover components
 */
export interface StatusPopoverProps {
    bundle: BundleListItem;
}
