/*
 * Service types
 */

import {
    BundleFilters,
    BundleFormData,
    BundleStatus,
    CreateBundleInput,
    DeleteBundleResult,
    TransformedBundle,
} from "@/features/bundles";

/*
 * Validation types
 */
export interface ValidationError {
    _errors: string[];
}

/*
 * Validation types
 */
export interface ValidationErrors {
    [field: string]: ValidationError;
}

/*
 * Validation result types
 */
export interface SchemaValidationResult {
    success: boolean;
    data?: BundleFormData;
    errors?: {
        status: "error";
        message: string;
        errors: ValidationErrors;
        data: null;
    };
}

/*
 * Business rules validation result types
 */
export interface BusinessRulesResult {
    success: boolean;
    message: string;
    errors: ValidationErrors | null;
}

/*
 * Security validation result types
 */
export interface SecurityValidationResult {
    success: boolean;
    errors: ValidationErrors | null;
}

/*
 * Combined validation result types
 */
export interface CombinedValidationResult {
    success?: boolean;
    status?: "error";
    message?: string;
    errors?: ValidationErrors;
    data?: BundleFormData | null;
}

/*
 * Bundle service types
 */
export interface UpdateBundleStatusInput {
    bundleId: string;
    shop: string;
    status: BundleStatus;
}

/*
 * Update bundle status result types
 */
export interface UpdateBundleStatusResult {
    success: boolean;
    bundle: any;
    message?: string;
}

/*
 * Delete bundle service types
 */
export interface DeleteBundleInput {
    bundleId: string;
    shop: string;
}

/*
 * Delete bundle service result types
 */
export interface DeleteBundleServiceResult {
    success: boolean;
    bundle: DeleteBundleResult;
    message?: string;
}

/*
 * Bulk delete bundles service types
 */
export interface BulkDeleteBundlesInput {
    bundleIds: string[];
    shop: string;
}

/*
 * Bulk delete bundles service result types
 */
export interface BulkDeleteBundlesServiceResult {
    success: boolean;
    bundles: DeleteBundleResult[];
    deletedCount: number;
    message?: string;
}

/*
 * Duplicate bundle service types
 */
export interface DuplicateBundleInput {
    bundleId: string;
    shop: string;
}

/*
 * Duplicate bundle service result types
 */
export interface DuplicateBundleResult {
    success: boolean;
    data: any;
    message: string;
}

/*
 * Create bundle with validation input
 */
export interface CreateBundleWithValidationInput {
    shop: string;
    data: CreateBundleInput;
}

/*
 * Get bundles input
 */
export interface GetBundlesInput {
    shop: string;
    sessionToken: string;
    pagination: {
        page: number;
        itemsPerPage: number;
    };
    filters?: BundleFilters;
}

/*
 * Pagination result types
 */
export interface PaginationResult {
    page: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

/*
 * Bundles list result types
 */
export interface BundlesListResult {
    bundles: any[];
    pagination: PaginationResult;
}

/*
 * Bulk update bundle status
 */
export interface BulkUpdateBundleStatusInput {
    bundleIds: string[];
    shop: string;
    status: BundleStatus;
}

/*
 * Bulk update bundle status result types
 */
export interface BulkUpdateBundleStatusResult {
    success: boolean;
    message: string;
}

/*
 * Create bundle service types
 */
export interface CreateBundleServiceInput {
    shop: string;
    data: BundleFormData;
}

/*
 * Create bundle service result types
 */
export interface CreateBundleServiceResponse {
    success: boolean;
    message: string;
    bundle: TransformedBundle | null;
    errors: Record<string, { _errors: string[] }> | null;
}

/*
 * Create bundle action input
 */
export type CreateBundleActionInput = Omit<CreateBundleInput, 'shop'>;

/*
 * Security check result types
 */
export interface SecurityCheckResult {
    passed: boolean;
    reason?: string;
}

/*
 * Abusive pattern result types
 */
export interface AbusivePatternResult {
    isAbusive: boolean;
    reason?: string;
    details?: {
        created: number;
        deleted: number;
        threshold: number;
    };
}