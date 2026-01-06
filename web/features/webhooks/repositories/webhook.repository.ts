import { executeGraphQLQuery } from "@/lib";
import { Session } from "@shopify/shopify-api";
import { registerWebhooks } from "@/lib/shopify/webhooks/register";
import { prisma } from "@/shared/repositories/prisma-connect";
import { WebhookSubscription } from "@/features/webhooks";
import {
    GetWebhookSubscriptionsDocument,
    GetWebhookSubscriptionsQuery,
} from "@/lib/graphql/generated/graphql";

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
    console.log(
        "[Webhook Repository] Delegating to old system's registerWebhooks...",
    );

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
    try {
        const shopRecord = await prisma.shop.findUnique({
            where: { domain: shop },
            select: { setupComplete: true },
        });

        return shopRecord?.setupComplete ?? false;
    } catch (error) {
        console.error("[Webhook Repository] Error checking setup:", error);
        return false;
    }
}

/**
 * Check if webhooks are registered for a shop
 */
export async function areWebhooksRegistered(shop: string): Promise<boolean> {
    try {
        const shopRecord = await prisma.shop.findUnique({
            where: { domain: shop },
            select: { webhooksRegistered: true },
        });

        return shopRecord?.webhooksRegistered ?? false;
    } catch (error) {
        console.error("[Webhook Repository] Error checking webhooks:", error);
        return false;
    }
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

        console.log(
            `[Webhook Repository] ✅ Marked setup complete for ${shop}`,
        );
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

        console.log(
            `[Webhook Repository] ✅ Marked webhooks registered for ${shop}`,
        );
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

        console.log(`[Webhook Repository] ⚠️ Reset setup status for ${shop}`);
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
 */
export async function deleteShopData(shop: string): Promise<void> {
    try {
        console.log(`[Webhook Repository] Deleting data for ${shop}...`);

        // Delete sessions
        await prisma.session.deleteMany({
            where: { shop },
        });

        // Delete shop record (cascades to related data)
        await prisma.shop.deleteMany({
            where: { domain: shop },
        });

        console.log(`[Webhook Repository] ✅ Data deleted for ${shop}`);
    } catch (error) {
        console.error("[Webhook Repository] Error deleting shop data:", error);
        throw error;
    }
}
