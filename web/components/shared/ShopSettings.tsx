'use client';

import { useShopSettings } from "@/hooks";

export const ShopSettings: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isLoading, error, isInitialized } = useShopSettings();

    if (!isInitialized && isLoading) {
        return;
    }

    if (error) console.error("Failed to load shop settings:", error);

    return <>{children}</>;
};
