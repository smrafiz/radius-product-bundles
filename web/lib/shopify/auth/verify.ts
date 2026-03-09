import {
    extractBearerToken,
    isSessionExpired,
    normalizeShopDomain,
} from "@/shared";
import {
    findOfflineSessionByShop,
    storeSession,
    upsertShop,
} from "@/shared/repositories";
import { runAppSetup } from "../setup/app-setup";
import shopify from "../config/initialize-context";
import { registerWebhooks } from "../webhooks/register";
import { markWebhooksRegistered } from "@/features/webhooks";
import { RequestedTokenType, Session } from "@shopify/shopify-api";
import { claimSetupLock } from "@/features/webhooks/repositories/webhook.repository";

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
            await upsertShop(shop);

            // Atomically claim setup lock in DB to prevent concurrent/duplicate setup
            if (session.accessToken && (await claimSetupLock(shop))) {
                console.log(
                    "[Auth] First-time setup via token exchange for:",
                    shop,
                );

                try {
                    await runAppSetup(session.accessToken!, shop);
                } catch (setupErr) {
                    console.error("[Auth] Setup failed (use Force Register to retry):", setupErr);
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
            }
        } catch (err) {
            console.error("[Auth] Shop upsert/setup failed:", err);
        }
    }

    return { shop, session };
}
