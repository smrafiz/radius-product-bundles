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
