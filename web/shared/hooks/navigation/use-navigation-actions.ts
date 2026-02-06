"use client";

import { useState } from "react";

export function useNavigationActions<T extends Record<string, () => void>>(
    actions: T,
) {
    const [loadingKey, setLoadingKey] = useState<string | null>(null);

    const wrapped = Object.entries(actions).reduce(
        (acc, [key, fn]) => {
            acc[key as keyof T] = () => {
                setLoadingKey(key);
                fn();
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
