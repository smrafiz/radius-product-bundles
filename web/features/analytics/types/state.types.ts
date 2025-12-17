/**
 * Analytics state types
 */

import { Bundle } from "@/features/bundles";
import { AnalyticsMetricsData } from "@/features/analytics";

/**
 * Analytics state
 */
export interface AnalyticsState {
    bundles: Bundle[];
    metrics: AnalyticsMetricsData | null;
    loading: boolean;
    error: string | null;
    toast: { active: boolean; message: string };
    setBundles: (bundles: Bundle[]) => void;
    setMetrics: (metrics: AnalyticsMetricsData) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string) => void;
    hideToast: () => void;
}
