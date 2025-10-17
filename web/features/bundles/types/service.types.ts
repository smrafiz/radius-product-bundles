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