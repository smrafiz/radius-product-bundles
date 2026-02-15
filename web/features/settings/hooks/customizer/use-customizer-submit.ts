"use client";

import {
    CustomizerStyles,
    useCustomizerStore,
    useSettingsQuery,
    useSettingsSubmit,
} from "@/features/settings";

/**
 * Hook for handling customizer form submission.
 */
export function useCustomizerSubmit(options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) {
    const { data: settingsData } = useSettingsQuery();
    const { discardChanges } = useCustomizerStore();

    const submit = useSettingsSubmit({
        mode: "customizer",
        currentSettings: settingsData,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });

    /**
     * Handles form submission.
     */
    const handleSubmit = async (validatedData?: CustomizerStyles) => {
        await submit.handleSubmit(validatedData);
    };

    /**
     * Resets dirty state - reverts to original styles.
     */
    const resetDirty = () => {
        discardChanges();
    };

    return {
        handleSubmit,
        resetDirty,
        isLoading: submit.isSubmitting,
        isSuccess: submit.isSuccess,
        error: submit.error,
    };
}
