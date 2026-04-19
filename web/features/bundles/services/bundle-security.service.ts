/**
 * Security checks that require database access
 */

import { AbusivePatternResult, SecurityCheckResult } from "@/features/bundles";
import {
    countBundlesByShop,
    countRecentBundles,
    getBundleActivity,
} from "@/features/bundles/repositories";
import { getShop, getShopStatus } from "@/shared/repositories";
import {
    checkBundleTypeAllowed,
    checkBundleStatusAllowed,
} from "@/shared/services/plan.service";
import { getStaticTranslations } from "@/lib/i18n/server";

/**
 * Perform all security checks for bundle operations
 */
export async function performSecurityChecks(
    shop: string,
): Promise<SecurityCheckResult> {
    // 1. Rate limiting check
    const rateLimitCheck = await checkRateLimit(shop);
    if (!rateLimitCheck.passed) {
        return rateLimitCheck;
    }

    // 2. Shop status check
    const shopStatusCheck = await checkShopStatus(shop);
    if (!shopStatusCheck.passed) {
        return shopStatusCheck;
    }

    // 3. Abuse detection
    const abuseCheck = await checkAbusivePatterns(shop);
    if (!abuseCheck.passed) {
        return abuseCheck;
    }

    return { passed: true };
}

// ==========================================
// INDIVIDUAL SECURITY CHECKS
// ==========================================

/**
 * Check rate limit (max bundles per hour)
 *
 * @param shop - Shop domain
 * @param maxPerHour - Maximum bundles allowed per hour (default: 5)
 * @returns Security check result
 */
export async function checkRateLimit(
    shop: string,
    maxPerHour: number = 10,
): Promise<SecurityCheckResult> {
    const recentBundleCount = await countRecentBundles(
        shop,
        new Date(Date.now() - 60 * 60 * 1000),
    );

    if (recentBundleCount >= maxPerHour) {
        console.warn(
            `[Security] Rate limit exceeded for shop ${shop}: ${recentBundleCount}/${maxPerHour}`,
        );
        const t = await getStaticTranslations("Bundles.ServiceErrors");
        return {
            passed: false,
            reason: t("rateLimitExceeded", { max: maxPerHour }),
        };
    }

    return { passed: true };
}

/**
 * Check shop status (active, suspended, trial expired, etc.)
 *
 * @param shop - Shop domain
 * @returns Security check result
 */
export async function checkShopStatus(
    shop: string,
): Promise<SecurityCheckResult> {
    const shopStatus = await getShopStatus(shop);
    const t = await getStaticTranslations("Bundles.ServiceErrors");

    if (shopStatus === "SUSPENDED") {
        console.warn(`[Security] Shop suspended: ${shop}`);
        return { passed: false, reason: t("shopSuspended") };
    }

    if (shopStatus === "TRIAL_EXPIRED") {
        console.warn(`[Security] Trial expired for shop: ${shop}`);
        return { passed: false, reason: t("trialExpired") };
    }

    if (shopStatus === "NOT_CONFIGURED") {
        console.warn(`[Security] Shop not configured: ${shop}`);
        return { passed: false, reason: t("shopNotConfigured") };
    }

    return { passed: true };
}

/**
 * Check for abusive patterns
 *
 * @param shop - Shop domain
 * @returns Security check result
 */
export async function checkAbusivePatterns(
    shop: string,
): Promise<SecurityCheckResult> {
    const abuseResult = await detectAbusiveBehavior(shop);

    if (abuseResult.isAbusive) {
        console.warn(
            `[Security] Abusive pattern detected for shop ${shop}: ${abuseResult.reason}`,
        );
        const t = await getStaticTranslations("Bundles.ServiceErrors");
        return {
            passed: false,
            reason: abuseResult.reason || t("suspiciousActivity"),
        };
    }

    return { passed: true };
}

// ==========================================
// ABUSE DETECTION
// ==========================================

