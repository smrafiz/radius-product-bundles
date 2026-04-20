import { ShopPlanUpsertData } from "@/features/pricing";
import prisma from "@/shared/repositories/prisma-connect";
import { ShopifySubscriptionStatus } from "@/prisma/generated/client";

export async function getShopPlanRecord(domain: string) {
    return prisma.shopPlan.findFirst({
        where: { shop: { domain } },
    });
}

export async function upsertShopPlan(domain: string, data: ShopPlanUpsertData) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { id: true },
    });

    if (!shop) {
        throw new Error(`Shop not found: ${domain}`);
    }

    return prisma.shopPlan.upsert({
        where: { shopId: shop.id },
        create: { shopId: shop.id, ...data },
        update: { ...data },
    });
}

export async function cancelShopPlan(domain: string) {
    return prisma.shopPlan.updateMany({
        where: { shop: { domain } },
        data: {
            status: ShopifySubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
            trialEndsAt: null,
            plan: "FREE",
        },
    });
}

export async function deleteShopPlan(domain: string) {
    return prisma.shopPlan.deleteMany({
        where: { shop: { domain } },
    });
}
