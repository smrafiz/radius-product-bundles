import { Banner, BlockStack, Layout } from "@shopify/polaris";

import { MessageType } from "@/types";
import { useGlobalBannerStore } from "@/stores";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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

export default function GlobalBanner() {
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
        <Layout.Section>
            <BlockStack gap="200">
                {messages.map((message) => (
                    <Banner
                        key={message.id}
                        title={message.title}
                        tone={getToneFromType(message.type)}
                        action={
                            message.action
                                ? {
                                      content: message.action.label,
                                      onAction: message.action.onAction,
                                  }
                                : undefined
                        }
                        onDismiss={
                            message.dismissible
                                ? () => removeMessage(message.id)
                                : undefined
                        }
                    >
                        {message.content}
                    </Banner>
                ))}
            </BlockStack>
        </Layout.Section>
    );
}
