"use client";

import { useEffect } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { useGlobalBannerStore } from "@/shared/stores/global-banner.store";

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
            content: error.message || "An unexpected error occurred",
            dismissible: true,
            action: {
                label: "Try again",
                onAction: reset,
            },
        });

        return () => {
            clearAllMessages();
        };
    }, [error, reset, addMessage, clearAllMessages]);

    return null;
}
