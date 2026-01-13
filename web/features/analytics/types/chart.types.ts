import { ReactNode } from "react";

/**
 * Chart Wrapper Props
 */
export interface ChartWrapperProps {
    title: string;
    description?: string;
    formula?: string;
    summaryStats?: Array<{
        label: string;
        value: string | number;
    }>;
    children: ReactNode;
    isLoading?: boolean;
    gap?: "small" | "small-200" | "base";
    showInfoBanner?: boolean;
    infoBannerMessage?: string;
}

/**
 * Chart Title Tooltip Props
 */
export interface ChartTitleTooltipProps {
    children: ReactNode;
    content?: ReactNode;
    title?: string;
    description?: string;
    formula?: string;
    width?: string;
    id?: string;
}

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
    date: string | Date;
    views?: number;
    addToCarts?: number;
    purchases?: number;
    revenue?: number;
    [key: string]: any;
}

/**
 * Chart Empty State Props
 */
export interface ChartEmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: "primary" | "secondary";
    };
}

/**
 * Chart data status result
 */
export interface ChartDataStatusResult {
    isValid: boolean;
    reason:
        | "no_data"
        | "insufficient_points"
        | "no_activity"
        | "no_conversions"
        | "no_purchases"
        | null;
    points?: number;
}
