"use client";

import {
    DEFAULT_FORM_ID,
    DISMISS_SAVE_BAR,
    getFormState,
    GlobalFormProps,
    SUBMIT_FORM,
    TRIGGER_SAVE_BAR,
    useGlobalBannerStore,
    VALIDATION_ERROR,
    withLoader,
} from "@/shared";
import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { FieldErrors, FieldValues, useFormContext } from "react-hook-form";

/**
 * A reusable global form wrapper compatible with any React Hook Form context.
 */
export function GlobalForm<T extends FieldValues>({
    children,
    onSubmit,
    resetDirty,
    onDiscard,
    formId = DEFAULT_FORM_ID,
    stepFieldMap,
    fieldLabels,
    onValidationError,
}: GlobalFormProps<T>) {
    const formRef = useRef<HTMLFormElement>(null);
    const form = useFormContext<T>();
    const [showSaveBar, setShowSaveBar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const saveBarId = `save-bar-${formId}`;

    /**
     * Gets step number for a field (if step mapping provided).
     */
    const getStepForField = (fieldName: string): number | undefined => {
        if (!stepFieldMap) return undefined;
        return stepFieldMap[fieldName];
    };

    const validationBannerKey = `${formId}-validation`;

    /**
     * Formats a field name into a readable label.
     */
    const formatFieldLabel = (field: string): string => {
        if (fieldLabels?.[field]) return fieldLabels[field];
        return (
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
        );
    };

    /**
     * Handle validation errors — shows GlobalBanner matching customizer format.
     */
    const handleValidationErrors = (errors: FieldErrors<T>) => {
        const errorFields = Object.keys(errors);

        if (errorFields.length === 0) {
            return;
        }

        const firstField = errorFields[0];
        const firstError = errors[firstField as keyof typeof errors];
        const errorMessage =
            (firstError?.message as string) || "Please fix the errors";
        const stepNumber = getStepForField(firstField);

        // Call custom error handler if provided
        if (onValidationError) {
            onValidationError({
                step: stepNumber,
                field: firstField,
                errors,
                message: errorMessage,
            });
        }

        // Dispatch event for external listeners
        window.dispatchEvent(
            new CustomEvent(VALIDATION_ERROR, {
                detail: { formId, step: stepNumber, field: firstField, errors },
            }),
        );

        // Show validation error banner (matching customizer format)
        const errorItems = errorFields
            .map((field) => {
                const label = formatFieldLabel(field);
                const error = errors[field as keyof typeof errors];
                const message = (error?.message as string) || "Invalid value";
                return `<s-list-item><strong>${label}:</strong> ${message}</s-list-item>`;
            })
            .join("");

        const errorCount = errorFields.length;
        const errorContent = `<s-unordered-list>${errorItems}</s-unordered-list>`;

        useGlobalBannerStore.getState().removeMessageByKey(validationBannerKey);
        useGlobalBannerStore.getState().addMessage({
            type: "error",
            title: `Validation Failed (${errorCount} ${errorCount === 1 ? "error" : "errors"})`,
            key: validationBannerKey,
            content: errorContent,
            isHtml: true,
            autoHide: true,
            duration: 15000,
        });
    };

    /**
     * Handles save action.
     */
    const handleSave = async () => {
        if (!onSubmit || !form) return;

        setIsSaving(true);

        await form.handleSubmit(
            async (data) => {
                useGlobalBannerStore
                    .getState()
                    .removeMessageByKey(validationBannerKey);
                withLoader(async () => {
                    await onSubmit(data);
                    window.shopify?.loading(false);
                    resetDirty?.();
                    setShowSaveBar(false);
                    getFormState(formId).hasUnsavedChanges = false;
                    setIsSaving(false);
                })();
            },
            (errors) => {
                console.log("GlobalForm validation errors:", errors);
                handleValidationErrors(errors);
                window.shopify?.loading(false);
                setIsSaving(false);
            },
        )();
    };

    /**
     * Handles discard action.
     */
    const handleDiscard = () => {
        onDiscard?.();
        form?.reset();
        resetDirty?.();
        setShowSaveBar(false);
        getFormState(formId).hasUnsavedChanges = false;
    };

    useEffect(() => {
        const state = getFormState(formId);

        /**
         * Shows the save bar (only for this form).
         */
        const handleTriggerSaveBar = (event: Event) => {
            const customEvent = event as CustomEvent;
            const eventFormId = customEvent.detail?.formId || DEFAULT_FORM_ID;

            if (eventFormId === formId && !state.isBlocked) {
                setShowSaveBar(true);
            }
        };

        /**
         * Handles form submission (only for this form).
         */
        const handleSubmitForm = (event: Event) => {
            const customEvent = event as CustomEvent;
            const eventFormId = customEvent.detail?.formId || DEFAULT_FORM_ID;

            if (eventFormId === formId) {
                void handleSave();
            }
        };

        const handleDismissSaveBar = (event: Event) => {
            const customEvent = event as CustomEvent;
            const eventFormId = customEvent.detail?.formId || DEFAULT_FORM_ID;

            if (eventFormId === formId) {
                setShowSaveBar(false);
            }
        };

        window.addEventListener(TRIGGER_SAVE_BAR, handleTriggerSaveBar);
        window.addEventListener(SUBMIT_FORM, handleSubmitForm);
        window.addEventListener(DISMISS_SAVE_BAR, handleDismissSaveBar);

        // Sync state on mount
        if (state.hasUnsavedChanges && !showSaveBar && !state.isBlocked) {
            setShowSaveBar(true);
        }

        return () => {
            window.removeEventListener(TRIGGER_SAVE_BAR, handleTriggerSaveBar);
            window.removeEventListener(SUBMIT_FORM, handleSubmitForm);
            window.removeEventListener(DISMISS_SAVE_BAR, handleDismissSaveBar);
        };
    }, [showSaveBar, formId]);

    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <SaveBar id={saveBarId} open={showSaveBar} discardConfirmation>
                <button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    loading={isSaving ? "" : undefined}
                />
                <button onClick={handleDiscard} disabled={isSaving} />
            </SaveBar>
            {children}
        </form>
    );
}
