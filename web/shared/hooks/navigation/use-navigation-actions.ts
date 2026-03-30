"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useNavigationActions<T extends Record<string, () => void | false>>(
    actions: T,
) {
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setLoadingKey(null);
    }, [pathname]);

    const wrapped = Object.entries(actions).reduce(
        (acc, [key, fn]) => {
            acc[key as keyof T] = () => {
                setLoadingKey(key);
                const result = fn();
                if (result === false) {
                    setLoadingKey(null);
                }
            };
            return acc;
        },
        {} as Record<keyof T, () => void>,
    );

    return {
        actions: wrapped,
        isLoading: (key: keyof T) => loadingKey === key,
        activeKey: loadingKey,
    };
}
