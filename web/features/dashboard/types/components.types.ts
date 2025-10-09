/**
 * Dashboard component prop types
 */
import type { Bundle } from "@/types";
import { IconSource } from "@shopify/polaris";

export interface DashboardBundlesListProps {
    bundles: Bundle[];
}

export interface DashboardQuickActionItem {
    id: string;
    title: string;
    description: string;
    icon: IconSource;
    url: string;
    backgroundColor: string;
    iconColor: "success" | "info" | "critical" | "warning" | "emphasis";
    badge?: string;
    enabled?: boolean;
    permissions?: string[];
}
