import NProgress from "nprogress";

/**
 * Wrapper function to start the loader and execute the callback
 * @param callback
 * @returns
 */
export const withLoader = (callback: () => void) => {
    return () => {
        NProgress.start(); // start instantly
        callback();
    };
};
