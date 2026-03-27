"use client";

import {
    extractFieldLabelsFromConfig,
    startLoading,
    stopLoading,
    useGlobalBanner,
} from "@/shared";
import {
    CustomizerStyles,
    globalStylesSchema,
    useCustomizerStore,
    useCustomizerSubmit,
    useSettingsQuery,
    type WidgetLayout,
} from "@/features/settings";
import { BundleType } from "@/features/bundles";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Resolver, useForm } from "react-hook-form";
import { BUNDLE_TYPES } from "@/features/bundles/constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

/**
 * Deep clones and merges saved styles with defaults.
 */
function createInitialStyles(
    savedStyles: Partial<CustomizerStyles> | null | undefined,
): CustomizerStyles {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZER_STYLES));
    const saved = savedStyles ? JSON.parse(JSON.stringify(savedStyles)) : {};

    return {
        ...defaults,
        ...saved,
    };
}

/**
 * Hook for managing the customizer page state and actions.
 */
export function useCustomizerPage() {
    const types = Object.values(BUNDLE_TYPES);
    const searchParams = useSearchParams();
    const bundleTypeParam = searchParams.get("bundleType");
    const layoutParam = searchParams.get("layout");
    const deviceParam = searchParams.get("device") as
        | "desktop"
        | "tablet"
        | "mobile"
        | null;
    const sourceParam = searchParams.get("source") as
        | "settings"
        | "bundle-preview"
        | null;

    const { setCustomizerSource, setPreviewProducts } = useCustomizerStore();
    const productsParam = searchParams.get("products");

    useEffect(() => {
        if (sourceParam) {
            setCustomizerSource(sourceParam);
        }

        // Read products from URL param
        if (productsParam) {
            try {
                const products = JSON.parse(decodeURIComponent(productsParam));
                if (Array.isArray(products) && products.length > 0) {
                    setPreviewProducts(products);
                    setCustomizerSource("bundle-preview");
                } else {
                    setPreviewProducts([]);
                }
            } catch (e) {
                console.error("Failed to parse products param:", e);
                setPreviewProducts([]);
            }
        } else {
            setPreviewProducts([]);
        }
    }, [sourceParam, productsParam, setCustomizerSource, setPreviewProducts]);

    const initialType =
        types.find((t) => t.id === bundleTypeParam)?.id ?? types[0].id;
    const [resetCounter, setResetCounter] = useState(0);

    // Store the ORIGINAL server values in a ref (immutable snapshot)
    const serverSnapshotRef = useRef<CustomizerStyles | null>(null);

    const { data: settingsData, isLoading } = useSettingsQuery();
    const initializeStyles = useCustomizerStore(
        (state) => state.initializeStyles,
    );
    const markClean = useCustomizerStore((state) => state.markClean);
    const activeBundleType = useCustomizerStore(
        (state) => state.activeBundleType,
    );
    const setActiveBundleType = useCustomizerStore(
        (state) => state.setActiveBundleType,
    );
    const setActiveLayout = useCustomizerStore(
        (state) => state.setActiveLayout,
    );
    const setActiveDevice = useCustomizerStore(
        (state) => state.setActiveDevice,
    );

    // Initialize active bundle type, layout, and device from URL params
    useEffect(() => {
        if (!activeBundleType) {
            setActiveBundleType(initialType as BundleType);
            if (layoutParam) {
                setActiveLayout(layoutParam as WidgetLayout);
            }
        }
        if (deviceParam) {
            setActiveDevice(deviceParam);
        }
    }, [
        activeBundleType,
        initialType,
        layoutParam,
        deviceParam,
        setActiveBundleType,
        setActiveLayout,
        setActiveDevice,
    ]);

    const { handleSubmit: submitToServer, isLoading: isSaving } =
        useCustomizerSubmit();
    const { showError, removeMessageByKey } = useGlobalBanner();

    // Build field labels from config (memoized)
    const fieldLabels = useMemo(
        () => extractFieldLabelsFromConfig(CUSTOMIZER_CONFIG),
        [],
    );

    // Initialize RHF with Zod resolver
    const form = useForm<CustomizerStyles>({
        resolver: zodResolver(globalStylesSchema) as Resolver<CustomizerStyles>,
        defaultValues: DEFAULT_CUSTOMIZER_STYLES,
        mode: "onChange",
    });

    // Sync form and store when settings load - capture snapshot ONCE
    useEffect(() => {
        if (settingsData !== undefined && serverSnapshotRef.current === null) {
            const snapshot = createInitialStyles(
                settingsData?.globalStyles ?? {},
            );
            serverSnapshotRef.current = snapshot;

            initializeStyles(snapshot);
            form.reset(snapshot);
        }
    }, [settingsData, initializeStyles, form]);

    /**
     * Clears validation errors and error banner.
     */
    const handleClearErrors = useCallback(() => {
        removeMessageByKey("customizer-validation");
        form.clearErrors();
    }, [form, removeMessageByKey]);

    /**
     * Handles form submission with RHF validation.
     */
    const handleSubmit = form.handleSubmit(
        async (data) => {
            removeMessageByKey("customizer-validation");
            startLoading();

            try {
                await submitToServer(data);
            } finally {
                stopLoading();
            }

            // Update snapshot to new saved values
            serverSnapshotRef.current = JSON.parse(JSON.stringify(data));

            form.reset(data);
            markClean();
        },
        (errors) => {
            const errorItems = Object.entries(errors)
                .map(([field, error]) => {
                    const label = fieldLabels[field] || field;
                    const message = error?.message || "Invalid value";
                    return `<s-list-item><strong>${label}:</strong> ${message}</s-list-item>`;
                })
                .join("");

            const errorCount = Object.keys(errors).length;
            const errorContent = `<s-unordered-list>${errorItems}</s-unordered-list>`;

            showError(
                `Validation Failed (${errorCount} ${errorCount === 1 ? "error" : "errors"})`,
                {
                    key: "customizer-validation",
                    content: errorContent,
                    isHtml: true,
                    autoHide: true,
                    duration: 15000,
                },
            );
        },
    );

    /**
     * Handles form reset (discard changes).
     */
    const handleReset = useCallback(() => {
        const snapshot = serverSnapshotRef.current;

        if (!snapshot) {
            console.warn("[useCustomizerPage] No server snapshot available");
            return;
        }

        const freshValues = JSON.parse(JSON.stringify(snapshot));

        // Clear validation error banner
        removeMessageByKey("customizer-validation");

        // Reset Zustand store FIRST
        initializeStyles(freshValues);

        // Then reset RHF form (this clears validation errors)
        form.reset(freshValues);

        // Clear any remaining form errors explicitly
        form.clearErrors();

        // Increment reset counter to force re-render of web components
        setResetCounter((c) => c + 1);
    }, [form, initializeStyles, removeMessageByKey]);

    return {
        // State
        form,
        activeId: activeBundleType ?? initialType,
        isLoading,
        isSaving,
        isDirty: form.formState.isDirty,
        resetCounter,

        // Actions
        setActiveId: (id: string) => setActiveBundleType(id as BundleType),
        handleClearErrors,
        handleSubmit,
        handleReset,
    };
}
