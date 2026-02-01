import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { WidgetLayout } from "@/prisma/generated/enums";
import { CustomizerStoreState, CustomizerStyles } from "@/features/settings";
import { DEFAULT_CUSTOMIZER_STYLES, STYLE_PRESETS, } from "@/features/settings/constants/defaults.constants";

/**
 * Deep clones an object to prevent mutation.
 */
function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Customizer store for managing widget styles.
 *
 * Features:
 * - Style state management with defaults
 * - Preset application with tracking
 * - Discard/reset functionality
 * - Layout-aware state
 */
export const useCustomizerStore = create<CustomizerStoreState>()(
    devtools(
        (set, get) => ({
            styles: deepClone(DEFAULT_CUSTOMIZER_STYLES),
            originalStyles: null,
            isInitialized: false,
            activeLayout: "LIST" as WidgetLayout,
            activeDevice: "desktop",
            activePreset: null,

            /**
             * Initializes styles from partial input.
             */
            initializeStyles: (styles: Partial<CustomizerStyles>) => {
                const merged = {
                    ...deepClone(DEFAULT_CUSTOMIZER_STYLES),
                    ...styles,
                };
                set({
                    styles: merged,
                    originalStyles: deepClone(merged),
                    isInitialized: true,
                    activePreset: null,
                });
            },

            /**
             * Initializes from global styles (API response).
             */
            initializeFromGlobalStyles: (
                globalStyles: Partial<CustomizerStyles> | null,
            ) => {
                const merged = {
                    ...deepClone(DEFAULT_CUSTOMIZER_STYLES),
                    ...(globalStyles || {}),
                };
                set({
                    styles: merged,
                    originalStyles: deepClone(merged),
                    isInitialized: true,
                    activePreset: null,
                });
            },

            /**
             * Updates a single style property.
             */
            updateStyle: <K extends keyof CustomizerStyles>(
                key: K,
                value: CustomizerStyles[K],
            ) => {
                const { activeDevice, styles } = get();

                if (activeDevice === "desktop") {
                    set((state) => ({
                        styles: { ...state.styles, [key]: value },
                        activePreset: null,
                    }));
                } else {
                    // Handle nested overrides
                    const currentMap = styles[activeDevice] || {};
                    const updatedMap = {
                        ...currentMap,
                        [key]: value,
                    };

                    set((state) => ({
                        styles: {
                            ...state.styles,
                            [activeDevice]: updatedMap,
                        },
                        activePreset: null,
                    }));
                }
            },

            /**
             * Updates multiple style properties.
             */
            updateStyles: (styles: Partial<CustomizerStyles>) => {
                set((state) => ({
                    styles: { ...state.styles, ...styles },
                    activePreset: null,
                }));
            },

            /**
             * Sets the active layout for preview.
             */
            setActiveLayout: (layout: WidgetLayout) => {
                set({ activeLayout: layout });
            },

            /**
             * Sets the active device for responsive editing.
             */
            setActiveDevice: (device: "desktop" | "tablet" | "mobile") => {
                set({ activeDevice: device });
            },

            /**
             * Applies a style preset.
             */
            applyPreset: (presetKey: string) => {
                const preset = STYLE_PRESETS[presetKey];
                if (!preset) return;

                set((state) => ({
                    styles: {
                        ...state.styles,
                        ...preset.values,
                    },
                    activePreset: presetKey,
                }));
            },

            /**
             * Resets all styles to defaults.
             */
            resetToDefaults: () => {
                set({
                    styles: deepClone(DEFAULT_CUSTOMIZER_STYLES),
                    activePreset: null,
                });
            },

            /**
             * Discards changes and reverts to original styles.
             */
            discardChanges: () => {
                const { originalStyles } = get();
                if (originalStyles) {
                    set({
                        styles: deepClone(originalStyles),
                        activePreset: null,
                    });
                }
            },

            /**
             * Gets current styles.
             */
            getStyles: () => get().styles,

            /**
             * Gets styles for API submission.
             */
            getGlobalStyles: () => get().styles,

            /**
             * Marks store as clean after save.
             */
            markClean: () => {
                const { styles } = get();
                set({
                    originalStyles: deepClone(styles),
                });
            },
        }),
        { name: "customizer-store" },
    ),
);
