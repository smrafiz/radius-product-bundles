import { handleSubscriptionWebhookService } from "@/features/pricing/services/subscription.service";

export async function handleAppSubscriptionUpdate(
    shop: string,
    body: string,
): Promise<void> {
    let data: Record<string, unknown> | undefined;
    try {
        data = JSON.parse(body);
    } catch {
        console.error("[Subscription] Failed to parse body");
        return;
    }

    if (!data) {
        console.error("[Subscription] No body provided");
        return;
    }

    const sub =
        (data.app_subscription as Record<string, unknown> | undefined) ?? data;

    const subscriptionId = String(sub.admin_graphql_api_id ?? sub.id ?? "");
    const rawStatus = String(sub.status || "").toUpperCase();
    const planName = String(sub.name || "");

    console.info(
        `[Subscription] Processing APP_SUBSCRIPTIONS_UPDATE for ${shop}:`,
        subscriptionId,
        rawStatus,
    );

    try {
        await handleSubscriptionWebhookService(shop, subscriptionId, rawStatus, planName);

        console.info(
            `[Subscription] Updated for ${shop}: ${subscriptionId} -> ${rawStatus} (${planName})`,
        );
    } catch (error) {
        console.error(
            `[Subscription] Failed to update subscription for ${shop}:`,
            error,
        );
        throw error;
    }
}
