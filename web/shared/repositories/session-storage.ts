import prisma from "./prisma-connect";
import { Session } from "@/prisma/generated/client";
import { Session as ShopifySession } from "@shopify/shopify-api";
import { encryptToken, decryptToken, isEncrypted } from "@/lib/crypto";

const apiKey = process.env.SHOPIFY_API_KEY || "";

/**
 * Stores the session in the database
 */
export async function storeSession(session: ShopifySession) {
    await prisma.$transaction(async (tx) => {
        await tx.session.upsert({
            where: { id: session.id },
            update: {
                shop: session.shop,
                accessToken: session.accessToken
                    ? encryptToken(session.accessToken)
                    : null,
                scope: session.scope,
                expires: session.expires,
                isOnline: session.isOnline,
                state: session.state,
                apiKey,
            },
            create: {
                id: session.id,
                shop: session.shop,
                accessToken: session.accessToken
                    ? encryptToken(session.accessToken)
                    : null,
                scope: session.scope,
                expires: session.expires,
                isOnline: session.isOnline,
                state: session.state,
                apiKey,
            },
        });

        if (session.onlineAccessInfo) {
            const onlineAccessInfo = await tx.onlineAccessInfo.upsert({
                where: { sessionId: session.id },
                update: {
                    expiresIn: session.onlineAccessInfo.expires_in,
                    associatedUserScope:
                        session.onlineAccessInfo.associated_user_scope,
                },
                create: {
                    sessionId: session.id,
                    expiresIn: session.onlineAccessInfo.expires_in,
                    associatedUserScope:
                        session.onlineAccessInfo.associated_user_scope,
                },
            });

            const { associated_user } = session.onlineAccessInfo;
            await tx.associatedUser.upsert({
                where: { onlineAccessInfoId: onlineAccessInfo.id },
                update: {
                    firstName: associated_user.first_name,
                    lastName: associated_user.last_name,
                    email: associated_user.email,
                    emailVerified: associated_user.email_verified,
                    accountOwner: associated_user.account_owner,
                    locale: associated_user.locale,
                    collaborator: associated_user.collaborator,
                    userId: associated_user.id,
                },
                create: {
                    onlineAccessInfoId: onlineAccessInfo.id,
                    firstName: associated_user.first_name,
                    lastName: associated_user.last_name,
                    email: associated_user.email,
                    emailVerified: associated_user.email_verified,
                    accountOwner: associated_user.account_owner,
                    locale: associated_user.locale,
                    collaborator: associated_user.collaborator,
                    userId: associated_user.id,
                },
            });
        }
    });
}

export async function loadSession(id: string) {
    const session = await prisma.session.findUnique({
        where: { id },
    });

    if (session) {
        return generateShopifySessionFromDB(session);
    } else {
        throw new NoSessionFoundError();
    }
}

export async function deleteSession(id: string) {
    await prisma.session.delete({
        where: { id },
    });
}

export async function deleteSessions(ids: string[]) {
    await prisma.session.deleteMany({
        where: { id: { in: ids } },
    });
}

export async function findSessionsByShop(shop: string) {
    const sessions = await prisma.session.findMany({
        where: { shop, apiKey },
        include: {
            onlineAccessInfo: {
                include: {
                    associatedUser: true,
                },
            },
        },
    });

    return sessions.map((session) => generateShopifySessionFromDB(session));
}

function generateShopifySessionFromDB(session: Session) {
    let accessToken: string | undefined;

    if (session.accessToken) {
        if (isEncrypted(session.accessToken)) {
            accessToken = decryptToken(session.accessToken);
        } else {
            accessToken = session.accessToken;
            prisma.session
                .update({
                    where: { id: session.id },
                    data: { accessToken: encryptToken(session.accessToken) },
                })
                .catch((err) =>
                    console.error(
                        `[Session] Failed to encrypt token for ${session.id}:`,
                        err,
                    ),
                );
        }
    }

    return new ShopifySession({
        id: session.id,
        shop: session.shop,
        accessToken,
        scope: session.scope || undefined,
        state: session.state,
        isOnline: session.isOnline,
        expires: session.expires || undefined,
    });
}

export class NoSessionFoundError extends Error {
    constructor() {
        super("Session not found");
        this.name = "SessionNotFoundError";
    }
}

export async function findOfflineSessionByShop(shop: string) {
    const sessions = await findSessionsByShop(shop);
    const offlineSession = sessions.find((session) => !session.isOnline);

    if (!offlineSession) {
        throw new NoSessionFoundError();
    }

    return offlineSession;
}
