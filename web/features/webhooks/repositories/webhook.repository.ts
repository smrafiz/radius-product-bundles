import {
    GetWebhookSubscriptionsDocument,
    GetWebhookSubscriptionsQuery,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLQuery } from "@/lib";
import { Session } from "@shopify/shopify-api";
import { WebhookSubscription } from "@/features/webhooks";
import { prisma } from "@/shared/repositories/prisma-connect";
import { registerWebhooks } from "@/lib/shopify/webhooks/register";
import { deleteShopPlan } from "@/features/pricing/repositories/shop-plan.repository";

/**
 * Webhook Repository - Data Access Layer
 *
 * Handles all database and API operations for webhooks
 */

/**
 * Get all registered webhooks from Shopify
 */
export async function getRegisteredWebhooks(
    sessionToken: string,
): Promise<WebhookSubscription[]> {
    const response = await executeGraphQLQuery<GetWebhookSubscriptionsQuery>({
        query: GetWebhookSubscriptionsDocument,
        variables: { first: 50 },
        sessionToken,
    });

    if (!response.data?.webhookSubscriptions?.edges) {
        return [];
    }

    // Transform GraphQL response to our interface
    return response.data.webhookSubscriptions.edges.map((edge) => ({
        id: edge.node.id,
        topic: edge.node.topic,
        callbackUrl:
            edge.node.endpoint?.__typename === "WebhookHttpEndpoint"
                ? edge.node.endpoint.callbackUrl
                : null,
        createdAt: edge.node.createdAt,
        updatedAt: edge.node.updatedAt,
    }));
}

/**
 * Register webhooks with Shopify via the SDK
 *
 * Uses the proven registerWebhooks function from the old system
 */
export async function registerWebhooksWithShopify(session: Session) {
    // Use the old system's registerWebhooks which:
    // 1. Calls addHandlers() to configure webhook callbacks
    // 2. Validates the session
    // 3. Calls shopify.webhooks.register()
    return await registerWebhooks(session);
}

/**
 * Check if setup is complete for a shop
 */
export async function isSetupComplete(shop: string): Promise<boolean> {
    const status = await getShopSetupStatus(shop);
    return status.setupComplete;
}

/**
 * Check if webhooks are registered for a shop
 */
export async function areWebhooksRegistered(shop: string): Promise<boolean> {
    const status = await getShopSetupStatus(shop);
    return status.webhooksRegistered;
}

/**
 * Single query returning both setup and webhook status.
 * Used by handleSessionToken fast path to avoid 2 DB round-trips.
 */
export async function getShopSetupStatus(
    shop: string,
): Promise<{ setupComplete: boolean; webhooksRegistered: boolean }> {
    try {
        const shopRecord = await prisma.shop.findUnique({
            where: { domain: shop },
            select: { setupComplete: true, webhooksRegistered: true },
        });

        return {
            setupComplete: shopRecord?.setupComplete ?? false,
            webhooksRegistered: shopRecord?.webhooksRegistered ?? false,
        };
    } catch (error) {
        console.error("[Webhook Repository] Error checking shop status:", error);
        return { setupComplete: false, webhooksRegistered: false };
    }
}

/**
 * Atomically claim setup lock — returns true only for the first caller.
 * Uses lastSetupCheck as concurrency guard; setupComplete set after success.
 */
export async function claimSetupLock(shop: string): Promise<boolean> {
    try {
        const result = await prisma.shop.updateMany({
            where: {
                domain: shop,
                setupComplete: false,
                OR: [
                    { lastSetupCheck: null },
                    {
                        lastSetupCheck: {
                            lt: new Date(Date.now() - 5 * 60 * 1000),
                        },
                    },
                ],
            },
            data: { lastSetupCheck: new Date() },
        });
        return result.count > 0;
    } catch (err) {
        console.error("[Setup Lock] Error:", err);
        return false;
    }
}

export async function releaseSetupLock(shop: string): Promise<void> {
    await prisma.shop
        .updateMany({
            where: { domain: shop, setupComplete: false },
            data: { lastSetupCheck: null },
        })
        .catch((err) => {
            console.warn("[Webhook] Failed to release setup lock:", err);
        });
}

/**
 * Mark setup as complete for a shop
 */
