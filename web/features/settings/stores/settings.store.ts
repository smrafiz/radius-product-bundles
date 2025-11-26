import { create } from "zustand";
import {SettingState} from "@/features/settings";

/*
 * Settings store
 */
export const useSettingStore = create<SettingState>((set) => ({
    /*
     * Initial state
     */
    loading: true,
    error: null,

    /*
     * Actions
     */
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