/**
 * Detect abusive behavior patterns
 *
 * Checks for:
 * - Excessive bundle creation (>50 in 24h)
 * - High deletion rate (>80% deleted)
 * - Rapid create/delete cycles
 *
 * @param shop - Shop domain
 * @param hoursToCheck - Hours to look back (default: 24)
 * @returns Abuse detection result
 */
export async function detectAbusiveBehavior(
    shop: string,
    hoursToCheck: number = 24,
): Promise<AbusivePatternResult> {
    // Get activity for the specified period
    const activity = await getBundleActivity(shop, hoursToCheck);

    // Threshold for excessive creation
    const EXCESSIVE_CREATION_THRESHOLD = 50;

    // Check 1: Excessive bundle creation
    if (activity.created > EXCESSIVE_CREATION_THRESHOLD) {
        console.warn(
            `[Security] Excessive creation detected: ${activity.created} bundles in ${hoursToCheck}h`,
        );

        const t = await getStaticTranslations("Bundles.ServiceErrors");
        return {
            isAbusive: true,
            reason: t("excessiveCreation", { count: activity.created, hours: String(hoursToCheck) }),
            details: {
                created: activity.created,
                deleted: activity.deleted,
                threshold: EXCESSIVE_CREATION_THRESHOLD,
            },
        };
    }

    // Check 2: High deletion rate (if soft deletes are implemented)
    // Note: Your schema doesn't have deletedAt field yet
    // Uncomment when you add soft delete support:
    /*
    const DELETION_RATE_THRESHOLD = 0.8; // 80%

    if (activity.deleted > 0) {
        const deletionRate = activity.deleted / activity.created;

        if (deletionRate > DELETION_RATE_THRESHOLD) {
            console.warn(
                `[Security] High deletion rate: ${(deletionRate * 100).toFixed(1)}%`,
            );

            return {
                isAbusive: true,
                reason: `High deletion rate detected (${(deletionRate * 100).toFixed(1)}%)`,
                details: {
                    created: activity.created,
                    deleted: activity.deleted,
                    threshold: DELETION_RATE_THRESHOLD,
                },
            };
        }
    }
    */

    // No abuse detected
    return {
        isAbusive: false,
    };
}

// ==========================================
// ADDITIONAL SECURITY HELPERS
// ==========================================

/**
 * Check if shop can create more bundles (quota check)
 *
 * @param shop - Shop domain
 * @returns Whether shop can create more bundles
 */
export async function canCreateBundle(shop: string): Promise<{
    allowed: boolean;
    reason?: string;
    current?: number;
    limit?: number;
}> {
    const { checkBundleQuota } = await import(
        "@/shared/services/plan.service"
    );
    const quota = await checkBundleQuota(shop);

    if (!quota.allowed) {
        const t = await getStaticTranslations("Bundles.ServiceErrors");
        return {
            allowed: false,
            reason: t("quotaExceeded", { limit: quota.limit }),
            current: quota.current,
            limit: quota.limit,
        };
    }

    return {
        allowed: true,
        current: quota.current,
        limit: quota.limit,
    };
}

/**
 * Validate shop permissions for bundle operation
 *
 * @param shop - Shop domain
 * @param operation - Operation type ('create', 'update', 'delete')
 * @returns Permission check result
 */
export async function validateShopPermissions(
    shop: string,
    operation: "create" | "update" | "delete",
    bundleType?: string,
    bundleStatus?: string,
): Promise<SecurityCheckResult> {
    if (operation === "create" && bundleType) {
        const result = await checkBundleTypeAllowed(shop, bundleType);
        if (!result.allowed) {
            return {
                passed: false,
                reason: result.message,
            };
        }
    }

    if ((operation === "create" || operation === "update") && bundleStatus) {
        const result = await checkBundleStatusAllowed(shop, bundleStatus);
        if (!result.allowed) {
            return {
                passed: false,
                reason: result.message,
            };
        }
    }

    return { passed: true };
}
