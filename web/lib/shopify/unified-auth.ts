// lib/shopify/unified-auth.ts
import { NextRequest } from "next/server";
import crypto from "crypto";
import { findOfflineSessionByShop } from "@/lib/db/session-storage";
import {
    SessionNotFoundError,
    ExpiredTokenError,
    normalizeShopDomain,
    isSessionExpired,
} from "@/utils";

// Environment validation
if (!process.env.SHOPIFY_API_SECRET) {
    throw new Error("SHOPIFY_API_SECRET environment variable is required");
}

// Types
export interface AuthSession {
    id: string;
    shop: string;
    accessToken?: string | null;
    isOnline?: boolean;
    scope?: string;
    expires?: Date | null;
    // App proxy specific fields
    timestamp?: number;
    logged_in_customer_id?: string | null;
    path_prefix?: string;
}

export interface AuthResult {
    shop: string;
    session: AuthSession;
    type: "oauth" | "app-proxy";
}

// Custom error classes for app proxy
export class AppProxyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AppProxyError";
    }
}

/**
 * Unified authenticate function for both OAuth and App Proxy requests
 */
export async function authenticate(
    req: NextRequest,
): Promise<AuthResult | null> {
    try {
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams.entries());

        const shop = params["shop"];
        if (!shop || !isValidShopDomain(shop)) {
            logAuthEvent("error", "Invalid or missing shop parameter", {
                shop,
            });
            return null;
        }

        const normalizedShop = normalizeShopDomain(shop);
        const signature = params["signature"];
        const timestamp = params["timestamp"];

        // 🔹 1. App Proxy Authentication
        if (signature && timestamp) {
            logAuthEvent("info", "Attempting app proxy authentication", {
                shop: normalizedShop,
            });

            try {
                const isValid = verifyAppProxySignature(params);
                if (!isValid) {
                    throw new AppProxyError("Invalid app proxy signature");
                }

                const authResult: AuthResult = {
                    shop: normalizedShop,
                    session: {
                        id: `app-proxy-${normalizedShop}`,
                        shop: normalizedShop,
                        accessToken: null,
                        isOnline: false,
                        scope: "",
                        expires: null,
                        timestamp: parseInt(timestamp),
                        logged_in_customer_id:
                            params["logged_in_customer_id"] || null,
                        path_prefix: params["path_prefix"] || "",
                    },
                    type: "app-proxy",
                };

                logAuthEvent("success", "App proxy authentication successful", {
                    shop: normalizedShop,
                });
                return authResult;
            } catch (error) {
                logAuthEvent("error", "App proxy authentication failed", {
                    shop: normalizedShop,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
                return null;
            }
        }

        // 🔹 2. OAuth Session Authentication
        logAuthEvent("info", "Attempting OAuth session authentication", {
            shop: normalizedShop,
        });

        try {
            const session = await findOfflineSessionByShop(normalizedShop);

            // Check if session is expired using your utility
            if (isSessionExpired(session.expires)) {
                throw new ExpiredTokenError(session.isOnline || false);
            }

            // Validate access token exists
            if (!session.accessToken) {
                throw new SessionNotFoundError(false); // offline session
            }

            const authResult: AuthResult = {
                shop: normalizedShop,
                session: {
                    id: session.id,
                    shop: session.shop,
                    accessToken: session.accessToken,
                    isOnline: session.isOnline,
                    scope: session.scope,
                    expires: session.expires,
                },
                type: "oauth",
            };

            logAuthEvent("success", "OAuth session authentication successful", {
                shop: normalizedShop,
                sessionId: session.id,
                isOnline: session.isOnline,
            });

            return authResult;
        } catch (error) {
            if (error instanceof SessionNotFoundError) {
                logAuthEvent("error", "No session found for shop", {
                    shop: normalizedShop,
                    isOnline: error.isOnline,
                });
            } else if (error instanceof ExpiredTokenError) {
                logAuthEvent("error", "Session expired for shop", {
                    shop: normalizedShop,
                    isOnline: error.isOnline,
                });
            } else {
                logAuthEvent("error", "OAuth session authentication failed", {
                    shop: normalizedShop,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
            }
            return null;
        }
    } catch (error) {
        logAuthEvent("error", "Authentication process failed", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return null;
    }
}

/**
 * Verify Shopify App Proxy signature using HMAC SHA256
 */
function verifyAppProxySignature(params: Record<string, string>): boolean {
    const { signature, timestamp, ...rest } = params;

    if (!signature) {
        throw new AppProxyError("Missing signature parameter");
    }

    if (!timestamp) {
        throw new AppProxyError("Missing timestamp parameter");
    }

    // Validate timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);

    if (isNaN(requestTime)) {
        throw new AppProxyError("Invalid timestamp format");
    }

    // Reject requests older than 5 minutes (300 seconds)
    const timeDiff = Math.abs(now - requestTime);
    if (timeDiff > 300) {
        throw new AppProxyError(
            `Request expired. Time difference: ${timeDiff} seconds`,
        );
    }

    try {
        // Build HMAC string according to Shopify's specification
        const sortedParams = Object.keys(rest)
            .sort()
            .map((key) => `${key}=${rest[key]}`)
            .join("&");

        const dataToSign = sortedParams;

        logAuthEvent("debug", "HMAC verification details", {
            dataToSign,
            receivedSignature: signature,
            timestamp: requestTime,
        });

        // Calculate HMAC
        const calculatedSignature = crypto
            .createHmac("sha256", process.env.SHOPIFY_API_SECRET!)
            .update(dataToSign)
            .digest("hex");

        // Timing-safe comparison
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature, "hex"),
            Buffer.from(calculatedSignature, "hex"),
        );

        if (!isValid) {
            logAuthEvent("debug", "Signature mismatch", {
                received: signature,
                calculated: calculatedSignature,
                dataToSign,
            });
        }

        return isValid;
    } catch (error) {
        logAuthEvent("error", "HMAC verification error", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        throw new AppProxyError("Failed to verify signature");
    }
}

/**
 * Validate shop domain format (since your normalizeShopDomain doesn't validate)
 */
function isValidShopDomain(shop: string): boolean {
    if (!shop) {
        return false;
    }

    // Remove protocols and .myshopify.com for validation
    const cleanShop = shop
        .replace(/^https?:\/\//, "")
        .replace(".myshopify.com", "");

    // Shopify shop names: letters, numbers, hyphens, 3-60 chars
    const shopRegex =
        /^[a-zA-Z0-9][a-zA-Z0-9\-]{1,58}[a-zA-Z0-9]$|^[a-zA-Z0-9]{1,60}$/;

    return shopRegex.test(cleanShop);
}

/**
 * Check if authentication result is from app proxy
 */
export function isAppProxyRequest(authResult: AuthResult): boolean {
    return authResult.type === "app-proxy";
}

/**
 * Check if authentication result is from OAuth session
 */
export function isOAuthRequest(authResult: AuthResult): boolean {
    return authResult.type === "oauth";
}

/**
 * Get logged-in customer ID from app proxy request
 */
export function getLoggedInCustomerId(authResult: AuthResult): string | null {
    if (authResult.type === "app-proxy") {
        return authResult.session.logged_in_customer_id || null;
    }
    return null;
}

/**
 * Check if user has required scopes (OAuth only)
 */
export function hasRequiredScopes(
    authResult: AuthResult,
    requiredScopes: string[],
): boolean {
    if (authResult.type !== "oauth" || !authResult.session.scope) {
        return false;
    }

    const sessionScopes = authResult.session.scope
        .split(",")
        .map((s) => s.trim());
    return requiredScopes.every((scope) => sessionScopes.includes(scope));
}

/**
 * Create middleware function for route protection
 */
export function createAuthMiddleware(
    options: {
        requireOAuth?: boolean;
        requireAppProxy?: boolean;
        requiredScopes?: string[];
    } = {},
) {
    return async (req: NextRequest) => {
        const authResult = await authenticate(req);

        if (!authResult) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Check OAuth requirement
        if (options.requireOAuth && authResult.type !== "oauth") {
            return new Response("OAuth authentication required", {
                status: 401,
            });
        }

        // Check App Proxy requirement
        if (options.requireAppProxy && authResult.type !== "app-proxy") {
            return new Response("App Proxy authentication required", {
                status: 401,
            });
        }

        // Check required scopes
        if (
            options.requiredScopes &&
            !hasRequiredScopes(authResult, options.requiredScopes)
        ) {
            return new Response("Insufficient permissions", { status: 403 });
        }

        return null; // Authentication successful
    };
}

/**
 * Logging utility for authentication events
 */
function logAuthEvent(
    level: "debug" | "info" | "warn" | "error" | "success",
    message: string,
    data?: Record<string, any>,
): void {
    const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data,
    };

    // Only log debug messages in development
    if (level === "debug" && process.env.NODE_ENV !== "development") {
        return;
    }

    // Use appropriate console method
    switch (level) {
        case "error":
            console.error("🔒", logData);
            break;
        case "warn":
            console.warn("⚠️", logData);
            break;
        case "success":
            console.log("✅", logData);
            break;
        case "debug":
            console.debug("🔍", logData);
            break;
        default:
            console.log("ℹ️", logData);
    }
}
