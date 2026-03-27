import {
    AppSettingsFormData,
    CustomizerStyles,
    WidgetLayout,
} from "@/features/settings";
import { BundleType } from "@/features/bundles";
import type { PreviewProduct } from "@/shared";

export type SettingsStoreState = {
    serverData: AppSettingsFormData | null;
    localData: AppSettingsFormData | null;

    labelsLocale: string | null;
    isLocaleLoading: boolean;

    isLoading: boolean;
    isSaving: boolean;
    isExporting: boolean;
    isImporting: boolean;
    isSyncing: boolean;
    isResetting: boolean;
    isClearing: boolean;
    isCheckingWebhooks: boolean;
    isRegisteringWebhooks: boolean;
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

    setLabelsLocale: (locale: string | null) => void;
    setLocaleLoading: (loading: boolean) => void;

    markDirty: () => void;
    resetDirty: () => void;

    resetToDefaults: () => void;
    discardChanges: () => void;

    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;
    setExporting: (exporting: boolean) => void;
    setImporting: (importing: boolean) => void;
    setSyncing: (syncing: boolean) => void;
    setClearing: (clearing: boolean) => void;
    setResetting: (resetting: boolean) => void;
    setCheckingWebhooks: (checking: boolean) => void;
    setRegisteringWebhooks: (registering: boolean) => void;

    setError: (error: string | null) => void;

    showToast: (message: string, isError?: boolean) => void;
    hideToast: () => void;

    syncMetafields: () => Promise<void>;

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
    activeDevice: "desktop" | "tablet" | "mobile";
    activeBundleType: BundleType | null;
    activePreset: string | null;

    // Preview products from bundle preview (when opened from bundle edit)
    previewProducts: PreviewProduct[];
    customizerSource: "settings" | "bundle-preview";

    initializeStyles: (styles: Partial<CustomizerStyles>) => void;
    initializeFromGlobalStyles: (
        globalStyles: Partial<CustomizerStyles> | null,
    ) => void;
    updateStyle: <K extends keyof CustomizerStyles>(
        key: K,
        value: CustomizerStyles[K],
    ) => void;
    updateStyles: (styles: Partial<CustomizerStyles>) => void;
    clearDeviceOverride: (key: keyof CustomizerStyles) => void;
    clearBundleTypeOverride: (key: keyof CustomizerStyles) => void;
    setActiveLayout: (layout: WidgetLayout) => void;
    setActiveDevice: (device: "desktop" | "tablet" | "mobile") => void;
    setActiveBundleType: (type: BundleType | null) => void;
    applyPreset: (presetKey: string) => void;
    resetToDefaults: () => void;
    discardChanges: () => void;
    getStyles: () => CustomizerStyles;
    getGlobalStyles: () => CustomizerStyles;
    markClean: () => void;
    setPreviewProducts: (products: PreviewProduct[]) => void;
    setCustomizerSource: (source: "settings" | "bundle-preview") => void;
}
