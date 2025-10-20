/*
 * Service types
 */

import { BundleFormData } from "@/lib/validation";
import { BundleStatus } from "@/features/bundles";

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