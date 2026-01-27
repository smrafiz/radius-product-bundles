"use client";

import { useCallback } from "react";
import { useSettingsForm } from "./use-settings-form";
import {
    AppSettingsFormData,
    useSaveSettingsMutation,
} from "@/features/settings";

/**
 * Hook for handling settings form submission with React Query.
 *
 * Returns handleSubmit and resetDirty for use with GlobalForm,
 * following the same pattern as useBundleSubmit.
 */
export function useSettingsSubmit(options?: {
    onSuccess?: (data: AppSettingsFormData) => void;
    onError?: (error: Error) => void;
}) {
    const { formState, reset, trigger } = useSettingsForm();
    const mutation = useSaveSettingsMutation();

    /**
     * Handles form submission - called by GlobalForm.
     * This is the main submit handler that processes the validated data.
     */
    const handleSubmit = useCallback(
        async (data: AppSettingsFormData) => {
            try {
                const savedData = await mutation.mutateAsync(data);

                if (savedData) {
                    reset(savedData);
                    options?.onSuccess?.(savedData);
                    window.shopify?.toast?.show("Settings saved successfully");
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to save settings";
                options?.onError?.(new Error(errorMessage));
                window.shopify?.toast?.show(errorMessage, { isError: true });
            }
        },
        [mutation, reset, options],
    );

    /**
     * Resets the dirty state after successful save.
     * Called by GlobalForm after successful submission.
     */
    const resetDirty = useCallback(() => {
        // Reset is handled in handleSubmit, but this callback
        // allows GlobalForm to trigger additional cleanup if needed
    }, []);

    /**
     * Validates the form without submitting.
     */
    const validateSettings = useCallback(async () => {
        return await trigger();
    }, [trigger]);

    return {
        handleSubmit,
        resetDirty,
        validateSettings,
        isSubmitting: mutation.isPending || formState.isSubmitting,
        isSuccess: mutation.isSuccess,
        submitError: mutation.error?.message ?? null,
        clearError: () => mutation.reset(),
        isDirty: formState.isDirty,
        isValid: formState.isValid,
    };
}
