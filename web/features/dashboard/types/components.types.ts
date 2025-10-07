/**
 * Dashboard component prop types
 */

import type { BundleListItem } from '@/features/bundles/types';
import type { DashboardMetrics, MetricCardData } from './metrics.types';
import type { QuickAction } from './common.types';

/**
 * Dashboard page component props
 */
export interface DashboardPageProps {
    initialData?: DashboardInitialData;
    onRefresh?: () => void;
}

/**
 * Initial data for server-side rendering
 */
export interface DashboardInitialData {
    bundles?: BundleListItem[];
    metrics?: DashboardMetrics;
}

/**
 * Dashboard overview section props
 */
export interface DashboardOverviewProps {
    metrics: DashboardMetrics | null;
    bundles: BundleListItem[];
    isLoading?: boolean;
}

/**
 * Dashboard metrics section props
 */
export interface DashboardMetricsProps {
    metrics: DashboardMetrics | null;
    isLoading?: boolean;
    onRefresh?: () => void;
}

/**
 * Dashboard bundles section props
 */
export interface DashboardBundlesProps {
    bundles: BundleListItem[];
    limit?: number;
    showViewAll?: boolean;
    isLoading?: boolean;
}

/**
 * Quick actions component props
 */
export interface QuickActionsProps {
    actions?: QuickAction[];
    columns?: 2 | 3 | 4;
}

/**
 * AI Insights component props
 */
export interface AIInsightsProps {
    insights?: AIInsight[];
    isLoading?: boolean;
}

/**
 * AI insight data
 */
export interface AIInsight {
    id: string;
    type: 'suggestion' | 'warning' | 'opportunity';
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Metric card component props
 */
export interface MetricCardProps extends MetricCardData {
    isLoading?: boolean;
    className?: string;
}