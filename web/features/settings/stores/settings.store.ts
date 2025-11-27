import { create } from "zustand";
import {SettingState} from "@/features/settings";

/*
 * Settings store
 */

export const useSettingStore = create<SettingState>((set, get) => ({
    /*
     * Initial state
     */
    loading: false,
    error: null,
    toast: { active: false, message: "" },

    /*
     * Actions
     */
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    showToast: (message) => set({ toast: { active: true, message } }),
    hideToast: () => set({ toast: { active: false, message: "" } }),

    /*
     * NEW: handleApply inside store
     */
    handleApply: async () => {
        const { setLoading, showToast } = get();

        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 800));
            showToast("Settings applied successfully!");
        } catch (err) {
            showToast("Failed to apply settings!");
        } finally {
            setLoading(false);
        }
    },

}));
