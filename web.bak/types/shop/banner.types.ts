export type MessageType = "success" | "error" | "warning" | "info";

export interface GlobalMessage {
    id: string;
    type: MessageType;
    title: string;
    content?: string;
    action?: {
        label: string;
        onAction: () => void;
    };
    dismissible?: boolean;
    autoHide?: boolean;
    duration?: number;
    timestamp: number;
}
