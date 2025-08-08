import { Session } from "@prisma/client";
import { Session as ShopifySession } from "@shopify/shopify-api";
import prisma from "./prisma-connect";

const apiKey = process.env.SHOPIFY_API_KEY || "";

/**
 * Stores the session in the database
 * This could be useful if we need to do something with the access token later.
 */
export async function storeSession(session: ShopifySession) {
    console.log(`💾 Storing session for shop: ${session.shop} (${session.isOnline ? 'online' : 'offline'}) with ID: ${session.id}`);
    
    await prisma.session.upsert({
        where: { id: session.id },
        update: {
            shop: session.shop,
            accessToken: session.accessToken,
            scope: session.scope,
            expires: session.expires,
            isOnline: session.isOnline,
            state: session.state,
            apiKey,
        },
        create: {
            id: session.id,
            shop: session.shop,
            accessToken: session.accessToken,
            scope: session.scope,
            expires: session.expires,
            isOnline: session.isOnline,
            state: session.state,
            apiKey,
        },
    });

    if (session.onlineAccessInfo) {
        const onlineAccessInfo = await prisma.onlineAccessInfo.upsert({
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
        const associatedUser = await prisma.associatedUser.upsert({
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
    
    console.log(`✅ Session stored successfully for shop: ${session.shop} with ID: ${session.id}`);
}

export async function loadSession(id: string) {
    console.log(`🔍 Loading session from DB by ID: ${id}`);
    
    const session = await prisma.session.findUnique({
        where: { id },
    });

    if (session) {
        console.log(`✅ Session found in DB: ${session.shop} (${session.isOnline ? 'online' : 'offline'}) with ID: ${session.id}`);
        return generateShopifySessionFromDB(session);
    } else {
        console.log(`❌ Session not found in DB by ID: ${id}`);
        throw new SessionNotFoundError();
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

export async function cleanUpSession(shop: string, accessToken: string) {
    await prisma.session.deleteMany({
        where: { shop, accessToken, apiKey },
    });
}

export async function findSessionsByShop(shop: string) {
    console.log(`🔍 Looking for sessions by shop: ${shop}`);
    
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

    console.log(`📊 Found ${sessions.length} sessions for shop: ${shop}`);
    sessions.forEach(s => {
        console.log(`  - Session ID: ${s.id}, isOnline: ${s.isOnline}, expires: ${s.expires}`);
    });

    return sessions.map((session) => generateShopifySessionFromDB(session));
}

function generateShopifySessionFromDB(session: Session) {
    return new ShopifySession({
        id: session.id,
        shop: session.shop,
        accessToken: session.accessToken || undefined,
        scope: session.scope || undefined,
        state: session.state,
        isOnline: session.isOnline,
        expires: session.expires || undefined,
    });
}

export class SessionNotFoundError extends Error {
    constructor() {
        super("Session not found");
        this.name = "SessionNotFoundError";
    }
}

export async function findOfflineSessionByShop(shop: string) {
    console.log(`🔍 Looking for OFFLINE session for shop: ${shop}`);
    
    const sessions = await findSessionsByShop(shop);
    // Return the offline session (isOnline === false)
    const offlineSession = sessions.find((session) => !session.isOnline);
    
    if (!offlineSession) {
        console.log(`❌ No offline session found for shop: ${shop}`);
        throw new SessionNotFoundError();
    }
    
    console.log(`✅ Found offline session for shop: ${shop} with ID: ${offlineSession.id}`);
    return offlineSession;
}
