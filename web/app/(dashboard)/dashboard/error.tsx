"use client";

import { useEffect } from "react";
import { useGlobalBannerStore } from "@/shared";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { addMessage, clearAllMessages } = useGlobalBannerStore();

    useEffect(() => {
        clearAllMessages();

        addMessage({
            type: "error",
            title: "Something went wrong",
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
