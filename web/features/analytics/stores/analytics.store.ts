import { create } from "zustand";
import { AnalyticsState } from "@/features/analytics";

/*
 * Analytics store
 */
export const useAnalyticsStore = create<AnalyticsState>((set) => ({
    /*
     * Initial state
     */
    bundles: [],
    metrics: null,
    loading: true,
    error: null,
    toast: { active: false, message: "" },

    /*
     * Actions
     */
    setBundles: (bundles) => set({ bundles }),
    setMetrics: (metrics) => set({ metrics }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    showToast: (message) => set({ toast: { active: true, message } }),
    hideToast: () => set({ toast: { active: false, message: "" } }),
}));
