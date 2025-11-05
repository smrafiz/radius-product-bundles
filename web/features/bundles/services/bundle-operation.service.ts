import {
    BundleFormData,
    BundleOperationContext,
    performSecurityChecks,
    validateBusinessRules,
    validateSecurity,
    ValidationResult,
} from "@/features/bundles";
import { getShop } from "@/shared";

/**
 * Perform security checks (rate limit, abuse, shop status)
 */
export async function checkBundleSecurity(shop: string): Promise<{
    success: boolean;
    message?: string;
    errors?: Record<string, { _errors: string[] }>;
}> {
    console.log("[Shared] Performing security checks...");

    const securityCheck = await performSecurityChecks(shop);

    if (!securityCheck.passed) {
        console.log(`[Shared] Security check failed: ${securityCheck.reason}`);

        return {
            success: false,
            message: securityCheck.reason || "Security check failed",
            errors: {
                security: {
                    _errors: [securityCheck.reason || "Security check failed"],
                },
            },
        };
    }

    console.log("[Shared] ✓ Security checks passed");
    return { success: true };
}

/**
 * Fetch shop settings for validation context
 */
export async function fetchOperationContext(
    shop: string,
): Promise<BundleOperationContext> {
    console.log("[Shared] Fetching shop settings...");

    const shopData = await getShop(shop);
    
    // Ensure we return an object that matches the expected type
    const shopSettings = {
        appSettings: shopData?.appSettings || null
    };

    if (shopSettings.appSettings?.maxBundleProducts !== undefined) {
        console.log(
            `[Service] Shop settings loaded: maxProducts=${shopSettings.appSettings.maxBundleProducts}`,
        );
    } else {
        console.log("[Service] No shop settings found, using defaults");
    }

    return { shopSettings };
}

/**
 * Validate bundle data (security and business rules)
 */
export function validateBundleData(
    data: BundleFormData,
    context: BundleOperationContext,
): ValidationResult {
    console.log("[Shared] Security validation (GIDs, duplicates)...");

    const securityValidation = validateSecurity(data);

    if (!securityValidation.success) {
        console.log("[Shared] ✗ Security validation failed");
        return {
            success: false,
            errors: securityValidation.errors,
        };
    }

    console.log("[Shared] ✓ Security validation passed");

    // Business rules validation (pure with context)
    console.log("[Shared] Validating business rules...");

    const businessValidation = validateBusinessRules(data, {
        maxBundleProducts: context?.appSettings?.maxBundleProducts || 100,
        maxBundlesPerShop: context?.appSettings?.maxBundlesPerShop || 100,
        betaFeatures: context?.appSettings?.betaFeatures || false,
    });

    if (!businessValidation.success) {
        console.log("[Shared] ✗ Business validation failed");
        return {
            success: false,
            errors: businessValidation.errors,
        };
    }

    console.log("[Shared] ✓ Business validation passed");

    return { errors: null, success: true };
}

/**
 * Handle bundle operation errors
 */
export function handleBundleOperationError(error: unknown): {
    success: false;
    message: string;
    errors: Record<string, { _errors: string[] }>;
    bundle: null;
} {
    console.error("[Shared] Unexpected error:", error);

    if (error instanceof Error) {
        // Prisma unique constraint error
        if (error.message.includes("Unique constraint")) {
            return {
                success: false,
                message: "A bundle with this name already exists",
                errors: {
                    name: {
                        _errors: ["A bundle with this name already exists"],
                    },
                },
                bundle: null,
            };
        }

        // Transaction timeout
        if (error.message.includes("timeout")) {
            return {
                success: false,
                message:
                    "Operation timed out. Please try again with fewer products.",
                errors: {
                    timeout: {
                        _errors: ["Operation timed out"],
                    },
                },
                bundle: null,
            };
        }

        // Generic error
        return {
            success: false,
            message: error.message,
            errors: {
                server: {
                    _errors: [error.message],
                },
            },
            bundle: null,
        };
    }

    // Unknown error
    return {
        success: false,
        message: "An unexpected error occurred",
        errors: {
            server: {
                _errors: ["An unexpected error occurred"],
            },
        },
        bundle: null,
    };
}