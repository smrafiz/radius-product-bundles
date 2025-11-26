/**
 * Settings tab nav types
 */
export interface SettingsTabNavInfo {
    id: string;
    title: string;
    icon:
        | "settings"
        | "store-online"
        | "store"
        | "discount"
        | "refresh"
        | "button"
        | "variant"
        | "apps"
        | "inventory"
        | "adjust"
        | "notification"
        | "dns-settings"
        | "wrench";
    tone?:
        | "success"
        | "info"
        | "warning"
        | "critical"
        | "neutral"
        | "caution"
        | "auto"
        | undefined;
}
