import { Bundle } from "@/types";
import { DashboardMetricsData } from "@/features/dashboard";

/**
 * Main dashboard store state
 */
export interface DashboardState {
    bundles: Bundle[];
    metrics: DashboardMetricsData | null;
    loading: boolean;
    error: string | null;
    toast: { active: boolean; message: string };
    setBundles: (bundles: Bundle[]) => void;
    setMetrics: (metrics: DashboardMetricsData) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string) => void;
    hideToast: () => void;
}
