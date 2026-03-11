/*
 * Dashboard utils
 */

import { getDashboardQuickActions } from "@/features/dashboard";

/*
 * Get enabled quick actions
 */
export const getEnabledQuickActions = (t: (key: string) => string) =>
    getDashboardQuickActions(t).filter((action) => action.enabled !== false);
