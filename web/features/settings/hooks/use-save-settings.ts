"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { saveSettingsAction } from "@/features/settings/actions/settings.action";
import {
    AppSettingsFormData,
    settingsQueryKeys,
    useSettingsStore,
} from "@/features/settings";

/**
 * Hook to save settings to API
 */
export function useSaveSettingsMutation() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { setServerData, resetDirty } = useSettingsStore();

    return useMutation({
        mutationFn: async (data: AppSettingsFormData) => {
            const token = await app.idToken();
            const result = await saveSettingsAction(token, data);

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
                resetDirty();
            }

            // Show success notification
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show("Settings saved successfully", {
                    duration: 3000,
                });
            }
        },
        onError: (error: Error) => {
            // Show error notification
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show(error.message || "Failed to save settings", {
                    duration: 5000,
                    isError: true,
                });
            }
        },
    });
}
