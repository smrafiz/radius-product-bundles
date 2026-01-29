import { WidgetLayout } from "@/prisma/generated/enums";
import { AppSettingsFormData, CustomizerStyles } from "@/features/settings";

export type SettingsStoreState = {
    serverData: AppSettingsFormData | null;
    localData: AppSettingsFormData | null;

    isLoading: boolean;
    isSaving: boolean;
    isDirty: boolean;

    error: string | null;
    toast: {
        active: boolean;
        message: string;
        isError?: boolean;
    };

    setServerData: (data: AppSettingsFormData) => void;
    setLocalData: (data: AppSettingsFormData) => void;

    updateField: <K extends keyof AppSettingsFormData>(
        key: K,
        value: AppSettingsFormData[K],
    ) => void;

    updateNestedField: <
        P extends keyof AppSettingsFormData,
        C extends keyof AppSettingsFormData[P],
    >(
        parentKey: P,
        childKey: C,
        value: AppSettingsFormData[P][C],
    ) => void;

    markDirty: () => void;
    resetDirty: () => void;

    resetToDefaults: () => void;
    discardChanges: () => void;

    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;

    setError: (error: string | null) => void;

    showToast: (message: string, isError?: boolean) => void;
    hideToast: () => void;

    getEffectiveData: () => AppSettingsFormData;
};

/**
 * Customizer store state interface.
 */
/**
 * Customizer store state interface.
 */
export interface CustomizerStoreState {
    styles: CustomizerStyles;
    originalStyles: CustomizerStyles | null;
    isInitialized: boolean;
    activeLayout: WidgetLayout;
    activePreset: string | null;

    initializeStyles: (styles: Partial<CustomizerStyles>) => void;
    initializeFromGlobalStyles: (
        globalStyles: Partial<CustomizerStyles> | null,
    ) => void;
    updateStyle: <K extends keyof CustomizerStyles>(
        key: K,
        value: CustomizerStyles[K],
    ) => void;
    updateStyles: (styles: Partial<CustomizerStyles>) => void;
    setActiveLayout: (layout: WidgetLayout) => void;
    applyPreset: (presetKey: string) => void;
    resetToDefaults: () => void;
    discardChanges: () => void;
    getStyles: () => CustomizerStyles;
    getGlobalStyles: () => CustomizerStyles;
    markClean: () => void;
}
