"use client";

import { useCallback, useState } from "react";
import { useSettingsForm } from "./use-settings-form";
import { AppSettingsFormData } from "@/features/settings";

/**
 * Hook for handling settings form submission.
 *
 * Provides submit handler with loading state and error handling.
 */
export function useSettingsSubmit(options?: {
    onSuccess?: (data: AppSettingsFormData) => void;
    onError?: (error: Error) => void;
}) {
    const { handleSubmit, formState, reset } = useSettingsForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    /**
     * Handles form submission with validation
     */
    const onSubmit = useCallback(
        async (data: AppSettingsFormData) => {
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                // Call API to save settings
                const response = await fetch("/api/settings", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to save settings",
                    );
                }

                const savedData = await response.json();

                // Reset form with saved data to clear dirty state
                reset(savedData);

                // Show success toast
                if (typeof shopify !== "undefined" && shopify.toast?.show) {
                    shopify.toast.show("Settings saved successfully", {
                        duration: 3000,
                    });
                }

                options?.onSuccess?.(savedData);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to save settings";

                setSubmitError(errorMessage);

                // Show error toast
                if (typeof shopify !== "undefined" && shopify.toast?.show) {
                    shopify.toast.show(errorMessage, {
                        duration: 5000,
                        isError: true,
                    });
                }

                options?.onError?.(
                    error instanceof Error ? error : new Error(errorMessage),
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [reset, options],
    );

    /**
     * Submit handler that validates before submitting
     */
    const submitSettings = useCallback(() => {
        return handleSubmit(onSubmit)();
    }, [handleSubmit, onSubmit]);

    /**
     * Validates the form without submitting
     */
    const validateSettings = useCallback(async () => {
        const result = await handleSubmit(
            () => true,
            () => false,
        )();
        return result !== false;
    }, [handleSubmit]);

    return {
        submitSettings,
        validateSettings,
        isSubmitting: isSubmitting || formState.isSubmitting,
        submitError,
        clearError: () => setSubmitError(null),
        isDirty: formState.isDirty,
        isValid: formState.isValid,
    };
}
