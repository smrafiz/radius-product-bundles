/**
 * Dashboard component types
 */

import { Bundle } from "@/features/bundles";
import { CalloutButtonProps } from "@/shared";
import { SetupStepKey } from "@/features/dashboard";

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
    img?: { url?: string; alt?: string; svg?: string };
    icon: "text-in-rows" | "chart-histogram-second-last" | "database";
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
    icon: "email" | "star" | "book";
    primaryButton?: CalloutButtonProps | null;
}

export interface SetupItemButton {
    content: string;
    internalUrl?: string;
    props?: Record<string, any>;
}

export interface SetupItemData {
    id: number;
    stepKey: string;
    title: string;
    description?: string;
    image?: { url: string; alt: string };
    complete: boolean;
    autoDetected: boolean;
    primaryButton?: SetupItemButton | null;
    secondaryButton?: SetupItemButton | null;
}

export interface DashboardSetupGuideProps {
    onDismiss: () => void;
    onStepComplete: (key: SetupStepKey, value: boolean) => Promise<void> | void;
    isDismissing: boolean;
    items: SetupItemData[];
    shopDomain: string;
    apiKey: string;
}

export interface SetupItemProps extends SetupItemData {
    expanded: boolean;
    setExpanded: () => void;
    onComplete: (key: SetupStepKey, value: boolean) => Promise<void> | void;
    shopDomain: string;
    apiKey: string;
    autoDetected: boolean;
}
