"use client";

import { create } from "zustand";

interface AnalyticsDateRangeState {
    startDate: string;
    endDate: string;
    days: number;
    setDateRange: (start: string, end: string) => void;
    setDays: (days: number) => void;
}

/**
 * Analytics date range store
 *
 * Manages the selected date range for analytics queries.
 */
export const useAnalyticsStore = create<AnalyticsDateRangeState>((set) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return {
        startDate: sevenDaysAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
        days: 7,
        setDateRange: (start, end) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            set({ startDate: start, endDate: end, days: diffDays });
        },
        setDays: (days) => {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - days);

            set({
                startDate: startDate.toISOString().split("T")[0],
                endDate: today.toISOString().split("T")[0],
                days,
            });
        },
    };
});
