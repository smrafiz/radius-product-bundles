import { create } from "zustand";
import { triggerSaveBar } from "@/shared";
import { immer } from "zustand/middleware/immer";
import {
    AppSettingsFormData,
    getDefaultValuesFromConfig,
    SettingsStoreState,
} from "@/features/settings";

/**
 * Settings store
 */
export const useSettingsStore = create(
    immer<SettingsStoreState>((set, get) => ({
        // Initial state
        serverData: null,
        localData: null,
        labelsLocale: null,
        isLocaleLoading: false,
        isLoading: false,
        isSaving: false,
        isExporting: false,
        isImporting: false,
        isSyncing: false,
        isResetting: false,
        isClearing: false,
        isCheckingWebhooks: false,
        isRegisteringWebhooks: false,
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

        // Set labels locale
        setLabelsLocale: (locale) => {
            set((state) => {
                state.labelsLocale = locale;
            });
        },

        // Set locale loading state
        setLocaleLoading: (loading) => {
            set((state) => {
                state.isLocaleLoading = loading;
            });
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

        setExporting: (exporting) => {
            set((state) => {
                state.isExporting = exporting;
            });
        },

        setImporting: (importing) => {
            set((state) => {
                state.isImporting = importing;
            });
        },

        setSyncing: (syncing) => {
            set((state) => {
                state.isSyncing = syncing;
            });
        },

        setClearing: (clearing) => {
            set((state) => {
                state.isClearing = clearing;
            });
        },

        setResetting: (resetting) => {
            set((state) => {
                state.isResetting = resetting;
            });
        },

        setCheckingWebhooks: (checking) => {
            set((state) => {
                state.isCheckingWebhooks = checking;
            });
        },

        setRegisteringWebhooks: (registering) => {
            set((state) => {
                state.isRegisteringWebhooks = registering;
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

        // Tool Actions
        syncMetafields: async () => {
            set((state) => {
                state.isSyncing = true;
            });
            try {
                // TODO: Implement sync logic
                // Simulate delay
                await new Promise((resolve) => setTimeout(resolve, 1000));
                get().showToast("Sync completed successfully");
            } catch (error) {
                console.error("Sync error:", error);
                get().showToast("Failed to sync", true);
            } finally {
                set((state) => {
                    state.isSyncing = false;
                });
            }
        },

        // Get effective data (local or defaults)
        getEffectiveData: () => {
            const state = get();

            if (state.localData) {
                return state.localData;
            }

            if (state.serverData) {
                return state.serverData;
            }

            return getDefaultValuesFromConfig() as AppSettingsFormData;
        },
    })),
);
