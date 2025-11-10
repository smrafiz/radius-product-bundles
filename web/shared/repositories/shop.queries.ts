import { prisma } from "@/shared";

export async function upsertShop(
    domain: string,
    data?: Partial<{ plan: string; trialEndsAt: Date }>,
) {
    return await prisma.shop.upsert({
        where: { domain },
        create: { domain, ...data },
        update: { ...data },
    });
}

export async function getShop(domain: string) {
    return await prisma.shop.findUnique({
        where: { domain },
        include: { appSettings: true },
    });
}

export async function getShopStatus(domain: string) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { status: true },
    });
    return shop?.status ?? null;
}
