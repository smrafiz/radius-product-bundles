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
 * Bundle listing old.components
 */
export interface ProductAvatarStackProps {
    products: ProductGroup[];
    remainingCount: number;
}

/*
 * Bundle detail old.components
 */
export interface ProductListPopoverProps {
    products: ProductGroup[];
}

/*
 * Bundle table old.components
 */
export interface BundleTableEmptyStatesProps {
    totalBundles: number;
    filteredBundlesCount: number;
}

/*
 * Bundle table row old.components
 */
export interface BundleTableRowProps {
    bundle: BundleListItem;
    index: number;
    isSelected: boolean;
}

/*
 * Bundle table actions old.components
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
 * Bundle status popover old.components
 */
export interface StatusPopoverProps {
    bundle: BundleListItem;
}

/*
 * Bundle creation old.components
 */
export interface BundleCreationFormProps {
    bundleType: BundleType;
    bundleName?: string;
}

/*
 * Bundle form provider old.components
 */
export interface BundleFormProviderProps {
    children: ReactNode;
    bundleType: BundleType;
    initialData?: Partial<BundleFormData>;
}

/*
 * Step heading old.components
 */
export interface StepHeadingProps {
    title: string;
    description?: string;
    gap?: "050" | "100" | "200" | "300" | "400" | "500";
}
