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

/**
 * Base customizer field configuration
 */
interface BaseCustomizerFieldConfig {
    name: keyof CustomizerStyles;
    label: string;
    details?: string;
}

/**
 * Color field configuration
 */
export interface ColorFieldConfig extends BaseCustomizerFieldConfig {
    type: "color";
    defaultValue?: string;
}

/**
 * Number field configuration
 */
export interface NumberFieldConfig extends BaseCustomizerFieldConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
}

/**
 * Range slider field configuration
 */
export interface RangeFieldConfig extends BaseCustomizerFieldConfig {
    type: "range";
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
}

/**
 * Button group field configuration (for alignment, sizes, etc.)
 */
export interface ButtonGroupFieldConfig extends BaseCustomizerFieldConfig {
    type: "buttonGroup";
    options: Array<{ value: string | number; label: string }>;
    defaultValue?: string | number;
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseCustomizerFieldConfig {
    type: "select";
    options: Array<{ value: string; label: string }>;
    defaultValue?: string;
}

/**
 * Union type for all customizer field configurations
 */
export type CustomizerFieldConfig =
    | ColorFieldConfig
    | NumberFieldConfig
    | RangeFieldConfig
    | ButtonGroupFieldConfig
    | SelectFieldConfig;

/**
 * Customizer section configuration
 */
export interface CustomizerSectionConfig {
    id: string;
    title: string;
    description?: string;
    defaultOpen?: boolean;
    fields: CustomizerFieldConfig[];
    /** Optional grid layout for fields (default: stack) */
    columns?: 1 | 2 | 3;
}

/**
 * Customizer panel configuration (for different bundle types)
 */
export interface CustomizerPanelConfig {
    id: string;
    title: string;
    sections: CustomizerSectionConfig[];
}

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
    activeLayout: "LIST" | "GRID";

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
    setActiveLayout: (layout: "LIST" | "GRID") => void;
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
}
