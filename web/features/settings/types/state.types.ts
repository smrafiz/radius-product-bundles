/**
 * Setting state types
 */

import { AppSettingsFormData } from "@/features/settings";

/**
 * Settings store state
 */
export interface SettingsStoreState {
    // Data
    serverData: AppSettingsFormData | null;
    localData: AppSettingsFormData | null;

    // UI State
    isLoading: boolean;
    isSaving: boolean;
    isDirty: boolean;
    error: string | null;

    // Toast
    toast: {
        active: boolean;
        message: string;
        isError?: boolean;
    };

    // Actions
    setServerData: (data: AppSettingsFormData | null) => void;
    setLocalData: (data: AppSettingsFormData) => void;
    updateField: <K extends keyof AppSettingsFormData>(
        key: K,
        value: AppSettingsFormData[K],
    ) => void;
    updateNestedField: (
        parentKey: string,
        childKey: string,
        value: any,
    ) => void;
    markDirty: () => void;
    resetDirty: () => void;
    resetToDefaults: () => void;
    discardChanges: () => void;

    // UI Actions
    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string, isError?: boolean) => void;
    hideToast: () => void;

    // Computed
    getEffectiveData: () => AppSettingsFormData;
}
