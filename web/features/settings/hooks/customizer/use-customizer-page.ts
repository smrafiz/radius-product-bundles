"use client";

import {
    CustomizerStyles,
    globalStylesSchema,
    useCustomizerStore,
    useCustomizerSubmit,
    useSettingsQuery,
} from "@/features/settings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BUNDLE_TYPES } from "@/features/bundles/constants";
import { extractFieldLabelsFromConfig, useGlobalBanner } from "@/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants";
import { CUSTOMIZER_CONFIG } from "@/features/settings/configs/customizer.config";

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
    const [activeId, setActiveId] = useState<string>(types[0].id);
    const [resetCounter, setResetCounter] = useState(0);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    // Store the ORIGINAL server values in a ref (immutable snapshot)
    const serverSnapshotRef = useRef<CustomizerStyles | null>(null);

    const { data: settingsData, isLoading } = useSettingsQuery();
    const initializeStyles = useCustomizerStore(
        (state) => state.initializeStyles,
    );
    const markClean = useCustomizerStore((state) => state.markClean);

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
        resolver: zodResolver(globalStylesSchema),
        defaultValues: DEFAULT_CUSTOMIZER_STYLES,
        mode: "onChange",
    });

    // Sync form and store when settings load - capture snapshot ONCE
    useEffect(() => {
        if (settingsData !== undefined && serverSnapshotRef.current === null) {
            const snapshot = createInitialStyles(settingsData?.globalStyles ?? {});
            serverSnapshotRef.current = snapshot;

            initializeStyles(snapshot);
            form.reset(snapshot);
        }
    }, [settingsData, initializeStyles, form]);

    /**
     * Triggers SaveBar by changing hidden input value.
     */
    const triggerSaveBar = useCallback(() => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = Date.now().toString();
            hiddenInputRef.current.dispatchEvent(
                new Event("input", { bubbles: true }),
            );
        }
    }, []);

    /**
     * Handles form submission with RHF validation.
     */
    const handleSubmit = form.handleSubmit(
        async (data) => {
            removeMessageByKey("customizer-validation");

            // Pass the validated form data to the server
            await submitToServer(data);

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

        // Reset Zustand store FIRST
        initializeStyles(freshValues);

        // Then reset RHF form
        form.reset(freshValues);

        // Increment reset counter to force re-render of web components
        setResetCounter((c) => c + 1);
    }, [form, initializeStyles]);

    return {
        // State
        form,
        activeId,
        isLoading,
        isSaving,
        isDirty: form.formState.isDirty,
        hiddenInputRef,
        resetCounter,

        // Actions
        setActiveId,
        triggerSaveBar,
        handleSubmit,
        handleReset,
    };
}
