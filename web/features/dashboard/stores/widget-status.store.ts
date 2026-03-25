import type {
    WidgetStatusActions,
    WidgetStatusState,
} from "@/features/dashboard";
import { create } from "zustand";

/**
 * Zustand store for managing widget status.
 */
export const useWidgetStatusStore = create<
    WidgetStatusState & WidgetStatusActions
>()((set) => ({
    widgetStatus: null,
    isChecked: false,
    setWidgetStatus: (status) => set({ widgetStatus: status, isChecked: true }),
    markChecked: () => set({ isChecked: true }),
}));
