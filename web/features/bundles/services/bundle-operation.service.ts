import {
    BundleFormData,
    BundleOperationContext,
    PreflightResult,
    validateBusinessRules,
    validateSecurity,
    ValidationResult,
} from "@/features/bundles";
import {
    countRecentBundles,
    getBundleActivity,
} from "@/features/bundles/repositories";
import { getShop } from "@/shared/repositories";
import { checkBundleQuota } from "@/shared/services/plan.service";
import { getShopWithLimits } from "@/shared/repositories/shop.queries";
import { getStaticTranslations } from "@/lib/i18n/server";

/**
 * Runs security checks, shop context fetch, and quota check in parallel.
 * Replaces sequential checkBundleSecurity → fetchOperationContext → canCreateBundle.
 */
export async function fetchBundlePreflight(
    shop: string,
): Promise<PreflightResult> {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const t = await getStaticTranslations("Bundles.ServiceErrors");

    const [shopData, recentCount, activity] = await Promise.all([
        getShopWithLimits(shop),
        countRecentBundles(shop, oneHourAgo),
        getBundleActivity(shop, 24),
    ]);

    const appSettings = shopData?.appSettings || null;
    const makeContext = (): BundleOperationContext => ({
        shopSettings: { appSettings },
    });

    // Evaluate rate limit
    const maxPerHour = 10;
    if (recentCount >= maxPerHour) {
        const msg = t("rateLimitExceeded", { max: maxPerHour });
        return {
            security: {
                success: false,
                message: msg,
                errors: { security: { _errors: [msg] } },
            },
            context: makeContext(),
            quota: { allowed: false },
        };
    }

    // Evaluate shop status
    const status = shopData?.status;
    if (
        status === "SUSPENDED" ||
        status === "TRIAL_EXPIRED" ||
        status === "NOT_CONFIGURED"
    ) {
        const keyMap: Record<string, string> = {
            SUSPENDED: "shopSuspended",
            TRIAL_EXPIRED: "trialExpired",
            NOT_CONFIGURED: "shopNotConfigured",
        };
        const msg = t(keyMap[status]);
        return {
            security: {
                success: false,
                message: msg,
                errors: { security: { _errors: [msg] } },
            },
            context: makeContext(),
            quota: { allowed: false },
        };
    }

    // Evaluate abuse detection
    const EXCESSIVE_CREATION_THRESHOLD = 50;
    if (activity.created > EXCESSIVE_CREATION_THRESHOLD) {
        const msg = t("excessiveCreation", { count: activity.created, hours: "24" });
        return {
            security: {
                success: false,
                message: msg,
                errors: { security: { _errors: [msg] } },
            },
            context: makeContext(),
            quota: { allowed: false },
        };
    }

    // Evaluate quota using plan limits (not the admin-configurable DB field)
    const quotaResult = await checkBundleQuota(shop);

    return {
        security: { success: true },
        context: makeContext(),
        quota: quotaResult.allowed
            ? {
                  allowed: true,
                  current: quotaResult.current,
                  limit: quotaResult.limit === -1 ? undefined : quotaResult.limit,
              }
            : {
                  allowed: false,
                  reason: t("quotaExceeded", { limit: quotaResult.limit }),
                  current: quotaResult.current,
                  limit: quotaResult.limit,
              },
    };
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
    const securityValidation = validateSecurity(data);

    if (!securityValidation.success) {
        return {
            success: false,
            errors: securityValidation.errors,
        };
    }

    // Business rules validation (pure with context)
    const businessValidation = validateBusinessRules(data, {
        maxBundleProducts: context?.appSettings?.maxBundleProducts || 100,
        maxBundlesPerShop: context?.appSettings?.maxBundlesPerShop || 100,
        betaFeatures: context?.appSettings?.betaFeatures || false,
    });

    if (!businessValidation.success) {
        return {
            success: false,
            errors: businessValidation.errors,
        };
    }

    return { errors: null, success: true };
}

/**
 * Handle bundle operation errors
 */
export async function handleBundleOperationError(error: unknown): Promise<{
    success: false;
    message: string;
    errors: Record<string, { _errors: string[] }>;
    bundle: null;
}> {
    console.error("[Shared] Unexpected error:", error);
    const t = await getStaticTranslations("Bundles.ServiceErrors");

    if (error instanceof Error) {
        // Prisma unique constraint error
        if (error.message.includes("Unique constraint")) {
            const msg = t("duplicateName");
            return {
                success: false,
                message: msg,
                errors: { name: { _errors: [msg] } },
                bundle: null,
            };
        }

        // Transaction timeout
        if (error.message.includes("timeout")) {
            return {
                success: false,
                message: t("operationTimedOut"),
                errors: { timeout: { _errors: [t("operationTimedOutShort")] } },
                bundle: null,
            };
        }

        // Generic error
        return {
            success: false,
            message: error.message,
            errors: { server: { _errors: [error.message] } },
            bundle: null,
        };
    }

    // Unknown error
    const msg = t("unexpectedError");
    return {
        success: false,
        message: msg,
        errors: { server: { _errors: [msg] } },
        bundle: null,
    };
}
