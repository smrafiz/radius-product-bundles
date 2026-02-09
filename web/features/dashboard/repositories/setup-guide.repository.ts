"use server";

import prisma from "@/shared/repositories/prisma-connect";
import { DEFAULT_SETUP_PROGRESS } from "../constants/setup-guide.constants";
import type { SetupProgress, SetupStepKey } from "../types/setup-guide.types";

export async function getSetupProgress(domain: string) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: {
            setupGuideDismissed: true,
            setupProgress: true,
            setupComplete: true,
            domain: true,
        },
    });

    if (!shop) throw new Error(`Shop not found: ${domain}`);

    const progress: SetupProgress = {
        ...DEFAULT_SETUP_PROGRESS,
        ...((shop.setupProgress as Record<string, boolean>) ?? {}),
    };

    return {
        dismissed: shop.setupGuideDismissed,
        progress,
        setupComplete: shop.setupComplete,
        shopDomain: shop.domain,
    };
}

export async function updateSetupStep(
    domain: string,
    stepKey: SetupStepKey,
    value: boolean,
) {
    const shop = await prisma.shop.findUnique({
        where: { domain },
        select: { setupProgress: true },
    });

    if (!shop) throw new Error(`Shop not found: ${domain}`);

    const current: SetupProgress = {
        ...DEFAULT_SETUP_PROGRESS,
        ...((shop.setupProgress as Record<string, boolean>) ?? {}),
    };

    const updated = { ...current, [stepKey]: value };

    const allComplete = Object.values(updated).every(Boolean);

    await prisma.shop.update({
        where: { domain },
        data: {
            setupProgress: updated as any,
            setupComplete: allComplete,
        },
    });

    return updated;
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
