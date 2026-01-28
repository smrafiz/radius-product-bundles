import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CustomizerStoreState, CustomizerStyles } from "@/features/settings";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

/**
 * Customizer store for style settings.
 */
export const useCustomizerStore = create(
    immer<CustomizerStoreState>((set, get) => ({
        // Initial state - always start with complete defaults
        styles: { ...DEFAULT_CUSTOMIZER_STYLES },
        originalStyles: { ...DEFAULT_CUSTOMIZER_STYLES },
        isInitialized: false,
        activeLayout: "LIST",

        /**
         * Initializes the customizer with styles.
         */
        initializeStyles: (styles) => {
            const mergedStyles: CustomizerStyles = {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...styles,
            };

            set((state) => {
                state.styles = mergedStyles;
                state.originalStyles = { ...mergedStyles };
                state.isInitialized = true;
            });
        },

        /**
         * Initializes from globalStyles (same flat structure from DB).
         */
        initializeFromGlobalStyles: (
            globalStyles: Partial<CustomizerStyles> | null,
        ) => {
            const mergedStyles: CustomizerStyles = {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...(globalStyles || {}),
            };
            set((state) => {
                state.styles = mergedStyles;
                state.originalStyles = { ...mergedStyles };
                state.isInitialized = true;
            });
        },

        /**
         * Updates a single style property.
         */
        updateStyle: (key, value) => {
            set((state) => {
                state.styles[key] = value;
            });
        },

        /**
         * Updates multiple style properties at once.
         */
        updateStyles: (styles) => {
            set((state) => {
                Object.assign(state.styles, styles);
            });
        },

        /**
         * Sets the active layout for preview.
         */
        setActiveLayout: (layout) => {
            set((state) => {
                state.activeLayout = layout;
            });
        },

        /**
         * Resets all styles to defaults.
         */
        resetToDefaults: () => {
            set((state) => {
                state.styles = { ...DEFAULT_CUSTOMIZER_STYLES };
            });
        },

        /**
         * Discards changes and reverts to original styles.
         */
        discardChanges: () => {
            const original = get().originalStyles;

            const restoredStyles: CustomizerStyles = {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...(original || {}),
            };

            set((state) => {
                state.styles = restoredStyles;
            });
        },

        /**
         * Gets current flat styles.
         */
        getStyles: () => {
            return get().styles;
        },

        /**
         * Gets styles for API.
         */
        getGlobalStyles: () => {
            return get().styles;
        },

        /**
         * Marks the store as clean (after saving).
         */
        markClean: () => {
            set((state) => {
                state.originalStyles = { ...state.styles };
            });
        },

        /**
         * Gets the original (last saved) styles.
         */
        getOriginalStyles: () => {
            const original = get().originalStyles;
            return {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...(original || {}),
            };
        },
    })),
);
