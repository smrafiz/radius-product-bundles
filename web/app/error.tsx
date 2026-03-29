"use client";

import { useEffect } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { useGlobalBannerStore } from "@/shared/stores/global-banner.store";
import { GlobalBanner } from "@/shared/components/feedback/banner";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const addMessage = useGlobalBannerStore((state) => state.addMessage);
    const clearAllMessages = useGlobalBannerStore(
        (state) => state.clearAllMessages,
    );
    const t = useTranslations("Meta");

    useEffect(() => {
        clearAllMessages();

        addMessage({
            type: "error",
            title: t("error"),
            content: error.message || t("error"),
            dismissible: true,
            action: {
                label: t("tryAgain"),
                onAction: reset,
            },
        });

        return () => {
            clearAllMessages();
        };
    }, [error, reset, addMessage, clearAllMessages]);

    return <GlobalBanner />;
}
