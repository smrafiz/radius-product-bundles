"use client";

import { create } from "zustand";
import { AnalyticsState } from "@/features/analytics";
import { formatDate, getTodayInShopTimezone } from "@/features/analytics/utils";

/**
 * Analytics date range store
 *
 * Manages the selected date range for analytics queries.
 */
export const useAnalyticsStore = create<AnalyticsState>((set) => {
    return {
        startDate: "",
        endDate: "",
        days: 7,

        setDateRange: (start, end) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            set({ startDate: start, endDate: end, days: diffDays });
        },

        setDays: (days) => {
            const today = getTodayInShopTimezone();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - (days - 1));

            set({
                startDate: formatDate(startDate),
                endDate: formatDate(today),
                days,
            });
        },
    };
});
