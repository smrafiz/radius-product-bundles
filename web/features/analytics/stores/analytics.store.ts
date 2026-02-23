"use client";

import { create } from "zustand";
import {
    AnalyticsState,
    formatDate,
    getTodayInShopTimezone,
} from "@/features/analytics";

/**
 * Analytics date range store
 */
export const useAnalyticsStore = create<AnalyticsState>((set) => {
    // Compute initial dates so the query key is stable from first render
    const defaultDays = 7;
    const today = getTodayInShopTimezone();
    const start = new Date(today);
    start.setDate(start.getDate() - (defaultDays - 1));

    return {
        startDate: formatDate(start),
        endDate: formatDate(today),
        days: defaultDays,
        preset: "last7",

        /**
         * Set date range with optional preset
         */
        setDateRange: (start, end, preset = "custom") => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            set({
                startDate: start,
                endDate: end,
                days: diffDays,
                preset,
            });
        },

        /*
         * Set days
         */
        setDays: (days) => {
            const today = getTodayInShopTimezone();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - (days - 1));

            // Map days to preset name
            const presetMap: Record<number, string> = {
                1: "today",
                7: "last7",
                30: "last30",
                90: "last90",
                365: "last365",
            };

            set({
                startDate: formatDate(startDate),
                endDate: formatDate(today),
                days,
                preset: presetMap[days] || `last${days}`,
            });
        },
    };
});
