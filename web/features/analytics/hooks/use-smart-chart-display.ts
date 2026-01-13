/**
 * Smart Empty State Logic - Date Selection Aware
 */

import { useMemo } from "react";
import { SmartChartDisplay } from "@/features/analytics";

/**
 * Hook to determine if we should show the chart or empty state
 */
export function useSmartChartDisplay(
    chartData: any[] | null | undefined,
    preset?: string,
): SmartChartDisplay {
    return useMemo(() => {
        const validPresets = [
            "today",
            "yesterday",
            "last7",
            "last30",
            "last90",
            "last365",
            "lastWeek",
            "lastMonth",
        ];

        const singleDayPresets = ["today", "yesterday"];

        const isCustomSelection = !preset || !validPresets.includes(preset);
        const isSingleDayPreset = preset && singleDayPresets.includes(preset);

        // No data at all
        if (!chartData || chartData.length === 0) {
            if (isCustomSelection) {
                return {
                    shouldShowChart: true,
                    shouldShowEmptyState: false,
                    emptyStateReason: null,
                };
            }

            return {
                shouldShowChart: false,
                shouldShowEmptyState: true,
                emptyStateReason: "no_data",
            };
        }

        // Check for activity (all zeros)
        const hasActivity = chartData.some(
            (point) =>
                (point.views || 0) > 0 ||
                (point.addToCarts || 0) > 0 ||
                (point.purchases || 0) > 0,
        );

        if (!hasActivity) {
            if (isCustomSelection || isSingleDayPreset) {
                return {
                    shouldShowChart: true,
                    shouldShowEmptyState: false,
                    emptyStateReason: null,
                    showInfoBanner: true,
                    bannerMessage: "No activity recorded during this period",
                };
            }

            // Multi-day presets with no activity → Show empty state
            return {
                shouldShowChart: false,
                shouldShowEmptyState: true,
                emptyStateReason: "no_activity",
            };
        }

        // Valid data with activity
        return {
            shouldShowChart: true,
            shouldShowEmptyState: false,
            emptyStateReason: null,
        };
    }, [chartData, preset]);
}
