import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CustomizerStoreState, CustomizerStyles } from "@/features/settings";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

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
         * Initializes the customizer with styles.
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
         * Initializes from globalStyles (same flat structure from DB).
         */
        initializeFromGlobalStyles: (
            globalStyles: Partial<CustomizerStyles> | null,
        ) => {
            const mergedStyles = {
                ...DEFAULT_CUSTOMIZER_STYLES,
                ...(globalStyles || {}),
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
                state.styles = state.originalStyles
                    ? { ...state.originalStyles }
                    : { ...DEFAULT_CUSTOMIZER_STYLES };
            });
        },

        /**
         * Gets current flat styles.
         */
        getStyles: () => {
            return get().styles;
        },

        /**
         * Gets styles for API - same flat structure, no transform needed.
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
            return get().originalStyles ?? { ...DEFAULT_CUSTOMIZER_STYLES };
        },
    })),
);
