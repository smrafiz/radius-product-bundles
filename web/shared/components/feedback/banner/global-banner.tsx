"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageType, useGlobalBannerStore, sanitizeHtml } from "@/shared";

const getToneFromType = (
    type: MessageType,
): "success" | "info" | "warning" | "critical" => {
    switch (type) {
        case "success":
            return "success";
        case "error":
            return "critical";
        case "warning":
            return "warning";
        case "info":
        default:
            return "info";
    }
};

export function GlobalBanner() {
    const pathname = usePathname();
    const { messages, removeMessage, clearAllMessages } =
        useGlobalBannerStore();

    useEffect(() => {
        return () => {
            clearAllMessages();
        };
    }, [pathname, clearAllMessages]);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div role="status" aria-live="polite" aria-atomic="false">
        <s-stack gap="base">
            {messages.map((message) => (
                <s-banner
                    key={message.id}
                    heading={message.title}
                    tone={getToneFromType(message.type)}
                    dismissible={message.dismissible}
                    onDismiss={
                        message.dismissible
                            ? () => removeMessage(message.id)
                            : undefined
                    }
                >
                    {message.isHtml && message.content ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(message.content),
                            }}
                        />
                    ) : (
                        message.content
                    )}

                    {message.action && (
                        <s-button
                            slot="action"
                            variant="primary"
                            onClick={message.action.onAction}
                        >
                            {message.action.label}
                        </s-button>
                    )}
                </s-banner>
            ))}
        </s-stack>
        </div>
    );
}
