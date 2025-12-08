"use client";

import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { GlobalFormProps, withLoader } from "@/shared";
import { FieldValues, useFormContext } from "react-hook-form";

// Custom event for triggering save bar
export const TRIGGER_SAVE_BAR = "form:trigger-save-bar";
export const SUBMIT_FORM = "form:submit";

// Track if we have unsaved changes (persists across step changes)
let hasUnsavedChanges = false;

// Flag to block save bar during initialization
let isBlocked = false;

/**
 * Blocks save bar triggers (use during initialization).
 */
export function blockSaveBar(value: boolean) {
    isBlocked = value;
    if (value) {
        hasUnsavedChanges = false;
    }
}

/**
 * Triggers the Shopify save bar to appear.
 */
export function triggerSaveBar() {
    if (typeof window !== "undefined" && !isBlocked) {
        hasUnsavedChanges = true;
        window.dispatchEvent(new CustomEvent(TRIGGER_SAVE_BAR));
    }
}

/**
 * Submits the form programmatically.
 */
export function submitForm() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(SUBMIT_FORM));
    }
}

/**
 * A reusable global form wrapper compatible with any React Hook Form context.
 */
export function GlobalForm<T extends FieldValues>({
    children,
    onSubmit,
    resetDirty,
}: GlobalFormProps<T>) {
    const formRef = useRef<HTMLFormElement>(null);
    const form = useFormContext<T>();
    const [showSaveBar, setShowSaveBar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        /**
         * Shows the save bar (only if not blocked).
         */
        const handleTriggerSaveBar = () => {
            if (!isBlocked) {
                setShowSaveBar(true);
            }
        };

        /**
         * Handles form submission from external trigger.
         */
        const handleSubmitForm = () => {
            handleSave();
        };

        window.addEventListener(TRIGGER_SAVE_BAR, handleTriggerSaveBar);
        window.addEventListener(SUBMIT_FORM, handleSubmitForm);

        // Sync state with global flag on mount (for step changes)
        if (hasUnsavedChanges && !showSaveBar && !isBlocked) {
            setShowSaveBar(true);
        }

        return () => {
            window.removeEventListener(TRIGGER_SAVE_BAR, handleTriggerSaveBar);
            window.removeEventListener(SUBMIT_FORM, handleSubmitForm);
        };
    }, [showSaveBar]);

    /**
     * Handles save action from Shopify save bar.
     */
    const handleSave = async () => {
        if (onSubmit && form) {
            setIsSaving(true);

            await form.handleSubmit(
                (data) =>
                    withLoader(async () => {
                        console.log("GlobalForm submitting data:", data);
                        await onSubmit(data);
                        window.shopify?.loading(false);
                        resetDirty();
                        setShowSaveBar(false);
                        hasUnsavedChanges = false;
                        setIsSaving(false);
                    })(),
                (errors) => {
                    console.log("GlobalForm validation errors:", errors);
                    window.shopify?.loading(false);
                    setIsSaving(false);
                },
            )();
        }
    };

    /**
     * Handles discard action from Shopify save bar.
     */
    const handleDiscard = () => {
        form?.reset();
        resetDirty();
        setShowSaveBar(false);
        hasUnsavedChanges = false;
    };

    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <SaveBar
                id="radius-bundle-save-bar"
                open={showSaveBar}
                discardConfirmation
            >
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
