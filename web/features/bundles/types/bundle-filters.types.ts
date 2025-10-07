import { BundleStatus, BundleType } from "./bundle.types";

/**
 * Bundle list filters
 */
export interface BundleFilters {
    search?: string;
    status?: BundleStatus[];
    type?: BundleType[];
    dateFrom?: Date;
    dateTo?: Date;
}

/**
 * Bundle sort options
 */
export type BundleSortBy =
    | "createdAt"
    | "name"
    | "revenue"
    | "conversions"
    | "views";

/**
 * Bundle sort direction
 */
export type BundleSortDirection = "asc" | "desc";
