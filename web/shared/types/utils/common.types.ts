/**
 * Message types
 */
export type MessageType = "success" | "error" | "warning" | "info";

/**
 * Global message
 */
export interface GlobalMessage {
    id: string;
    type: MessageType;
    title: string;
    content?: string;
    isHtml?: boolean;
    action?: {
        label: string;
        onAction: () => void;
    };
    dismissible?: boolean;
    autoHide?: boolean;
    duration?: number;
    timestamp: number;
}

/**
 * Validation errors
 */
export type ValidationErrors = Record<string, { _errors: string[] }>;

/**
 * Config field structure for label extraction
 */
export interface ConfigField {
    name: string;
    label: string;
}

/**
 * Config section structure for label extraction
 */
export interface ConfigSection {
    title: string;
    fields: ConfigField[];
}

/**
 * Config structure with sections
 */
export interface Config {
    sections: ConfigSection[];
}

/**
 * Options for extracting field labels from config
 */
export interface ExtractLabelsOptions {
    /** Include section title as prefix (default: true) */
    includeSectionTitle?: boolean;
    /** Custom separator between section and field (default: " ") */
    separator?: string;
}
