"use client";
import React from "react";
import { useTranslations } from "@/lib/i18n/provider";
export function PricingStore() {
    const t = useTranslations("Pricing");
    const [close, setClose] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const handleClose = () => {
        setLoading(true);
        setTimeout(() => {
            setClose(false);
            setLoading(false);
        }, 1000);
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
                                    <s-heading>{t("devStoreTitle")}</s-heading>
                                    <s-paragraph>
                                        {t("devStoreDesc")}
                                    </s-paragraph>
                                </s-grid>
                            </s-grid>
                            <s-button
                                icon="x"
                                tone="neutral"
                                variant="tertiary"
                                accessibilityLabel={t("dismissCard")}
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
