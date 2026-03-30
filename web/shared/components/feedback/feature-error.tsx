"use client";

import { useTranslations } from "@/lib/i18n/provider";

interface FeatureErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export function FeatureError({ error, reset }: FeatureErrorProps) {
    const t = useTranslations("Meta");

    return (
        <s-page heading={t("error")}>
            <s-banner tone="critical" heading={t("error")}>
                <s-stack gap="small">
                    {error.message || t("error")}
                    <s-button variant="primary" onClick={reset}>
                        {t("tryAgain")}
                    </s-button>
                </s-stack>
            </s-banner>
        </s-page>
    );
}