export async function markSetupComplete(shop: string): Promise<void> {
    try {
        await prisma.shop.upsert({
            where: { domain: shop },
            create: {
                domain: shop,
                setupComplete: true,
                lastSetupCheck: new Date(),
            },
            update: {
                setupComplete: true,
                lastSetupCheck: new Date(),
            },
        });
    } catch (error) {
        console.error(
            "[Webhook Repository] Error marking setup complete:",
            error,
        );
        throw error;
    }
}

/**
 * Mark webhooks as registered for a shop
 */
export async function markWebhooksRegistered(shop: string): Promise<void> {
    try {
        await prisma.shop.upsert({
            where: { domain: shop },
            create: {
                domain: shop,
                webhooksRegistered: true,
                lastSetupCheck: new Date(),
            },
            update: {
                webhooksRegistered: true,
                lastSetupCheck: new Date(),
            },
        });
    } catch (error) {
        console.error("[Webhook Repository] Error marking webhooks:", error);
        throw error;
    }
}

/**
 * Update last setup check timestamp
 */
export async function updateLastSetupCheck(shop: string): Promise<void> {
    try {
        await prisma.shop.update({
            where: { domain: shop },
            data: { lastSetupCheck: new Date() },
        });
    } catch (error) {
        console.error("[Webhook Repository] Error updating check time:", error);
    }
}

/**
 * Reset setup status (for testing)
 */
export async function resetSetupStatus(shop: string): Promise<void> {
    try {
        await prisma.shop.update({
            where: { domain: shop },
            data: {
                setupComplete: false,
                webhooksRegistered: false,
                lastSetupCheck: null,
            },
        });
    } catch (error) {
        console.error("[Webhook Repository] Error resetting status:", error);
        throw error;
    }
}

/**
 * Get offline session for a shop
 */
export async function getOfflineSession(shop: string) {
    return prisma.session.findFirst({
        where: {
            shop,
            isOnline: false,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

/**
 * Delete all shop data (for uninstall)
 *
 * Deletes in dependency order to avoid FK constraint violations.
 * BundleAnalytics/BundleView use onDelete:Restrict so must be deleted
 * before their parent Bundle records.
 */
export async function deleteShopData(shop: string): Promise<void> {
    try {
        const shopRecord = await prisma.shop.findFirst({
            where: { domain: shop },
        });

        await prisma.$transaction(async (tx) => {
            const sessionIds = (
                await tx.session.findMany({
                    where: { shop },
                    select: { id: true },
                })
            ).map((s) => s.id);

            if (sessionIds.length > 0) {
                const oaiIds = (
                    await tx.onlineAccessInfo.findMany({
                        where: { sessionId: { in: sessionIds } },
                        select: { id: true },
                    })
                ).map((o) => o.id);

                if (oaiIds.length > 0) {
                    await tx.associatedUser.deleteMany({
                        where: { onlineAccessInfoId: { in: oaiIds } },
                    });
                    await tx.onlineAccessInfo.deleteMany({
                        where: { id: { in: oaiIds } },
                    });
                }

                await tx.session.deleteMany({ where: { shop } });
            }

            const bundleIds = (
                await tx.bundle.findMany({
                    where: { shop },
                    select: { id: true },
                })
            ).map((b) => b.id);

            if (bundleIds.length > 0) {
                await tx.bundleView.deleteMany({
                    where: { bundleId: { in: bundleIds } },
                });
                await tx.bundleAnalytics.deleteMany({
                    where: { bundleId: { in: bundleIds } },
                });
                await tx.bundle.deleteMany({ where: { shop } });
            }

            // WebhookDelivery has no FK — uses plain shop string
            await tx.webhookDelivery.deleteMany({ where: { shop } });

            if (shopRecord) {
                const shopId = shopRecord.id;
                await tx.appSettings.deleteMany({ where: { shopId } });
                await tx.aBTest.deleteMany({ where: { shopId } });
                await tx.automationLog.deleteMany({
                    where: { automation: { shopId } },
                });
                await tx.automationBundle.deleteMany({
                    where: { automation: { shopId } },
                });
                await tx.automation.deleteMany({ where: { shopId } });
                await tx.aIInsight.deleteMany({ where: { shopId } });
                await tx.notification.deleteMany({ where: { shopId } });
                await tx.alertRule.deleteMany({ where: { shopId } });
                await tx.shopPlan.deleteMany({ where: { shopId } });
                await tx.shop.deleteMany({ where: { id: shopId } });
            }
        });
    } catch (error) {
        console.error("[Webhook Repository] Error deleting shop data:", error);
        throw error;
    }
}

