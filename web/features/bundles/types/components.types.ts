/**
 * Bundles component types
 */
import {
    BundleFormData,
    BundleListItem,
    BundleType,
    ProductGroup,
} from "@/features/bundles";
import { ReactNode } from "react";

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
    isSelected: boolean;
    onToggleSelection: (bundleId: string) => void;
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

/*
 * Bundle creation components
 */
export interface BundleCreationFormProps {
    bundleType: BundleType;
    bundleName?: string;
    bundleId?: string;
}

/*
 * Bundle form provider components
 */
export interface BundleFormProviderProps {
    children: ReactNode;
    bundleType: BundleType;
    initialData?: Partial<BundleFormData>;
}

/*
 * Discount application types
 */
export type DiscountApplication = "bundle" | "products";

/*
 * Bundle bulk actions bar components
 */
export interface BundleBulkActionsBarProps {
    selectedResources: string[];
    selectedBundle: BundleListItem | null;
    allResourcesSelected: boolean;
    toggleAllSelection: () => void;
    clearSelection: () => void;
}

/*
 * Bundle table header components
 */
export interface BundleTableHeaderProps {
    selectedResources: string[];
    allResourcesSelected: boolean;
    toggleAllSelection: () => void;
}
