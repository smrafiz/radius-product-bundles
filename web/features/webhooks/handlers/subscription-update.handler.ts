import { updateShopSubscription } from "@/features/webhooks/repositories/webhook.repository";

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

    console.log(
        `[Subscription] Processing APP_SUBSCRIPTIONS_UPDATE for ${shop}:`,
        data.id,
        data.status,
    );

    try {
        const subscriptionId = String(data.id || "");
        const newStatus = String(data.status || "");
        const planName = String(data.name || "");

        await updateShopSubscription(shop, subscriptionId, newStatus, planName);

        console.log(
            `[Subscription] Updated subscription for ${shop}: ${subscriptionId} -> ${newStatus} (${planName})`,
        );
    } catch (error) {
        console.error(
            `[Subscription] Failed to update subscription for ${shop}:`,
            error,
        );
        throw error;
    }
}
