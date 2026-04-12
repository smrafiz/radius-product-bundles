"use server";

import prisma from "@/shared/repositories/prisma-connect";
import { SetupProgress } from "@/features/dashboard";
import { DEFAULT_SETUP_PROGRESS } from "@/features/dashboard/constants/setup-guide.constants";

export async function getSetupProgress(domain: string) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: {
            setupGuideDismissed: true,
            setupProgress: true,
            domain: true,
        },
    });

    if (!shop) {
        throw new Error(`Shop not found: ${domain}`);
    }

    const progress: SetupProgress = {
        ...DEFAULT_SETUP_PROGRESS,
        ...((shop.setupProgress as Record<string, boolean>) ?? {}),
    };

    return {
        dismissed: shop.setupGuideDismissed,
        progress,
        shopDomain: shop.domain,
    };
}

export async function getAutoDetectData(domain: string) {
    const [bundleCount, appSettings] = await Promise.all([
        prisma.bundle.count({
            where: { shop: domain, status: { not: "DELETED" as const } },
        }),
        prisma.appSettings.findFirst({
            where: { shop: { domain } },
            select: { id: true },
        }),
    ]);

    return {
        bundleCount,
        settingsExist: appSettings !== null,
    };
}

export async function updateSetupProgress(
    domain: string,
    progress: SetupProgress,
    allComplete: boolean,
) {
    await prisma.shop.update({
        where: { domain },
        data: {
            setupProgress: progress as any,
            setupGuideDismissed: allComplete,
        },
    });
}

export async function dismissSetupGuide(domain: string) {
    await prisma.shop.update({
        where: { domain },
        data: { setupGuideDismissed: true },
    });
}

export async function showSetupGuide(domain: string) {
    await prisma.shop.update({
        where: { domain },
        data: { setupGuideDismissed: false },
    });
}
