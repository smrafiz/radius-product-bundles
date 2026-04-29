import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
    CustomizerStoreState,
    CustomizerStyles,
    WidgetLayout,
} from "@/features/settings";
import { BundleType } from "@/features/bundles";
import type { PreviewTemplateId } from "@/features/settings/types/template.types";
import { PreviewProduct } from "@/shared";
import {
    DEFAULT_CUSTOMIZER_STYLES,
    STYLE_PRESETS,
} from "@/features/settings/constants/defaults.constants";
import { RESPONSIVE_FIELDS } from "@/features/settings/configs/customizer.config";
import { CUSTOMIZER_LAYOUTS_MAPPING } from "@/features/settings/constants/customizer.constants";

function deepClone<T>(obj: T): T {
    return structuredClone(obj);
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
            activeBundleType: null as PreviewTemplateId | null,
            activePreset: null,

            previewProducts: [],
            customizerSource: "settings",

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
                const { activeDevice, activeBundleType, styles } = get();

                if (
                    activeDevice !== "desktop" &&
                    RESPONSIVE_FIELDS.has(key as string)
                ) {
                    const currentMap = styles[activeDevice] || {};
                    set((state) => ({
                        styles: {
                            ...state.styles,
                            [activeDevice]: { ...currentMap, [key]: value },
                        },
                        activePreset: null,
                    }));
                } else if (activeBundleType && activeBundleType !== "CART_BANNER") {
                    const overrides = styles.bundleTypeOverrides || {};
                    const typeMap = overrides[activeBundleType] || {};
                    set((state) => ({
                        styles: {
                            ...state.styles,
                            bundleTypeOverrides: {
                                ...overrides,
                                [activeBundleType]: {
                                    ...typeMap,
                                    [key]: value,
                                },
                            },
                        },
                        activePreset: null,
                    }));
                } else {
                    set((state) => ({
                        styles: { ...state.styles, [key]: value },
                        activePreset: null,
                    }));
                }
            },

            clearDeviceOverride: (key: keyof CustomizerStyles) => {
                const { activeDevice, styles } = get();
                if (activeDevice === "desktop") {
                    return;
                }

                const currentMap = styles[activeDevice];
                if (!currentMap || !(key in currentMap)) {
                    return;
                }

                const updated = { ...currentMap };
                delete updated[key as keyof typeof updated];

                set((state) => ({
                    styles: {
                        ...state.styles,
                        [activeDevice]:
                            Object.keys(updated).length > 0
                                ? updated
                                : undefined,
                    },
                }));
            },

            clearBundleTypeOverride: (key: keyof CustomizerStyles) => {
                const { activeBundleType, styles } = get();
                if (!activeBundleType || activeBundleType === "CART_BANNER") return;

                const typeMap = styles.bundleTypeOverrides?.[activeBundleType];
                if (!typeMap || !(key in typeMap)) return;

                const updated = { ...typeMap };
                delete updated[key as keyof typeof updated];

                const overrides = { ...styles.bundleTypeOverrides };
                if (Object.keys(updated).length > 0) {
                    overrides[activeBundleType] = updated;
                } else {
                    delete overrides[activeBundleType];
                }

                set((state) => ({
                    styles: {
                        ...state.styles,
                        bundleTypeOverrides:
                            Object.keys(overrides).length > 0
                                ? overrides
                                : undefined,
                    },
                }));
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

            setActiveBundleType: (type: PreviewTemplateId | null) => {
                const { styles, activeLayout } = get();
                let preset: string | null = null;
                if (type && type !== "CART_BANNER") {
                    preset =
                        (styles.bundleTypeOverrides?.[type as BundleType]
                            ?.stylePreset as string) ??
                        styles.stylePreset ??
                        null;
                } else {
                    preset = styles.stylePreset ?? null;
                }

                let nextLayout = activeLayout;
                if (type) {
                    const allowed = CUSTOMIZER_LAYOUTS_MAPPING[type];
                    const allowedValues = allowed.map((l) => l.value);
                    if (!allowedValues.includes(activeLayout)) {
                        nextLayout = allowed[0].value as WidgetLayout;
                    }
                }

                set({
                    activeBundleType: type,
                    activePreset: preset,
                    activeLayout: nextLayout,
                });
            },

            /**
             * Applies a style preset (type-aware).
             */
            applyPreset: (presetKey: string) => {
                const preset = STYLE_PRESETS[presetKey];
                if (!preset) return;

                const { activeBundleType } = get();

                if (activeBundleType && activeBundleType !== "CART_BANNER") {
                    set((state) => {
                        const overrides =
                            state.styles.bundleTypeOverrides || {};
                        const typeMap = overrides[activeBundleType] || {};
                        return {
                            styles: {
                                ...state.styles,
                                bundleTypeOverrides: {
                                    ...overrides,
                                    [activeBundleType]: {
                                        ...typeMap,
                                        ...preset.values,
                                        stylePreset: presetKey,
                                    },
                                },
                            },
                            activePreset: presetKey,
                        };
                    });
                } else {
                    set((state) => ({
                        styles: {
                            ...state.styles,
                            ...preset.values,
                        },
                        activePreset: presetKey,
                    }));
                }
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
            getGlobalStyles: () => {
                const styles = get().styles;
                const sanitized = { ...styles };
                for (const device of ["tablet", "mobile"] as const) {
                    const map = sanitized[device];
                    if (!map) continue;
                    const filtered = Object.fromEntries(
                        Object.entries(map).filter(([k]) =>
                            RESPONSIVE_FIELDS.has(k),
                        ),
                    );
                    sanitized[device] =
                        Object.keys(filtered).length > 0
                            ? filtered
                            : undefined;
                }
                return sanitized;
            },

            /**
             * Marks store as clean after save.
             */
            markClean: () => {
                const { styles } = get();
                set({
                    originalStyles: deepClone(styles),
                });
            },

            setPreviewProducts: (products: PreviewProduct[]) => {
                set({ previewProducts: products });
            },

            setCustomizerSource: (source: "settings" | "bundle-preview") => {
                set({ customizerSource: source });
            },
        }),
        { name: "customizer-store" },
    ),
);
