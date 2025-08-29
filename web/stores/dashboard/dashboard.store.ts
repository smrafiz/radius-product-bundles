// stores/dashboardStore.ts
import { create } from "zustand";
import type { Bundle, DashboardMetrics } from "@/types";

interface DashboardState {
    bundles: Bundle[];
    metrics: DashboardMetrics | null;
    loading: boolean;
    error: string | null;
    toast: { active: boolean; message: string };
    setBundles: (bundles: Bundle[]) => void;
    setMetrics: (metrics: DashboardMetrics) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string) => void;
    hideToast: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    bundles: [],
    metrics: null,
    loading: true,
    error: null,
    toast: { active: false, message: "" },
    setBundles: (bundles) => set({ bundles }),
    setMetrics: (metrics) => set({ metrics }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    showToast: (message) => set({ toast: { active: true, message } }),
    hideToast: () => set({ toast: { active: false, message: "" } }),
}));
