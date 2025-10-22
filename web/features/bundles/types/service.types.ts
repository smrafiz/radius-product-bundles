/*
 * Service types
 */

import {
    BundleFilters,
    BundleStatus,
    CreateBundleInput,
    DeleteBundleResult,
} from "@/features/bundles";
import { BundleFormData } from "@/lib/validation";

export interface ValidationError {
    _errors: string[];
}

export interface ValidationErrors {
    [field: string]: ValidationError;
}

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

export interface BusinessRulesResult {
    success: boolean;
    message: string;
    errors: ValidationErrors | null;
}

export interface SecurityValidationResult {
    success: boolean;
    errors: ValidationErrors | null;
}

export interface CombinedValidationResult {
    success?: boolean;
    status?: "error";
    message?: string;
    errors?: ValidationErrors;
    data?: BundleFormData | null;
}

export interface UpdateBundleStatusInput {
    bundleId: string;
    shop: string;
    status: BundleStatus;
}

export interface UpdateBundleStatusResult {
    success: boolean;
    bundle: any;
    message?: string;
}

export interface DeleteBundleInput {
    bundleId: string;
    shop: string;
}

export interface DeleteBundleServiceResult {
    success: boolean;
    bundle: DeleteBundleResult;
    message?: string;
}

export interface BulkDeleteBundlesInput {
    bundleIds: string[];
    shop: string;
}

export interface BulkDeleteBundlesServiceResult {
    success: boolean;
    bundles: DeleteBundleResult[];
    deletedCount: number;
    message?: string;
}

export interface DuplicateBundleInput {
    bundleId: string;
    shop: string;
}

export interface DuplicateBundleResult {
    success: boolean;
    data: any;
    message: string;
}

export interface CreateBundleWithValidationInput {
    shop: string;
    data: CreateBundleInput;
}

export interface GetBundlesInput {
    shop: string;
    sessionToken: string;
    pagination: {
        page: number;
        itemsPerPage: number;
    };
    filters?: BundleFilters;
}

export interface PaginationResult {
    page: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export interface BundlesListResult {
    data: any[];
    pagination: PaginationResult;
}

export interface BulkUpdateBundleStatusInput {
    bundleIds: string[];
    shop: string;
    status: BundleStatus;
}

export interface BulkUpdateBundleStatusResult {
    success: boolean;
    message: string;
}