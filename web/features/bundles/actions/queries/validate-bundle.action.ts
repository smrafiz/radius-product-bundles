/**
 * Bundle Validation Actions
 * Server actions wrapping the validation service
 */
"use server";

import {
    BundleFormData,
    CombinedValidationResult,
    validateAndCheckBusinessRules,
    ValidateBundleActionParams,
    validateBundleData,
    validateBundleWithSecurity,
    validateBusinessRules,
    validateSecurity,
} from "@/features/bundles";
import { ApiResponse } from "@/shared";

/**
 * Main validation action
 * Use this in your components/forms
 */
export async function validateBundleAction(
    params: ValidateBundleActionParams
): Promise<ApiResponse<CombinedValidationResult>> {
    const { shop, data, includeSecurity = false } = params;

    try {
        if (!shop) {
            return {
                status: "error",
                message: "Shop parameter is required",
            };
        }

        const result = includeSecurity
            ? await validateBundleWithSecurity(shop, data)
            : await validateAndCheckBusinessRules(shop, data);

        if (!result.success && result.status === "error") {
            return {
                status: "error",
                data: result,
                message: result.message || "Validation failed",
            };
        }

        return {
            status: "success",
            data: result,
        };
    } catch (error) {
        console.error("[validateBundleAction] Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Validation error",
        };
    }
}

/**
 * Validate with security checks
 */
export async function validateBundleWithSecurityAction(
    params: Omit<ValidateBundleActionParams, "includeSecurity">
): Promise<ApiResponse<CombinedValidationResult>> {
    return validateBundleAction({ ...params, includeSecurity: true });
}

// ==========================================
// Granular Actions
// ==========================================

/**
 * Schema validation only
 */
export async function validateSchemaAction(params: {
    data: unknown;
}): Promise<ApiResponse<any>> {
    try {
        const result = await validateBundleData(params.data);
        return {
            status: result.success ? "success" : "error",
            data: result,
        };
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Schema validation error",
        };
    }
}

/**
 * Business rules only
 */
export async function validateBusinessRulesAction(params: {
    shop: string;
    data: BundleFormData;
}): Promise<ApiResponse<any>> {
    try {
        if (!params.shop) {
            return { status: "error", message: "Shop required" };
        }
        const result = await validateBusinessRules(params.shop, params.data);
        return {
            status: result.success ? "success" : "error",
            data: result,
        };
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Business validation error",
        };
    }
}

/**
 * Security validation only
 */
export async function validateSecurityAction(params: {
    shop: string;
    data: BundleFormData;
}): Promise<ApiResponse<any>> {
    try {
        if (!params.shop) {
            return { status: "error", message: "Shop required" };
        }
        const result = await validateSecurity(params.shop, params.data);
        return {
            status: result.success ? "success" : "error",
            data: result,
        };
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Security validation error",
        };
    }
}

// ==========================================
// Field Validation
// ==========================================

/**
 * Validate single field (for real-time validation)
 */
export async function validateFieldAction(params: {
    field: string;
    value: any;
    data: Partial<BundleFormData>;
}): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    try {
        const testData = {
            name: params.data.name || "Test",
            type: params.data.type || "FIXED_BUNDLE",
            products: params.data.products || [],
            discountType: params.data.discountType || "NO_DISCOUNT",
            discountValue: params.data.discountValue || 0,
            settings: params.data.settings || {},
            [params.field]: params.value,
        };

        const result = await validateBundleData(testData);

        if (!result.success && result.errors?.errors) {
            const fieldError = result.errors.errors[params.field];
            if (fieldError) {
                return {
                    status: "error",
                    data: { valid: false, errors: fieldError._errors },
                };
            }
        }

        return {
            status: "success",
            data: { valid: true },
        };
    } catch (error) {
        return {
            status: "error",
            message: "Field validation error",
        };
    }
}