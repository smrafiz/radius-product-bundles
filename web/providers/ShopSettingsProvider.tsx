// /web/components/shared/ShopSettingsProvider.tsx
"use client";

import { useShopSettings } from "@/hooks";
import { ReactNode } from "react";
import { Banner } from "@shopify/polaris";

interface ShopSettingsProviderProps {
    children: ReactNode;
    // 🔥 Control when to load shop settings
    loadSettings?: boolean;
    // 🔥 Show loading UI or render children immediately
    showLoadingState?: boolean;
    // 🔥 Custom loading component
    loadingComponent?: ReactNode;
    // 🔥 Custom error component
    errorComponent?: (error: Error, retry: () => void) => ReactNode;
}

export const ShopSettingsProvider: React.FC<ShopSettingsProviderProps> = ({
    children,
    loadSettings = true,
    showLoadingState = true,
    loadingComponent,
    errorComponent,
}) => {
    const {
        isLoading,
        error,
        isInitialized,
        refreshShopSettings,
        hasValidCache,
    } = useShopSettings({
        enabled: loadSettings,
    });

    // 🔥 Custom loading component
    if (loadSettings && isLoading && showLoadingState && !hasValidCache) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        return;
    }

    if (error && loadSettings) {
        if (errorComponent) {
            return <>{errorComponent(error, refreshShopSettings)}</>;
        }

        return (
            <Banner
                tone="critical"
                title="Failed to load shop settings"
                action={{
                    content: "Retry",
                    onAction: refreshShopSettings,
                }}
            >
                <p>{error.message}</p>
            </Banner>
        );
    }

    return <>{children}</>;
};
