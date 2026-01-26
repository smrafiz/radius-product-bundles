/**
 * Setting state types
 */

import { AppSettingsFormData, CustomizerStyles, GlobalStylesFormData, } from "@/features/settings";

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

/**
 * Customizer store state
 */
export interface CustomizerStoreState {
    // Style data
    styles: CustomizerStyles;
    originalStyles: CustomizerStyles | null;
    isInitialized: boolean;

    // Layout
    activeLayout: "LIST" | "GRID" | "CAROUSEL" | "COMPACT";

    // Actions
    initializeStyles: (styles?: Partial<CustomizerStyles>) => void;
    initializeFromGlobalStyles: (globalStyles?: GlobalStylesFormData) => void;
    updateStyle: <K extends keyof CustomizerStyles>(
        key: K,
        value: CustomizerStyles[K],
    ) => void;
    updateStyles: (styles: Partial<CustomizerStyles>) => void;
    setActiveLayout: (layout: "LIST" | "GRID" | "CAROUSEL" | "COMPACT") => void;
    resetToDefaults: () => void;
    discardChanges: () => void;
    getStyles: () => CustomizerStyles;
    getGlobalStyles: () => GlobalStylesFormData;
    markClean: () => void;
}
