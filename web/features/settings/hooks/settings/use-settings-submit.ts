"use client";

import {
    AppSettingsFormData,
    CustomizerModeOptions,
    CustomizerStyles,
    SettingsModeOptions,
    settingsMutations,
    settingsQueryKeys,
    useCustomizerStore,
    UseSettingsSubmitOptions,
} from "@/features/settings";
import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Checks if options specify settings mode.
 */
function isSettingsMode(
    opts: UseSettingsSubmitOptions,
): opts is SettingsModeOptions {
    return "mode" in opts && opts.mode === "settings";
}

/**
 * Checks if options specify customizer mode.
 */
function isCustomizerMode(
    opts: UseSettingsSubmitOptions,
): opts is CustomizerModeOptions {
    return "mode" in opts && opts.mode === "customizer";
}

/**
 * Hook for handling settings and customizer form submission.
 */
export function useSettingsSubmit(options: UseSettingsSubmitOptions = {}) {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { getGlobalStyles, markClean, discardChanges } = useCustomizerStore();

    // Get mutation options from factory
    const mutations = settingsMutations(app);

    const mutation = useMutation({
        ...mutations.save(),
        onSuccess: (savedData) => {
            if (savedData) {
                // Update React Query cache
                queryClient.setQueryData(settingsQueryKeys.detail(), savedData);

                // Mode-specific cleanup
                if (isCustomizerMode(options)) {
                    markClean();
                }

                // Call user callback
                options.onSuccess?.(savedData);
            }

            // Show success notification
            const message = isCustomizerMode(options)
                ? "Styles saved successfully"
                : "Settings saved successfully";

            window.shopify?.toast?.show(message, { duration: 3000 });
        },
        onError: (error: Error) => {
            options.onError?.(error);

            window.shopify?.toast?.show(
                error.message || "Failed to save settings",
                { duration: 5000, isError: true },
            );
        },
    });

    /**
     * Handles settings form submission (default & settings mode).
     */
    const handleSettingsSubmit = useCallback(
        async (data: AppSettingsFormData) => {
            const savedData = await mutation.mutateAsync(data);

            if (savedData && isSettingsMode(options)) {
                options.reset(savedData);
            }
        },
        [mutation, options],
    );

    /**
     * Handles customizer form submission.
     */
    const handleCustomizerSubmit = useCallback(
        async (validatedStyles?: CustomizerStyles) => {
            if (!isCustomizerMode(options)) {
                return;
            }

            if (!options.currentSettings) {
                throw new Error("Settings not loaded");
            }

            const globalStyles = validatedStyles ?? getGlobalStyles();

            const updatedSettings: AppSettingsFormData = {
                ...options.currentSettings,
                globalStyles,
            };

            await mutation.mutateAsync(updatedSettings);
        },
        [mutation, options, getGlobalStyles],
    );

    /**
     * Unified submit handler.
     */
    const handleSubmit = useCallback(
        async (data?: AppSettingsFormData | CustomizerStyles) => {
            if (isCustomizerMode(options)) {
                await handleCustomizerSubmit(
                    data as CustomizerStyles | undefined,
                );
            } else {
                await handleSettingsSubmit(data as AppSettingsFormData);
            }
        },
        [options, handleSettingsSubmit, handleCustomizerSubmit],
    );

    /**
     * Resets dirty state.
     */
    const resetDirty = useCallback(() => {
        if (isCustomizerMode(options)) {
            discardChanges();
        }
    }, [options, discardChanges]);

    /**
     * Validates the form (settings mode only).
     */
    const validate = useCallback(async () => {
        if (isSettingsMode(options)) {
            return await options.trigger();
        }
        return true;
    }, [options]);

    // Base return object
    const baseReturn = {
        handleSubmit,
        resetDirty,
        isSubmitting: mutation.isPending,
        isSuccess: mutation.isSuccess,
        error: mutation.error?.message ?? null,
        clearError: () => mutation.reset(),
    };

    // Settings mode return
    if (isSettingsMode(options)) {
        return {
            ...baseReturn,
            validate,
            isDirty: options.formState.isDirty,
            isValid: options.formState.isValid,
        };
    }

    // Customizer mode return
    if (isCustomizerMode(options)) {
        return {
            ...baseReturn,
            isLoading: mutation.isPending,
        };
    }

    // Default mode return
    return baseReturn;
}
