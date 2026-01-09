import { ReactNode } from "react";

/**
 * Chart Wrapper Props
 */
export interface ChartWrapperProps {
    title: string;
    summaryStats?: Array<{
        label: string;
        value: string | number;
    }>;
    children: ReactNode;
    isLoading?: boolean;
    gap?: "small" | "small-200" | "base";
}
