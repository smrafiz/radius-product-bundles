import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GlobalMessage, GlobalMessageState } from "@/shared";

export const useGlobalBannerStore = create(
    immer<GlobalMessageState>((set, get) => ({
        messages: [],

        addMessage: (message) => {
            const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newMessage: GlobalMessage = {
                ...message,
                title: message.title ?? "",
                type: message.type ?? "info",
                id,
                timestamp: Date.now(),
                dismissible: message.dismissible ?? true,
                autoHide: message.autoHide ?? false,
                duration: message.duration ?? 5000,
            };

            set((state) => {
                state.messages.push(newMessage);
            });

            // Auto-hide if enabled
            if (newMessage.autoHide && newMessage.duration) {
                setTimeout(() => {
                    get().removeMessage(id);
                }, newMessage.duration);
            }

            return id;
        },

        removeMessage: (id) =>
            set((state) => {
                state.messages = state.messages.filter(
                    (msg: GlobalMessage) => msg.id !== id,
                );
            }),

        clearAllMessages: () =>
            set((state) => {
                state.messages = [];
            }),

        getMessagesByType: (type) => {
            return get().messages.filter((msg) => msg.type === type);
        },
    })),
);
