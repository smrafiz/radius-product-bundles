"use client";

import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { GlobalFormProps, withLoader } from "@/shared";
import { FieldErrors, FieldValues, useFormContext } from "react-hook-form";

// Custom events
export const TRIGGER_SAVE_BAR = "form:trigger-save-bar";
export const SUBMIT_FORM = "form:submit";
export const VALIDATION_ERROR = "form:validation-error";

// Default form ID
const DEFAULT_FORM_ID = "bundle";

// Track state per form ID
const formStates: Record<
    string,
    { hasUnsavedChanges: boolean; isBlocked: boolean }
> = {};

/**
 * Gets or creates form state for a given ID.
 */
const getFormState = (id: string) => {
    if (!formStates[id]) {
        formStates[id] = { hasUnsavedChanges: false, isBlocked: false };
    }
    return formStates[id];
};

/**
 * Blocks save bar triggers for a specific form.
 */
export function blockSaveBar(value: boolean, formId = DEFAULT_FORM_ID) {
    const state = getFormState(formId);
    state.isBlocked = value;
    if (value) {
        state.hasUnsavedChanges = false;
    }
}

/**
 * Triggers the Shopify save bar to appear.
 */
export function triggerSaveBar(formId = DEFAULT_FORM_ID) {
    const state = getFormState(formId);
    if (typeof window !== "undefined" && !state.isBlocked) {
        state.hasUnsavedChanges = true;
        window.dispatchEvent(
            new CustomEvent(TRIGGER_SAVE_BAR, { detail: { formId } }),
        );
    }
}

/**
 * Submits the form programmatically.
 */
export function submitForm(formId = DEFAULT_FORM_ID) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent(SUBMIT_FORM, { detail: { formId } }),
        );
    }
}

/**
 * Resets the save bar state for a form.
 */
export function resetSaveBar(formId = DEFAULT_FORM_ID) {
    const state = getFormState(formId);
    state.hasUnsavedChanges = false;
}

/**
 * A reusable global form wrapper compatible with any React Hook Form context.
 */
export function GlobalForm<T extends FieldValues>({
    children,
    onSubmit,
    resetDirty,
    formId = DEFAULT_FORM_ID,
    stepFieldMap,
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

    /**
     * Handle validation errors.
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

        console.log("First field:", firstField);
        console.log("Step number:", stepNumber);
        console.log("stepFieldMap:", stepFieldMap);

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

        // Show toast
        window.shopify?.toast?.show(errorMessage, { isError: true });
    };

    /**
     * Handles save action.
     */
    const handleSave = async () => {
        if (!onSubmit || !form) return;

        setIsSaving(true);

        await form.handleSubmit(
            async (data) => {
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
                handleSave();
            }
        };

        window.addEventListener(TRIGGER_SAVE_BAR, handleTriggerSaveBar);
        window.addEventListener(SUBMIT_FORM, handleSubmitForm);

        // Sync state on mount
        if (state.hasUnsavedChanges && !showSaveBar && !state.isBlocked) {
            setShowSaveBar(true);
        }

        return () => {
            window.removeEventListener(TRIGGER_SAVE_BAR, handleTriggerSaveBar);
            window.removeEventListener(SUBMIT_FORM, handleSubmitForm);
        };
    }, [showSaveBar, formId]);

    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <SaveBar id={saveBarId} open={showSaveBar} discardConfirmation>
                <button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    // @ts-ignore
                    loading={isSaving ? "" : undefined}
                />
                <button onClick={handleDiscard} disabled={isSaving} />
            </SaveBar>
            {children}
        </form>
    );
}
