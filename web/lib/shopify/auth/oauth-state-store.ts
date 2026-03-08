import prisma from "@/shared/repositories/prisma-connect";
import { randomBytes } from "crypto";

const STATE_TTL_MS = 5 * 60 * 1000;

export async function createOAuthState(shop: string): Promise<string> {
    const state = randomBytes(32).toString("hex");

    await prisma.session.upsert({
        where: { id: `oauth_state_${shop}` },
        create: {
            id: `oauth_state_${shop}`,
            shop,
            state,
            isOnline: false,
            apiKey: process.env.SHOPIFY_API_KEY!,
            expires: new Date(Date.now() + STATE_TTL_MS),
        },
        update: {
            state,
            expires: new Date(Date.now() + STATE_TTL_MS),
        },
    });

    return state;
}

export async function validateAndConsumeOAuthState(
    shop: string,
    state: string,
): Promise<boolean> {
    const { count } = await prisma.session.deleteMany({
        where: {
            id: `oauth_state_${shop}`,
            state,
            expires: { gte: new Date() },
        },
    });

    return count > 0;
}
