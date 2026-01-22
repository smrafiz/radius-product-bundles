/*
 * Dashboard utils
 */

import { DASHBOARD_QUICK_ACTIONS } from "@/features/dashboard";
import {
    formatCurrencyCompact,
    formatPercentage,
    MetricFormat,
} from "@/shared";

/*
 * Format metric value based on type
 */
export function formatByType(value: number, format: MetricFormat): string {
    switch (format) {
        case "currency":
            return formatCurrencyCompact(value);
        case "percentage":
            return formatPercentage(value);
        case "number":
        default:
            return value?.toLocaleString();
    }
}

/*
 * Get enabled quick actions
 */
export const getEnabledQuickActions = () =>
    DASHBOARD_QUICK_ACTIONS.filter((action) => action.enabled !== false);
