/**
 * Analytics state types
 */

/**
 * Analytics state
 */
export interface AnalyticsState {
    days: number;
    startDate: string;
    endDate: string;
    setDays: (days: number) => void;
    setDateRange: (startDate: string, endDate: string) => void;
}
