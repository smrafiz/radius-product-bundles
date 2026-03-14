"use client";

import { useEffect } from "react";
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
    // Since error.tsx might render outside I18nLoader bounds if layout fails,
    // we use a static translated string from next-intl or a simple fallback map if hook fails.
    // However, the standard React useContext works if it's within Providers.
    // We'll safely attempt to use the translation hook.
    const { useTranslations } = require("@/lib/i18n/provider");
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
