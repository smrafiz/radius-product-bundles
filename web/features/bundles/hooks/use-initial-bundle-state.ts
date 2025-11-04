"use client";

import { useEffect, useState } from "react";

/**
 * Use the initial bundle state
 */
export function useInitialBundleState({
    hasData,
    isLoading,
}: {
    hasData: boolean;
    isLoading: boolean;
}) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (hasData && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [hasData, isInitialLoad]);

    return {
        isInitialLoad,
        showSkeleton: isInitialLoad && isLoading,
    };
}
