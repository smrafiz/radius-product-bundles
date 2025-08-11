import {
    AppNotInstalledError, 
    SessionNotFoundError, 
    ScopeMismatchError, 
    ExpiredTokenError,
    normalizeShopDomain,
    extractBearerToken,
    isSessionExpired
} from "@/utils";
import shopify from "@/lib/shopify/initialize-context";
import { RequestedTokenType, Session } from "@shopify/shopify-api";
import { storeSession, findOfflineSessionByShop } from "@/lib/db/session-storage";

export { AppNotInstalledError, SessionNotFoundError, ScopeMismatchError, ExpiredTokenError };

export async function verifyRequest(
    req: Request,
    isOnline: boolean,
): Promise<{ shop: string; session: Session }> {
    const authHeader = req.headers.get("authorization");
    const sessionToken = extractBearerToken(authHeader);
    
    if (!sessionToken) {
        throw new Error("No bearer or session token present");
    }
    
    return handleSessionToken(sessionToken, isOnline);
}

/**
 * Do the token exchange from the sessionIdToken that comes from the client
 * This returns a valid session object with session caching.
 */
export async function tokenExchange({
    shop,
    sessionToken,
    online,
    store,
}: {
    shop: string;
    sessionToken: string;
    online?: boolean;
    store?: boolean;
}): Promise<Session> {
    
    // For offline sessions, try to find an existing session by shop
    if (!online) {
        try {
            const existingSession = await findOfflineSessionByShop(shop);
            
            if (existingSession && existingSession.accessToken) {
                if (!isSessionExpired(existingSession.expires)) {
                    return existingSession;
                }
            }
        } catch (error) {
            // Session doesn't exist in DB, will create a new one
        }
    }

    // Create a new session via token exchange
    const response = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: online
            ? RequestedTokenType.OnlineAccessToken
            : RequestedTokenType.OfflineAccessToken,
    });
    
    const { session } = response;
    
    // Store the new session
    if (store) {
        await storeSession(session);
    }
    
    return session;
}

/**
 * Do all the necessary steps to validate the session token and refresh it if needed.
 */
export async function handleSessionToken(
    sessionToken: string,
    online?: boolean,
    store?: boolean,
): Promise<{ shop: string; session: Session }> {
    const payload = await shopify.session.decodeSessionToken(sessionToken);
    const shop = normalizeShopDomain(payload.dest);
    
    const session = await tokenExchange({ 
        shop, 
        sessionToken, 
        online, 
        store: store !== false 
    });
    
    return { shop, session };
}
