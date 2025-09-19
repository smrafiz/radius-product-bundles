/**
 * Wrapper function to start the loader and execute the callback
 * @param callback
 * @returns
 */
export const withLoader = (callback: () => void) => {
    return () => {
        window.shopify.loading(true);
        callback();
    };
};
