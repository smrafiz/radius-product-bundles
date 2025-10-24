/**
 * Dashboard component types
 */
import { Bundle } from "@/features/bundles";
import { IconSource } from "@shopify/polaris";

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
    icon: IconSource;
    url: string;
    backgroundColor: string;
    iconColor: "success" | "info" | "critical" | "warning" | "emphasis";
    badge?: string;
    enabled?: boolean;
    permissions?: string[];
}
