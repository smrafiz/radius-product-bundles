/*
 * Bundle filters types
 */

import { BundleStatus, BundleType } from "./bundle.types";

/**
 * Bundle list filters
 */
export interface BundleFilters {
    typeFilter?: BundleType[];
    statusFilter?: BundleStatus[];
    selectedTab?: number | undefined;
    sortSelected?: string[] | undefined;
    search?: string;
    status?: BundleStatus[];
    type?: BundleType[];
    sortBy?: string;
    sortDirection?: "asc" | "desc";
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
