'use client';

import { useInitializeShopSettings } from "@/hooks/useInitializeShopSettings";

export const ShopSettings: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isLoading, error, isInitialized } = useInitializeShopSettings();

    if (!isInitialized && isLoading) {
        return;
    }

    if (error) console.error("Failed to load shop settings:", error);

    return <>{children}</>;
};
