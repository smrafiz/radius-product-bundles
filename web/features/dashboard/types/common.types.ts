/**
 * Common dashboard types
 */

import { ComponentType } from "react";

/**
 * Quick action definition
 */
export interface QuickAction {
    id: string;
    icon: ComponentType;
    label: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
    badge?: string | number;
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    enabled: boolean;
    order: number;
    size: WidgetSize;
}

/**
 * Widget types
 */
export type WidgetType =
    | "metrics"
    | "recent_bundles"
    | "top_bundles"
    | "quick_actions"
    | "insights"
    | "activity"
    | "chart";

/**
 * Widget size
 */
export type WidgetSize = "small" | "medium" | "large" | "full";

/**
 * Dashboard error
 */
export interface DashboardError {
    code: string;
    message: string;
    details?: Record<string, any>;
}