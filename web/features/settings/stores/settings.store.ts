import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AppSettingsFormData, SettingsStoreState } from "@/features/settings";
import { getDefaultValuesFromConfig } from "@/features/settings/utils/defaults.utils";
import { triggerSaveBar } from "@/shared";

/**
 * Settings store
 */
export const useSettingsStore = create(
    immer<SettingsStoreState>((set, get) => ({
        // Initial state
        serverData: null,
        localData: null,
        isLoading: false,
        isSaving: false,
        isDirty: false,
        error: null,
        toast: { active: false, message: "" },

        // Set server data (from API)
        setServerData: (data) => {
            set((state) => {
                state.serverData = data;
                state.localData = data;
                state.isDirty = false;
            });
        },

        // Set local data (for form)
        setLocalData: (data) => {
            set((state) => {
                state.localData = data;
            });
        },

        // Update a single field
        updateField: (key, value) => {
            set((state) => {
                if (!state.localData) {
                    state.localData =
                        getDefaultValuesFromConfig() as AppSettingsFormData;
                }
                (state.localData as any)[key] = value;
                state.isDirty = true;
            });
            triggerSaveBar();
        },

        // Update a nested field (e.g., labels.headingLabel)
        updateNestedField: (parentKey, childKey, value) => {
            set((state) => {
                if (!state.localData) {
                    state.localData =
                        getDefaultValuesFromConfig() as AppSettingsFormData;
                }
                if (!(state.localData as any)[parentKey]) {
                    (state.localData as any)[parentKey] = {};
                }
                (state.localData as any)[parentKey][childKey] = value;
                state.isDirty = true;
            });
            triggerSaveBar();
        },

        // Mark as dirty
        markDirty: () => {
            set((state) => {
                state.isDirty = true;
            });
            triggerSaveBar();
        },

        // Reset dirty state
        resetDirty: () => {
            set((state) => {
                state.isDirty = false;
            });
        },

        // Reset to defaults
        resetToDefaults: () => {
            const defaults =
                getDefaultValuesFromConfig() as AppSettingsFormData;
            set((state) => {
                state.serverData = null;
                state.localData = defaults;
                state.isDirty = false;
            });
        },

        // Discard changes (revert to server data)
        discardChanges: () => {
            set((state) => {
                state.localData = state.serverData;
                state.isDirty = false;
            });
        },

        // UI actions
        setLoading: (loading) => {
            set((state) => {
                state.isLoading = loading;
            });
        },

        setSaving: (saving) => {
            set((state) => {
                state.isSaving = saving;
            });
        },

        setError: (error) => {
            set((state) => {
                state.error = error;
            });
        },

        showToast: (message, isError = false) => {
            set((state) => {
                state.toast = { active: true, message, isError };
            });
        },

        hideToast: () => {
            set((state) => {
                state.toast = { active: false, message: "" };
            });
        },

        // Get effective data (local or defaults)
        getEffectiveData: () => {
            const state = get();
            if (state.localData) {
                return state.localData;
            }
            return getDefaultValuesFromConfig() as AppSettingsFormData;
        },
    })),
);
