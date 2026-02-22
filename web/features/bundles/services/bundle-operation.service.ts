import {
    BundleFormData,
    BundleOperationContext,
    validateBusinessRules,
    validateSecurity,
    ValidationResult,
} from "@/features/bundles";
import { getShop } from "@/shared/repositories";
import { getShopWithLimits } from "@/shared/repositories/shop.queries";
import { performSecurityChecks } from "@/features/bundles/services";
import {
    countBundlesByShop,
    countRecentBundles,
    getBundleActivity,
} from "@/features/bundles/repositories";

export interface PreflightResult {
    security: { success: boolean; message?: string; errors?: Record<string, { _errors: string[] }> };
    context: BundleOperationContext;
    quota: { allowed: boolean; reason?: string; current?: number; limit?: number };
}

/**
 * Runs security checks, shop context fetch, and quota check in parallel.
 * Replaces sequential checkBundleSecurity → fetchOperationContext → canCreateBundle.
 */
export async function fetchBundlePreflight(shop: string): Promise<PreflightResult> {
    const oneHourAgo = new Date(Date.now() - 3600000);

    const [shopData, recentCount, activity, bundleCount] = await Promise.all([
        getShopWithLimits(shop),
        countRecentBundles(shop, oneHourAgo),
        getBundleActivity(shop, 24),
        countBundlesByShop(shop),
    ]);

    const appSettings = shopData?.appSettings || null;
    const makeContext = (): BundleOperationContext => ({
        shopSettings: { appSettings },
    });

    // Evaluate rate limit
    const maxPerHour = 10;
    if (recentCount >= maxPerHour) {
        return {
            security: {
                success: false,
                message: `Rate limit exceeded. Maximum ${maxPerHour} bundles per hour. Please try again later.`,
                errors: { security: { _errors: [`Rate limit exceeded. Maximum ${maxPerHour} bundles per hour.`] } },
            },
            context: makeContext(),
            quota: { allowed: false },
        };
    }

    // Evaluate shop status
    const status = shopData?.status;
    if (status === "SUSPENDED" || status === "TRIAL_EXPIRED" || status === "NOT_CONFIGURED") {
        const messages: Record<string, string> = {
            SUSPENDED: "Shop account is suspended. Please contact support for assistance.",
            TRIAL_EXPIRED: "Trial period has expired. Please upgrade your plan.",
            NOT_CONFIGURED: "Shop is not properly configured. Please complete setup.",
        };
        return {
            security: {
                success: false,
                message: messages[status],
                errors: { security: { _errors: [messages[status]] } },
            },
            context: makeContext(),
            quota: { allowed: false },
        };
    }

    // Evaluate abuse detection
    const EXCESSIVE_CREATION_THRESHOLD = 50;
    if (activity.created > EXCESSIVE_CREATION_THRESHOLD) {
        return {
            security: {
                success: false,
                message: `Excessive bundle creation detected (${activity.created} in 24h)`,
                errors: { security: { _errors: [`Excessive bundle creation detected (${activity.created} in 24h)`] } },
            },
            context: makeContext(),
            quota: { allowed: false },
        };
    }

    // Evaluate quota
    const maxBundles = appSettings?.maxBundlesPerShop;
    const quotaExceeded = maxBundles && bundleCount >= maxBundles;

    return {
        security: { success: true },
        context: makeContext(),
        quota: quotaExceeded
            ? { allowed: false, reason: `Shop has reached maximum bundle limit (${maxBundles})`, current: bundleCount, limit: maxBundles }
            : { allowed: true, current: bundleCount, limit: maxBundles ?? undefined },
    };
}

/**
 * Perform security checks (rate limit, abuse, shop status)
 */
export async function checkBundleSecurity(shop: string): Promise<{
    success: boolean;
    message?: string;
    errors?: Record<string, { _errors: string[] }>;
}> {
    const securityCheck = await performSecurityChecks(shop);

    if (!securityCheck.passed) {
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

    return { success: true };
}

/**
 * Fetch shop settings for validation context
 */
export async function fetchOperationContext(
    shop: string,
): Promise<BundleOperationContext> {
    const shopData = await getShop(shop);

    const shopSettings = {
        appSettings: shopData?.appSettings || null,
    };

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
