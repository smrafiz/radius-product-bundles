import { formatCurrency, formatPercentage } from "@/shared";
import { DASHBOARD_QUICK_ACTIONS, MetricFormat } from "@/features/dashboard";

export function formatByType(value: number, format: MetricFormat): string {
    switch (format) {
        case "currency":
            return formatCurrency(value);
        case "percentage":
            return formatPercentage(value);
        case "number":
        default:
            return value?.toLocaleString();
    }
}

export const getQuickActionById = (id: string) =>
    DASHBOARD_QUICK_ACTIONS.find((action) => action.id === id);

export const getEnabledQuickActions = () =>
    DASHBOARD_QUICK_ACTIONS.filter((action) => action.enabled !== false);

export const getQuickActionsByPermission = (userPermissions: string[]) =>
    DASHBOARD_QUICK_ACTIONS.filter(
        (action) =>
            !action.permissions ||
            action.permissions.some((p) => userPermissions.includes(p)),
    );
