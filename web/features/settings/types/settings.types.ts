/**
 * Settings faqs types
 */
export interface SettingsTabNavInfo {
    id: string;
    title: string;
    icon: "settings" | "discount" | "refresh" | "button" | "variant" | "apps" | "inventory" | "adjust" | "notification" | "dns-settings" | "wrench";
    tone?: "success" | "info" | "warning" | "critical" | "neutral" | "caution" | "auto" | undefined;
}
