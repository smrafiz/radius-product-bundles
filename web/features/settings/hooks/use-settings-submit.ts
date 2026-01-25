"use client";

import { useCallback } from "react";
import { useSettingsForm } from "./use-settings-form";
import { AppSettingsFormData, useSaveSettingsMutation } from "@/features/settings";

/**
 * Hook for handling settings form submission with React Query.
 */
export function useSettingsSubmit(options?: {
    onSuccess?: (data: AppSettingsFormData) => void;
    onError?: (error: Error) => void;
}) {
    const { handleSubmit, formState, reset, trigger } = useSettingsForm();
    const mutation = useSaveSettingsMutation();

    /**
     * Handles form submission with validation
     */
    const onSubmit = useCallback(
        async (data: AppSettingsFormData) => {
            try {
                const savedData = await mutation.mutateAsync(data);

                if (savedData) {
                    reset(savedData);
                    options?.onSuccess?.(savedData);
                }
            } catch (error) {
                options?.onError?.(
                    error instanceof Error
                        ? error
                        : new Error("Failed to save settings"),
                );
            }
        },
        [mutation, reset, options],
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
        return await trigger();
    }, [trigger]);

    return {
        submitSettings,
        validateSettings,
        isSubmitting: mutation.isPending || formState.isSubmitting,
        isSuccess: mutation.isSuccess,
        submitError: mutation.error?.message ?? null,
        clearError: () => mutation.reset(),
        isDirty: formState.isDirty,
        isValid: formState.isValid,
    };
}
