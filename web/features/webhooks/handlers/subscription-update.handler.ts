import { upsertShop } from "@/shared/repositories/shop.queries";
import { ShopifySubscriptionStatus } from "@/prisma/generated/client";
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

    const sub =
        (data.app_subscription as Record<string, unknown> | undefined) ?? data;

    console.log(
        `[Subscription] Processing APP_SUBSCRIPTIONS_UPDATE for ${shop}:`,
        sub.admin_graphql_api_id ?? sub.id,
        sub.status,
    );

    try {
        const subscriptionId = String(
            sub.admin_graphql_api_id ?? sub.id ?? "",
        );
        const rawStatus = String(sub.status || "").toUpperCase();
        const planName = String(sub.name || "");

        await updateShopSubscription(shop, subscriptionId, rawStatus, planName);

        const isActive = rawStatus === ShopifySubscriptionStatus.ACTIVE;
        const isTerminated =
            rawStatus === ShopifySubscriptionStatus.CANCELLED ||
            rawStatus === ShopifySubscriptionStatus.EXPIRED ||
            rawStatus === ShopifySubscriptionStatus.DECLINED;

        if (isActive) {
            await upsertShop(shop, { plan: "PRO" });
        } else if (isTerminated) {
            await upsertShop(shop, { plan: "FREE" });
            if (rawStatus === ShopifySubscriptionStatus.EXPIRED) {
                console.warn(
                    `[Subscription] Trial/subscription expired for ${shop} — downgraded to FREE`,
                );
            }
        }

        console.log(
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
