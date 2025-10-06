import { useGlobalBannerStore } from "@/stores";
import { GlobalMessage, MessageType } from "@/types";

type MessageOptions = Omit<GlobalMessage, "id" | "timestamp" | "type">;

export function useGlobalBanner() {
    const { addMessage, removeMessage, clearAllMessages } =
        useGlobalBannerStore();

    const showMessage = (
        type: MessageType,
        title: string,
        options?: Partial<MessageOptions>,
    ) => {
        return addMessage({
            type,
            title,
            content: options?.content,
            action: options?.action,
            dismissible: options?.dismissible,
            autoHide: options?.autoHide,
            duration: options?.duration,
        });
    };

    return {
        // Convenience methods
        showSuccess: (title: string, options?: Partial<MessageOptions>) =>
            showMessage("success", title, options),

        showError: (title: string, options?: Partial<MessageOptions>) =>
            showMessage("error", title, options),

        showWarning: (title: string, options?: Partial<MessageOptions>) =>
            showMessage("warning", title, options),

        showInfo: (title: string, options?: Partial<MessageOptions>) =>
            showMessage("info", title, options),

        // General method
        showMessage,

        // Management methods
        removeMessage,
        clearAllMessages,
    };
}
