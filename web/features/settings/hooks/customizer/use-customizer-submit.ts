"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSettingsAction } from "@/features/settings/actions/settings.action";
import { CustomizerStyles, settingsQueryKeys, useCustomizerStore, useSettingsQuery, } from "@/features/settings";

/**
 * Hook for handling customizer form submission.
 *
 * Works with React Hook Form - data is pre-validated by Zod resolver.
 * Saves styles to database and updates cache.
 */
export function useCustomizerSubmit() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { data: settingsData } = useSettingsQuery();
    const { getGlobalStyles, markClean, discardChanges } = useCustomizerStore();

    const mutation = useMutation({
        mutationFn: async (validatedData?: CustomizerStyles) => {
            if (!settingsData) {
                throw new Error("Settings not loaded");
            }

            // Use validated data from RHF if provided, otherwise get from store
            const globalStyles = validatedData ?? getGlobalStyles();

            // Merge global styles into current settings
            const updatedSettings = {
                ...settingsData,
                globalStyles,
            };

            const token = await app.idToken();
            const result = await saveSettingsAction(token, updatedSettings);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data;
        },
        onSuccess: (savedData) => {
            if (savedData) {
                // Update React Query cache
                queryClient.setQueryData(settingsQueryKeys.detail(), savedData);

                // Mark customizer as clean
                markClean();
            }

            // Show success notification
            window.shopify?.toast?.show("Styles saved successfully", {
                duration: 3000,
            });
        },
        onError: (error: Error) => {
            // Show error notification
            window.shopify?.toast?.show(
                error.message || "Failed to save styles",
                {
                    duration: 5000,
                    isError: true,
                },
            );
        },
    });

    /**
     * Handles form submission.
     * Can optionally receive pre-validated data from RHF.
     */
    const handleSubmit = async (validatedData?: CustomizerStyles) => {
        await mutation.mutateAsync(validatedData);
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
        isLoading: mutation.isPending,
    };
}
