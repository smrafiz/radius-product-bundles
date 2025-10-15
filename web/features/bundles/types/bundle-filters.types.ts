import { BundleStatus, BundleType } from "./bundle.types";

/**
 * Bundle list filters
 */
export interface BundleFilters {
    typeFilter: string[];
    statusFilter: string[];
    selectedTab: number;
    sortSelected: string[];
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
