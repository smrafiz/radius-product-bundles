/*
 * Format metric value based on type (compact, card-friendly)
 */

import { formatCurrency, formatCurrencyCompact } from "./currency";
import { MetricFormat } from "@/shared/types/ui/metrics.types";

export function formatByType(
    value: number,
    format: MetricFormat,
    currencyCode?: string,
): string {
    switch (format) {
        case "currency":
            // Preserve cents for small values; compact suffix for large.
            if (Math.abs(value) < 1000) {
                return formatCurrency(value, currencyCode);
            }
            return formatCurrencyCompact(value, { currencyCode });
        case "percentage":
            return `${Math.round(value)}%`;
        case "number":
        default:
            return value?.toLocaleString();
    }
}
