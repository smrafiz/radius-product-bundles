/**
 * Analytics state types
 */

/**
 * Analytics state
 */
export interface AnalyticsState {
    startDate: string;
    endDate: string;
    days: number;
    preset: string;
    setDateRange: (start: string, end: string, preset?: string) => void;
    setDays: (days: number) => void;
}

/**
 * Interface for the hook return value
 */
export interface SmartChartDisplay {
    shouldShowChart: boolean;
    shouldShowEmptyState: boolean;
    emptyStateReason: "no_data" | "insufficient_points" | "no_activity" | null;
    points?: number;
    showInfoBanner?: boolean;
    bannerMessage?: string;
}
