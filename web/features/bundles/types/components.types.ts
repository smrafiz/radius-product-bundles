/**
 * Bundles component types
 */
import {
    BundleListItem,
    BundleStatus,
    BundleType,
    ProductGroup,
} from "@/features/bundles";
import { ReactNode } from "react";
import { BundleFormData } from "@/lib/validation";

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

/*
 * Bundle creation components
 */
export interface BundleCreationFormProps {
    bundleType: BundleType;
    bundleName?: string;
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
 * Step heading components
 */
export interface StepHeadingProps {
    title: string;
    description?: string;
    gap?: "050" | "100" | "200" | "300" | "400" | "500";
}
