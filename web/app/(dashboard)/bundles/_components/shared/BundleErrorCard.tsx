"use client";

import { Banner } from "@shopify/polaris";
import { useBundleListingStore } from "@/stores";

interface Props {
    onRetry?: () => void;
}

export default function BundleErrorCard({ onRetry }: Props) {
    const { error, setError } = useBundleListingStore();

    if (!error) {
        return null;
    }

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
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
