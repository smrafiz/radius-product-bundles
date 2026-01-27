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
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants";

/**
 * Hook for managing the customizer page state and actions.
 */
export function useCustomizerPage() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId, setActiveId] = useState<string>(types[0].id);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const { data: settingsData, isLoading } = useSettingsQuery();
    const { initializeStyles, discardChanges } = useCustomizerStore();
    const { handleSubmit: submitToServer, isLoading: isSaving } =
        useCustomizerSubmit();

    const defaultValues: CustomizerStyles = {
        ...DEFAULT_CUSTOMIZER_STYLES,
        ...(settingsData?.globalStyles || {}),
    };

    // Initialize RHF with Zod resolver
    const form = useForm<CustomizerStyles>({
        resolver: zodResolver(globalStylesSchema),
        defaultValues,
        mode: "onChange",
    });

    // Initialize Zustand store when settings load
    useEffect(() => {
        if (settingsData) {
            initializeStyles(settingsData.globalStyles || {});
        }
    }, [settingsData, initializeStyles]);

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
    const handleSubmit = form.handleSubmit(async () => {
        await submitToServer();
    });

    /**
     * Handles form reset (discard changes).
     */
    const handleReset = useCallback(() => {
        form.reset(defaultValues);
        discardChanges();
    }, [form, defaultValues, discardChanges]);

    return {
        // State
        form,
        activeId,
        isLoading,
        isSaving,
        hiddenInputRef,

        // Actions
        setActiveId,
        triggerSaveBar,
        handleSubmit,
        handleReset,
    };
}
