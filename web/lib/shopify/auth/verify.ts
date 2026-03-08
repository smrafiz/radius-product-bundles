import shopify from "../config/initialize-context";
import { RequestedTokenType, Session } from "@shopify/shopify-api";
import {
    findOfflineSessionByShop,
    storeSession,
    upsertShop,
} from "@/shared/repositories";
import {
    extractBearerToken,
    isSessionExpired,
    normalizeShopDomain,
} from "@/shared";
import { runAppSetup } from "../setup/app-setup";
import { registerWebhooks } from "../webhooks/register";
import { markSetupComplete, markWebhooksRegistered } from "@/features/webhooks";

const setupInProgress = new Map<string, Promise<void>>();

/**
 * Verify the request and return the shop and session
 */
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
 * Exchange the session token for a new session
 */
export async function tokenExchange({
    shop,
    sessionToken,
    online,
    store,
    forceRefresh,
}: {
    shop: string;
    sessionToken: string;
    online?: boolean;
    store?: boolean;
    forceRefresh?: boolean;
}): Promise<Session> {
    if (!online && !forceRefresh) {
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

    const response = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: online
            ? RequestedTokenType.OnlineAccessToken
            : RequestedTokenType.OfflineAccessToken,
    });

    const { session } = response;

    if (store || forceRefresh) {
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
    forceRefresh?: boolean,
): Promise<{ shop: string; session: Session }> {
    const payload = await shopify.session.decodeSessionToken(sessionToken);
    const shop = normalizeShopDomain(payload.dest);

    const session = await tokenExchange({
        shop,
        sessionToken,
        online,
        store: store !== false,
        forceRefresh,
    });

    // Ensure Shop record exists and run first-time setup if needed
    if (store !== false) {
        try {
            const shopRecord = await upsertShop(shop);

            if (!shopRecord.setupComplete && session.accessToken) {
                // Prevent duplicate concurrent setup for same shop
                if (!setupInProgress.has(shop)) {
                    const setupPromise = (async () => {
                        console.log(
                            "[Auth] First-time setup via token exchange for:",
                            shop,
                        );

                        const setupResult = await runAppSetup(
                            session.accessToken!,
                            shop,
                        );
                        if (setupResult.success) {
                            await markSetupComplete(shop);
                        }

                        try {
                            await registerWebhooks(session);
                            await markWebhooksRegistered(shop);
                        } catch (webhookErr) {
                            console.error(
                                "[Auth] Webhook registration failed:",
                                webhookErr,
                            );
                        }
                    })();

                    setupInProgress.set(shop, setupPromise);
                    try {
                        await setupPromise;
                    } finally {
                        setupInProgress.delete(shop);
                    }
                } else {
                    await setupInProgress.get(shop);
                }
            }
        } catch (err) {
            console.error("[Auth] Shop upsert/setup failed:", err);
        }
    }

    return { shop, session };
}
