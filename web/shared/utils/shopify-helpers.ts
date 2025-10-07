/**
 * Shopify App Bridge helper utilities
 */

// Type for the Shopify window object
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
    return typeof window !== 'undefined' && !!window.shopify?.loading;
};

/**
 * Wrapper function to start the loader and execute a synchronous callback
 *
 * @param callback - Function to execute with loader
 * @returns Wrapped function that shows loader before execution
 *
 * @example
 * ```tsx
 * <Button onAction={withLoader(() => router.push('/bundles'))}>
 *   Navigate
 * </Button>
 * ```
 */
export const withLoader = <T extends (...args: any[]) => void>(
    callback: T
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
 *
 * @param callback - Async function to execute with loader
 * @returns Wrapped async function with loader
 *
 * @example
 * ```tsx
 * const handleSave = withAsyncLoader(async () => {
 *   await saveBundle(data);
 *   router.push('/bundles');
 * });
 * ```
 */
export const withAsyncLoader = <T extends (...args: any[]) => Promise<any>>(
    callback: T
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        if (isShopifyAvailable()) {
            window.shopify!.loading(true);
        }

        try {
            return await callback(...args);
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
 * Execute a function with loading state
 * Useful for imperative code
 *
 * @example
 * ```ts
 * await executeWithLoading(async () => {
 *   await api.call();
 * });
 * ```
 */
export const executeWithLoading = async <T>(
    callback: () => Promise<T>
): Promise<T> => {
    startLoading();
    try {
        return await callback();
    } finally {
        stopLoading();
    }
};