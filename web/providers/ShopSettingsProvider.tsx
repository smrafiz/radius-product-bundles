"use client";

import { getShopSettings } from "@/actions";
import { ReactNode, useEffect, useState } from "react";
import { Banner } from "@shopify/polaris";

interface ShopSettingsProviderProps {
    children: ReactNode;
    shop: string;
    loadSettings?: boolean;
    showLoadingState?: boolean;
    loadingComponent?: ReactNode;
    errorComponent?: (error: Error, retry: () => void) => ReactNode;
}

interface ShopSettings {
    shop: string;
    name: string;
    email?: string;
    myshopifyDomain?: string;
    currencyCode: string;
    countryCode?: string;
    planDisplayName?: string;
}

export const ShopSettingsProvider: React.FC<ShopSettingsProviderProps> = ({
    children,
    shop,
    loadSettings = true,
    showLoadingState = true,
    loadingComponent,
    errorComponent,
}) => {
    const [settings, setSettings] = useState<ShopSettings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettings = async () => {
        if (!shop || !loadSettings) return;

        setIsLoading(true);
        setError(null);

        try {
            const shopSettings = await getShopSettings(shop);
            setSettings(shopSettings);
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error("Failed to load shop settings");
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchSettings();
    }, [shop, loadSettings]);

    // Show loading state
    if (loadSettings && isLoading && showLoadingState && !settings) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }
    }

    // Show error state
    if (error && loadSettings) {
        if (errorComponent) {
            return <>{errorComponent(error, fetchSettings)}</>;
        }

        return (
            <Banner
                tone="critical"
                title="Failed to load shop settings"
                action={{
                    content: "Retry",
                    onAction: fetchSettings,
                }}
            >
                <p>{error.message}</p>
            </Banner>
        );
    }

    return <>{children}</>;
};
