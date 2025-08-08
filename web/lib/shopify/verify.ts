import { storeSession, loadSession } from "@/lib/db/session-storage";
import shopify from "@/lib/shopify/initialize-context";
import { RequestedTokenType, Session } from "@shopify/shopify-api";

export class AppNotInstalledError extends Error {
    constructor() {
        super("App not installed");
        this.name = "AppNotInstalledError";
    }
}

export class SessionNotFoundError extends Error {
    isOnline: boolean;
    constructor(isOnline: boolean) {
        super("Session not found");
        this.name = "SessionNotFoundError";
        this.isOnline = isOnline;
    }
}

export class ScopeMismatchError extends Error {
    isOnline: boolean;
    accountOwner: boolean;
    constructor(isOnline: boolean, accountOwner: boolean) {
        super("Scope mismatch");
        this.name = "ScopeMismatchError";
        this.isOnline = isOnline;
        this.accountOwner = accountOwner;
    }
}

export class ExpiredTokenError extends Error {
    isOnline: boolean;
    constructor(isOnline: boolean) {
        super(`Token expired - ${isOnline ? "online" : "offline"}`);
        this.name = "ExpiredTokenError";
        this.isOnline = isOnline;
    }
}

export async function verifyRequest(
    req: Request,
    isOnline: boolean,
): Promise<{ shop: string; session: Session }> {
    const bearerPresent = req.headers
        .get("authorization")
        ?.startsWith("Bearer ");
    const sessionToken = req.headers
        .get("authorization")
        ?.replace("Bearer ", "");
    if (!bearerPresent || !sessionToken) {
        throw new Error("No bearer or session token present");
    }
    return handleSessionToken(sessionToken, isOnline);
}

/**
 * Do the token exchange from the sessionIdToken that comes from the client
 * This returns a valid session object.
 * NOW WITH SESSION CACHING - checks DB first before creating new sessions
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
    
    // Generate consistent session ID
    const sessionId = `${shop}_${online ? 'online' : 'offline'}`;
    
    // First, try to load existing session from database
    try {
        const existingSession = await loadSession(sessionId);
        
        // Check if session is still valid
        if (existingSession && existingSession.accessToken) {
            const now = new Date();
            const isExpired = existingSession.expires && new Date(existingSession.expires) < now;
            
            if (!isExpired) {
                console.log(`♻️  Reusing existing session for shop: ${shop}`);
                return existingSession;
            } else {
                console.log(`⏰ Session expired for shop: ${shop}, creating new one`);
            }
        }
    } catch (error) {
        // Session doesn't exist in DB, will create new one
        console.log(`🆕 No existing session found for shop: ${shop}, creating new one`);
    }

    // Create new session via token exchange
    console.log(`🔄 Creating new session for shop: ${shop} (${online ? 'online' : 'offline'})`);
    const response = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: online
            ? RequestedTokenType.OnlineAccessToken
            : RequestedTokenType.OfflineAccessToken,
    });
    
    const { session } = response;
    
    // Store the new session
    if (store !== false) { // Store by default unless explicitly disabled
        await storeSession(session);
        console.log(`✅ Session stored for shop: ${shop}`);
    }
    
    return session;
}

/**
 * @description Do all the necessary steps, to validate the session token and refresh it if it needs to.
 * @param sessionToken The session token from the request headers or directly sent by the client
 * @param online
 * @returns The session object
 */
export async function handleSessionToken(
    sessionToken: string,
    online?: boolean,
    store?: boolean,
): Promise<{ shop: string; session: Session }> {
    const payload = await shopify.session.decodeSessionToken(sessionToken);
    const shop = payload.dest.replace("https://", "");
    
    // Always store sessions by default for caching
    const session = await tokenExchange({ 
        shop, 
        sessionToken, 
        online, 
        store: store !== false 
    });
    
    return { shop, session };
}
