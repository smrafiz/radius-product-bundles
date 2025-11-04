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
