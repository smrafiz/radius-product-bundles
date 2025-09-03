import React from "react";
import { Banner } from "@shopify/polaris";
import { useBundleListingStore } from "@/stores";

interface BundleErrorCardProps {
    onRetry?: () => void;
}

export function BundleErrorCard({ onRetry }: BundleErrorCardProps) {
    const { error, setError } = useBundleListingStore();

    if (!error) {
        return null;
    }

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            // Default retry action - you might want to expose a retry function from the hook
            window.location.reload();
        }
    };

    return (
        <Banner
            tone="critical"
            onDismiss={() => setError(null)}
            action={{
                content: "Retry",
                onAction: handleRetry,
            }}
        >
            {error}
        </Banner>
    );
}
