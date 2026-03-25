/**
 * Dashboard state types
 */

import type { WidgetStatus } from "@/features/dashboard";

/**
 * Dashboard state
 */
export interface WidgetStatusState {
    widgetStatus: WidgetStatus | null;
    isChecked: boolean;
}

export interface WidgetStatusActions {
    setWidgetStatus: (status: WidgetStatus) => void;
    markChecked: () => void;
}
