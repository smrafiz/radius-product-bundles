import { useEffect, useState } from "react";

interface Props {
    hasData: boolean;
    isLoading: boolean;
}

export function useInitialBundleState({ hasData, isLoading }: Props) {
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
