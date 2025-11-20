"use client";
import React from "react";
export function PricingStore() {

    const [close, setClose] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const handleClose = () => {
        setLoading(true);
        setTimeout(() => {
            setClose(false);
            setLoading(false);
        }, 600);
    };

    return (
        <>
            {close && (
                <s-stack paddingBlockEnd="large">
                    <s-section>
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            gap="small-400"
                            alignItems="start"
                        >
                            <s-grid
                                gridTemplateColumns="@container (inline-size <= 480px) 1fr, auto auto"
                                gap="base"
                                alignItems="center"
                            >
                                <s-grid gap="small-200">
                                    <s-heading>
                                        Development Store Detected!
                                    </s-heading>
                                    <s-paragraph>
                                        You can use all BundleSuite features
                                        (unlimited bundles, analytics, etc.)
                                        completely free on your development
                                        store. Choose your paid plan only when
                                        you go live!
                                    </s-paragraph>
                                </s-grid>
                            </s-grid>
                            <s-button
                                icon="x"
                                tone="neutral"
                                variant="tertiary"
                                accessibilityLabel="Dismiss card"
                                loading={loading}
                                disabled={loading}
                                onClick={handleClose}
                            />
                        </s-grid>
                    </s-section>
                </s-stack>
            )}
        </>
    );
}
