"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { resetSettingsAction } from "@/features/settings/actions/settings.action";
import { settingsQueryKeys, useSettingsStore } from "@/features/settings";

/**
 * Hook to reset settings to defaults
 */
export function useResetSettingsMutation() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const { resetToDefaults } = useSettingsStore();

    return useMutation({
        mutationFn: async () => {
            const token = await app.idToken();
            const result = await resetSettingsAction(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data;
        },
        onSuccess: () => {
            // Invalidate cache to trigger refetch
            void queryClient.invalidateQueries({
                queryKey: settingsQueryKeys.all,
            });

            // Reset Zustand store to defaults
            resetToDefaults();

            // Show success notification
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show("Settings reset to defaults", {
                    duration: 3000,
                });
            }
        },
        onError: (error: Error) => {
            // Show error notification
            if (typeof shopify !== "undefined" && shopify.toast?.show) {
                shopify.toast.show(
                    error.message || "Failed to reset settings",
                    {
                        duration: 5000,
                        isError: true,
                    },
                );
            }
        },
    });
}
