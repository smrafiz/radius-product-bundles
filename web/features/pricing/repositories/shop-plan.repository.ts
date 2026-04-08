import { ShopPlanUpsertData } from "@/features/pricing";
import prisma from "@/shared/repositories/prisma-connect";
import { ShopifySubscriptionStatus } from "@/prisma/generated/client";

export async function getShopPlanRecord(shop: string) {
    return prisma.shopPlan.findUnique({
        where: { shop },
    });
}

export async function upsertShopPlan(shop: string, data: ShopPlanUpsertData) {
    return prisma.shopPlan.upsert({
        where: { shop },
        create: { shop, ...data },
        update: { ...data },
    });
}

export async function cancelShopPlan(shop: string) {
    return prisma.shopPlan.updateMany({
        where: { shop },
        data: {
            status: ShopifySubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
            trialEndsAt: null,
            plan: "FREE",
        },
    });
}

export async function deleteShopPlan(shop: string) {
    return prisma.shopPlan.deleteMany({
        where: { shop },
    });
}
