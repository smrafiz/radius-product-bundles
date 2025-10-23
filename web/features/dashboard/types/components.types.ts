/**
 * Dashboard component prop types
 */
import { Bundle } from "@prisma/client";
import { CalloutButtonProps, PolarisIconTypes } from "@/shared";

export interface DashboardBundlesListProps {
    bundles: Bundle[];
}

export interface DashboardQuickActionItem {
    id: string;
    title: string;
    description: string;
    icon: "order" | "chart-vertical" | "work-list";
    tone: "success" | "info" | "critical" | "warning" | "auto" | "neutral" | "caution" | undefined;
    url: string;
    backgroundColor: string;
    badge?: string;
    enabled?: boolean;
    permissions?: string[];
}

export interface DashboardCalloutCardsItem {
    title: string;
    description: string;
    icon: PolarisIconTypes;
    primaryButton?: CalloutButtonProps | null;
}
