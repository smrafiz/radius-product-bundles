"use client";

import { useEffect, useCallback } from "react";
import { UseSaveBarProps } from "@/features/settings";
import { TRIGGER_SAVE_BAR, SUBMIT_FORM, resetSaveBar } from "@/shared";

/**
 * Hook for integrating with Shopify's save bar.
 *
 * Handles:
 * - Showing/hiding save bar based on dirty state
 * - Save and discard actions
 * - Custom events for programmatic triggers
 */
export function useSaveBar({
    isDirty,
    isLoading = false,
    onSave,
    onDiscard,
    formId = "settings",
}: UseSaveBarProps) {
    // Handle save bar trigger event
    useEffect(() => {
        function handleTriggerSaveBar(event: CustomEvent) {
            if (event.detail?.formId === formId || !event.detail?.formId) {
                // Save bar will be shown by Shopify based on form dirty state
            }
        }

        window.addEventListener(
            TRIGGER_SAVE_BAR,
            handleTriggerSaveBar as EventListener,
        );

        return () => {
            window.removeEventListener(
                TRIGGER_SAVE_BAR,
                handleTriggerSaveBar as EventListener,
            );
        };
    }, [formId]);

    // Handle submit event
    useEffect(() => {
        function handleSubmit(event: CustomEvent) {
            if (event.detail?.formId === formId || !event.detail?.formId) {
                onSave();
            }
        }

        window.addEventListener(SUBMIT_FORM, handleSubmit as EventListener);

        return () => {
            window.removeEventListener(
                SUBMIT_FORM,
                handleSubmit as EventListener,
            );
        };
    }, [formId, onSave]);

    // Reset save bar when component unmounts or after successful save
    useEffect(() => {
        if (!isDirty) {
            resetSaveBar(formId);
        }
    }, [isDirty, formId]);

    // Programmatic save
    const save = useCallback(async () => {
        await onSave();
    }, [onSave]);

    // Programmatic discard
    const discard = useCallback(() => {
        onDiscard();
        resetSaveBar(formId);
    }, [onDiscard, formId]);

    return {
        isDirty,
        isLoading,
        save,
        discard,
    };
}
