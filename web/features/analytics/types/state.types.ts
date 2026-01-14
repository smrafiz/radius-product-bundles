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
