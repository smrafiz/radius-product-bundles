import {
    CustomizerStoreState,
    DEFAULT_CUSTOMIZER_STYLES,
    transformToFlat,
    transformToStructured,
} from "@/features/settings";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * Customizer store for style settings.
 */
export const useCustomizerStore = create(
    immer<CustomizerStoreState>((set, get) => ({
        // Initial state
        styles: { ...DEFAULT_CUSTOMIZER_STYLES },
        originalStyles: null,
        isInitialized: false,
        activeLayout: "LIST",

        /**
         * Initializes the customizer with flat styles.
         */
        initializeStyles: (styles) => {
            const mergedStyles = {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...styles,
            };
            set((state) => {
                state.styles = mergedStyles;
                state.originalStyles = mergedStyles;
                state.isInitialized = true;
            });
        },

        /**
         * Initializes from structured GlobalStylesFormData (from API).
         */
        initializeFromGlobalStyles: (globalStyles) => {
            const flatStyles = globalStyles
                ? transformToFlat(globalStyles)
                : {};
            const mergedStyles = {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...flatStyles,
            };
            set((state) => {
                state.styles = mergedStyles;
                state.originalStyles = mergedStyles;
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
            set((state) => {
                if (state.originalStyles) {
                    state.styles = { ...state.originalStyles };
                }
            });
        },

        /**
         * Gets current flat styles.
         */
        getStyles: () => {
            return get().styles;
        },

        /**
         * Gets styles in GlobalStylesFormData format for API.
         */
        getGlobalStyles: () => {
            return transformToStructured(get().styles);
        },

        /**
         * Marks the store as clean (after saving).
         */
        markClean: () => {
            set((state) => {
                state.originalStyles = { ...state.styles };
            });
        },
    })),
);
