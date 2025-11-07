/**
 * Shopify App Bridge helper utilities
 */
import { useAppBridge } from "@shopify/app-bridge-react";

/*
 * Type for the Shopify window object
 */
declare global {
    interface Window {
        shopify?: {
            loading: (state: boolean) => void;
        };
    }
}

/**
 * Check if Shopify App Bridge is available
 */
const isShopifyAvailable = (): boolean => {
    return typeof window !== "undefined" && !!window.shopify?.loading;
};

/**
 * Wrapper function to start the loader and execute a synchronous callback
 */
export const withLoader = <T extends (...args: any[]) => void>(
    callback: T,
): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
        if (isShopifyAvailable()) {
            window.shopify!.loading(true);
        }
        callback(...args);
    };
};

/**
 * Wrapper function for async operations with automatic loader cleanup
 */
export const withAsyncLoader = <T extends (...args: any[]) => any>(
    callback: T
): ((...args: Parameters<T>) => Promise<void>) => {
    return async (...args: Parameters<T>): Promise<void> => {
        if (isShopifyAvailable()) {
            window.shopify!.loading(true);
        }

        try {
            await callback(...args);
        } finally {
            if (isShopifyAvailable()) {
                window.shopify!.loading(false);
            }
        }
    };
};

/**
 * Manually start loading indicator
 */
export const startLoading = (): void => {
    if (isShopifyAvailable()) {
        window.shopify!.loading(true);
    }
};

/**
 * Manually stop loading indicator
 */
export const stopLoading = (): void => {
    if (isShopifyAvailable()) {
        window.shopify!.loading(false);
    }
};

/**
 * Execute a function with a loading state
 */
export const executeWithLoading = async <T>(
    callback: () => Promise<T>,
): Promise<T> => {
    startLoading();
    try {
        return await callback();
    } finally {
        stopLoading();
    }
};

/**
 * Session token request.
 */
export async function getSessionToken(
    app: ReturnType<typeof useAppBridge>
): Promise<string> {
    return await app.idToken();
}

/**
 * Custom error classes for Shopify app operations
 */

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

/**
 * Utility function to extract shop domain from various formats
 */
export function normalizeShopDomain(shop: string): string {
    return shop.replace("https://", "").replace("http://", "");
}

/**
 * Utility function to generate secure state parameter for OAuth
 */
export function generateOAuthState(shop: string): string {
    return `${shop}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * Utility function to validate token format
 */
export function isValidShopifyToken(token: string): boolean {
    return token.startsWith("shpat_") && token.length > 20;
}

/**
 * Utility function to check if the session is expired
 */
export function isSessionExpired(expires: Date | null | undefined): boolean {
    if (!expires) return false;
    return new Date() > new Date(expires);
}

/**
 * Utility function to extract authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.replace("Bearer ", "");
}
