import { NextRequest } from "next/server";
import { extractBearerToken } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";

/**
 * Authenticates a billing API request via the Shopify App Bridge session token
 * (Authorization: Bearer <token>). Returns the verified shop domain and offline
 * access token. Throws on any auth failure — callers must catch and return 401.
 */
export async function authenticateBillingRequest(request: NextRequest): Promise<{
    shop: string;
    accessToken: string;
}> {
    const authHeader = request.headers.get("authorization");
    const sessionToken = extractBearerToken(authHeader);

    if (!sessionToken) {
        throw new Error("Missing or invalid authorization header");
    }

    const { shop, session } = await handleSessionToken(sessionToken);

    if (!session.accessToken) {
        throw new Error("No access token for shop");
    }

    return { shop, accessToken: session.accessToken };
}
