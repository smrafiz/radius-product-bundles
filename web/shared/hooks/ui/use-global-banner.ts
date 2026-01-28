import {
    GlobalMessageOptions,
    MessageType,
    useGlobalBannerStore,
} from "@/shared";

export function useGlobalBanner() {
    const { addMessage, removeMessage, clearAllMessages } =
        useGlobalBannerStore();

    const showMessage = (
        type: MessageType,
        title: string,
        options?: Partial<GlobalMessageOptions>,
    ) => {
        return addMessage({
            type,
            title,
            content: options?.content,
            isHtml: options?.isHtml,
            action: options?.action,
            dismissible: options?.dismissible,
            autoHide: options?.autoHide,
            duration: options?.duration,
        });
    };

    return {
        // Convenience methods
        showSuccess: (title: string, options?: Partial<GlobalMessageOptions>) =>
            showMessage("success", title, options),

        showError: (title: string, options?: Partial<GlobalMessageOptions>) =>
            showMessage("error", title, options),

        showWarning: (title: string, options?: Partial<GlobalMessageOptions>) =>
            showMessage("warning", title, options),

        showInfo: (title: string, options?: Partial<GlobalMessageOptions>) =>
            showMessage("info", title, options),

        // General method
        showMessage,

        // Management methods
        removeMessage,
        clearAllMessages,
    };
}
