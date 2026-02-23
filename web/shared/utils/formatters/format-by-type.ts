/*
 * Format metric value based on type (compact, card-friendly)
 */

import { formatCurrencyCompact } from "./currency";
import { getCurrencySymbol } from "./currency";
import { MetricFormat } from "@/shared/types/ui/metrics.types";

export function formatByType(value: number, format: MetricFormat): string {
    switch (format) {
        case "currency":
            // Whole-dollar for small values, compact suffix for large
            if (Math.abs(value) < 1000) {
                return `${getCurrencySymbol("USD")}${Math.round(value).toLocaleString()}`;
            }
            return formatCurrencyCompact(value);
        case "percentage":
            return `${Math.round(value)}%`;
        case "number":
        default:
            return value?.toLocaleString();
    }
}
