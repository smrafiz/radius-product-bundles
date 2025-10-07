/**
 * Dashboard state types
 */

import type { DashboardMetrics } from './metrics.types';
import type { BundleListItem } from '@/features/bundles/types';

/**
 * Main dashboard store state
 */
export interface DashboardState {
    // Data
    bundles: BundleListItem[];
    metrics: DashboardMetrics | null;

    // UI State
    loading: boolean;
    error: string | null;
    viewMode: DashboardViewMode;

    // Notifications
    toast: ToastState;
}

/**
 * Toast notification state
 */
export interface ToastState {
    active: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

/**
 * Dashboard view mode
 */
export type DashboardViewMode = 'overview' | 'detailed' | 'compact';

/**
 * Dashboard layout preference
 */
export interface DashboardLayout {
    showMetrics: boolean;
    showRecentBundles: boolean;
    showQuickActions: boolean;
    showInsights: boolean;
}