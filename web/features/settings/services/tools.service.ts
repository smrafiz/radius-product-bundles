import { Session } from "@shopify/shopify-api";
import { syncAllSettingsToMetafields } from "@/lib";
import {
    getRegisteredWebhooks,
    resetSetupStatus,
} from "@/features/webhooks/repositories/webhook.repository";
import { initializeApp } from "@/features/webhooks/services/webhook.service";
import { revalidatePath } from "next/cache";
import {
    ClearCacheResult,
    SyncMetafieldResult,
    WebhookCheckResult,
    WebhookRegisterResult,
} from "@/features/settings";

const SUBSCRIPTION_WEBHOOK_TOPICS = [
    "APP_UNINSTALLED",
    "SHOP_UPDATE",
    "ORDERS_CREATE",
    "PRODUCTS_DELETE",
];

const GDPR_COMPLIANCE_TOPICS = [
    "CUSTOMERS_DATA_REQUEST",
    "CUSTOMERS_REDACT",
    "SHOP_REDACT",
];

export async function clearCacheService(
    sessionToken: string,
    shop: string,
): Promise<ClearCacheResult> {
    try {
        revalidatePath("/bundles");
        revalidatePath("/dashboard");
        revalidatePath("/settings");

        await syncAllSettingsToMetafields(sessionToken, shop);

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to clear server cache",
        };
    }
}

export async function syncMetafieldsService(
    sessionToken: string,
    shop: string,
): Promise<SyncMetafieldResult> {
    const result = await syncAllSettingsToMetafields(sessionToken, shop);

    const syncedItems: string[] = ["Global settings (shop metafield)"];
    if (result.bundleCount) {
        syncedItems.push(
            `Active bundles: ${result.bundleCount} (shop + discount metafields)`,
        );
    }

    return {
        success: result.success,
        bundleCount: result.bundleCount,
        error: result.error,
        syncedItems,
    };
}

export async function checkWebhooksService(
    sessionToken: string,
): Promise<WebhookCheckResult> {
    const allWebhooks = await getRegisteredWebhooks(sessionToken);

    const appWebhooks = allWebhooks.filter((w) =>
        SUBSCRIPTION_WEBHOOK_TOPICS.includes(w.topic),
    );

    const registeredTopics = appWebhooks.map((w) => w.topic);
    const missingTopics = SUBSCRIPTION_WEBHOOK_TOPICS.filter(
        (t) => !registeredTopics.includes(t),
    );

    return {
        webhooks: appWebhooks.map((w) => ({
            id: w.id,
            topic: w.topic,
            callbackUrl: w.callbackUrl,
            createdAt: w.createdAt,
        })),
        totalCount: appWebhooks.length,
        expectedTopics: SUBSCRIPTION_WEBHOOK_TOPICS,
        missingTopics,
        gdprTopics: GDPR_COMPLIANCE_TOPICS,
    };
}

export async function forceRegisterWebhooksService(
    sessionToken: string,
    session: Session,
    shop: string,
): Promise<WebhookRegisterResult> {
    await resetSetupStatus(shop);

    const result = await initializeApp(sessionToken, session);

    if (result.success) {
        return {
            success: true,
            registered: [...SUBSCRIPTION_WEBHOOK_TOPICS],
            failed: [],
        };
    }

    const failed = (result.errors ?? []).map((err) => ({
        topic: "unknown",
        error: err,
    }));

    return {
        success: false,
        registered: [],
        failed,
    };
}
