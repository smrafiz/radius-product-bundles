"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSettingsAction } from "@/features/settings/actions/settings.action";
import { AppSettingsFormData, settingsQueryKeys, useCustomizerStore, useSettingsStore, } from "@/features/settings";

/**
 * Hook for handling customizer form submission.
 *
 * Saves the customizer styles to the database via the settings API.
 * Used with the native data-save-bar form integration.
 */
export function useCustomizerSubmit() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const {
        localData,
        setServerData,
        resetDirty: resetStoreDirty,
    } = useSettingsStore();
    const { getGlobalStyles, markClean, discardChanges } = useCustomizerStore();

    const mutation = useMutation({
        mutationFn: async () => {
            if (!localData) {
                throw new Error("Settings not loaded");
            }

            const globalStyles = getGlobalStyles();

            // Merge global styles into current settings
            const updatedSettings: AppSettingsFormData = {
                ...localData,
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

                // Update Zustand store
                setServerData(savedData);
                resetStoreDirty();

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
     */
    const handleSubmit = async () => {
        await mutation.mutateAsync();
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
