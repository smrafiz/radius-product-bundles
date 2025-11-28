import { create } from "zustand";
import {SettingState} from "@/features/settings";

/*
 * Settings store
 */

export const useSettingStore = create<SettingState>((set) => ({
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

}));
