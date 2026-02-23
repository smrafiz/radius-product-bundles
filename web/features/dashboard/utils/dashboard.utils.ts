/*
 * Dashboard utils
 */

import { DASHBOARD_QUICK_ACTIONS } from "@/features/dashboard";

/*
 * Get enabled quick actions
 */
export const getEnabledQuickActions = () =>
    DASHBOARD_QUICK_ACTIONS.filter((action) => action.enabled !== false);
