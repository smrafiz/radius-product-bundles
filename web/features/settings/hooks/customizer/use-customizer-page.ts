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
 * Hook for managing the customizer page state and actions.
 */
export function useCustomizerPage() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId, setActiveId] = useState<string>(types[0].id);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const { data: settingsData, isLoading } = useSettingsQuery();
    const { initializeStyles, discardChanges, markClean, getOriginalStyles } = useCustomizerStore();
    const { handleSubmit: submitToServer, isLoading: isSaving } =
        useCustomizerSubmit();
    const { showError, removeMessageByKey } = useGlobalBanner();

    // Build field labels from config (memoized)
    const fieldLabels = useMemo(
        () => extractFieldLabelsFromConfig(CUSTOMIZER_CONFIG),
        [],
    );

    const savedValues = useMemo<CustomizerStyles>(() => ({
        ...DEFAULT_CUSTOMIZER_STYLES,
        ...(settingsData?.globalStyles || {}),
    }), [settingsData?.globalStyles]);

    // Initialize RHF with Zod resolver
    const form = useForm<CustomizerStyles>({
        resolver: zodResolver(globalStylesSchema),
        defaultValues: savedValues,
        mode: "onChange",
    });

    // Sync form and store when settings load
    useEffect(() => {
        if (settingsData) {
            initializeStyles(settingsData.globalStyles || {});
            form.reset(savedValues);
        }
    }, [settingsData, initializeStyles, form, savedValues]);

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
            await submitToServer();
            form.reset(data);
            markClean();
        },
        (errors) => {
            // Format errors as HTML list with styled labels
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
        const originalStyles = getOriginalStyles();
        form.reset(originalStyles);
        discardChanges();
    }, [form, getOriginalStyles, discardChanges]);

    return {
        // State
        form,
        activeId,
        isLoading,
        isSaving,
        isDirty: form.formState.isDirty,
        hiddenInputRef,

        // Actions
        setActiveId,
        triggerSaveBar,
        handleSubmit,
        handleReset,
    };
}
