import { Bundle } from "@/types";
import { DashboardMetricConfig } from "@/features/dashboard";

/**
 * Main dashboard store state
 */
export interface DashboardState {
    bundles: Bundle[];
    metrics: DashboardMetricConfig | null;
    loading: boolean;
    error: string | null;
    toast: { active: boolean; message: string };
    setBundles: (bundles: Bundle[]) => void;
    setMetrics: (metrics: DashboardMetricConfig) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string) => void;
    hideToast: () => void;
}
