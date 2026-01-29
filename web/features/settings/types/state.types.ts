import { AppSettingsFormData } from "@/features/settings";

/**
 * Customizer style state - flat structure for easy UI binding
 */
export interface CustomizerStyles {
    // General
    primaryColor: string;
    secondaryColor: string;
    textColor: string;

    // Box
    boxMaxWidth: number;
    boxAlignment: "left" | "center" | "right";
    boxBgColor: string;
    boxBorderColor: string;
    boxBorderWidth: number;
    boxRadius: number;

    // Heading
    headingFontSize: number;
    headingColor: string;
    headingTransform: "none" | "uppercase" | "capitalize";

    // Product
    productFontSize: number;
    productBgColor: string;
    productTextColor: string;
    productBorderColor: string;
    productRadius: number;

    // Button
    buttonFontSize: number;
    buttonBgColor: string;
    buttonTextColor: string;
    buttonHoverBgColor: string;
    buttonHoverTextColor: string;
    buttonRadius: number;

    // Badge
    badgeFontSize: number;
    badgeBgColor: string;
    badgeTextColor: string;
    badgeRadius: number;

    // Image
    imageRadius: number;
    imageSize: number;
    imageFit: "cover" | "contain" | "fill";
}

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
export interface CustomizerStoreState {
    /** Current styles being edited */
    styles: CustomizerStyles;
    /** Original styles for discard functionality */
    originalStyles: CustomizerStyles | null;
    /** Whether the store has been initialized */
    isInitialized: boolean;
    /** Active layout for preview */
    activeLayout: "LIST" | "GRID" | "CAROUSEL" | "COMPACT";

    /** Initializes with styles */
    initializeStyles: (styles: Partial<CustomizerStyles>) => void;
    /** Initializes from globalStyles (same flat structure from DB) */
    initializeFromGlobalStyles: (
        globalStyles: Partial<CustomizerStyles> | null,
    ) => void;
    /** Updates a single style */
    updateStyle: <K extends keyof CustomizerStyles>(
        key: K,
        value: CustomizerStyles[K],
    ) => void;
    /** Updates multiple styles */
    updateStyles: (styles: Partial<CustomizerStyles>) => void;
    /** Sets active layout */
    setActiveLayout: (layout: "LIST" | "GRID" | "CAROUSEL" | "COMPACT") => void;
    /** Resets to defaults */
    resetToDefaults: () => void;
    /** Discards changes */
    discardChanges: () => void;
    /** Gets current styles */
    getStyles: () => CustomizerStyles;
    /** Gets styles for API (same flat structure) */
    getGlobalStyles: () => CustomizerStyles;
    /** Marks store as clean after save */
    markClean: () => void;
    /** Gets original (last saved) styles */
    getOriginalStyles: () => CustomizerStyles;
}
