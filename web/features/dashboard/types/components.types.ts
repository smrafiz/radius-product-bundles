/**
 * Dashboard component types
 */
import { Bundle } from "@/features/bundles";
import { IconSource } from "@shopify/polaris";
import { CalloutButtonProps } from "@/shared";

/**
 * Dashboard bundles list props
 */
export interface DashboardBundlesListProps {
    bundles: Bundle[];
}

/**
 * Dashboard quick action item
 */
export interface DashboardQuickActionItem {
    id: string;
    title: string;
    description: string;
    icon: "order" | "chart-vertical" | "work-list";
    tone:
        | "success"
        | "info"
        | "critical"
        | "warning"
        | "auto"
        | "neutral"
        | "caution"
        | undefined;
    url: string;
    backgroundColor: string;
    badge?: string;
    enabled?: boolean;
    permissions?: string[];
}

/**
 * Dashboard callout card item
 */

export interface DashboardCalloutCardsItem {
    title: string;
    description: string;
    // icon: IconSource;
    icon: "lightbulb" | "video" | "question-circle";
    primaryButton?: CalloutButtonProps | null;
}

/**
 * Dashboard setup guide item
 */

export interface DashboardSetupConfig {
    id: number;
    title: string;
    description: string;
    image?: {
        url: string;
        alt?: string;
    };
    complete: boolean;
    primaryButton?: CalloutButtonProps | null;
    secondaryButton?: CalloutButtonProps | null;
}
