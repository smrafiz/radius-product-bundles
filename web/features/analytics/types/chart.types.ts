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
